"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import "./marketplace-checkout.css";

export type MarketplacePublicCheckoutOption = Readonly<{ option: string; amountMinor: number }>;
type CommerceHealth = Readonly<{ operational?: boolean }>;

type Props = Readonly<{
  productId: string;
  options: readonly MarketplacePublicCheckoutOption[];
  checkoutEnabled?: boolean | null;
  compact?: boolean;
  autoDownloadAfterPurchase?: boolean;
}>;

function label(option: MarketplacePublicCheckoutOption) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(option.amountMinor / 100);
  if (option.option === "recurring:month") return "Monthly subscription · " + amount;
  if (option.option === "recurring:year") return "Annual subscription · " + amount;
  if (option.option === "team_license:once") return "Team license · " + amount;
  if (option.option === "activation:once") return "Activation · " + amount;
  return "One-time purchase · " + amount;
}

function purchaseLabel(option: string) {
  return option.startsWith("recurring:") ? "Subscribe with card" : "Buy with card";
}

export default function MarketplaceV12Checkout({ productId, options, checkoutEnabled = null, compact = false }: Props) {
  const sortedOptions = useMemo(() => [...options].sort((left, right) => left.amountMinor - right.amountMinor || left.option.localeCompare(right.option)), [options]);
  const [selected, setSelected] = useState(sortedOptions[0]?.option ?? "");
  const [health, setHealth] = useState<CommerceHealth | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/ai-marketplace/commerce-health", { cache: "no-store", credentials: "same-origin" });
        const value = await response.json() as CommerceHealth;
        if (active) setHealth({ operational: response.ok && value.operational === true });
      } catch {
        if (active) setHealth({ operational: false });
      }
    };
    void refresh();
    return () => { active = false; };
  }, []);

  const salesHref = "/contact?interest=ai-marketplace&product=" + encodeURIComponent(productId);
  const providerReady = health?.operational === true;
  const productReady = checkoutEnabled !== false;
  const canPurchase = sortedOptions.length > 0 && providerReady && productReady;
  const className = compact ? "ai-marketplace__checkout ai-marketplace__checkout--compact" : "ai-marketplace__checkout";

  if (sortedOptions.length === 0) return <section className={className} aria-label="Purchase availability"><p role="status">Pricing for this capability is available by request.</p><Link href={salesHref}>Contact sales</Link></section>;

  let status = "Checking Stripe checkout availability…";
  if ((!providerReady && health !== null) || checkoutEnabled === false) status = "Online checkout is temporarily unavailable. Please try again soon or contact us for help.";
  else if (canPurchase) status = "Click Buy with card to continue directly to Stripe. Your protected download starts automatically after Stripe verifies payment.";

  return <form className={className} action="/api/ai-marketplace/guest-checkout" method="post">
    <input type="hidden" name="product" value={productId} />
    <label htmlFor={"purchase-" + productId}>Purchase option</label>
    <select id={"purchase-" + productId} name="purchaseOption" aria-describedby={"purchase-status-" + productId} value={selected} onChange={(event) => setSelected(event.target.value)} disabled={!canPurchase}>{sortedOptions.map((option) => <option key={option.option} value={option.option}>{label(option)}</option>)}</select>
    <button type="submit" disabled={!canPurchase}>{purchaseLabel(selected)}</button>
    <p id={"purchase-status-" + productId} role="status" aria-live="polite">{status}</p>
    <p className="ai-marketplace__checkout-terms">Purchase is governed by the <Link href="/trust/terms-of-use">Terms of Use</Link>, <Link href="/trust/refund-and-cancellation-policy">Refund and Cancellation Policy</Link>, and <Link href="/trust/subscription-terms">Subscription Terms</Link> where applicable.</p>
    {!canPurchase ? <Link href={salesHref}>Contact sales for purchase options</Link> : null}
  </form>;
}
