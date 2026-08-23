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
          <p className={styles.eyebrow}>Interactive capability universe</p>
          <h2 id="marketplace-universe-title">Explore Obserra capabilities as one connected system.</h2>
          <p>
            Rotate, pan, zoom, and select catalog-derived objects. Each object resolves to the same governed product record used by search,
            comparison, pricing, and fulfillment.
          </p>
        </div>
        <dl className={styles.metrics} aria-label="Marketplace catalog facts">
          <div><dt>Catalog records</dt><dd>{totalCards.toLocaleString()}</dd></div>
          <div><dt>Families</dt><dd>{familyCount.toLocaleString()}</dd></div>
          <div><dt>Visible projection</dt><dd>{records.length.toLocaleString()}</dd></div>
        </dl>
      </div>

      <div className={styles.experience}>
        <div className={styles.stageFrame}>
          <div className={styles.stageChrome} aria-hidden="true">
            <span>OBSERRA EPI // CAPABILITY UNIVERSE</span>
            <span>CATALOG-DERIVED // LIVE ROUTES</span>
          </div>
          <MarketplaceSpatialStage
            label="Obserra EPI Marketplace capability universe"
            nodes={records}
            selectedId={selected?.productId ?? null}
            onSelect={(node) => setSelectedId(node.productId)}
            emptyMessage="No capability records are available in this projection. Use Marketplace search below to load a different catalog view."
          />
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <p className={styles.eyebrow}>Selected capability</p>
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
                <div><dt>Publication</dt><dd>{humanize(selected.publicationState)}</dd></div>
                <div><dt>Delivery</dt><dd>{humanize(selected.deliverable)}</dd></div>
                <div><dt>Current action</dt><dd>{selected.action.label}</dd></div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primary} href={`/ai-marketplace/${encodeURIComponent(selected.slug)}`}>Open capability</Link>
                <Link className={styles.secondary} href={`/ai-marketplace/compare?items=${encodeURIComponent(selected.slug)}`}>Compare</Link>
                <Link className={styles.secondary} href={`/ai-marketplace/configure?items=${encodeURIComponent(selected.slug)}`}>Configure</Link>
              </div>
              {!selected.action.enabled && selected.action.reasonCode ? (
                <p className={styles.stateNote}>Purchase remains unavailable: {humanize(selected.action.reasonCode)}.</p>
              ) : null}
            </>
          ) : (
            <p>Select a capability object to inspect its catalog facts.</p>
          )}
        </aside>
      </div>

      <div className={styles.guidance}>
        <span>Drag to orbit</span><span>Scroll to zoom</span><span>Select an object for product facts</span><span>Search the full catalog below</span>
      </div>
    </section>
  );
}
