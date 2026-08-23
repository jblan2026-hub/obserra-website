"use client";

import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import type { Group } from "three";
import type { MarketplacePedestalDetail } from "../../lib/marketplace-v12-product-pedestal";
import styles from "./MarketplaceDimensionalPedestal.module.css";

function hash(value: string) { let output = 2166136261; for (let index = 0; index < value.length; index += 1) output = Math.imul(output ^ value.charCodeAt(index), 16777619); return output >>> 0; }
type SceneKind = "capability" | "agent" | "workflow" | "bridge" | "assurance" | "collection";

const palettes = [
  { primary: "#30d7ff", secondary: "#8bf0ff", accent: "#f6bd4c" },
  { primary: "#8b7cff", secondary: "#c9c2ff", accent: "#33d9ff" },
  { primary: "#35de9e", secondary: "#a1f6d2", accent: "#f7bd4d" },
  { primary: "#f9bd4b", secondary: "#ffe3a1", accent: "#33d4f4" },
  { primary: "#ff6680", secondary: "#ffb2be", accent: "#39d8ff" },
] as const;

function sceneKind(detail: MarketplacePedestalDetail): SceneKind {
  const identity = `${detail.productType} ${detail.family} ${detail.objectArchetype ?? ""}`.toLowerCase();
  if (/collection|bundle|suite|repository/.test(identity)) return "collection";
  if (/assurance|validator|guard|governance|evidence|security/.test(identity)) return "assurance";
  if (/connector|plugin|integration|bridge|mcp/.test(identity)) return "bridge";
  if (/workflow|playbook|automation|orchestration/.test(identity)) return "workflow";
  if (/agent|team/.test(identity)) return "agent";
  return "capability";
}

function sceneLabel(kind: SceneKind) {
  return ({ capability: "Capability engine", agent: "Agent command core", workflow: "Workflow engine", bridge: "Integration bridge", assurance: "Assurance shield", collection: "Capability constellation" })[kind];
}

function CapabilityAssembly({ detail, kind, reducedMotion }: { detail: MarketplacePedestalDetail; kind: SceneKind; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const palette = palettes[hash(`${detail.family}:${detail.positionSeed}`) % palettes.length];
  useFrame(({ clock }, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.12;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.08;
  });
  const material = <meshPhysicalMaterial color={palette.primary} emissive={palette.primary} emissiveIntensity={0.14} metalness={0.78} roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} />;
  const accentMaterial = <meshPhysicalMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.2} metalness={0.72} roughness={0.18} clearcoat={1} />;

  return <group ref={group} rotation={[0.16, -0.45, 0]}>
    {kind === "agent" && <>
      <mesh>{material}<icosahedronGeometry args={[1.12, 2]} /><Edges color={palette.secondary} threshold={18} /></mesh>
      <mesh rotation={[Math.PI / 2.6, 0.15, 0]}><torusGeometry args={[1.48, 0.055, 12, 96]} />{accentMaterial}</mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 1.52, side * 0.2, side * 0.18]} scale={0.24}>{accentMaterial}<octahedronGeometry args={[1, 0]} /></mesh>)}
    </>}
    {kind === "workflow" && <>
      {[-0.78, 0, 0.78].map((y, index) => <mesh key={y} position={[(index - 1) * 0.22, y, 0]} rotation={[0, index * 0.28, 0]}>{index === 1 ? accentMaterial : material}<boxGeometry args={[1.85 - Math.abs(index - 1) * 0.25, 0.42, 0.9]} /><Edges color={palette.secondary} /></mesh>)}
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.52, 0.055, 10, 80]} />{accentMaterial}</mesh>
    </>}
    {kind === "bridge" && <>
      <mesh position={[-0.86, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.22, 20, 72]} />{material}<Edges color={palette.secondary} /></mesh>
      <mesh position={[0.86, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.22, 20, 72]} />{accentMaterial}<Edges color={palette.secondary} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.16, 1.75, 24]} /><meshStandardMaterial color={palette.secondary} emissive={palette.primary} emissiveIntensity={0.22} metalness={0.8} roughness={0.18} /></mesh>
    </>}
    {kind === "assurance" && <>
      <mesh scale={[1.05, 1.25, 0.58]}>{material}<dodecahedronGeometry args={[1.05, 1]} /><Edges color={palette.secondary} threshold={15} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.48, 0.065, 12, 96]} />{accentMaterial}</mesh>
      <mesh position={[0, 0, 0.68]} scale={0.38}>{accentMaterial}<octahedronGeometry args={[1, 0]} /></mesh>
    </>}
    {kind === "collection" && <>
      <mesh>{accentMaterial}<icosahedronGeometry args={[0.7, 2]} /><Edges color={palette.secondary} /></mesh>
      {[[1.28, .35, .1], [-1.15, .5, -.3], [.38, -1.08, .25], [-.42, 1.16, -.22]].map((position, index) => <group key={position.join(":")} position={position as [number, number, number]}>
        <mesh scale={0.38 + index * 0.035}>{material}<dodecahedronGeometry args={[1, 1]} /><Edges color={palette.secondary} /></mesh>
        <mesh rotation={[Math.PI / 2, index * 0.4, 0]}><torusGeometry args={[0.58, 0.025, 8, 48]} /><meshBasicMaterial color={palette.accent} /></mesh>
      </group>)}
    </>}
    {kind === "capability" && <>
      <mesh>{material}<icosahedronGeometry args={[1.18, 3]} /><Edges color={palette.secondary} threshold={14} /></mesh>
      <mesh rotation={[Math.PI / 2.7, 0.1, 0.4]}><torusGeometry args={[1.5, 0.06, 12, 96]} />{accentMaterial}</mesh>
      <mesh rotation={[-Math.PI / 3.2, 0.2, -0.5]}><torusGeometry args={[1.32, 0.035, 10, 80]} /><meshBasicMaterial color={palette.secondary} /></mesh>
    </>}
    <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.72, 0.035, 10, 96]} /><meshBasicMaterial color={palette.primary} transparent opacity={0.55} /></mesh>
  </group>;
}

