"use client";

import { Html, Instance, Instances, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type MarketplaceCard = { product_id: string; slug: string; name: string; description: string; family: string; product_type: string; version: string; publication_state: string; pricing: { currency: string; model: string; offers: { amount_minor: number; cadence: string; currency: string; kind: string }[] }; visualization: { position_seed: number; scene_cluster: string; relationship_product_ids: string[] }; proficiency?: string };
type SearchResult = { total: number; results: MarketplaceCard[]; nextCursor: string | null };
type SceneNode = Pick<MarketplaceCard, "product_id" | "slug" | "family" | "product_type" | "name" | "proficiency"> & { position_seed: number; scene_cluster: string; relationship_product_ids: string[]; object_archetype?: string };
type SceneResult = { total: number; nodes: SceneNode[]; clusters: { id: string; count: number }[]; nextCursor: string | null; error?: string };
function price(card: MarketplaceCard) { const offer = card.pricing.offers[0]; if (!offer) return "Commercial terms available on request"; const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency }).format(offer.amount_minor / 100); return `${amount}${offer.cadence === "one-time" ? " one-time" : ` / ${offer.cadence}`}`; }
function hash(value: string) { let result = 2166136261; for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619); return result >>> 0; }
function color(value: string) { const palette = ["#2ed8f6", "#f5bd53", "#9186ff", "#52e8ab", "#ff7e94", "#76c9ff"]; return palette[hash(value) % palette.length]; }
function sceneFromCards(cards: MarketplaceCard[]): SceneResult { const nodes = cards.map((card) => ({ product_id: card.product_id, slug: card.slug, name: card.name, family: card.family, product_type: card.product_type, proficiency: card.proficiency, ...card.visualization })), counts = new Map<string, number>(); for (const node of nodes) counts.set(node.scene_cluster, (counts.get(node.scene_cluster) ?? 0) + 1); return { total: cards.length, nodes, clusters: [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([id, count]) => ({ id, count })), nextCursor: null }; }

type Vector3 = [number, number, number];
type SpatialNode = { node: SceneNode; position: Vector3; color: string };
type SpatialCluster = { id: string; count: number; position: Vector3; radius: number; color: string };
type SpatialEdge = { id: string; from: Vector3; to: Vector3; color: string };

/**
 * Builds the scene only from catalog-provided clusters, position seeds and
 * declared relationships. The 48-record cap is intentional: it preserves a
 * responsive, inspectable WebGL view while the server-side catalog/search
 * remains the complete discovery surface.
 */
