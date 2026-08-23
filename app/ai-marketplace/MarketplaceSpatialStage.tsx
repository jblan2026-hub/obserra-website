"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { Group } from "three";
import type { MarketplaceWorkspaceRecord } from "../../lib/marketplace-v12-workspaces";
import styles from "./MarketplaceSpatialStage.module.css";

type SceneNode = Pick<MarketplaceWorkspaceRecord, "productId" | "slug" | "name" | "family" | "productType" | "version" | "category" | "sceneCluster" | "positionSeed" | "relationshipProductIds" | "objectArchetype">;
type Vector3 = [number, number, number];
type StagePoint = { node: SceneNode; position: Vector3; color: string };
type StageCluster = { id: string; position: Vector3; radius: number; color: string; count: number };
type StageEdge = { id: string; from: Vector3; to: Vector3; color: string };

const PALETTE = ["#2ed8f6", "#f5bd53", "#9186ff", "#52e8ab", "#ff7e94", "#76c9ff"] as const;

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}

function color(value: string) { return PALETTE[hash(value) % PALETTE.length]; }
function humanize(value: string) { return value.replace(/[-_]/g, " "); }
function level(node: SceneNode) { return humanize(node.category ?? node.productType); }
function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

function buildStageGraph(nodes: SceneNode[]) {
  const membersByCluster = new Map<string, SceneNode[]>();
  for (const node of nodes) membersByCluster.set(node.sceneCluster, [...(membersByCluster.get(node.sceneCluster) ?? []), node]);
  const groups = [...membersByCluster.entries()].sort(([left], [right]) => left.localeCompare(right));
  const clusters: StageCluster[] = groups.map(([id, members], index) => {
    const angle = groups.length === 1 ? 0 : ((index / groups.length) * Math.PI * 2) - Math.PI / 2;
    const orbit = groups.length === 1 ? 2.9 : 3.3 + Math.floor(index / 8) * 2.4;
    return { id, count: members.length, position: [Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit], radius: Math.min(1.65, 0.78 + Math.sqrt(members.length) * 0.18), color: color(id) };
  });
  const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
  const points: StagePoint[] = groups.flatMap(([clusterId, members]) => {
    const cluster = clusterById.get(clusterId)!;
    return [...members].sort((left, right) => left.productId.localeCompare(right.productId)).map((node, index) => {
      const seed = Math.abs(node.positionSeed) || hash(node.productId);
      const angle = ((seed % 360) / 360) * Math.PI * 2 + index * 0.71;
      const radius = members.length === 1 ? 0 : 0.38 + ((Math.floor(seed / 31) % 100) / 100) * cluster.radius * 0.72;
      return { node, color: color(node.family), position: [cluster.position[0] + Math.cos(angle) * radius, -0.22 + ((Math.floor(seed / 97) % 100) / 100) * 1.25, cluster.position[2] + Math.sin(angle) * radius] as Vector3 };
    });
  });
  const pointById = new Map(points.map((point) => [point.node.productId, point]));
  const seen = new Set<string>(), edges: StageEdge[] = [];
  for (const source of points) for (const targetId of source.node.relationshipProductIds) {
    const target = pointById.get(targetId);
    if (!target) continue;
    const id = [source.node.productId, targetId].sort().join("::");
    if (seen.has(id)) continue;
    seen.add(id);
    edges.push({ id, from: source.position, to: target.position, color: source.color });
  }
  return { clusters, points, edges };
}

type Form = "agent" | "bundle" | "connector" | "guardrail" | "workflow" | "capability";
function form(node: SceneNode): Form {
  const value = `${node.objectArchetype ?? ""} ${node.productType}`.toLocaleLowerCase();
  if (/(agent|team|octa|pyramid)/.test(value)) return "agent";
  if (/(bundle|collection|suite|box|cube)/.test(value)) return "bundle";
  if (/(connector|integration|torus)/.test(value)) return "connector";
  if (/(guard|assurance|audit|shield|dodeca)/.test(value)) return "guardrail";
  if (/(workflow|pipeline|cylinder|automation)/.test(value)) return "workflow";
  return "capability";
}

function CapabilityGeometry({ kind }: { kind: Form }) {
  if (kind === "agent") return <octahedronGeometry args={[0.42, 1]} />;
  if (kind === "bundle") return <boxGeometry args={[0.62, 0.62, 0.62, 2, 2, 2]} />;
  if (kind === "connector") return <torusKnotGeometry args={[0.27, 0.085, 72, 10, 2, 3]} />;
  if (kind === "guardrail") return <dodecahedronGeometry args={[0.41, 1]} />;
  if (kind === "workflow") return <cylinderGeometry args={[0.28, 0.38, 0.72, 16, 2]} />;
  return <icosahedronGeometry args={[0.41, 2]} />;
}

