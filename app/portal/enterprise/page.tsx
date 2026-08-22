import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { applicationsTenantId, durableApplicationEntitlements, durableApplicationsCustomer } from "../../../lib/applications-commerce";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: `Enterprise Account | ${LEGAL_ENTITY_NAME} Customer Portal`,
  description: "Protected enterprise account workspace for organization, licensing, billing, and release readiness.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const linkClass =
  "inline-flex items-center justify-center rounded-lg border border-cyan-300/30 bg-slate-900/70 px-4 py-3 text-sm font-extrabold text-slate-100 no-underline transition hover:border-obserra-gold hover:text-obserra-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default async function EnterpriseCustomerPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in?redirect_url=/portal/enterprise");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || email || "Authenticated customer";

  const tenantId = applicationsTenantId(session.userId, session.orgId);
  const entitlements = await durableApplicationEntitlements(session.userId, tenantId).catch(() => []);
  const stripeCustomerCount = await durableApplicationsCustomer(session.userId, tenantId).then((value) => value ? 1 : 0).catch(() => 0);
  const activeSubscriptions = entitlements.filter((entitlement) => entitlement.allowed);
  const licensedApplications = new Set(
    activeSubscriptions.map((entitlement) => entitlement.appSlug).filter(Boolean),
  );
  const organizationActive = Boolean(session.orgId);
  const organizationRole = session.orgRole || "No active organization role";

  const readinessCards = [
    {
      eyebrow: "Organization administration",
      title: "Teams and roles",
      body: "Organization membership, administrator roles, and user governance depend on an active Clerk organization context.",
      status: organizationActive
        ? `Organization context verified: ${session.orgId}`
        : "Create or select an organization before team administration",
    },
    {
      eyebrow: "Seat licensing",
      title: "Subscription-backed seats",
      body: "Seat allocation must be derived from purchased quantities and verified subscription metadata, not manually assumed.",
      status: activeSubscriptions.length
        ? `${activeSubscriptions.length} active subscription record(s) available for seat-policy mapping`
        : "No active subscription records available",
    },
    {
      eyebrow: "Application licensing",
      title: "Entitlements and activation",
      body: "Application access remains bound to active or trialing subscription snapshots in the signed-webhook ledger and server-issued license controls.",
      status: licensedApplications.size
        ? `${licensedApplications.size} application entitlement(s) verified`
        : "No active application entitlements found",
    },
    {
      eyebrow: "Release management",
      title: "Stable, beta, and early access",
      body: "Release-channel enrollment requires a verified entitlement and an approved release policy before customer activation.",
      status: "Policy and entitlement gate required",
    },
    {
      eyebrow: "Enterprise billing",
      title: "Invoices and subscription changes",
      body: "Billing history, receipts, upgrades, and cancellation controls are provided through verified Stripe customer records.",
      status: stripeCustomerCount
        ? `${stripeCustomerCount} Stripe customer record(s) matched`
        : "No Stripe customer record matched",
    },
    {
      eyebrow: "Enterprise identity",
      title: "SSO and provisioning readiness",
      body: "SAML/OIDC SSO and SCIM provisioning require an enterprise identity configuration, domain verification, and administrative approval.",
      status: "Configuration required before activation",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_85%_5%,rgba(30,100,139,.28),transparent_32%),linear-gradient(180deg,#03101d,#061b2d)] text-slate-100">
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-cyan-300/20 bg-slate-950/90 px-5 py-4 backdrop-blur-xl md:px-[5vw] lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-xs font-black tracking-[0.13em] text-white no-underline">
          <Image
            src="/brand/obserra-logo.png"
            alt={LEGAL_ENTITY_NAME}
            width={286}
            height={55}
            className="h-auto w-[min(250px,68vw)]"
          />
          <span className="hidden text-obserra-gold sm:inline">ENTERPRISE ACCOUNT</span>
        </Link>
        <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Link href="/store" className={linkClass}>Store</Link>
          <Link href="/portal/orders" className={linkClass}>Orders</Link>
          <Link href="/portal/applications" className={linkClass}>Applications</Link>
          <Link href="/portal" className={linkClass}>Dashboard</Link>
        </nav>
      </header>

      <section className="grid gap-6 px-5 py-12 md:px-[5vw] md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.42fr)]">
        <div>
          <p className="mb-3 text-xs font-black tracking-[0.14em] text-obserra-gold">AUTHENTICATED ENTERPRISE WORKSPACE</p>
          <h1 className="m-0 max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
            Manage organization readiness, commercial entitlements, and enterprise deployment pathways.
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">
            This workspace reports only verified Clerk identity context and durable signed-webhook commerce records. It does not create simulated organizations, seats, licenses, users, or billing activity.
          </p>
        </div>
        <aside className="self-start rounded-2xl border border-cyan-300/25 bg-slate-900/75 p-6 shadow-2xl shadow-black/30">
          <small className="text-xs font-black tracking-[0.12em] text-obserra-gold">ACCOUNT</small>
          <strong className="mt-3 block text-xl">{displayName}</strong>
          <span className="mt-2 block break-all text-sm text-slate-300">{email || "No verified primary email"}</span>
        </aside>
      </section>

      <section className="grid gap-3 px-5 pb-8 md:grid-cols-2 md:px-[5vw] xl:grid-cols-4">
        {[
          ["ORGANIZATION", organizationActive ? "Active" : "Not selected", session.orgId || "No Clerk organization context"],
          ["ORGANIZATION ROLE", organizationRole, "Verified session role"],
          ["ACTIVE SUBSCRIPTIONS", String(activeSubscriptions.length), "Active signed-webhook ledger records"],
          ["LICENSED APPLICATIONS", String(licensedApplications.size), "Verified application entitlements"],
        ].map(([label, value, detail]) => (
          <article key={label} className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
            <small className="text-xs font-black tracking-[0.12em] text-obserra-gold">{label}</small>
            <strong className="my-2 block break-words text-2xl">{value}</strong>
            <span className="text-sm leading-6 text-slate-300">{detail}</span>
          </article>
        ))}
      </section>

      <section className="px-5 py-10 md:px-[5vw]">
        <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.55fr)]">
          <div>
            <p className="mb-2 text-xs font-black tracking-[0.12em] text-obserra-gold">ENTERPRISE CONTROL PLANE</p>
            <h2 className="m-0 text-3xl font-black leading-none tracking-[-0.04em] sm:text-5xl">Current readiness and governed operating paths.</h2>
          </div>
          <p className="m-0 text-base leading-7 text-slate-300">Capabilities remain unavailable until their identity, billing, licensing, or deployment evidence exists.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readinessCards.map((card) => (
            <article key={card.title} className="flex min-h-72 flex-col rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-sky-950 to-slate-950 p-6 shadow-xl shadow-black/20">
              <small className="text-xs font-black tracking-[0.08em] text-obserra-gold">{card.eyebrow}</small>
              <h3 className="my-3 text-2xl font-black tracking-[-0.03em]">{card.title}</h3>
              <p className="m-0 leading-7 text-slate-300">{card.body}</p>
              <strong className="mt-auto pt-6 text-sm leading-6 text-cyan-200">{card.status}</strong>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/portal/orders" className="inline-flex items-center justify-center rounded-lg bg-obserra-gold px-5 py-3 font-black text-slate-950 no-underline hover:brightness-110">Review billing records</Link>
          <Link href="/portal/applications" className={linkClass}>Manage application access</Link>
          <Link href="/contact?interest=enterprise-account" className={linkClass}>Request enterprise setup</Link>
        </div>
      </section>

      <section className="border-y border-cyan-300/20 bg-slate-950/50 px-5 py-10 md:px-[5vw]">
        <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.55fr)]">
          <div>
            <p className="mb-2 text-xs font-black tracking-[0.12em] text-obserra-gold">SECURE BY DEFAULT</p>
            <h2 className="m-0 text-3xl font-black leading-none tracking-[-0.04em] sm:text-5xl">Enterprise controls remain evidence-based and fail closed.</h2>
          </div>
          <p className="m-0 text-base leading-7 text-slate-300">No customer receives organization privileges, seats, licenses, downloads, or release-channel access without verified authorization.</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Identity", "Authenticated Clerk session and organization context"],
            ["Commerce", "Stripe-hosted billing and verified subscription records"],
            ["Licensing", "Subscription-bound entitlement validation"],
            ["Auditability", "Provider records and server-side authorization decisions"],
          ].map(([title, detail]) => (
            <article key={title} className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
              <strong className="block text-lg text-obserra-gold">{title}</strong>
              <span className="mt-2 block text-sm leading-6 text-slate-300">{detail}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
