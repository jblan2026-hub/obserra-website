import type { Metadata } from "next";
import Link from "next/link";
import { marketplaceV12ComposerFacts, marketplaceV12Selection, marketplaceV12WorkspaceCandidates, marketplaceV12WorkspaceRecord, MARKETPLACE_COMPOSER_LIMIT } from "../../../lib/marketplace-v12-workspaces";
import MarketplaceBundleComposer from "../MarketplaceBundleComposer";
import styles from "../MarketplaceWorkspaces.module.css";

export const metadata: Metadata = { title: "Configure a Governed AI Marketplace Selection | Obserra EPI", description: "Compose a factual Obserra EPI AI Marketplace selection with server-validated catalog records and declared relationships.", robots: { index: false, follow: true } };
type Props = { searchParams: Promise<{ items?: string | string[]; mission?: string | string[] }> };
function value(input: string | string[] | undefined) { return typeof input === "string" ? input : Array.isArray(input) ? input[0] : undefined; }

export default async function MarketplaceConfigurePage({ searchParams }: Props) {
  const params = await searchParams, selection = marketplaceV12Selection(value(params.items), MARKETPLACE_COMPOSER_LIMIT), anchor = marketplaceV12WorkspaceRecord(value(params.mission));
  const anchorProblem = value(params.mission) && (!anchor || !anchor.mission) ? "The requested mission anchor is not present in the current server catalog." : null;
  return <main className={styles.root}><header className={styles.nav}><Link href="/ai-marketplace" aria-label="Obserra EPI AI Marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href="/ai-marketplace/compare">Comparison stage</Link><Link href="/ai-marketplace/hangar">Customer hangar</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav></header><MarketplaceBundleComposer anchor={anchor?.mission ? anchor : null} records={selection.records} candidates={marketplaceV12WorkspaceCandidates()} facts={marketplaceV12ComposerFacts(anchor?.mission ? anchor : null, selection.records)} invalidReason={selection.reason ?? anchorProblem} /></main>;
}
