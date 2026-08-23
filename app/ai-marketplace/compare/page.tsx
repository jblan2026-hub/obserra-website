import type { Metadata } from "next";
import Link from "next/link";
import { marketplaceV12Selection, marketplaceV12WorkspaceCandidates, MARKETPLACE_COMPARE_LIMIT } from "../../../lib/marketplace-v12-workspaces";
import MarketplaceComparisonStage from "../MarketplaceComparisonStage";
import styles from "../MarketplaceWorkspaces.module.css";

export const metadata: Metadata = { title: "Compare AI Marketplace Records | Obserra EPI", description: "A server-validated, shareable comparison of verified Obserra EPI marketplace catalog records.", robots: { index: false, follow: true } };
type Props = { searchParams: Promise<{ items?: string | string[] }> };
function value(input: string | string[] | undefined) { return typeof input === "string" ? input : Array.isArray(input) ? input[0] : undefined; }

export default async function MarketplaceComparePage({ searchParams }: Props) {
  const state = marketplaceV12Selection(value((await searchParams).items), MARKETPLACE_COMPARE_LIMIT);
  return <main className={styles.root}><header className={styles.nav}><Link href="/ai-marketplace" aria-label="Obserra EPI AI Marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href="/ai-marketplace/configure">Bundle composer</Link><Link href="/ai-marketplace/hangar">Customer hangar</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav></header><MarketplaceComparisonStage records={state.records} candidates={marketplaceV12WorkspaceCandidates()} invalidReason={state.reason} /></main>;
}
