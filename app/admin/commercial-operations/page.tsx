import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import storeCatalog from "../../apps/store-catalog.json";
import { marketplaceApps } from "../../apps/appsData";
import "./commercial-operations.css";

export const metadata: Metadata = {
  title: "Commercial Operations | Obserra",
  description: "Protected administration for application commerce, releases, marketing readiness, paid acquisition, and PCI-aligned ecommerce controls.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function adminEmails() {
  return new Set((process.env.OBSERRA_ADMIN_EMAILS || "").split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean));
}

const marketingChannels = [
  ["LinkedIn", "Executive and enterprise buyers", "Draft generation enabled", "Publishing requires connected account and approved budget"],
  ["Google Search", "High-intent application and course demand", "Keyword and copy drafts enabled", "Conversion tracking and billing required"],
  ["Meta", "Awareness, retargeting, and lead capture", "Creative copy variants enabled", "Pixel, audience, and spend approval required"],
  ["Email", "Existing contacts and nurture", "Campaign copy enabled", "Consent and connected delivery platform required"],
  ["YouTube", "Product education and demonstrations", "Promotion brief enabled", "Creative assets and connected account required"],
];

const governanceControls = [
  "Human approval before campaign publishing",
  "Budget approval before any spend",
  "Verified product and course claims only",
  "UTM and conversion tracking readiness",
  "Consent and privacy review for lead capture",
  "Channel credentials stored outside source control",
  "Campaign pause and revocation controls",
  "No automated spend escalation without approval",
];

const pciControls = [
  ["Payment collection", "Stripe-hosted checkout only; card data is never collected by Obserra application code."],
  ["Data storage", "No PAN, CVV, magnetic-stripe, or sensitive authentication data stored in the application or repository."],
  ["Webhooks", "Stripe webhook signatures are verified before fulfillment or entitlement actions."],
  ["Access control", "Administrative access is allowlisted and authenticated; production secrets remain outside source control."],
  ["Logging", "Payment secrets and cardholder data must not be logged; application events should use identifiers and outcomes only."],
  ["Vulnerability management", "Dependencies, release artifacts, and production endpoints require recurring scanning and remediation."],
  ["Encryption", "TLS is required in transit; provider-managed encryption is required for payment metadata and release storage."],
  ["Evidence", "Maintain Stripe configuration evidence, access reviews, webhook tests, scans, incident procedures, and change records."],
];

