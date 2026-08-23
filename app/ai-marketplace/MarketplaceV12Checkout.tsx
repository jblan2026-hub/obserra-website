import Link from "next/link";

export type MarketplacePublicCheckoutOption = Readonly<{ option: string; amountMinor: number }>;

function label(option: MarketplacePublicCheckoutOption) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(option.amountMinor / 100);
  if (option.option === "recurring:month") return "Monthly subscription · " + amount;
  if (option.option === "recurring:year") return "Annual subscription · " + amount;
  if (option.option === "team_license:once") return "Team license · " + amount;
  if (option.option === "activation:once") return "Activation · " + amount;
  return "One-time purchase · " + amount;
}

export default function MarketplaceV12Checkout({ productId, options, checkoutEnabled }: { productId: string; options: readonly MarketplacePublicCheckoutOption[]; checkoutEnabled: boolean }) {
  const salesHref = "/contact?interest=ai-marketplace&product=" + encodeURIComponent(productId);
  if (options.length === 0) return <section className="ai-marketplace__checkout" aria-label="Purchase availability"><p role="status">Pricing for this capability is available by request.</p><Link href={salesHref}>Contact sales</Link></section>;

  return <form className="ai-marketplace__checkout" action="/api/ai-marketplace/checkout" method="post">
    <input type="hidden" name="product" value={productId} />
    <label htmlFor={"purchase-" + productId}>Purchase option</label>
    <select id={"purchase-" + productId} name="purchaseOption" aria-describedby={"purchase-status-" + productId}>{options.map((option) => <option key={option.option} value={option.option}>{label(option)}</option>)}</select>
    <button type="submit" disabled={!checkoutEnabled}>{checkoutEnabled ? "Continue to secure checkout" : "Checkout unavailable"}</button>
    <p id={"purchase-status-" + productId} role="status">{checkoutEnabled ? "You will review your order and payment details before completing your purchase." : "Online checkout is not available for this capability right now."}</p>
    {!checkoutEnabled && <Link href={salesHref}>Contact sales for purchase options</Link>}
  </form>;
}