function CapabilityObject({ point, selected, onSelect }: { point: StagePoint; selected: boolean; onSelect: (node: SceneNode) => void }) {
  const [hovered, setHovered] = useState(false), kind = form(point.node), scale = selected ? 1.28 : hovered ? 1.13 : 1;
  return <group position={point.position}>
    <mesh position={[0, -0.46, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.46, 0.58, 0.09, 32]} /><meshStandardMaterial color="#061b2d" metalness={0.82} roughness={0.28} /></mesh>
    <mesh rotation={[Math.PI / 2, hash(point.node.productId) % Math.PI, 0]} scale={selected ? 1.24 : 1}><torusGeometry args={[0.54, selected ? 0.026 : 0.014, 7, 48]} /><meshBasicMaterial color={selected ? "#f5bd53" : point.color} transparent opacity={selected ? 0.92 : 0.46} /></mesh>
    <mesh
      scale={scale}
      castShadow
      receiveShadow
      onClick={(event) => { event.stopPropagation(); onSelect(point.node); }}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <CapabilityGeometry kind={kind} />
      <meshPhysicalMaterial color={selected ? "#f5bd53" : point.color} emissive={selected ? "#f5bd53" : point.color} emissiveIntensity={selected ? 0.74 : hovered ? 0.43 : 0.24} metalness={0.78} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.18} />
    </mesh>
    <Html position={[0, 0.76, 0]} center sprite distanceFactor={10.5} zIndexRange={[4, 0]}>
      <Link className={`${styles.objectLabel}${selected ? ` ${styles.objectLabelSelected}` : ""}`} href={`/ai-marketplace/${encodeURIComponent(point.node.slug)}`} onClick={() => onSelect(point.node)}>
        <strong>{point.node.name}</strong><span>{point.node.family}</span><small>Level · {level(point.node)} · v{point.node.version}</small>
      </Link>
    </Html>
  </group>;
}

function CommandCore({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => { if (!reducedMotion && group.current) group.current.rotation.y += delta * 0.12; });
  return <group ref={group} position={[0, -0.35, 0]}>
    <mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[1.05, 0.028, 8, 72]} /><meshBasicMaterial color="#f5bd53" transparent opacity={0.68} /></mesh>
    <mesh rotation={[-Math.PI / 4, 0.5, 0]}><torusGeometry args={[0.72, 0.016, 8, 64]} /><meshBasicMaterial color="#2ed8f6" transparent opacity={0.6} /></mesh>
    <mesh><icosahedronGeometry args={[0.28, 2]} /><meshStandardMaterial color="#f5bd53" emissive="#f5bd53" emissiveIntensity={1.5} metalness={0.82} roughness={0.12} /></mesh>
  </group>;
}

function ContextMonitor({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => { canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", onRestored); };
  }, [gl, onLost, onRestored]);
  return null;
}

