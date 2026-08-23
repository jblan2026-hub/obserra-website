"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import Link from "next/link";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MarketplacePublicProductDetail } from "../../lib/marketplace-public-product";
import styles from "./MarketplaceDimensionalPedestal.module.css";

type MarketplaceBuyerProductDetail = Omit<MarketplacePublicProductDetail, "publisher" | "productType" | "tags" | "positionSeed" | "objectArchetype">;
type DemoStep = Readonly<{ label: string; title: string; body: string; tags: readonly string[] }>;

function plain(value: string | null | undefined, fallback = "All levels") {
  return value?.trim().replace(/[-_]+/g, " ") || fallback;
}

function productFocus(detail: MarketplaceBuyerProductDetail) {
  return plain(detail.capability ?? detail.domain ?? detail.category ?? detail.family, "your work");
}

function buyerText(value: string | null | undefined, fallback: string) {
  const copy = value?.trim();
  if (!copy || /\b(?:artifact|checksum|file ?name|manifest|sha(?:256)?|hash|verification|verified|validation|catalog record|execution evidence)\b/i.test(copy) || /\.(?:json|ya?ml|zip|tar|gz|md|txt|csv)\b/i.test(copy)) return fallback;
  return copy;
}

function demoSteps(detail: MarketplaceBuyerProductDetail): readonly DemoStep[] {
  const focus = productFocus(detail);
  const level = plain(detail.proficiency);
  return [
    {
      label: "Step 1 · Input",
      title: `Your ${focus} goal`,
      body: `Bring the goal, context, and requirements you want to move forward.`,
      tags: [focus, level],
    },
    {
      label: "Step 2 · Capability in use",
      title: detail.name,
      body: buyerText(detail.description, `${detail.name} applies a focused capability to your ${focus} work.`),
      tags: [plain(detail.category ?? detail.family, "Practical capability"), level],
    },
    {
      label: "Step 3 · Outcome",
      title: "Work ready to move forward",
      body: buyerText(detail.mission ?? detail.deliverable, `A practical outcome for your ${focus} work.`),
      tags: ["Buyer outcome", level],
    },
  ];
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  return null;
}

function CapabilityDemoScene({ detail, onLost }: { detail: MarketplaceBuyerProductDetail; onLost: () => void }) {
  const steps = useMemo(() => demoSteps(detail), [detail]);
  const positions: [number, number, number][] = [[-2.4, .62, -.38], [0, -.42, .62], [2.4, .62, -.22]];
  const rotations: [number, number, number][] = [[.02, .14, -.012], [-.025, 0, 0], [.02, -.14, .012]];

  return <>
    <color attach="background" args={["#020b14"]} />
    <fog attach="fog" args={["#020b14", 9, 18]} />
    <Line points={positions} color="#43d5ef" lineWidth={1.25} transparent opacity={.58} />
    {steps.map((step, index) => <Html key={step.label} transform position={positions[index]} rotation={rotations[index]} distanceFactor={5.15} zIndexRange={[6 - index, 0]}>
      <article className={styles.demoPanel} data-step={index + 1}>
        <header><span>{step.label}</span><b>{String(index + 1).padStart(2, "0")}</b></header>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div>{step.tags.slice(0, 2).map((tag) => <small key={tag}>{tag}</small>)}</div>
        {index === 1 ? <footer><i /><span>Applying this capability</span></footer> : null}
      </article>
    </Html>)}
    <OrbitControls makeDefault enableDamping dampingFactor={.08} enablePan={false} minDistance={7.4} maxDistance={10.4} minPolarAngle={1.03} maxPolarAngle={1.48} minAzimuthAngle={-.34} maxAzimuthAngle={.34} target={[0, .08, 0]} />
    <ContextMonitor onLost={onLost} />
  </>;
}

