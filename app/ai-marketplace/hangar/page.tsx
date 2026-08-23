import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { aiMarketplaceTenantId, marketplaceV12CustomerInventory } from "../../../lib/ai-marketplace-commerce";
import { marketplaceV12ProtectedDeliveryConfigured, marketplaceV12Release } from "../../../lib/ai-marketplace-delivery";
import { marketplaceV12Summary } from "../../../lib/marketplace-v12-catalog";
import { marketplaceV12WorkspaceRecord } from "../../../lib/marketplace-v12-workspaces";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../lib/production-runtime-secrets";
import MarketplaceHangarInventory, { type HangarRecord } from "../MarketplaceHangarInventory";
import styles from "../MarketplaceWorkspaces.module.css";

export const metadata: Metadata = { title: "Customer Capability Hangar | Obserra EPI", description: "Server-authoritative Obserra EPI marketplace customer capability inventory.", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MarketplaceHangarPage() {
  const { userId, orgId } = await auth();
  if (!userId) return <main className={styles.root}><header className={styles.nav}><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href="/ai-marketplace/compare">Comparison stage</Link><Link href="/ai-marketplace/configure">Bundle composer</Link></nav></header><section className={styles.hangarSurface}><p className={styles.eyebrow}>Customer capability hangar</p><h1>Sign in to retrieve your authoritative capability inventory.</h1><p>The Hangar does not render a catalog record as an owned product. Authentication is required before the server can resolve the customer and organization entitlement boundary.</p><Link className={styles.primaryAction} href="/sign-in?redirect_url=/ai-marketplace/hangar">Sign in to your Hangar</Link></section></main>;
  const revision = marketplaceV12Summary().revision;
  let authorityAvailable = true, deliveryConfigured = false, records: HangarRecord[] = [];
  try {
    await ensureMarketplaceV12RuntimeSecrets();
    deliveryConfigured = marketplaceV12ProtectedDeliveryConfigured();
    const inventory = await marketplaceV12CustomerInventory(userId, aiMarketplaceTenantId(userId, orgId));
    records = inventory.flatMap((entry) => {
      const record = marketplaceV12WorkspaceRecord(entry.productId);
      if (!record) return [];
      const currentRevision = entry.catalogRevision === revision && entry.artifactSha256 === record.artifactSha256;
      const release = currentRevision && entry.accessStatus === "active" ? marketplaceV12Release(record.productId, revision, entry.artifactSha256) : null;
      return [{ record, accessStatus: entry.accessStatus, purchaseOption: entry.purchaseOption, updatedAt: entry.updatedAt, currentRevision, downloadAvailable: Boolean(release && deliveryConfigured) }];
    });
  } catch { authorityAvailable = false; }
  return <main className={styles.root}><header className={styles.nav}><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href="/ai-marketplace/compare">Comparison stage</Link><Link href="/ai-marketplace/configure">Bundle composer</Link><Link href="/portal">Customer portal</Link></nav></header><MarketplaceHangarInventory records={records} authorityAvailable={authorityAvailable} deliveryConfigured={deliveryConfigured} /></main>;
}
