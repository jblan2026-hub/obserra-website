"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";

import styles from "./MarketplaceCommandDeck.module.css";

type MarketplaceCommandDeckProps = {
  totalCards: number;
  collectionCount: number;
  familyCount: number;
};

type ArtifactKind = "skill" | "agent" | "workflow" | "connector" | "assurance";

type Artifact = {
  kind: ArtifactKind;
  label: string;
  detail: string;
  position: [number, number, number];
  steel: string;
};

const MARKETPLACE_GOLD = "#d8ad5a";
const STEEL_LIGHT = "#c7d8e2";
const STEEL_BLUE = "#6688a0";

const ARTIFACTS: readonly Artifact[] = [
  { kind: "skill", label: "AI Skills", detail: "Focused capability", position: [-3.35, 0.55, -0.3], steel: "#a9c2d2" },
  { kind: "agent", label: "Agent Teams", detail: "Coordinated execution", position: [-1.65, 1.55, -1.05], steel: "#7fa4bb" },
  { kind: "workflow", label: "Workflow Packs", detail: "Repeatable operations", position: [0, 0.72, 0.5], steel: "#b7c9d5" },
  { kind: "connector", label: "Connectors", detail: "Controlled integration", position: [1.85, 1.45, -0.8], steel: "#7599b0" },
  { kind: "assurance", label: "Guardrails + Assurance", detail: "Governed confidence", position: [3.55, 0.5, -0.1], steel: "#9db6c6" },
] as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function ArtifactGeometry({ kind }: { kind: ArtifactKind }) {
  if (kind === "skill") return <icosahedronGeometry args={[0.56, 2]} />;
  if (kind === "agent") return <octahedronGeometry args={[0.62, 2]} />;
  if (kind === "workflow") return <cylinderGeometry args={[0.44, 0.62, 1.05, 20, 3]} />;
  if (kind === "connector") return <torusKnotGeometry args={[0.39, 0.12, 96, 14, 2, 3]} />;
  return <dodecahedronGeometry args={[0.62, 1]} />;
}

function ProductArtifact({ artifact, index, reducedMotion }: { artifact: Artifact; index: number; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const baseY = artifact.position[1];

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * (0.16 + index * 0.012);
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.34 + index) * 0.06;
    group.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.55 + index * 0.8) * 0.12;
  });

  return (
    <group ref={group} position={artifact.position}>
      <mesh position={[0, -0.78, 0]} receiveShadow>
        <cylinderGeometry args={[0.82, 1.05, 0.12, 48]} />
        <meshStandardMaterial color="#06192a" metalness={0.9} roughness={0.23} />
      </mesh>
      <mesh position={[0, -0.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.025, 10, 64]} />
        <meshBasicMaterial color={index % 2 === 0 ? MARKETPLACE_GOLD : STEEL_LIGHT} transparent opacity={0.72} />
      </mesh>
      <mesh castShadow receiveShadow>
        <ArtifactGeometry kind={artifact.kind} />
        <meshPhysicalMaterial
          color={artifact.steel}
          emissive={artifact.steel}
          emissiveIntensity={0.16}
          metalness={0.94}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      <mesh scale={1.2}>
        <ArtifactGeometry kind={artifact.kind} />
        <meshBasicMaterial color={MARKETPLACE_GOLD} wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function CommandCore({ reducedMotion }: { reducedMotion: boolean }) {
  const core = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!core.current || reducedMotion) return;
    core.current.rotation.y += delta * 0.11;
    core.current.rotation.z -= delta * 0.035;
  });

  return (
    <group ref={core} position={[0, -0.68, -1.45]}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.38, 0.035, 10, 96]} />
        <meshBasicMaterial color={MARKETPLACE_GOLD} transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[-Math.PI / 3.6, 0.3, 0]}>
        <torusGeometry args={[1.02, 0.022, 10, 96]} />
        <meshBasicMaterial color={STEEL_LIGHT} transparent opacity={0.62} />
      </mesh>
      <mesh rotation={[0.34, -0.2, 0]}>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshPhysicalMaterial color="#9eb8c9" emissive="#567b95" emissiveIntensity={0.48} metalness={0.96} roughness={0.1} clearcoat={1} />
      </mesh>
      <pointLight color={MARKETPLACE_GOLD} intensity={4.6} distance={9} />
    </group>
  );
}

