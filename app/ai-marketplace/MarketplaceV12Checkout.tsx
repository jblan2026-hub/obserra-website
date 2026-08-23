import type { MarketplaceV12Card } from "../../lib/marketplace-v12-catalog";
import { marketplaceV12PurchaseOptions } from "../../lib/marketplace-v12-bindings";

function label(option: ReturnType<typeof marketplaceV12PurchaseOptions>[number]) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(option.amountMinor / 100);
  if (option.option === "recurring:month") return `Monthly subscription · ${amount}`;
  if (option.option === "recurring:year") return `Annual subscription · ${amount}`;
  if (option.option === "team_license:once") return `Team license · ${amount}`;
  if (option.option === "activation:once") return `Activation · ${amount}`;
  return `One-time purchase · ${amount}`;
}

export default function MarketplaceV12Checkout({ product, revision }: { product: MarketplaceV12Card; revision: string }) {
  const options = marketplaceV12PurchaseOptions(product);
  return <form className="ai-marketplace__checkout" action="/api/ai-marketplace/checkout" method="post">
    <input type="hidden" name="product" value={product.product_id} />
    <input type="hidden" name="catalogRevision" value={revision} />
    <label htmlFor={`purchase-${product.product_id}`}>Purchase option</label>
    <select id={`purchase-${product.product_id}`} name="purchaseOption" disabled>{options.map((option) => <option key={option.option} value={option.option}>{label(option)}</option>)}</select>
    <button type="submit" disabled>Checkout unavailable</button>
    <p role="status">Protected checkout remains unavailable until every exact catalog offer has a verified Stripe Price and fulfillment evidence.</p>
  </form>;
}
