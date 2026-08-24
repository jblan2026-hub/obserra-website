"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import "./marketplace-checkout.css";

export type MarketplacePublicCheckoutOption = Readonly<{ option: string; amountMinor: number }>;
type CommerceHealth = Readonly<{ operational?: boolean }>;
type AccessState = "checking" | "signed-out" | "owned" | "not-owned" | "unavailable";

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

export default function MarketplaceV12Checkout({ productId, options, checkoutEnabled = null, compact = false, autoDownloadAfterPurchase = true }: Props) {
  const sortedOptions = useMemo(() => [...options].sort((left, right) => left.amountMinor - right.amountMinor || left.option.localeCompare(right.option)), [options]);
  const [selected, setSelected] = useState(sortedOptions[0]?.option ?? "");
  const [health, setHealth] = useState<CommerceHealth | null>(null);
  const [access, setAccess] = useState<AccessState>("checking");
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const attempt = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const query = new URLSearchParams(window.location.search);
    const pending = query.get("purchase") === "pending-fulfillment";

    const refresh = async () => {
      attempt.current += 1;
      try {
        const healthResponse = await fetch("/api/ai-marketplace/commerce-health", { cache: "no-store", credentials: "same-origin" });
        const healthValue = await healthResponse.json() as CommerceHealth;
        if (active) {
          setPendingPurchase(pending);
          setHealth({ operational: healthValue.operational === true });
        }
      } catch {
        if (active) {
          setPendingPurchase(pending);
          setHealth({ operational: false });
        }
      }

      try {
        const accessResponse = await fetch(`/api/ai-marketplace/access?product=${encodeURIComponent(productId)}`, { cache: "no-store", credentials: "same-origin" });
        if (!active) return;
        if (accessResponse.status === 401) {
          setAccess("signed-out");
        } else if (accessResponse.ok) {
          const value = await accessResponse.json() as { deliveryAuthorized?: boolean };
          setAccess(value.deliveryAuthorized === true ? "owned" : "not-owned");
          if (pending && value.deliveryAuthorized !== true && attempt.current < 24) timer = setTimeout(refresh, 1500);
        } else {
          setAccess("unavailable");
          if (pending && attempt.current < 12) timer = setTimeout(refresh, 2000);
        }
      } catch {
        if (!active) return;
        setAccess("unavailable");
        if (pending && attempt.current < 12) timer = setTimeout(refresh, 2000);
      }
    };

    void refresh();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [productId]);

  useEffect(() => {
    if (!pendingPurchase || access !== "owned" || !autoDownloadAfterPurchase) return;
    const downloadUrl = `/api/ai-marketplace/download?product=${encodeURIComponent(productId)}`;
    const timer = window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [access, autoDownloadAfterPurchase, pendingPurchase, productId]);

  const salesHref = "/contact?interest=ai-marketplace&product=" + encodeURIComponent(productId);
  const downloadHref = "/api/ai-marketplace/download?product=" + encodeURIComponent(productId);
  const providerReady = health?.operational === true;
  const productReady = checkoutEnabled !== false;
  const canPurchase = sortedOptions.length > 0 && providerReady && productReady;
  const className = compact ? "ai-marketplace__checkout ai-marketplace__checkout--compact" : "ai-marketplace__checkout";

  if (access === "owned") {
    return <section className={className} aria-label="Owned product delivery">
      <strong className="ai-marketplace__checkout-owned">Purchased and ready</strong>
      <a className="ai-marketplace__download-button" href={downloadHref}>Download now</a>
      <p role="status" aria-live="polite">Your product is ready to download.</p>
    </section>;
  }

  if (sortedOptions.length === 0) return <section className={className} aria-label="Purchase availability"><p role="status">Pricing for this capability is available by request.</p><Link href={salesHref}>Contact sales</Link></section>;

  let status = "Checking Stripe checkout availability…";
  if (pendingPurchase) status = "Payment received. Preparing your download…";
  else if ((!providerReady && health !== null) || checkoutEnabled === false) status = "Online checkout is temporarily unavailable. Please try again soon or contact us for help.";
  else if (canPurchase) status = "Pay securely by card with Stripe. Your protected download starts after payment is verified.";

  return <form className={className} action="/api/ai-marketplace/guest-checkout" method="post">
    <input type="hidden" name="product" value={productId} />
    <label htmlFor={"purchase-" + productId}>Purchase option</label>
    <select id={"purchase-" + productId} name="purchaseOption" aria-describedby={"purchase-status-" + productId} value={selected} onChange={(event) => setSelected(event.target.value)} disabled={!canPurchase}>{sortedOptions.map((option) => <option key={option.option} value={option.option}>{label(option)}</option>)}</select>
    <button type="submit" disabled={!canPurchase}>{pendingPurchase ? "Preparing download…" : purchaseLabel(selected)}</button>
    <p id={"purchase-status-" + productId} role="status" aria-live="polite">{status}</p>
    {!canPurchase && !pendingPurchase ? <Link href={salesHref}>Contact sales for purchase options</Link> : null}
  </form>;
}