function catalogSpatialGraph(nodes: SceneNode[]) {
  const grouped = new Map<string, SceneNode[]>();
  for (const node of nodes) grouped.set(node.scene_cluster, [...(grouped.get(node.scene_cluster) ?? []), node]);
  const entries = [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  const clusters: SpatialCluster[] = entries.map(([id, members], index) => {
    const band = Math.floor(index / 12), angle = ((index % 12) / 12) * Math.PI * 2 + band * 0.31;
    const distance = 4.2 + band * 2.45, position: Vector3 = [Math.cos(angle) * distance, ((index % 3) - 1) * 0.9, Math.sin(angle) * distance];
    return { id, count: members.length, position, radius: Math.min(1.6, 0.56 + Math.sqrt(members.length) * 0.17), color: color(id) };
  });
  const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
  const spatialNodes: SpatialNode[] = entries.flatMap(([clusterId, members]) => {
    const cluster = clusterById.get(clusterId)!;
    return members.sort((left, right) => left.product_id.localeCompare(right.product_id)).map((node, index) => {
      const seed = Math.abs(node.position_seed) || hash(node.product_id), angle = ((seed % 360) / 360) * Math.PI * 2 + index * 0.17;
      const radius = 0.2 + ((Math.floor(seed / 23) % 100) / 100) * cluster.radius * 0.74;
      const position: Vector3 = [cluster.position[0] + Math.cos(angle) * radius, cluster.position[1] + ((Math.floor(seed / 97) % 100) / 100 - 0.5) * cluster.radius, cluster.position[2] + Math.sin(angle) * radius];
      return { node, position, color: color(node.family) };
    });
  });
  const nodeById = new Map(spatialNodes.map((node) => [node.node.product_id, node]));
  const seen = new Set<string>(), edges: SpatialEdge[] = [];
  for (const source of spatialNodes) for (const targetId of source.node.relationship_product_ids) {
    const target = nodeById.get(targetId); if (!target) continue;
    const id = [source.node.product_id, targetId].sort().join("::"); if (seen.has(id)) continue;
    seen.add(id); edges.push({ id, from: source.position, to: target.position, color: source.color });
  }
  return { clusters, nodes: spatialNodes, edges };
}

type NodeArchetype = "box" | "cylinder" | "octahedron" | "icosahedron";
function nodeArchetype(value?: string): NodeArchetype { const kind = value?.toLocaleLowerCase() ?? ""; if (/(cube|box|module)/.test(kind)) return "box"; if (/(pyramid|agent|octa)/.test(kind)) return "octahedron"; if (/(cylinder|workflow|pipeline)/.test(kind)) return "cylinder"; return "icosahedron"; }

function ArchetypeGeometry({ archetype }: { archetype: NodeArchetype }) {
  if (archetype === "box") return <boxGeometry args={[0.29, 0.29, 0.29]} />;
  if (archetype === "octahedron") return <octahedronGeometry args={[0.27, 1]} />;
  if (archetype === "cylinder") return <cylinderGeometry args={[0.16, 0.16, 0.43, 12]} />;
  return <icosahedronGeometry args={[0.25, 2]} />;
}

/**
 * Repeated catalog objects use GPU instancing. An Instance is still raycast
 * selectable, so we retain a direct selection path from every rendered object
 * to its real catalog record while bounding the scene to 48 source nodes.
 */
function CatalogNodeInstances({ points, selected, onSelect }: { points: SpatialNode[]; selected: string | null; onSelect: (node: SceneNode) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const groups = useMemo(() => { const grouped = new Map<NodeArchetype, SpatialNode[]>(); for (const point of points) { const type = nodeArchetype(point.node.object_archetype); grouped.set(type, [...(grouped.get(type) ?? []), point]); } return [...grouped.entries()]; }, [points]);
  return <>{groups.map(([archetype, members]) => <Instances key={archetype} limit={members.length} range={members.length} castShadow receiveShadow>
    <ArchetypeGeometry archetype={archetype} /><meshStandardMaterial metalness={0.7} roughness={0.19} vertexColors />
    {members.map((point) => { const isSelected = selected === point.node.product_id, isHovered = hovered === point.node.product_id, emphasis = isSelected ? 1.72 : isHovered ? 1.3 : 1; return <Instance key={point.node.product_id} position={point.position} scale={emphasis} color={isSelected ? "#f5bd53" : point.color} onClick={(event) => { event.stopPropagation(); onSelect(point.node); }} onPointerOver={(event) => { event.stopPropagation(); setHovered(point.node.product_id); }} onPointerOut={() => setHovered(null)} />; })}
  </Instances>)}</>;
}

function CatalogNodeLabels({ points, selected, onSelect }: { points: SpatialNode[]; selected: string | null; onSelect: (node: SceneNode) => void }) {
  return <>{points.map((point) => <Html key={`label-${point.node.product_id}`} position={[point.position[0], point.position[1] + 0.38, point.position[2]]} center sprite distanceFactor={9.6} zIndexRange={[3, 0]}>
    <a className={`ai-marketplace__scene-label${selected === point.node.product_id ? " is-selected" : ""}`} href={`/ai-marketplace/${encodeURIComponent(point.node.slug)}`} onClick={() => onSelect(point.node)} aria-label={`Open ${point.node.name} catalog record`}>
      <strong>{point.node.name}</strong><span>{point.node.family}</span><small>{point.node.proficiency ?? point.node.product_type}</small>
    </a>
  </Html>)}</>;
}

function CatalogClusters({ clusters }: { clusters: SpatialCluster[] }) {
  return <>{clusters.map((cluster) => <group key={cluster.id} position={cluster.position} rotation={[Math.PI / 2, 0, hash(cluster.id) % Math.PI]}>
    <mesh><torusGeometry args={[cluster.radius, 0.014, 6, 56]} /><meshBasicMaterial color={cluster.color} transparent opacity={0.52} /></mesh>
    <mesh rotation={[Math.PI / 2, 0.31, 0]}><torusGeometry args={[Math.max(0.22, cluster.radius * 0.56), 0.008, 5, 40]} /><meshBasicMaterial color="#dff9ff" transparent opacity={0.26} /></mesh>
  </group>)}</>;
}

function CatalogCore() {
  return <group><mesh rotation={[Math.PI / 3, 0.42, 0]}><torusGeometry args={[1.16, 0.028, 8, 72]} /><meshBasicMaterial color="#f5bd53" transparent opacity={0.76} /></mesh><mesh rotation={[-Math.PI / 5, 0.72, 0.2]}><torusGeometry args={[0.76, 0.018, 8, 64]} /><meshBasicMaterial color="#2ed8f6" transparent opacity={0.68} /></mesh><mesh><icosahedronGeometry args={[0.31, 2]} /><meshStandardMaterial color="#f5bd53" emissive="#f5bd53" emissiveIntensity={1.45} metalness={0.82} roughness={0.13} /></mesh></group>;
}

/** Only used after an actual renderer error/context failure; never the primary experience. */
function SemanticSpatialFallback({ nodes, selected, onSelect }: { nodes: SceneNode[]; selected: string | null; onSelect: (node: SceneNode) => void }) {
  const points = useMemo(() => new Map(nodes.map((node, index) => { const clusterAngle = (hash(node.scene_cluster) % 628) / 100, localAngle = ((Math.abs(node.position_seed) || hash(node.product_id)) % 628) / 100 + index * 0.11, clusterRadius = 20 + (hash(node.scene_cluster) % 13), localRadius = 4 + ((hash(node.product_id) % 10) / 2); return [node.product_id, { x: 50 + Math.cos(clusterAngle) * clusterRadius + Math.cos(localAngle) * localRadius, y: 50 + Math.sin(clusterAngle) * clusterRadius * 0.68 + Math.sin(localAngle) * localRadius * 0.72, z: hash(node.product_id) % 9 }]; })), [nodes]);
  const visibleIds = new Set(nodes.map((node) => node.product_id));
  return <div className="ai-marketplace__universe-fallback" role="status"><div className="ai-marketplace__fallback-copy"><strong>3D renderer unavailable on this device.</strong><span>This semantic 2.5D catalog map preserves the same bounded records, clusters, relationships, labels, and product routes.</span></div><div className="ai-marketplace__fallback-map" aria-label="Semantic spatial catalog map">
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">{nodes.flatMap((node) => node.relationship_product_ids.filter((targetId) => visibleIds.has(targetId) && node.product_id < targetId).map((targetId) => { const source = points.get(node.product_id)!, target = points.get(targetId)!; return <line key={`${node.product_id}-${targetId}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} />; }))}</svg>
    {nodes.map((node) => { const point = points.get(node.product_id)!; return <Link key={node.product_id} className={`ai-marketplace__fallback-node${selected === node.product_id ? " is-selected" : ""}`} href={`/ai-marketplace/${encodeURIComponent(node.slug)}`} style={{ left: `${point.x}%`, top: `${point.y}%`, zIndex: point.z }} onClick={() => onSelect(node)}><strong>{node.name}</strong><span>{node.family}</span><small>{node.proficiency ?? node.product_type}</small></Link>; })}
  </div></div>;
}

function WebglContextMonitor({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => { const canvas = gl.domElement, lost = (event: Event) => { event.preventDefault(); onLost(); }, restored = () => onRestored(); canvas.addEventListener("webglcontextlost", lost); canvas.addEventListener("webglcontextrestored", restored); return () => { canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored); }; }, [gl, onLost, onRestored]);
  return null;
}

function SpatialCatalogScene({ nodes, selected, onSelect, onContextLost, onContextRestored, reducedMotion }: { nodes: SceneNode[]; selected: string | null; onSelect: (node: SceneNode) => void; onContextLost: () => void; onContextRestored: () => void; reducedMotion: boolean }) {
  const graph = useMemo(() => catalogSpatialGraph(nodes), [nodes]);
  return <>
    <color attach="background" args={["#03111e"]} /><fog attach="fog" args={["#03111e", 11, 32]} />
    <ambientLight intensity={0.52} /><directionalLight position={[6, 8, 5]} intensity={1.7} color="#dff9ff" castShadow /><pointLight position={[-5, 2, -5]} intensity={4.2} color="#2ed8f6" distance={18} /><pointLight position={[3, -2, 5]} intensity={3.4} color="#f5bd53" distance={15} />
    <CatalogCore /><CatalogClusters clusters={graph.clusters} />
    {graph.edges.map((edge) => <Line key={edge.id} points={[edge.from, edge.to]} color={edge.color} lineWidth={0.72} transparent opacity={0.55} />)}
    <CatalogNodeInstances points={graph.nodes} selected={selected} onSelect={onSelect} /><CatalogNodeLabels points={graph.nodes} selected={selected} onSelect={onSelect} />
    <OrbitControls enableDamping dampingFactor={0.08} enablePan enableZoom minDistance={4.8} maxDistance={30} minPolarAngle={0.28} maxPolarAngle={Math.PI * 0.85} autoRotate={!reducedMotion} autoRotateSpeed={0.18} />
    <WebglContextMonitor onLost={onContextLost} onRestored={onContextRestored} />
  </>;
}

class CapabilitySceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function CapabilityUniverse({ nodes, selected, onSelect }: { nodes: SceneNode[]; selected: string | null; onSelect: (node: SceneNode) => void }) {
  const [renderer, setRenderer] = useState<"loading" | "ready" | "recovering" | "unavailable">("loading"), [reducedMotion, setReducedMotion] = useState(false), [cluster, setCluster] = useState("");
  const router = useRouter();
  useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"), update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  const clusters = useMemo(() => [...new Set(nodes.map((node) => node.scene_cluster))].sort((left, right) => left.localeCompare(right)), [nodes]), visibleNodes = useMemo(() => cluster ? nodes.filter((node) => node.scene_cluster === cluster) : nodes, [cluster, nodes]);
  const keyboardNode = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => { if (visibleNodes.length === 0) return; const current = Math.max(0, visibleNodes.findIndex((node) => node.product_id === selected)); let next = current; if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % visibleNodes.length; else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + visibleNodes.length) % visibleNodes.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = Math.max(0, visibleNodes.length - 1); else if (event.key === "Enter" && selected) { const node = visibleNodes.find((item) => item.product_id === selected); if (node) router.push(`/ai-marketplace/${encodeURIComponent(node.slug)}`); return; } else return; event.preventDefault(); if (visibleNodes[next]) onSelect(visibleNodes[next]); }, [onSelect, router, selected, visibleNodes]);
  const unavailable = renderer === "unavailable";
  return <div className="ai-marketplace__universe" data-webgl={renderer} role="application" tabIndex={0} onKeyDown={keyboardNode} aria-label="Interactive 3D catalog capability universe. Arrow keys select nodes; Enter opens the selected catalog record.">
    {!unavailable && <CapabilitySceneBoundary onFailure={() => setRenderer("unavailable")}><Canvas style={{ height: "440px", width: "100%" }} dpr={reducedMotion ? 1 : [1, 1.75]} camera={{ position: [0, 5.2, 17], fov: 47, near: 0.1, far: 80 }} gl={{ alpha: false, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: false }} onCreated={() => setRenderer("ready")} aria-label="Interactive 3D catalog capability universe. Drag to orbit, right-drag to pan, scroll or pinch to zoom, and select a plotted catalog record." role="application" tabIndex={0}>
      <SpatialCatalogScene nodes={visibleNodes} selected={selected} onSelect={onSelect} onContextLost={() => setRenderer("recovering")} onContextRestored={() => setRenderer("ready")} reducedMotion={reducedMotion} />
    </Canvas></CapabilitySceneBoundary>}
    {unavailable && <SemanticSpatialFallback nodes={visibleNodes} selected={selected} onSelect={onSelect} />}
    <div className="ai-marketplace__scene-controls"><label htmlFor="marketplace-scene-cluster">3D cluster <select id="marketplace-scene-cluster" value={cluster} onChange={(event) => setCluster(event.target.value)}><option value="">All catalog clusters</option>{clusters.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><span>{visibleNodes.length} rendered object{visibleNodes.length === 1 ? "" : "s"}</span></div>
    <p>{renderer === "ready" ? "Real catalog scene · drag to orbit · right-drag to pan · scroll or pinch to zoom · select a node to open its catalog record." : renderer === "loading" ? "Starting the catalog WebGL renderer…" : renderer === "recovering" ? "Restoring the WebGL renderer after a graphics-context interruption…" : "Use the keyboard-accessible scene index below to select and open each catalog record."}</p>
  </div>;
}

