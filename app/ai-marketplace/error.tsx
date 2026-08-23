"use client";

import Link from "next/link";

export default function MarketplaceError({ reset }: { reset: () => void }) {
  return <main className="ai-marketplace"><section className="ai-marketplace__route-recovery" role="alert"><p className="ai-marketplace__eyebrow">Marketplace recovery</p><h1>The catalog view is temporarily unavailable.</h1><p>No checkout, entitlement, delivery, or installation action has been attempted. You can retry the verified catalog view or return to the marketplace entry page.</p><div><button type="button" onClick={reset}>Retry catalog view</button><Link href="/ai-marketplace">Return to marketplace</Link></div></section></main>;
}
