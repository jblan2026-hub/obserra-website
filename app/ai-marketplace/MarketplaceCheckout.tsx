"use client";

import { useEffect, useMemo, useState } from "react";
import "./marketplace-checkout.css";

type Product = { product_id: string; billing_model: "subscription" | "one-time" | "hybrid"; monthly_usd: string; annual_usd: string; one_time_usd: string };
type CommerceHealth = { operational: boolean; productBindings?: { requiredProductCards: number; declaredBoundCards: number; structurallyComplete: boolean; stripeVerified: boolean } };

function options(product: Product) {
  if (product.billing_model === "one-time") return [{ value: "one-time", label: `Buy once · $${product.one_time_usd}` }];
  if (product.billing_model === "hybrid") return [{ value: "monthly", label: `Monthly · $${product.monthly_usd}` }, { value: "one-time", label: `Buy once · $${product.one_time_usd}` }];
  return [{ value: "monthly", label: `Monthly · $${product.monthly_usd}` }, { value: "annual", label: `Annual · $${product.annual_usd}` }];
}

export default function MarketplaceCheckout({ product }: { product: Product }) {
  const billing = useMemo(() => options(product), [product]);
  const [interval, setInterval] = useState(billing[0].value);
  const [health, setHealth] = useState<CommerceHealth | null>(null);
  useEffect(() => { let mounted = true; fetch("/api/ai-marketplace/commerce-health", { cache: "no-store" }).then((response) => response.json() as Promise<CommerceHealth>).then((value) => { if (mounted) setHealth(value); }).catch(() => { if (mounted) setHealth({ operational: false }); }); return () => { mounted = false; }; }, []);
  const enabled = health?.operational === true;
  const status = enabled ? "Secure checkout is available. Purchase is completed on Stripe." : health?.productBindings ? `${health.productBindings.declaredBoundCards}/${health.productBindings.requiredProductCards} declared v1.2 payment bindings. Checkout remains protected until Stripe verification and all commerce controls are live.` : "Checking protected checkout availability.";
  return <form className="ai-marketplace__checkout" action="/api/ai-marketplace/checkout" method="post"><input type="hidden" name="product" value={product.product_id} /><label htmlFor={`billing-${product.product_id}`}>Purchase option</label><select id={`billing-${product.product_id}`} name="interval" value={interval} onChange={(event) => setInterval(event.target.value)} disabled={!enabled}>{billing.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select><button type="submit" disabled={!enabled}>{enabled ? "Secure checkout" : "Checkout unavailable"}</button><p role="status" aria-live="polite">{status}</p></form>;
}