export default async function CommercialOperationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin/commercial-operations");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const configuredAdmins = adminEmails();
  if (!email || !configuredAdmins.has(email)) redirect("/portal");

  const publishedApps = storeCatalog.applications.length;
  const catalogApps = marketplaceApps.length;
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeWebhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const licenseConfigured = Boolean(process.env.APP_LICENSE_SIGNING_SECRET);
  const deliveryConfigured = Boolean(
    process.env.APP_RELEASE_CDN_URL &&
      process.env.APP_RELEASE_CLOUDFRONT_KEY_PAIR_ID &&
      process.env.APP_RELEASE_CLOUDFRONT_PRIVATE_KEY,
  );
  const adsConnected = Boolean(process.env.OBSERRA_AD_PLATFORM_CONNECTIONS);
  const trackingConfigured = Boolean(process.env.OBSERRA_MARKETING_TRACKING_READY);

  return (
    <main className="commercial-ops-page">
      <header className="commercial-ops-nav">
        <Link href="/" className="commercial-ops-brand">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>COMMERCIAL OPERATIONS</span>
        </Link>
        <nav><Link href="/apps">Store</Link><Link href="/portal/applications">Fulfillment</Link><Link href="/academy">Academy</Link><Link href="/admin">Admin</Link></nav>
      </header>

      <section className="commercial-ops-hero">
        <div>
          <p className="commercial-ops-eyebrow">PROTECTED ADMINISTRATION</p>
          <h1>Operate Obserra applications, courses, releases, subscriptions, marketing, and ecommerce from one governed workspace.</h1>
          <p>This console reports configuration readiness and controlled operating paths without inventing sales, customer, subscription, license, lead, campaign, revenue, or compliance records.</p>
        </div>
        <aside><span>ADMINISTRATOR</span><strong>{email}</strong><p>Access is limited by OBSERRA_ADMIN_EMAILS.</p></aside>
      </section>

      <section className="commercial-ops-kpis">
        <article><span>STORE CATALOG</span><strong>{catalogApps}</strong><p>Configured public offerings</p></article>
        <article><span>PUBLISHED RELEASES</span><strong>{publishedApps}</strong><p>Manifest-driven FINAL releases</p></article>
        <article><span>STRIPE</span><strong>{stripeConfigured && stripeWebhookConfigured ? "Configured" : "Action required"}</strong><p>Checkout and webhook readiness</p></article>
        <article><span>SECURE DELIVERY</span><strong>{deliveryConfigured ? "Configured" : "Action required"}</strong><p>Private signed downloads</p></article>
      </section>

      <section className="commercial-ops-section">
        <div className="commercial-ops-heading"><div><p className="commercial-ops-eyebrow">COMMERCE AND RELEASE READINESS</p><h2>Production configuration and operational pathways.</h2></div><p>Controls remain fail closed until required systems are configured.</p></div>
        <div className="commercial-ops-grid">
          <article><span>Subscriptions</span><h3>Stripe commerce</h3><p>Monthly and annual subscriptions, billing portal, cancellation handling, and entitlement revalidation.</p><strong>{stripeConfigured ? "Ready" : "STRIPE_SECRET_KEY required"}</strong></article>
          <article><span>Licensing</span><h3>Application keys</h3><p>Server-issued keys bound to verified subscription data and denied when billing is inactive.</p><strong>{licenseConfigured ? "Ready" : "APP_LICENSE_SIGNING_SECRET required"}</strong></article>
          <article><span>Publishing</span><h3>FINAL folder release sync</h3><p>Approved artifacts and release manifests publish from the designated OneDrive desktop folder.</p><strong>Local publisher configuration required</strong></article>
          <article><span>Delivery</span><h3>Signed customer downloads</h3><p>Authenticated customers receive short-lived signed release URLs after entitlement validation.</p><strong>{deliveryConfigured ? "Ready" : "CDN signing configuration required"}</strong></article>
        </div>
        <div className="commercial-ops-actions"><Link href="/apps">Review storefront</Link><Link href="/portal/applications">Open fulfillment center</Link><Link href="/contact?interest=commercial-operations">Commercial operations support</Link></div>
      </section>

      <section className="commercial-ops-section marketing-ops-section">
        <div className="commercial-ops-heading"><div><p className="commercial-ops-eyebrow">MARKETING OPERATIONS</p><h2>Generate governed advertising drafts for applications, courses, services, and future offerings.</h2></div><p>Generation may be automated from verified catalog content. Publishing and spend remain approval-gated.</p></div>
        <div className="marketing-status-grid">
          <article><span>AD PLATFORM CONNECTIONS</span><strong>{adsConnected ? "Connected" : "Not connected"}</strong><p>No ad publishing occurs until account credentials are connected.</p></article>
          <article><span>CONVERSION TRACKING</span><strong>{trackingConfigured ? "Ready" : "Not ready"}</strong><p>UTM, consent, analytics, and conversion events must be validated.</p></article>
          <article><span>AUTOMATIC AD DRAFTS</span><strong>Enabled</strong><p>Draft-only generation from verified offerings.</p></article>
          <article><span>LIVE SPEND</span><strong>Approval required</strong><p>No autonomous budget activation or escalation.</p></article>
        </div>
        <div className="marketing-channel-grid">
          {marketingChannels.map(([channel, audience, automation, gate]) => <article key={channel}><small>{channel}</small><h3>{audience}</h3><p>{automation}</p><strong>{gate}</strong></article>)}
        </div>
        <div className="marketing-workflow">
          <div><h3>Automatic campaign draft workflow</h3><ol><li>Read verified product, course, or service content.</li><li>Generate channel-specific copy, objectives, buyer roles, landing links, and UTM parameters.</li><li>Assign draft budget, cost-per-lead target, and approval status.</li><li>Require human review of claims, audience, privacy, tracking, and spend.</li><li>Publish only through connected ad accounts after approval.</li></ol></div>
          <div><h3>Mandatory controls</h3><ul>{governanceControls.map((control) => <li key={control}>{control}</li>)}</ul></div>
        </div>
      </section>

      <section className="commercial-ops-section">
        <div className="commercial-ops-heading"><div><p className="commercial-ops-eyebrow">PCI ALIGNMENT</p><h2>Reduce payment-card scope and preserve audit-ready ecommerce controls.</h2></div><p>This is a readiness view, not a claim of PCI DSS certification or assessor validation.</p></div>
        <div className="commercial-ops-grid">
          {pciControls.map(([title, copy]) => <article key={title}><span>PCI CONTROL</span><h3>{title}</h3><p>{copy}</p><strong>Required</strong></article>)}
        </div>
      </section>

      <section className="commercial-ops-section">
        <div className="commercial-ops-heading"><div><p className="commercial-ops-eyebrow">PUBLISHER SOURCE</p><h2>Authoritative local release destination.</h2></div></div>
        <code>C:\Users\jblan\OneDrive\Desktop\Final Production Release Apps</code>
        <p className="commercial-ops-note">Each application requires a FINAL folder containing an approved release-manifest.json and one distributable artifact. The publisher uploads artifacts to private storage, updates the store catalog, and pushes the catalog change for Vercel deployment.</p>
      </section>
    </main>
  );
}
