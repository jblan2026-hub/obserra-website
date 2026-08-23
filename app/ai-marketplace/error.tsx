"use client";

import Link from "next/link";

export default function MarketplaceError({ reset }: { reset: () => void }) {
  return <main className="ai-marketplace"><section className="ai-marketplace__route-recovery" role="alert"><p className="ai-marketplace__eyebrow">Marketplace</p><h1>We couldn&apos;t load this page.</h1><p>This page error did not submit a new purchase. Try again or return to the marketplace.</p><div><button type="button" onClick={reset}>Try again</button><Link href="/ai-marketplace">Return to marketplace</Link></div></section></main>;
}
