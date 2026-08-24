"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Boxes, BrainCircuit, CheckCircle2, Cloud, Code2, Database, FileText, Globe, PlugZap, ShieldCheck, Workflow } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MarketplaceV12Card } from "../../lib/marketplace-v12-catalog";
import styles from "./MarketplaceSalesDock.module.css";

type Props = { products: MarketplaceV12Card[] };
type ProductForm = "agent" | "collection" | "connector" | "protection" | "workflow" | "capability";

function words(value: string | null | undefined) { return value?.trim().replace(/[-_]/g, " ") || "All levels"; }
function unique(products: MarketplaceV12Card[]) { return [...new Map(products.map((product) => [product.product_id, product])).values()]; }
function level(product: MarketplaceV12Card) { return words(product.proficiency || product.product_type); }
function category(product: MarketplaceV12Card) { return words(product.category || product.family); }
function buyerText(product: MarketplaceV12Card, value: string | null | undefined) {
  const copy = value?.trim();
  if (!copy || /\b(?:artifact|checksum|file ?name|manifest|sha(?:256)?|hash|verification|verified|validation|catalog record|execution evidence)\b/i.test(copy) || /\.(?:json|ya?ml|zip|tar|gz|md|txt|csv)\b/i.test(copy)) return `${product.name} helps move ${category(product)} work from a clear request to a usable outcome.`;
  return copy;
}
function outcome(product: MarketplaceV12Card) { return buyerText(product, product.mission || product.description); }
function offeringLabel(product: MarketplaceV12Card) {
  if (product.product_type === "ai-skill") return "AI skill";
  if (product.product_type === "agent-team") return "Agent team";
  if (product.product_type === "workflow-pack") return "Workflow pack";
  if (product.product_type === "industry-edition") return "Industry edition";
  return words(product.product_type);
}
function form(product: MarketplaceV12Card): ProductForm {
  const value = `${product.product_type} ${product.family} ${product.visualization.object_archetype ?? ""}`.toLowerCase();
  if (/collection|bundle|suite|repository/.test(value)) return "collection";
  if (/guard|assurance|audit|security|evidence|governance/.test(value)) return "protection";
  if (/connector|integration|plugin|bridge|mcp/.test(value)) return "connector";
  if (/workflow|automation|playbook|pipeline/.test(value)) return "workflow";
  if (/agent|team/.test(value)) return "agent";
  return "capability";
}
function CategoryIcon({ name }: { name: string }) {
  const value = name.toLowerCase(), props = { size: 19, strokeWidth: 1.8, "aria-hidden": true } as const;
  if (/security|assurance|risk|governance|audit/.test(value)) return <ShieldCheck {...props} />;
  if (/agent|ai|intelligence|machine|model/.test(value)) return <BrainCircuit {...props} />;
  if (/workflow|productivity|automation|operation/.test(value)) return <Workflow {...props} />;
  if (/connector|integration|plugin|mcp/.test(value)) return <PlugZap {...props} />;
  if (/data|database|record/.test(value)) return <Database {...props} />;
  if (/cloud|infrastructure|devops/.test(value)) return <Cloud {...props} />;
  if (/document|report|content/.test(value)) return <FileText {...props} />;
  if (/web|browser|internet/.test(value)) return <Globe {...props} />;
  if (/develop|code|api/.test(value)) return <Code2 {...props} />;
  if (/team|collection|bundle|suite/.test(value)) return <Boxes {...props} />;
  return <CheckCircle2 {...props} />;
}
function offer(product: MarketplaceV12Card) {
  const offers = product.pricing.offers ?? [];
  if (!offers.length || product.pricing.model === "quote") return { price: "Tailored pricing", note: "Built around your requirements", href: `/contact?interest=ai-marketplace&product=${encodeURIComponent(product.product_id)}`, action: "Talk to an expert" };
  const lowest = [...offers].sort((left, right) => left.amount_minor - right.amount_minor)[0];
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: lowest.currency }).format(lowest.amount_minor / 100);
  const cadence = lowest.cadence && lowest.cadence !== "one-time" ? ` / ${words(lowest.cadence)}` : " one-time";
  return { price: `${amount}${cadence}`, note: offers.length > 1 ? `${offers.length} ways to purchase` : "Clear product pricing", href: `/ai-marketplace/${encodeURIComponent(product.slug)}#purchase-options`, action: "Buy now" };
}

function inputLabel(kind: ProductForm) { return ({ agent: "Your objective", workflow: "Starting request", connector: "Your tools", protection: "Work to review", collection: "Your mission", capability: "Your need" })[kind]; }
function resultText(product: MarketplaceV12Card) { return outcome(product); }
function demoSteps(product: MarketplaceV12Card) {
  return [
    { label: "Step 1 · Input", title: inputLabel(form(product)), body: `Bring the goal, context, and requirements for your ${category(product)} work.`, tags: [category(product), level(product)] },
    { label: "Step 2 · Capability in use", title: product.name, body: buyerText(product, product.description), tags: [product.family, offeringLabel(product)] },
    { label: "Step 3 · Outcome", title: "Work ready to move forward", body: resultText(product), tags: ["Buyer outcome", level(product)] },
  ] as const;
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => { const canvas = gl.domElement, lost = (event: Event) => { event.preventDefault(); onLost(); }; canvas.addEventListener("webglcontextlost", lost); return () => canvas.removeEventListener("webglcontextlost", lost); }, [gl, onLost]);
  return null;
}