export default function MarketplaceExperience({ initialCatalog, initialTotal, initialNextCursor, initialQuery = "", familyEntries, revision }: { initialCatalog: MarketplaceCard[]; initialTotal: number; initialNextCursor: string | null; initialQuery?: string; familyEntries: [string, number][]; revision: string }) {
  const initialized = useRef(false); const [family, setFamily] = useState(""), [query, setQuery] = useState(initialQuery), [cards, setCards] = useState(initialCatalog), [total, setTotal] = useState(initialTotal), [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor), [scene, setScene] = useState<SceneResult>(() => sceneFromCards(initialCatalog)), [selected, setSelected] = useState<string | null>(null), [loading, setLoading] = useState(false), [error, setError] = useState<string | null>(null);
  const request = useCallback(async (append = false, cursor = "") => { setLoading(true); setError(null); try { const params = new URLSearchParams({ limit: "24" }); if (query.trim()) params.set("q", query.trim()); if (family) params.set("family", family); if (cursor) params.set("cursor", cursor); const sceneParams = new URLSearchParams(params); sceneParams.set("limit", "48"); const [searchResponse, sceneResponse] = await Promise.all([fetch(`/api/ai-marketplace/search?${params}`), fetch(`/api/ai-marketplace/scene?${sceneParams}`)]); if (!searchResponse.ok || !sceneResponse.ok) throw new Error("Catalog scene unavailable"); const result = await searchResponse.json() as SearchResult, nextScene = await sceneResponse.json() as SceneResult; setCards((current) => append ? [...current, ...result.results] : result.results); setTotal(result.total); setNextCursor(result.nextCursor); setScene(nextScene); setSelected((current) => nextScene.nodes.some((node) => node.product_id === current) ? current : null); } catch { setError("Catalog updates are temporarily unavailable. The last verified records remain available; retry when ready."); } finally { setLoading(false); } }, [family, query]);
  useEffect(() => { if (!initialized.current) { initialized.current = true; return; } const timer = window.setTimeout(() => { void request(); }, 180); return () => window.clearTimeout(timer); }, [request]);
  const selectedNode = scene.nodes.find((node) => node.product_id === selected) ?? null, summary = useMemo(() => `${total.toLocaleString()} result${total === 1 ? "" : "s"}${query ? ` for “${query}”` : ""}`, [total, query]);
  return <><section className="ai-marketplace__constellation" aria-labelledby="capability-map-heading"><div className="ai-marketplace__constellation-copy"><p className="ai-marketplace__eyebrow">Catalog capability universe</p><h2 id="capability-map-heading">A navigable universe built from catalog clusters and relationships.</h2><p>Every node uses its catalog cluster and position seed. This bounded view never invents records or relationships; the semantic scene index offers an equivalent keyboard path.</p><p className="ai-marketplace__revision">Catalog revision {revision.slice(0, 12)} · {scene.clusters.length} clusters · {scene.nodes.length} scene nodes</p></div><CapabilityUniverse nodes={scene.nodes} selected={selected} onSelect={(node) => setSelected(node.product_id)} /><div className="ai-marketplace__scene-index" aria-label="Capability universe scene index"><h3>Scene index</h3><p>Use these keyboard controls to select any plotted record.</p><div>{scene.nodes.map((node) => <button type="button" key={node.product_id} aria-pressed={selected === node.product_id} onClick={() => setSelected(node.product_id)}>{node.name}</button>)}</div>{selectedNode && <aside aria-live="polite"><strong>{selectedNode.name}</strong><span>{selectedNode.family} · {selectedNode.relationship_product_ids.length} declared relationships</span><Link href={`/ai-marketplace/${encodeURIComponent(selectedNode.slug)}`}>Open catalog record →</Link></aside>}</div></section>
    <section className="ai-marketplace__discovery" aria-labelledby="catalog-controls-heading"><h2 id="catalog-controls-heading">Browse the catalog</h2><label htmlFor="marketplace-search"><span>Search capabilities, descriptions, families, and product types</span><input id="marketplace-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the catalog" type="search" /></label><div className="ai-marketplace__filters" aria-label="Filter by product family"><button type="button" aria-pressed={!family} onClick={() => setFamily("")}>All <span>{initialTotal.toLocaleString()}</span></button>{familyEntries.map(([item, count]) => <button type="button" aria-pressed={family === item} onClick={() => setFamily(item)} key={item}>{item} <span>{count.toLocaleString()}</span></button>)}</div></section>
    <section className="ai-marketplace__results" aria-labelledby="catalog-results-heading" aria-busy={loading}><div className="ai-marketplace__results-head"><h2 id="catalog-results-heading">Catalog results</h2><p className="ai-marketplace__result-count" role="status" aria-live="polite">{loading ? "Updating results…" : summary}</p></div>{error && <div className="ai-marketplace__recovery" role="alert"><span>{error}</span><button type="button" onClick={() => void request()}>Retry catalog update</button></div>}<div className="ai-marketplace__grid">{cards.map((card) => <article key={card.product_id} className="ai-marketplace__product-card"><div className="ai-marketplace__card-top"><span>{card.family}</span><span>v{card.version}</span></div><h3>{card.name}</h3><p>{card.description}</p><dl><div><dt>Product type</dt><dd>{card.product_type.replace(/-/g, " ")}{card.proficiency ? ` · ${card.proficiency}` : ""}</dd></div><div><dt>Commercial guidance</dt><dd>{price(card)}</dd></div><div><dt>Fulfillment state</dt><dd>{card.publication_state.replace(/-/g, " ")}</dd></div></dl><footer><Link href={`/ai-marketplace/${encodeURIComponent(card.slug)}`}>View catalog record <span aria-hidden="true">→</span></Link></footer></article>)}</div>{!loading && cards.length === 0 && <p className="ai-marketplace__empty">No catalog records match this search. Clear the search or select All.</p>}{nextCursor && <button className="ai-marketplace__more" type="button" onClick={() => void request(true, nextCursor)} disabled={loading}>Load 24 more records</button>}</section></>;
}