function CapabilityScene({ nodes, selectedId, onSelect, reducedMotion, onLost, onRestored }: { nodes: SceneNode[]; selectedId: string | null; onSelect: (node: SceneNode) => void; reducedMotion: boolean; onLost: () => void; onRestored: () => void }) {
  const graph = useMemo(() => buildStageGraph(nodes), [nodes]);
  return <>
    <color attach="background" args={["#020b14"]} /><fog attach="fog" args={["#020b14", 12, 32]} />
    <ambientLight intensity={0.48} /><directionalLight castShadow position={[5, 9, 6]} intensity={1.8} color="#e7fbff" /><pointLight position={[-5, 2, -4]} intensity={3.8} distance={18} color="#2ed8f6" /><pointLight position={[4, 1, 5]} intensity={3.2} distance={16} color="#f5bd53" />
    <gridHelper args={[30, 30, "#164e68", "#08283a"]} position={[0, -1.52, 0]} />
    <mesh position={[0, -1.54, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[14, 64]} /><meshStandardMaterial color="#03111e" metalness={0.34} roughness={0.76} /></mesh>
    <CommandCore reducedMotion={reducedMotion} />
    {graph.clusters.map((cluster) => <group key={cluster.id} position={[cluster.position[0], -1.44, cluster.position[2]]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[cluster.radius, 0.018, 7, 64]} /><meshBasicMaterial color={cluster.color} transparent opacity={0.54} /></mesh>
      <Html position={[0, 0.04, cluster.radius + 0.22]} center transform sprite distanceFactor={13}><div className={styles.clusterLabel}><span>{cluster.id}</span><b>{cluster.count}</b></div></Html>
    </group>)}
    {graph.edges.map((edge) => <Line key={edge.id} points={[edge.from, edge.to]} color={edge.color} lineWidth={0.85} transparent opacity={0.58} />)}
    {graph.points.map((point) => <CapabilityObject key={point.node.productId} point={point} selected={point.node.productId === selectedId} onSelect={onSelect} />)}
    <OrbitControls makeDefault enableDamping dampingFactor={0.075} enablePan enableZoom minDistance={5.4} maxDistance={24} minPolarAngle={0.32} maxPolarAngle={Math.PI * 0.82} target={[0, -0.15, 0]} />
    <ContextMonitor onLost={onLost} onRestored={onRestored} />
  </>;
}

class RendererBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function fallbackPosition(node: SceneNode, index: number, count: number) {
  const clusterAngle = (hash(node.sceneCluster) % 628) / 100;
  const localAngle = ((Math.abs(node.positionSeed) || hash(node.productId)) % 628) / 100 + index * 0.43;
  const radius = count === 1 ? 8 : 23 + (hash(node.sceneCluster) % 10);
  return { x: 50 + Math.cos(clusterAngle) * radius + Math.cos(localAngle) * 7, y: 51 + Math.sin(clusterAngle) * radius * 0.58 + Math.sin(localAngle) * 5, depth: 12 + (hash(node.productId) % 38) };
}

function SemanticFallback({ nodes, selectedId, onSelect, onRetry }: { nodes: SceneNode[]; selectedId: string | null; onSelect: (node: SceneNode) => void; onRetry: () => void }) {
  const points = useMemo(() => new Map(nodes.map((node, index) => [node.productId, fallbackPosition(node, index, nodes.length)])), [nodes]);
  const visible = new Set(nodes.map((node) => node.productId));
  return <div className={styles.fallback} role="group" aria-label="Semantic 2.5D capability map">
    <header><div><span>Designed compatibility view</span><strong>The same catalog records remain navigable.</strong></div><button type="button" onClick={onRetry}>Retry 3D</button></header>
    <div className={styles.fallbackField}>
      <div className={styles.fallbackArchitecture} aria-hidden="true"><i /><i /><b>OBSERRA<br />EPI</b></div>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">{nodes.flatMap((node) => node.relationshipProductIds.filter((target) => visible.has(target) && node.productId < target).map((target) => { const from = points.get(node.productId)!, to = points.get(target)!; return <line key={`${node.productId}-${target}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />; }))}</svg>
      {nodes.map((node) => { const point = points.get(node.productId)!; return <Link key={node.productId} href={`/ai-marketplace/${encodeURIComponent(node.slug)}`} className={`${styles.fallbackNode}${selectedId === node.productId ? ` ${styles.fallbackNodeSelected}` : ""}`} style={{ left: `${point.x}%`, top: `${point.y}%`, zIndex: point.depth }} onClick={() => onSelect(node)}><b>{initials(node.name)}</b><span><strong>{node.name}</strong><small>{node.family} · Level {level(node)}</small></span></Link>; })}
    </div>
  </div>;
}

function DesignedEmpty({ message, filtered, onReset }: { message: string; filtered: boolean; onReset: () => void }) {
  return <div className={styles.empty} role="status"><div className={styles.emptyArchitecture} aria-hidden="true"><i /><i /><i /><b>CAPABILITY<br />DOCK</b></div><div><span>{filtered ? "Filtered spatial view" : "Awaiting governed capability records"}</span><strong>{filtered ? "No objects match both active controls." : "The command deck is ready for verified inventory."}</strong><p>{filtered ? "Reset Family and Cluster to restore this bounded scene." : message}</p>{filtered && <button type="button" onClick={onReset}>Reset spatial controls</button>}</div></div>;
}

function webglAvailable() {
  try { const canvas = document.createElement("canvas"); return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")); } catch { return false; }
}

export default function MarketplaceSpatialStage({ label, nodes, selectedId = null, onSelect, emptyMessage }: { label: string; nodes: SceneNode[]; selectedId?: string | null; onSelect?: (node: SceneNode) => void; emptyMessage: string }) {
  const router = useRouter(), uid = useId(), recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [family, setFamily] = useState(""), [cluster, setCluster] = useState(""), [renderer, setRenderer] = useState<"checking" | "loading" | "ready" | "recovering" | "fallback">(() => typeof window === "undefined" ? "checking" : webglAvailable() ? "loading" : "fallback"), [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches), [attempt, setAttempt] = useState(0);
  const families = useMemo(() => [...new Set(nodes.map((node) => node.family))].sort((left, right) => left.localeCompare(right)), [nodes]);
  const clusters = useMemo(() => [...new Set(nodes.map((node) => node.sceneCluster))].sort((left, right) => left.localeCompare(right)), [nodes]);
  const visibleNodes = useMemo(() => nodes.filter((node) => (!family || node.family === family) && (!cluster || node.sceneCluster === cluster)).slice(0, 48), [cluster, family, nodes]);
  const selectedNode = nodes.find((node) => node.productId === selectedId) ?? null;
  const select = useCallback((node: SceneNode) => onSelect?.(node), [onSelect]);
  const reset = useCallback(() => { setFamily(""); setCluster(""); }, []);
  const retry = useCallback(() => { setRenderer(webglAvailable() ? "loading" : "fallback"); setAttempt((value) => value + 1); }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)"), update = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); if (recoveryTimer.current) clearTimeout(recoveryTimer.current); };
  }, []);

  const contextLost = useCallback(() => { setRenderer("recovering"); if (recoveryTimer.current) clearTimeout(recoveryTimer.current); recoveryTimer.current = setTimeout(() => setRenderer("fallback"), 1800); }, []);
  const contextRestored = useCallback(() => { if (recoveryTimer.current) clearTimeout(recoveryTimer.current); recoveryTimer.current = null; setRenderer("ready"); }, []);
  const keyboard = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!visibleNodes.length) return;
    const current = visibleNodes.findIndex((node) => node.productId === selectedId);
    let next = current < 0 ? 0 : current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (next + 1) % visibleNodes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (next - 1 + visibleNodes.length) % visibleNodes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = visibleNodes.length - 1;
    else if (event.key === "Enter" && selectedNode) { event.preventDefault(); router.push(`/ai-marketplace/${encodeURIComponent(selectedNode.slug)}`); return; }
    else return;
    event.preventDefault(); select(visibleNodes[next]);
  }, [router, select, selectedId, selectedNode, visibleNodes]);

  const filtered = Boolean((family || cluster) && nodes.length);
  return <section className={styles.stage} aria-label={label}>
    <header className={styles.stageHeader}><div><span>Catalog spatial system</span><strong>{label}</strong></div><div className={styles.stageCount}><b>{visibleNodes.length}</b><span>verified object{visibleNodes.length === 1 ? "" : "s"}</span></div></header>
    <div className={styles.controls} aria-label={`${label} scene controls`}>
      <label htmlFor={`${uid}-family`}>Family<select id={`${uid}-family`} value={family} onChange={(event) => setFamily(event.target.value)}><option value="">All families</option>{families.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label htmlFor={`${uid}-cluster`}>Cluster<select id={`${uid}-cluster`} value={cluster} onChange={(event) => setCluster(event.target.value)}><option value="">All clusters</option>{clusters.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <button type="button" onClick={reset} disabled={!family && !cluster}>Reset</button>
      <span>Arrows select · Enter opens</span>
    </div>
    <div className={styles.viewport} data-renderer={renderer} tabIndex={0} onKeyDown={keyboard} aria-label={`${label}. Use arrow keys to select a capability and Enter to open its stable product route.`}>
      {visibleNodes.length === 0 ? <DesignedEmpty message={emptyMessage} filtered={filtered} onReset={reset} /> : renderer === "fallback" ? <SemanticFallback nodes={visibleNodes} selectedId={selectedId} onSelect={select} onRetry={retry} /> : <RendererBoundary key={attempt} onFailure={() => setRenderer("fallback")}>
        <Canvas dpr={reducedMotion ? 1 : [1, 1.65]} camera={{ position: [0, 6.3, 13.5], fov: 48, near: 0.1, far: 70 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} shadows={!reducedMotion} frameloop={reducedMotion ? "demand" : "always"} onCreated={() => setRenderer("ready")}>
          <CapabilityScene nodes={visibleNodes} selectedId={selectedId} onSelect={select} reducedMotion={reducedMotion} onLost={contextLost} onRestored={contextRestored} />
        </Canvas>
      </RendererBoundary>}
      {renderer === "loading" && visibleNodes.length > 0 && <div className={styles.loading} role="status"><i /><span>Assembling catalog geometry…</span></div>}
      {renderer === "recovering" && <div className={styles.loading} role="status"><i /><span>Recovering the graphics context…</span></div>}
    </div>
    {visibleNodes.length > 0 && <div className={styles.selection} aria-live="polite">{selectedNode ? <><div><span>Selected capability</span><strong>{selectedNode.name}</strong><small>{selectedNode.family} · Level {level(selectedNode)} · v{selectedNode.version}</small></div><Link href={`/ai-marketplace/${encodeURIComponent(selectedNode.slug)}`}>Open stable record <span aria-hidden="true">→</span></Link></> : <><div><span>Capability focus</span><strong>Select a labelled object.</strong><small>The scene uses only server catalog identity, cluster, form, position, and relationship facts.</small></div><span className={styles.selectionHint}>Arrow keys are available</span></>}</div>}
    {visibleNodes.length > 0 && <div className={styles.index} aria-label={`${label} semantic scene index`}><span>Semantic navigator</span><div>{visibleNodes.map((node) => <button type="button" key={node.productId} aria-pressed={node.productId === selectedId} onClick={() => select(node)}><b>{initials(node.name)}</b><span><strong>{node.name}</strong><small>{node.family} · Level {level(node)}</small></span></button>)}</div></div>}
  </section>;
}
