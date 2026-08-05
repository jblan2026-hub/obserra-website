"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  Fingerprint,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { marketplaceApps } from "./appsData";

const missions = [
  {
    id: "enterprise-risk",
    title: "Reduce enterprise risk",
    copy: "Unify risk visibility, evidence, prioritization, and executive accountability.",
    icon: Scale,
    categories: ["GRC", "Cybersecurity", "Operations"],
    keywords: ["risk", "control", "evidence", "executive"],
  },
  {
    id: "decision-intelligence",
    title: "Improve decision intelligence",
    copy: "Give executives a governed operating picture for faster, defensible decisions.",
    icon: BrainCircuit,
    categories: ["Intelligence", "Operations", "GRC"],
    keywords: ["decision", "intelligence", "executive", "dashboard"],
  },
  {
    id: "secure-ai",
    title: "Govern and secure AI",
    copy: "Control AI use, policy, models, data exposure, approvals, and audit evidence.",
    icon: Sparkles,
    categories: ["AI Governance", "GRC", "Cybersecurity"],
    keywords: ["ai", "model", "governance", "policy"],
  },
  {
    id: "identity",
    title: "Strengthen identity assurance",
    copy: "Improve access governance, certification, lifecycle controls, and workforce trust.",
    icon: Fingerprint,
    categories: ["Identity", "Cybersecurity"],
    keywords: ["identity", "access", "certification", "workforce"],
  },
  {
    id: "cyber-resilience",
    title: "Build cyber resilience",
    copy: "Prioritize vulnerabilities, coordinate incidents, and validate security controls.",
    icon: ShieldCheck,
    categories: ["Cybersecurity", "Operations"],
    keywords: ["vulnerability", "incident", "cyber", "security"],
  },
  {
    id: "executive-protection",
    title: "Protect executives and operations",
    copy: "Connect protective intelligence, exposure, travel risk, and threat context.",
    icon: LockKeyhole,
    categories: ["Executive Protection", "Intelligence"],
    keywords: ["executive", "protection", "threat", "travel"],
  },
] as const;

function relevanceScore(app: (typeof marketplaceApps)[number], mission: (typeof missions)[number]) {
  const searchable = [app.name, app.value, ...app.features, ...app.integrations].join(" ").toLowerCase();
  const categoryScore = mission.categories.includes(app.category) ? 6 : 0;
  const keywordScore = mission.keywords.reduce((score, keyword) => score + (searchable.includes(keyword) ? 2 : 0), 0);
  const availabilityScore = app.status === "Available" ? 2 : app.status === "Pilot" ? 1 : 0;
  return categoryScore + keywordScore + availabilityScore;
}

export default function MissionMarketplace() {
  const [selectedMission, setSelectedMission] = useState(missions[0].id);
  const mission = missions.find((entry) => entry.id === selectedMission) ?? missions[0];

  const recommendations = useMemo(
    () => marketplaceApps
      .map((app) => ({ app, score: relevanceScore(app, mission) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.app.name.localeCompare(right.app.name))
      .slice(0, 4),
    [mission],
  );

  return (
    <section className="mission-marketplace" aria-labelledby="mission-marketplace-title">
      <div className="mission-heading">
        <div>
          <p>EXECUTIVE MISSION NAVIGATOR</p>
          <h2 id="mission-marketplace-title">Start with the outcome your organization needs.</h2>
          <span>Select a mission to receive an immediate, explainable application recommendation.</span>
        </div>
        <Link href="/contact?interest=portfolio-advisory">Request portfolio advisory <ArrowRight size={16} /></Link>
      </div>

      <div className="mission-layout">
        <div className="mission-options" role="list" aria-label="Enterprise missions">
          {missions.map(({ id, title, copy, icon: Icon }) => {
            const selected = id === mission.id;
            return (
              <button key={id} type="button" className={selected ? "active" : ""} onClick={() => setSelectedMission(id)} aria-pressed={selected}>
                <span className="mission-icon"><Icon size={20} /></span>
                <span><strong>{title}</strong><small>{copy}</small></span>
                <ArrowRight size={17} />
              </button>
            );
          })}
        </div>

        <div className="mission-recommendations" aria-live="polite">
          <header>
            <div>
              <small>RECOMMENDED PORTFOLIO</small>
              <h3>{mission.title}</h3>
              <p>{mission.copy}</p>
            </div>
            <span>{recommendations.length} matched solutions</span>
          </header>

          <div className="mission-product-grid">
            {recommendations.map(({ app }) => (
              <article key={app.slug}>
                <div className="mission-product-topline">
                  <span>{app.status === "Available" ? "Available now" : app.status}</span>
                  <small>{app.category}</small>
                </div>
                <h4>{app.name}</h4>
                <p>{app.value}</p>
                <ul>{app.features.slice(0, 2).map((feature) => <li key={feature}><Check size={13} /> {feature}</li>)}</ul>
                <Link href={`/apps/${app.slug}`}>Review solution <ArrowRight size={14} /></Link>
              </article>
            ))}
          </div>

          <footer>
            <div><Building2 size={18} /><span>Recommendations can be scoped for SaaS, private cloud, hybrid, on premises, or government deployment.</span></div>
            <Link href={`/contact?interest=mission-portfolio&mission=${encodeURIComponent(mission.title)}`}>Build this portfolio <ArrowRight size={15} /></Link>
          </footer>
        </div>
      </div>
    </section>
  );
}