function SemanticCapabilityObject({ detail, kind, loading = false }: { detail: MarketplacePedestalDetail; kind: SceneKind; loading?: boolean }) {
  return <article className={styles.semanticObject} aria-label={`${sceneLabel(kind)} for ${detail.name}`}>
    <div className={styles.semanticGlyph} data-kind={kind} aria-hidden="true"><i /><i /><b>{detail.productType.slice(0, 2).toUpperCase()}</b></div>
    <div><span>{loading ? "Preparing interactive view" : "Interactive capability view"}</span><strong>{detail.name}</strong><small>{detail.family}</small></div>
  </article>;
}

function ProductScene({ detail, kind, reducedMotion }: { detail: MarketplacePedestalDetail; kind: SceneKind; reducedMotion: boolean }) {
  return <>
    <ambientLight intensity={0.72} />
    <hemisphereLight color="#d9f7ff" groundColor="#03131f" intensity={1.3} />
    <spotLight position={[4.5, 5.5, 5]} angle={0.5} penumbra={0.9} intensity={110} color="#62dcff" />
    <spotLight position={[-4, 1, 3]} angle={0.6} penumbra={1} intensity={80} color="#f7bd4d" />
    <CapabilityAssembly detail={detail} kind={kind} reducedMotion={reducedMotion} />
    <ContactShadows position={[0, -1.82, 0]} opacity={0.55} scale={7} blur={2.8} far={4} />
  </>;
}

function money(amount: number, currency: string) { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100); }
function fact(value: string | null) { return value ? value.replace(/[-_]/g, " ") : "Not recorded"; }

function ProductObject({ detail }: { detail: MarketplacePedestalDetail }) {
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"checking" | "loading" | "ready" | "fallback">("checking");
  const [reducedMotion, setReducedMotion] = useState(false);
  const kind = useMemo(() => sceneKind(detail), [detail]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    motion.addEventListener("change", updateMotion);
    const probe = document.createElement("canvas");
    const supported = Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
    const frame = window.requestAnimationFrame(() => { updateMotion(); setMode(supported ? "loading" : "fallback"); });
    return () => { window.cancelAnimationFrame(frame); motion.removeEventListener("change", updateMotion); };
  }, []);

  useEffect(() => {
    if (mode !== "ready") return;
    const canvas = stage.current?.querySelector("canvas");
    if (!canvas) return;
    const lost = (event: Event) => { event.preventDefault(); setMode("fallback"); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [mode]);

  return <div className={styles.object}>
    <div ref={stage} className={styles.objectStage} data-mode={mode}>
      {(mode === "checking" || mode === "fallback") && <SemanticCapabilityObject detail={detail} kind={kind} loading={mode === "checking"} />}
      {(mode === "loading" || mode === "ready") && <>
        <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.15, 6.4], fov: 42, near: 0.1, far: 60 }} performance={{ min: 0.55 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={() => setMode("ready")} role="img" aria-label={`${sceneLabel(kind)} for ${detail.name}. Drag to orbit and use the scroll wheel to zoom.`}>
          <Suspense fallback={<Html center><span className={styles.sceneLoader}>Building the interactive view</span></Html>}><ProductScene detail={detail} kind={kind} reducedMotion={reducedMotion} /></Suspense>
          <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} enablePan={false} minDistance={4.2} maxDistance={9} minPolarAngle={0.42} maxPolarAngle={Math.PI - 0.55} autoRotate={!reducedMotion} autoRotateSpeed={0.45} />
        </Canvas>
        <div className={styles.objectIdentity}><span>{sceneLabel(kind)}</span><strong>{detail.name}</strong><small>{detail.family}</small></div>
      </>}
      <span>{mode === "ready" ? "Drag to explore the capability object; scroll to zoom." : "A labeled capability view remains available while the interactive view loads."}</span>
    </div>
    <button type="button" onClick={() => controls.current?.reset()} disabled={mode !== "ready"}>Reset view</button>
  </div>;
}

