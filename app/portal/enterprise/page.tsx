import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStripe } from "../../../lib/stripe";
import "./enterprise.css";

export const metadata: Metadata = {
  title: "Enterprise Account | Obserra Customer Portal",
  description: "Protected enterprise account workspace for organization, licensing, billing, and release readiness.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ACTIVE_STATES = new Set(["active", "trialing"]);

export default async function EnterpriseCustomerPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in?redirect_url=/portal/enterprise");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || email || "Authenticated customer";

  let subscriptions: Awaited<ReturnType<ReturnType<typeof getStripe>["subscriptions"]["list"]>>["data"] = [];
  let stripeCustomerCount = 0;

  if (process.env.STRIPE_SECRET_KEY && email) {
    const stripe = getStripe();
    const customers = await stripe.customers.list({ email, limit: 10 });
    stripeCustomerCount = customers.data.length;
    const groups = await Promise.all(
      customers.data.map((customer) => stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 100 })),
    );
    subscriptions = groups.flatMap((group) => group.data).sort((a, b) => b.created - a.created);
  }

  const activeSubscriptions = subscriptions.filter((subscription) => ACTIVE_STATES.has(subscription.status));
  const licensedApplications = new Set(
    activeSubscriptions.map((subscription) => subscription.metadata.obserraApp).filter(Boolean),
  );
  const organizationActive = Boolean(session.orgId);
  const organizationRole = session.orgRole || "No active organization role";

  return (
    <main className="enterprise-page">
      <header className="enterprise-nav">
        <Link href="/" className="enterprise-brand">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>ENTERPRISE ACCOUNT</span>
        </Link>
        <nav>
          <Link href="/store">Store</Link>
          <Link href="/portal/orders">Orders</Link>
          <Link href="/portal/applications">Applications</Link>
          <Link href="/portal">Dashboard</Link>
        </nav>
      </header>

      <section className="enterprise-hero">
        <div>
          <p>AUTHENTICATED ENTERPRISE WORKSPACE</p>
          <h1>Manage organization readiness, commercial entitlements, and enterprise deployment pathways.</h1>
          <span>This workspace reports only verified Clerk identity context and Stripe commerce records. It does not create simulated organizations, seats, licenses, users, or billing activity.</span>
        </div>
        <aside>
          <small>ACCOUNT</small>
          <strong>{displayName}</strong>
          <span>{email || "No verified primary email"}</span>
        </aside>
      </section>

      <section className="enterprise-kpis">
        <article><small>ORGANIZATION</small><strong>{organizationActive ? "Active" : "Not selected"}</strong><span>{session.orgId || "No Clerk organization context"}</span></article>
        <article><small>ORGANIZATION ROLE</small><strong>{organizationRole}</strong><span>Verified session role</span></article>
        <article><small>ACTIVE SUBSCRIPTIONS</small><strong>{activeSubscriptions.length}</strong><span>Active or trialing Stripe records</span></article>
        <article><small>LICENSED APPLICATIONS</small><strong>{licensedApplications.size}</strong><span>Verified application entitlements</span></article>
      </section>

      <section className="enterprise-section">
        <div className="enterprise-heading"><div><p>ENTERPRISE CONTROL PLANE</p><h2>Current readiness and governed operating paths.</h2></div><span>Capabilities remain unavailable until their identity, billing, licensing, or deployment evidence exists.</span></div>
        <div className="enterprise-grid">
          <article><small>Organization administration</small><h3>Teams and roles</h3><p>Organization membership, administrator roles, and user governance depend on an active Clerk organization context.</p><strong>{organizationActive ? `Organization context verified: ${session.orgId}` : "Create or select an organization before team administration"}</strong></article>
          <article><small>Seat licensing</small><h3>Subscription-backed seats</h3><p>Seat allocation must be derived from purchased quantities and verified subscription metadata, not manually assumed.</p><strong>{activeSubscriptions.length ? `${activeSubscriptions.length} active subscription record(s) available for seat-policy mapping` : "No active subscription records available"}</strong></article>
          <article><small>Application licensing</small><h3>Entitlements and activation</h3><p>Application access remains bound to active or trialing Stripe subscriptions and server-issued license controls.</p><strong>{licensedApplications.size ? `${licensedApplications.size} application entitlement(s) verified` : "No active application entitlements found"}</strong></article>
          <article><small>Release management</small><h3>Stable, beta, and early access</h3><p>Release-channel enrollment requires a verified entitlement and an approved release policy before customer activation.</p><strong>Policy and entitlement gate required</strong></article>
          <article><small>Enterprise billing</small><h3>Invoices and subscription changes</h3><p>Billing history, receipts, upgrades, and cancellation controls are provided through verified Stripe customer records.</p><strong>{stripeCustomerCount ? `${stripeCustomerCount} Stripe customer record(s) matched` : "No Stripe customer record matched"}</strong></article>
          <article><small>Enterprise identity</small><h3>SSO and provisioning readiness</h3><p>SAML/OIDC SSO and SCIM provisioning require an enterprise identity configuration, domain verification, and administrative approval.</p><strong>Configuration required before activation</strong></article>
        </div>
        <div className="enterprise-actions">
          <Link href="/portal/orders">Review billing records</Link>
          <Link href="/portal/applications">Manage application access</Link>
          <Link href="/contact?interest=enterprise-account">Request enterprise setup</Link>
        </div>
      </section>

      <section className="enterprise-section enterprise-security">
        <div className="enterprise-heading"><div><p>SECURE BY DEFAULT</p><h2>Enterprise controls remain evidence-based and fail closed.</h2></div><span>No customer receives organization privileges, seats, licenses, downloads, or release-channel access without verified authorization.</span></div>
        <div className="enterprise-security-grid">
          <article><strong>Identity</strong><span>Authenticated Clerk session and organization context</span></article>
          <article><strong>Commerce</strong><span>Stripe-hosted billing and verified subscription records</span></article>
          <article><strong>Licensing</strong><span>Subscription-bound entitlement validation</span></article>
          <article><strong>Auditability</strong><span>Provider records and server-side authorization decisions</span></article>
        </div>
      </section>
    </main>
  );
}