function MarketplaceScene({ reducedMotion }: { reducedMotion: boolean }) {
  const linkPoints = useMemo(() => ARTIFACTS.map((artifact) => [artifact.position, [0, -0.55, -1.25] as [number, number, number]] as const), []);

  return (
    <>
      <color attach="background" args={["#020914"]} />
      <fog attach="fog" args={["#020914", 8, 26]} />
      <ambientLight intensity={0.44} />
      <directionalLight castShadow position={[5.5, 8.5, 4]} intensity={2.2} color="#eef7fb" />
      <pointLight position={[-5, 2.5, 3]} intensity={4.2} distance={18} color="#6d9bb8" />
      <pointLight position={[5.5, 3.2, 2]} intensity={4.8} distance={18} color={MARKETPLACE_GOLD} />
      <gridHelper args={[34, 34, "#173d57", "#09243a"]} position={[0, -1.46, 0]} />
      <mesh position={[0, -1.49, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15.5, 80]} />
        <meshStandardMaterial color="#03111e" metalness={0.55} roughness={0.72} />
      </mesh>
      {linkPoints.map(([from, to], index) => (
        <Line key={ARTIFACTS[index].kind} points={[from, to]} color={index % 2 === 0 ? MARKETPLACE_GOLD : STEEL_BLUE} lineWidth={0.9} transparent opacity={0.48} />
      ))}
      <CommandCore reducedMotion={reducedMotion} />
      {ARTIFACTS.map((artifact, index) => <ProductArtifact key={artifact.kind} artifact={artifact} index={index} reducedMotion={reducedMotion} />)}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={7.6}
        maxDistance={14.5}
        minPolarAngle={0.7}
        maxPolarAngle={1.48}
        minAzimuthAngle={-0.56}
        maxAzimuthAngle={0.56}
        target={[0, 0.15, -0.45]}
      />
    </>
  );
}

export default function MarketplaceCommandDeck({ totalCards, collectionCount, familyCount }: MarketplaceCommandDeckProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero} aria-labelledby="marketplace-heading">
      <div className={styles.copy}>
        <Image className={styles.logo} src="/brand/obserra-logo.png" width={286} height={55} priority alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" />
        <p className={styles.eyebrow}>OBSERRA EPI AI MARKETPLACE</p>
        <h1 id="marketplace-heading">Put governed AI capability to work.</h1>
        <p className={styles.lede}>
          Deploy practical AI skills, agent teams, workflow packs, connectors, guardrails, assurance, governance, and industry editions built to move real work from intent to controlled execution.
        </p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#marketplace-catalog">Explore the marketplace <span aria-hidden="true">→</span></a>
          <Link className={styles.secondary} href="/ai-marketplace/configure">Build a governed solution</Link>
        </div>
        <dl className={styles.metrics} aria-label="Marketplace facts">
          <div><dt>Governed catalog</dt><dd>{totalCards.toLocaleString()}</dd><span>capability records</span></div>
          <div><dt>Curated packages</dt><dd>{collectionCount.toLocaleString()}</dd><span>collections</span></div>
          <div><dt>Capability depth</dt><dd>{familyCount.toLocaleString()}</dd><span>families</span></div>
        </dl>
        <p className={styles.assurance}>
          Commerce is governed by authoritative product, price, entitlement, and protected-delivery controls. Any incomplete release state fails closed.
        </p>
      </div>

      <div className={styles.visual} aria-label="Interactive 3D representation of Obserra EPI AI Marketplace product families">
        <div className={styles.chrome} aria-hidden="true"><span>OBSERRA EPI // MARKETPLACE COMMAND DECK</span><span>GOVERNED CAPABILITY NETWORK</span></div>
        <div className={styles.canvasWrap}>
          <Canvas
            dpr={reducedMotion ? 1 : [1, 1.65]}
            camera={{ position: [0, 4.5, 10.8], fov: 46, near: 0.1, far: 60 }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            shadows={!reducedMotion}
            frameloop={reducedMotion ? "demand" : "always"}
          >
            <MarketplaceScene reducedMotion={reducedMotion} />
          </Canvas>
        </div>
        <div className={styles.legend} aria-label="3D product-family legend">
          {ARTIFACTS.map((artifact, index) => <div key={artifact.kind}><i data-tone={index % 2 === 0 ? "gold" : "steel"} /><span><strong>{artifact.label}</strong><small>{artifact.detail}</small></span></div>)}
        </div>
        <p className={styles.interactionHint}>Drag to inspect the capability field · scroll to change depth</p>
      </div>
    </section>
  );
}