export default function MarketplaceDimensionalPedestal({ detail, checkoutEnabled }: { detail: MarketplacePedestalDetail; checkoutEnabled: boolean; runtimeReason: string }) {
  const [selectedOffer, setSelectedOffer] = useState(0);
  const offer = detail.pricing.offers[selectedOffer] ?? null;
  const hasOnlineCheckout = checkoutEnabled && detail.action.enabled;
  const isSkill = /skill/i.test(`${detail.name} ${detail.family} ${detail.productType}`);
  const isAcademy = /academy|course|training/i.test(`${detail.name} ${detail.family} ${detail.productType}`);

  return <section className={styles.pedestal} aria-labelledby="dimensional-product-title">
    <header className={styles.header}>
      <div><p>Interactive capability</p><h1 id="dimensional-product-title">{detail.name}</h1><span>{detail.family}</span></div>
      <div className={styles.action} data-enabled={hasOnlineCheckout ? "true" : "false"}><span>Purchase availability</span><strong>{hasOnlineCheckout ? "Purchase online" : "Contact for purchase"}</strong><small>{hasOnlineCheckout ? "Select an option below to continue." : "Online checkout is not available for this product yet."}</small></div>
    </header>

    <div className={styles.layout}>
      <ProductObject detail={detail} />
      <article className={styles.inspector}>
        <p className={styles.eyebrow}>About this capability</p><h2>Built for practical outcomes</h2><p>{detail.description}</p>
        {detail.mission && <blockquote><span>Purpose</span>{detail.mission}</blockquote>}
        <dl><div><dt>Created by</dt><dd>{detail.publisher}</dd></div><div><dt>Capability area</dt><dd>{detail.family}</dd></div><div><dt>Format</dt><dd>{fact(detail.productType)}</dd></div><div><dt>What you receive</dt><dd>{detail.deliverable ?? "Product details provided at purchase."}</dd></div></dl>
      </article>
    </div>

    <section className={styles.commercial} aria-labelledby="commercial-title">
      <div><p className={styles.eyebrow}>Purchase options</p><h2 id="commercial-title">Choose how you want to get started.</h2><p>{detail.pricingBasis ?? "Choose an option or contact us for tailored licensing."}</p></div>
      {detail.pricing.offers.length ? <fieldset><legend>Available options</legend><div>{detail.pricing.offers.map((entry, index) => <label key={`${entry.kind}-${entry.amount_minor}-${entry.cadence ?? "once"}`}><input type="radio" name={`pedestal-offer-${detail.productId}`} checked={selectedOffer === index} onChange={() => setSelectedOffer(index)} /><span><strong>{money(entry.amount_minor, entry.currency)}{entry.cadence ? ` / ${entry.cadence}` : " one-time"}</strong><small>{fact(entry.kind)}</small></span></label>)}</div><output aria-live="polite">Selected option: {offer ? `${money(offer.amount_minor, offer.currency)}${offer.cadence ? ` / ${offer.cadence}` : " one-time"}` : "No option selected"}</output></fieldset> : <p className={styles.notice}>Contact us for availability and licensing options.</p>}
      <div className={styles.actionRow}>
        <span className={styles.unavailable} aria-live="polite">{hasOnlineCheckout ? "Secure checkout is available for this product." : "Online checkout is coming soon for this product."}</span>
        <Link className={styles.secondaryAction} href={`/contact?interest=ai-marketplace&product=${encodeURIComponent(detail.productId)}`}>Talk to an expert</Link>
      </div>
    </section>

    <section className={styles.relationships} aria-labelledby="relationship-title">
      <div><p className={styles.eyebrow}>Explore more</p><h2 id="relationship-title">Related capabilities.</h2><p>Continue exploring the capabilities that complement this product.</p></div>
      {detail.relationships.length ? <ul>{detail.relationships.map((entry) => <li key={entry.productId}><span>{entry.family}</span><strong>{entry.name}</strong><small>{fact(entry.productType)}</small><Link href={`/ai-marketplace/${encodeURIComponent(entry.slug)}`}>View capability</Link></li>)}</ul> : <p className={styles.notice}>Explore the marketplace to discover related capabilities.</p>}
    </section>

    <nav className={styles.footerNav} aria-label="Product next steps">
      <Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Compare capabilities</Link>
      <Link href={`/ai-marketplace/configure?mission=${encodeURIComponent(detail.mission ? detail.slug : "")}&items=${encodeURIComponent(detail.slug)}`}>Plan your solution</Link>
      {isSkill && <Link href="/ai-marketplace/skill-libraries">Explore skills</Link>}
      {isAcademy && <Link href="/academy">Explore Academy courses</Link>}
      <Link href="/ai-marketplace/hangar">My library</Link>
    </nav>
  </section>;
}