function SemanticDemo({ detail, loading = false }: { detail: MarketplaceBuyerProductDetail; loading?: boolean }) {
  return <div className={styles.semanticDemo} aria-label={`How ${detail.name} works`}>
    {demoSteps(detail).map((step, index) => <article key={step.label} data-step={index + 1}>
      <header><span>{step.label}</span><b>{String(index + 1).padStart(2, "0")}</b></header>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      <div>{step.tags.slice(0, 2).map((tag) => <small key={tag}>{tag}</small>)}</div>
    </article>)}
    {loading ? <p className={styles.loadingNote} role="status">Preparing the dimensional view…</p> : null}
  </div>;
}

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function CapabilityDemo({ detail }: { detail: MarketplaceBuyerProductDetail }) {
  const [mode, setMode] = useState<"checking" | "loading" | "ready" | "fallback">("checking");
  const [compact, setCompact] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(mobile.matches);
    mobile.addEventListener("change", update);
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      supported = Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
    } catch {
      supported = false;
    }
    const frame = window.requestAnimationFrame(() => { update(); setMode(supported ? "loading" : "fallback"); });
    return () => { window.cancelAnimationFrame(frame); mobile.removeEventListener("change", update); };
  }, []);

  const fallback = compact || mode === "fallback" || mode === "checking";
  const retry = () => { setAttempt((value) => value + 1); setMode("loading"); };
  return <div className={styles.demo} tabIndex={0} aria-label={`Capability demonstration for ${detail.name}. Input, capability in use, and outcome.`}>
    {fallback ? <SemanticDemo detail={detail} loading={mode === "checking"} /> : <>
      {mode === "loading" ? <SemanticDemo detail={detail} loading /> : null}
      <SceneBoundary key={attempt} onFailure={() => setMode("fallback")}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.05, 9], fov: 46, near: .1, far: 40 }} performance={{ min: .6 }} frameloop="demand" gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} onCreated={() => setMode("ready")} role="img" aria-label={`Layered demonstration of ${detail.name}: input, capability in use, and buyer outcome.`}>
          <CapabilityDemoScene detail={detail} onLost={() => setMode("fallback")} />
        </Canvas>
      </SceneBoundary>
    </>}
    <p className={styles.demoHint}>{fallback ? "Input → capability in use → outcome" : "Drag gently to inspect each layer · scroll to zoom"}</p>
    {!compact && mode === "fallback" ? <button className={styles.retry} type="button" onClick={retry}>Try dimensional view</button> : null}
  </div>;
}

export default function MarketplaceDimensionalPedestal({ detail }: { detail: MarketplaceBuyerProductDetail; checkoutEnabled: boolean }) {
  const focus = productFocus(detail);
  const isSkill = /skill/i.test(`${detail.name} ${detail.family}`);
  const isAcademy = /academy|course|training/i.test(`${detail.name} ${detail.family}`);

  return <section className={styles.pedestal} aria-labelledby="capability-demo-title">
    <header className={styles.header}>
      <div><p>See the capability in use</p><h2 id="capability-demo-title">From your starting point to a usable outcome.</h2></div>
      <p>This demonstration uses the selected product&apos;s actual purpose and deliverable so you can understand the fit before you buy.</p>
    </header>

    <div className={styles.layout}>
      <CapabilityDemo detail={detail} />
      <article className={styles.inspector} id="capability-details">
        <p className={styles.eyebrow}>What it does for you</p>
        <h2>{detail.name}</h2>
        <p>{buyerText(detail.description, `${detail.name} applies a focused capability to your ${focus} work.`)}</p>
        {detail.mission ? <blockquote><span>Designed outcome</span>{buyerText(detail.mission, `A practical outcome for your ${focus} work.`)}</blockquote> : null}
        <dl>
          <div><dt>Best for</dt><dd>{focus}</dd></div>
          <div><dt>Experience level</dt><dd>{plain(detail.proficiency)}</dd></div>
          <div><dt>What you receive</dt><dd>{buyerText(detail.deliverable, "A ready-to-use capability with clear setup and usage guidance.")}</dd></div>
        </dl>
        <a className={styles.purchaseLink} href="#purchase-options">Review pricing and purchase <span aria-hidden="true">→</span></a>
      </article>
    </div>

    <section className={styles.relationships} aria-labelledby="relationship-title">
      <div><p className={styles.eyebrow}>Explore more</p><h2 id="relationship-title">Capabilities that work well alongside this one.</h2></div>
      {detail.relationships.length ? <ul>{detail.relationships.map((entry) => <li key={entry.productId}><span>{entry.family}</span><strong>{entry.name}</strong><Link href={`/ai-marketplace/${encodeURIComponent(entry.slug)}`}>View capability <b aria-hidden="true">→</b></Link></li>)}</ul> : <p className={styles.notice}>Explore the marketplace to discover related capabilities.</p>}
    </section>

    <nav className={styles.footerNav} aria-label="Product next steps">
      <Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Compare capabilities</Link>
      <Link href={`/ai-marketplace/configure?mission=${encodeURIComponent(detail.mission ? detail.slug : "")}&items=${encodeURIComponent(detail.slug)}`}>Plan your solution</Link>
      {isSkill ? <Link href="/ai-marketplace/skill-libraries">Explore skills</Link> : null}
      {isAcademy ? <Link href="/academy">Explore Academy courses</Link> : null}
      <Link href="/ai-marketplace/hangar">My library</Link>
    </nav>
  </section>;
}
