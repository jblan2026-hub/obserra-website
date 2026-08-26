"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import "./marketplace-checkout.css";

export type MarketplacePublicCheckoutOption = Readonly<{ option: string; amountMinor: number }>;

type Props = Readonly<{
  productId: string;
  options: readonly MarketplacePublicCheckoutOption[];
  compact?: boolean;
}>;

function label(option: MarketplacePublicCheckoutOption) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(option.amountMinor / 100);
  if (option.option === "recurring:month") return "Monthly subscription · " + amount;
  if (option.option === "recurring:year") return "Annual subscription · " + amount;
  if (option.option === "team_license:once") return "Team license · " + amount;
  if (option.option === "activation:once") return "Activation · " + amount;
  return "One-time purchase · " + amount;
}

export default function MarketplaceV12Checkout({ productId, options, compact = false }: Props) {
  const sortedOptions = useMemo(() => [...options].sort((left, right) => left.amountMinor - right.amountMinor || left.option.localeCompare(right.option)), [options]);
  const [selected, setSelected] = useState(sortedOptions[0]?.option ?? "");

  const salesHref = "/contact?interest=ai-marketplace&product=" + encodeURIComponent(productId);
  const className = compact ? "ai-marketplace__checkout ai-marketplace__checkout--compact" : "ai-marketplace__checkout";

  if (sortedOptions.length === 0) return <section className={className} aria-label="Purchase availability"><p role="status">Pricing for this capability is available by request.</p><Link href={salesHref}>Contact sales</Link></section>;

  return <form className={className} action="/api/ai-marketplace/guest-checkout" method="post">
    <input type="hidden" name="product" value={productId} />
    {sortedOptions.length === 1
      ? <input type="hidden" name="purchaseOption" value={selected} />
      : <><label htmlFor={"purchase-" + productId}>Purchase option</label><select id={"purchase-" + productId} name="purchaseOption" aria-describedby={"purchase-status-" + productId} value={selected} onChange={(event) => setSelected(event.target.value)}>{sortedOptions.map((option) => <option key={option.option} value={option.option}>{label(option)}</option>)}</select></>}
    <button type="submit">Buy now</button>
    <p id={"purchase-status-" + productId}>Secure checkout by Stripe. Your protected download is available after payment.</p>
    <p className="ai-marketplace__checkout-terms">Purchase is governed by the <Link href="/trust/terms-of-use">Terms of Use</Link>, <Link href="/trust/refund-and-cancellation-policy">Refund and Cancellation Policy</Link>, and <Link href="/trust/subscription-terms">Subscription Terms</Link> where applicable.</p>
  </form>;
}