function StorefrontScene({ selected, onLost }: { selected: MarketplaceV12Card; onLost: () => void }) {
  const positions: [number, number, number][] = [[-2.35, 0.55, -0.35], [0, -0.42, 0.55], [2.35, 0.55, -0.15]], rotations: [number, number, number][] = [[0.02, 0.13, -0.015], [-0.03, 0, 0], [0.02, -0.13, 0.015]];
  const steps = demoSteps(selected);
  return <>
    <color attach="background" args={["#020b14"]} /><fog attach="fog" args={["#020b14", 9, 19]} />
    <Line points={[positions[0], positions[1], positions[2]]} color="#43d5ef" lineWidth={1.2} transparent opacity={0.58} />
    {steps.map((step, index) => <Html key={step.label} transform position={positions[index]} rotation={rotations[index]} distanceFactor={5.2} zIndexRange={[5 - index, 0]}><article className={styles.demoPanel} data-step={index + 1}><header><span>{step.label}</span><b>{String(index + 1).padStart(2, "0")}</b></header><h4>{step.title}</h4><p>{step.body}</p><div>{step.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>{index === 1 && <footer><i /><span>Applying selected capability</span></footer>}</article></Html>)}
    <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan={false} minDistance={7.4} maxDistance={10.5} minPolarAngle={1.02} maxPolarAngle={1.5} minAzimuthAngle={-0.32} maxAzimuthAngle={0.32} target={[0, 0.1, 0]} />
    <ContextMonitor onLost={onLost} />
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function TouchDemo({ selected }: { selected: MarketplaceV12Card }) {
  return <div className={styles.touchDemo} aria-label={`How ${selected.name} works`}>{demoSteps(selected).map((step, index) => <article key={step.label}><header><span>{step.label}</span><b>{String(index + 1).padStart(2, "0")}</b></header><h4>{step.title}</h4><p>{step.body}</p><div>{step.tags.map((tag) => <small key={tag}>{tag}</small>)}</div></article>)}</div>;
}

function SpatialStage({ products, selected, onSelect }: { products: MarketplaceV12Card[]; selected: MarketplaceV12Card; onSelect: (product: MarketplaceV12Card) => void }) {
  const router = useRouter(), [renderer, setRenderer] = useState<"loading" | "ready" | "fallback">("loading"), [compact, setCompact] = useState(false), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)"), update = () => setCompact(mobile.matches); mobile.addEventListener("change", update);
    let supported = false; try { const probe = document.createElement("canvas"); supported = Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl")); } catch { supported = false; }
    const frame = window.requestAnimationFrame(() => { setCompact(mobile.matches); if (!supported) setRenderer("fallback"); });
    return () => { window.cancelAnimationFrame(frame); mobile.removeEventListener("change", update); };
  }, []);
  const retry = () => { setAttempt((value) => value + 1); setRenderer("loading"); };
  const keyboard = (event: React.KeyboardEvent<HTMLDivElement>) => { const current = products.findIndex((product) => product.product_id === selected.product_id); let next = current; if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % products.length; else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + products.length) % products.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = products.length - 1; else if (event.key === "Enter") { event.preventDefault(); router.push(offer(selected).href); return; } else return; event.preventDefault(); onSelect(products[next]); };
  const fallback = compact || renderer === "fallback";
  return <div className={styles.stage} tabIndex={0} onKeyDown={keyboard} aria-label="Featured product preview. Use arrow keys to choose a product and Enter to open it.">
    {fallback ? <><TouchDemo selected={selected} />{!compact && <button className={styles.retry} type="button" onClick={retry}>Try dimensional preview</button>}</> : <SceneBoundary key={attempt} onFailure={() => setRenderer("fallback")}><Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.1, 9], fov: 46, near: 0.1, far: 40 }} performance={{ min: 0.6 }} frameloop="demand" gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} onCreated={() => setRenderer("ready")} role="img" aria-label={`Layered demonstration of ${selected.name}: input, capability in use, and buyer outcome.`}><StorefrontScene selected={selected} onLost={() => setRenderer("fallback")} /></Canvas></SceneBoundary>}
    {!fallback && renderer === "loading" && <div className={styles.loading} role="status"><i /><span>Preparing featured products…</span></div>}
    <p className={styles.stageHelp}>{fallback ? "Input → capability in use → outcome" : "Drag gently to inspect each workflow layer · scroll to zoom"}</p>
  </div>;
}

