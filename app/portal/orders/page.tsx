import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { applicationsTenantId, durableApplicationsCustomer } from "../../../lib/applications-commerce";
import { applicationsCommerceConfigured, getApplicationsStripe } from "../../../lib/applications-stripe";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { ensureApplicationsRuntimeSecrets } from "../../../lib/production-runtime-secrets";

export const metadata: Metadata = {
  title: `Orders and Billing | ${LEGAL_ENTITY_NAME} Customer Portal`,
  description: `Review verified ${LEGAL_ENTITY_NAME} subscriptions, invoices, receipts, and fulfillment pathways.`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const shell = "min-h-svh bg-gradient-to-b from-[#03101d] to-[#061b2d] text-[#eef8ff]";
const nav = "sticky top-0 z-20 flex flex-col gap-4 border-b border-[#72bada33] bg-[#03101dec] px-[max(5vw,24px)] py-4 backdrop-blur md:flex-row md:items-center md:justify-between";
const navLink = "rounded-lg border border-[#72bada33] bg-[#08243c] px-3 py-2 text-center text-sm font-extrabold text-[#dff3ff] no-underline md:border-0 md:bg-transparent md:p-0";
const eyebrow = "text-[11px] font-black tracking-[0.12em] text-obserra-gold";
const panel = "rounded-2xl border border-[#72bada33] bg-[#08243c]";
const goldButton = "rounded-lg bg-obserra-gold px-3 py-2 text-sm font-black text-[#082033] no-underline";

function money(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "Not available";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function dateFromUnix(value: number | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value * 1000));
}

function OrdersHeader({ billing = false }: { billing?: boolean }) {
  return (
    <header className={nav}>
      <Link href="/" className="flex items-center gap-3 text-[11px] font-black tracking-[0.13em] text-white no-underline">
        <Image className="h-auto w-[min(250px,68vw)]" src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
        <span>ORDERS &amp; BILLING</span>
      </Link>
      <nav className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:items-center md:gap-4">
        <Link className={navLink} href="/store">Store</Link>
        <Link className={navLink} href="/portal/applications">Applications</Link>
        <Link className={navLink} href="/portal">Dashboard</Link>
        {billing ? <form action="/api/apps/billing-portal" method="post"><button className={goldButton} type="submit">Manage billing</button></form> : null}
      </nav>
    </header>
  );
}

