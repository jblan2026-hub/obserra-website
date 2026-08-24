"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { MarketplaceWorkspaceRecord } from "../../lib/marketplace-v12-workspaces";
import MarketplaceSpatialStage from "./MarketplaceSpatialStage";
import styles from "./MarketplaceCapabilityUniverse.module.css";

function humanize(value: string | null | undefined) {
  return value ? value.replace(/[-_]/g, " ") : "Not recorded";
}

function offerText(record: MarketplaceWorkspaceRecord) {
  if (record.pricing.model === "quote") return "Enterprise quote";
  if (!record.pricing.offers.length) return "Pricing unavailable";
  return record.pricing.offers
    .slice(0, 2)
    .map((offer) => {
      const value = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency }).format(offer.amount_minor / 100);
      if (offer.kind === "recurring" && offer.cadence) return `${value} / ${offer.cadence}`;
      return `${value} one-time`;
    })
    .join(" · ");
}

export default function MarketplaceCapabilityUniverse({
  records,
  totalCards,
  familyCount,
}: {
  records: MarketplaceWorkspaceRecord[];
  totalCards: number;
  familyCount: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(records[0]?.productId ?? null);
  const selected = useMemo(
    () => records.find((record) => record.productId === selectedId) ?? records[0] ?? null,
    [records, selectedId],
  );

  return (
    <section className={styles.universe} aria-labelledby="marketplace-universe-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Connected capability intelligence</p>
          <h2 id="marketplace-universe-title">See what works together before you build.</h2>
          <p>
            Explore relationships across Obserra skills, agents, workflows, connectors, guardrails, assurance, governance, and industry products. Focus any object to evaluate fit, pricing, delivery, and the next controlled action.
          </p>
        </div>
        <dl className={styles.metrics} aria-label="Marketplace catalog facts">
          <div><dt>Governed catalog</dt><dd>{totalCards.toLocaleString()}</dd></div>
          <div><dt>Capability families</dt><dd>{familyCount.toLocaleString()}</dd></div>
          <div><dt>3D projection</dt><dd>{records.length.toLocaleString()}</dd></div>
        </dl>
      </div>

      <div className={styles.experience}>
        <div className={styles.stageFrame}>
          <div className={styles.stageChrome} aria-hidden="true">
            <span>OBSERRA EPI // CAPABILITY INTELLIGENCE FIELD</span>
            <span>SELECT // COMPARE // CONFIGURE</span>
          </div>
          <MarketplaceSpatialStage
            label="Obserra EPI Marketplace connected capability field"
            nodes={records}
            selectedId={selected?.productId ?? null}
            onSelect={(node) => setSelectedId(node.productId)}
            emptyMessage="No capabilities match this projection. Search the governed Marketplace catalog to load another product set."
          />
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <p className={styles.eyebrow}>Capability focus</p>
          {selected ? (
            <>
              <div className={styles.identity}>
                <span>{selected.family}</span>
                <span>{humanize(selected.productType)}</span>
                <span>v{selected.version}</span>
              </div>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
              <dl className={styles.facts}>
                <div><dt>Price</dt><dd>{offerText(selected)}</dd></div>
                <div><dt>Availability</dt><dd>{humanize(selected.publicationState)}</dd></div>
                <div><dt>Delivery</dt><dd>{humanize(selected.deliverable)}</dd></div>
                <div><dt>Next action</dt><dd>{selected.action.label}</dd></div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primary} href={`/ai-marketplace/${encodeURIComponent(selected.slug)}`}>View product and options</Link>
                <Link className={styles.secondary} href={`/ai-marketplace/compare?items=${encodeURIComponent(selected.slug)}`}>Compare</Link>
                <Link className={styles.secondary} href={`/ai-marketplace/configure?items=${encodeURIComponent(selected.slug)}`}>Build with this</Link>
              </div>
              {!selected.action.enabled && selected.action.reasonCode ? (
                <p className={styles.stateNote}>This purchase path remains safely gated: {humanize(selected.action.reasonCode)}.</p>
              ) : null}
            </>
          ) : (
            <p>Select a capability object to inspect fit, delivery, and buying options.</p>
          )}
        </aside>
      </div>

      <div className={styles.guidance}>
        <span>Orbit the capability field</span><span>Zoom for relationship depth</span><span>Select a product to evaluate fit</span><span>Compare or build a solution</span>
      </div>
    </section>
  );
}