export default function MarketplaceSalesDock({ products }: Props) {
  const records = useMemo(() => unique(products).slice(0, 16), [products]);
  const [selectedId, setSelectedId] = useState(records[0]?.product_id ?? "");
  const [activeLevel, setActiveLevel] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const selected = records.find((product) => product.product_id === selectedId) ?? records[0];
  const select = useCallback((product: MarketplaceV12Card) => setSelectedId(product.product_id), []);
  if (!selected) return null;
  const availableLevels = ["Beginner", "Intermediate", "Expert", "Advanced"].filter((name) => records.some((product) => product.proficiency?.toLowerCase() === name.toLowerCase()));
  const levelRecords = activeLevel === "All" ? records : records.filter((product) => product.proficiency?.toLowerCase() === activeLevel.toLowerCase());
  const categories = [...new Map(levelRecords.map((product) => [category(product), levelRecords.filter((entry) => category(entry) === category(product))])).entries()].sort(([left], [right]) => left.localeCompare(right));
  const visibleRecords = activeCategory === "All" ? levelRecords : levelRecords.filter((product) => category(product) === activeCategory);
  const chooseLevel = (name: string) => { const next = name === "All" ? records : records.filter((product) => product.proficiency?.toLowerCase() === name.toLowerCase()); setActiveLevel(name); setActiveCategory("All"); if (next[0]) select(next[0]); };
  const chooseCategory = (name: string, entries: MarketplaceV12Card[]) => { setActiveCategory(name); if (entries[0]) select(entries[0]); };
  const selectedOffer = offer(selected);
  return <section className={styles.dock} aria-labelledby="sales-dock-heading">
    <header className={styles.header}><div><p>Featured Obserra capabilities</p><h2 id="sales-dock-heading">Choose by outcome, level, and fit.</h2></div><p>Explore a connected selection of practical AI products. Focus one capability to see what it helps you achieve and the clearest next step.</p></header>
    <div className={styles.storefront}>
      <SpatialStage products={visibleRecords.length ? visibleRecords : records} selected={selected} onSelect={select} />
      <article className={styles.focus} aria-live="polite"><p>Focused capability</p><span className={styles.focusMeta}>{level(selected)} · {category(selected)}</span><h3>{selected.name}</h3><p className={styles.outcome}>{outcome(selected)}</p><dl><div><dt>Best fit</dt><dd>{category(selected)}</dd></div><div><dt>Experience level</dt><dd>{level(selected)}</dd></div><div><dt>Price</dt><dd>{selectedOffer.price}</dd><small>{selectedOffer.note}</small></div></dl><Link href={selectedOffer.href}>{selectedOffer.action}<span aria-hidden="true">→</span></Link></article>
      <nav className={styles.navigator} aria-label="Featured products by level and category">
        <header><div><span>Explore by fit</span><strong>Levels and categories</strong></div><div className={styles.levelChips}>{["All", ...availableLevels].map((name) => <button type="button" key={name} aria-pressed={activeLevel === name} onClick={() => chooseLevel(name)}>{name}</button>)}</div></header>
        <div className={styles.categoryTiles}><button type="button" className={activeCategory === "All" ? styles.categorySelected : undefined} onClick={() => chooseCategory("All", levelRecords)}><i><Boxes size={19} strokeWidth={1.8} aria-hidden="true" /></i><span><strong>All categories</strong><small>{levelRecords.length} individual capabilities</small></span></button>{categories.map(([name, entries]) => <button type="button" className={activeCategory === name ? styles.categorySelected : undefined} key={name} onClick={() => chooseCategory(name, entries)}><i><CategoryIcon name={name} /></i><span><strong>{name}</strong><small>{outcome(entries[0])}</small></span></button>)}</div>
        <div className={styles.skillPicker}><span>Individual capabilities</span><ul>{(visibleRecords.length ? visibleRecords : levelRecords).map((product) => {
          const productOffer = offer(product);
          const productHref = `/ai-marketplace/${encodeURIComponent(product.slug)}`;
          return <li key={product.product_id} data-selected={product.product_id === selected.product_id ? "true" : "false"}>
            <Link className={styles.skillCardLink} href={productHref} aria-label={`Open ${product.name}`}><span aria-hidden="true" /></Link>
            <div><strong className={styles.skillName}>{product.name}</strong><small>{level(product)}</small></div>
            <p>{outcome(product)}</p>
            <div className={styles.skillTags}><span>{category(product)}</span><span>{offeringLabel(product)}</span></div>
            <footer><strong>{productOffer.price}</strong><span className={styles.openProduct}>{product.pricing.offers.length ? "Buy now" : "Open product"} <b aria-hidden="true">→</b></span><button type="button" aria-pressed={product.product_id === selected.product_id} onClick={() => select(product)}>{product.product_id === selected.product_id ? "Focused" : "Preview here"}</button></footer>
          </li>;
        })}</ul></div>
      </nav>
    </div>
  </section>;
}