export default async function OrdersPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/orders");

  let commerceConfigured = false;
  try {
    await ensureApplicationsRuntimeSecrets();
    commerceConfigured = applicationsCommerceConfigured();
  } catch {
    commerceConfigured = false;
  }

  const customer = commerceConfigured
    ? await durableApplicationsCustomer(userId, applicationsTenantId(userId, orgId)).catch(() => null)
    : null;
  if (!customer) {
    return (
      <main className={shell}>
        <OrdersHeader />
        <section className={`${panel} mx-auto my-[12vh] max-w-4xl p-8`}>
          <p className={eyebrow}>VERIFIED COMMERCE RECORDS</p>
          <h1 className="my-5 text-[clamp(36px,5vw,64px)] leading-none tracking-[-0.04em]">Billing records are unavailable.</h1>
          <span className="block leading-7 text-[#b8d5e6]">The portal is configured to fail closed when Stripe or the verified account email is unavailable. No simulated orders or balances are displayed.</span>
        </section>
      </main>
    );
  }

  const stripe = getApplicationsStripe();
  const customerIds = [customer.stripeCustomerId];
  const subscriptionGroups = await Promise.all(customerIds.map((customer) => stripe.subscriptions.list({ customer, status: "all", limit: 100, expand: ["data.items.data.price.product"] })));
  const invoiceGroups = await Promise.all(customerIds.map((customer) => stripe.invoices.list({ customer, limit: 100 })));
  const subscriptions = subscriptionGroups.flatMap((group) => group.data).sort((a, b) => b.created - a.created);
  const invoices = invoiceGroups.flatMap((group) => group.data).sort((a, b) => b.created - a.created);
  const activeCount = subscriptions.filter((subscription) => subscription.status === "active" || subscription.status === "trialing").length;
  const kpis = [
    ["ACTIVE SUBSCRIPTIONS", String(activeCount), "Active or trialing"],
    ["TOTAL SUBSCRIPTIONS", String(subscriptions.length), "All Stripe states"],
    ["INVOICES", String(invoices.length), "Verified billing records"],
    ["PAYMENT SYSTEM", "Stripe", "Hosted checkout and billing"],
  ];

  return (
    <main className={shell}>
      <OrdersHeader billing />
      <section className="bg-[radial-gradient(circle_at_88%_8%,#1e648b4a,transparent_34%)] px-[max(5vw,24px)] pb-9 pt-16 md:pt-20">
        <p className={eyebrow}>AUTHENTICATED COMMERCE CENTER</p>
        <h1 className="m-0 max-w-6xl text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-[-0.05em]">Your verified subscriptions, invoices, receipts, and fulfillment pathways.</h1>
        <span className="mt-5 block max-w-4xl text-lg leading-8 text-[#b8d5e6]">Records are loaded from the Stripe customer immutably bound to your authenticated {LEGAL_ENTITY_NAME} account. Email lookup is not used, and no order, invoice, subscription, balance, or receipt is fabricated by the website.</span>
      </section>

      <section className="grid grid-cols-1 gap-3 px-[max(5vw,24px)] pb-7 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, detail]) => <article key={label} className={`${panel} p-5`}><small className={eyebrow}>{label}</small><strong className="my-2 block text-3xl">{value}</strong><span className="text-sm text-[#b8d5e6]">{detail}</span></article>)}
      </section>

      <section className="px-[max(5vw,24px)] py-8">
        <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.5fr)]">
          <div><p className={eyebrow}>SUBSCRIPTIONS</p><h2 className="m-0 text-[clamp(30px,4vw,48px)] leading-none tracking-[-0.04em]">Current and historical recurring purchases.</h2></div>
          <span className="text-lg leading-8 text-[#b8d5e6]">Application fulfillment is available only when entitlement status is active or trialing.</span>
        </div>
        {subscriptions.length ? <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">{subscriptions.map((subscription) => {
          const item = subscription.items.data[0];
          const productValue = item?.price.product;
          const product = productValue && typeof productValue !== "string" && !("deleted" in productValue) ? productValue : null;
          const appSlug = subscription.metadata.obserraApp;
          return <article key={subscription.id} className="rounded-2xl border border-[#72bada33] bg-gradient-to-br from-[#0d3556] to-[#071e33] p-5"><header className="grid gap-3 sm:flex sm:items-start sm:justify-between"><small className={eyebrow}>{subscription.status.toUpperCase()}</small><strong className="text-xl sm:text-right">{product?.name || appSlug || `${LEGAL_ENTITY_NAME} subscription`}</strong></header><dl className="my-5 grid gap-3">{[["Plan", subscription.metadata.plan || item?.price.recurring?.interval || "Not available"],["Deployment", subscription.metadata.deploymentModel || "Not specified"],["Started", dateFromUnix(subscription.start_date)],["Current period", dateFromUnix(item?.current_period_end)]].map(([term, detail]) => <div key={term} className="flex justify-between gap-4 border-b border-[#72bada22] pb-2"><dt className="text-[#9ccbe2]">{term}</dt><dd className="m-0 text-right">{detail}</dd></div>)}</dl><footer className="flex flex-wrap gap-3">{appSlug ? <Link className={goldButton} href="/portal/applications">Open fulfillment</Link> : <Link className={goldButton} href="/store">View offering</Link>}<form action="/api/apps/billing-portal" method="post"><input type="hidden" name="app" value={appSlug}/><button className={goldButton} type="submit">Manage subscription</button></form></footer></article>;
        })}</div> : <div className="mt-5 rounded-2xl border border-[#72bada33] bg-gradient-to-br from-[#0d3556] to-[#071e33] p-5"><h3>No Stripe subscriptions found.</h3><p className="leading-7 text-[#b8d5e6]">This account has no recurring purchase records associated with the verified email address.</p><Link className={goldButton} href="/store">Browse the store</Link></div>}
      </section>

      <section className="px-[max(5vw,24px)] py-8">
        <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.5fr)]"><div><p className={eyebrow}>INVOICES &amp; RECEIPTS</p><h2 className="m-0 text-[clamp(30px,4vw,48px)] leading-none tracking-[-0.04em]">Verified payment and billing documents.</h2></div><span className="text-lg leading-8 text-[#b8d5e6]">Links are provided only when Stripe returns a hosted invoice or invoice PDF.</span></div>
        {invoices.length ? <div className="mt-5 grid gap-3">{invoices.map((invoice) => <article key={invoice.id} className={`${panel} grid gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(120px,.4fr)_auto] lg:items-center`}><div className="grid gap-1"><small className={eyebrow}>{(invoice.status || "unknown").toUpperCase()}</small><strong>{invoice.number || invoice.id}</strong><span className="text-sm text-[#b8d5e6]">{dateFromUnix(invoice.created)}</span></div><div className="grid gap-1"><strong>{money(invoice.amount_paid, invoice.currency)}</strong><span className="text-sm text-[#b8d5e6]">Paid</span></div><div className="flex flex-wrap gap-3 lg:justify-end">{invoice.hosted_invoice_url ? <a className={goldButton} href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">View invoice</a> : null}{invoice.invoice_pdf ? <a className={goldButton} href={invoice.invoice_pdf} target="_blank" rel="noreferrer">Download PDF</a> : null}</div></article>)}</div> : <div className="mt-5 rounded-2xl border border-[#72bada33] bg-gradient-to-br from-[#0d3556] to-[#071e33] p-5"><h3>No Stripe invoices found.</h3><p className="text-[#b8d5e6]">No verified invoices are associated with this authenticated account.</p></div>}
      </section>
    </main>
  );
}
