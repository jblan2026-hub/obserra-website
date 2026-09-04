import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ACADEMY_BRAND_NAME, LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: "Store",
  description: `Purchase ${LEGAL_ENTITY_NAME} AI capabilities, applications, courses, subscriptions, advisory services, and enterprise offerings through one secure commercial storefront.`,
  alternates: { canonical: "/store" },
};

const categories = [
  {
    eyebrow: "AI MARKETPLACE",
    title: "AI skills, agents, workflows, and governed capability packs",
    copy: `Purchase first-party ${LEGAL_ENTITY_NAME} AI capabilities through the governed marketplace with payment-gated fulfillment and protected delivery.`,
    href: "/ai-marketplace",
    action: "Shop AI Marketplace",
    status: "Secure checkout",
    commerce: true,
  },
  {
    eyebrow: "APPLICATIONS",
    title: "Enterprise software and SaaS",
    copy: `Evaluate ${LEGAL_ENTITY_NAME} applications, deployment models, licensing paths, and approved enterprise offerings.`,
    href: "/apps",
    action: "Browse applications",
    status: "Enterprise engagement",
    commerce: false,
  },
  {
    eyebrow: "ACADEMY",
    title: "Professional courses and completion records",
    copy: `Evaluate cybersecurity, leadership, governance, intelligence, and executive education through ${ACADEMY_BRAND_NAME}. Approved courses expose secure enrollment checkout.`,
    href: "/academy",
    action: "Shop approved courses",
    status: "Secure enrollment",
    commerce: true,
  },
  {
    eyebrow: "ADVISORY",
    title: "Executive and cybersecurity advisory",
    copy: "Request fractional Chief Information Security Officer leadership, board advisory, cyber strategy, governance, risk, compliance, and transformation engagements.",
    href: "/services",
    action: "Explore advisory",
    status: "Proposal-based",
    commerce: false,
  },
  {
    eyebrow: "PROTECTION",
    title: "Executive protection and intelligence",
    copy: "Request executive protection, travel risk, protective intelligence, investigations, and security planning services.",
    href: "/contact?interest=executive-protection",
    action: "Request protection support",
    status: "Consultation required",
    commerce: false,
  },
];

const commerceControls = [
  ["Secure payments", `Stripe-hosted checkout keeps payment-card data outside ${LEGAL_ENTITY_NAME} application code.`],
  ["Subscription enforcement", "Application access is revalidated and denied automatically when billing is inactive."],
  ["Protected delivery", "Approved software and marketplace artifacts use authenticated entitlement checks and short-lived signed delivery paths."],
  ["Customer fulfillment", "Purchases route to the protected portal or entitled download flow for launch, licensing, downloads, billing, and support."],
];

const commerceButton = "inline-flex min-h-12 items-center justify-center rounded-lg border border-[#d6af00] bg-[#ffd400] px-4 py-3 text-center text-sm font-black text-[#071a2b] no-underline shadow-[0_10px_24px_rgba(131,102,0,.24)] transition hover:-translate-y-px hover:bg-[#ffe55c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03101d]";
const secondaryButton = "inline-flex min-h-12 items-center justify-center rounded-lg border border-[#8bd8fa55] bg-[#0a2d4b] px-4 py-3 text-center text-sm font-black text-[#e9f8ff] no-underline transition hover:border-[#8bd8fa99] hover:bg-[#0d3657] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03101d]";
const eyebrow = "m-0 text-[11px] font-black tracking-[0.12em] text-[#d9ad57]";

export default function StorePage() {
  return (
    <main className="min-h-svh bg-[linear-gradient(180deg,#03101d,#061b2d)] font-[Sora,'Avenir_Next',sans-serif] text-[#edf8ff]">
      <header className="relative z-20 grid gap-4 border-b border-[#6db8d833] bg-[#03101de8] px-4 py-4 backdrop-blur-md md:sticky md:top-0 md:flex md:items-center md:justify-between md:px-[max(5vw,24px)]">
        <Link href="/" className="flex items-center gap-3 text-[11px] font-black tracking-[0.13em] text-white no-underline" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image className="h-auto w-[min(220px,70vw)] md:w-[260px]" src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
          <span>COMMERCIAL STORE</span>
        </Link>
        <nav className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-3.5" aria-label="Store navigation">
          {[
            ["AI Marketplace", "/ai-marketplace"],
            ["Applications", "/apps"],
            ["Courses", "/academy"],
            ["Services", "/services"],
            ["Customer portal", "/portal"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="flex min-h-11 items-center justify-center rounded-lg border border-[#6db8d833] bg-[#08243c] px-3 py-2.5 text-center text-[13px] font-extrabold text-[#dff3ff] no-underline md:min-h-0 md:border-0 md:bg-transparent md:p-0">
              {label}
            </Link>
          ))}
          <Link className="col-span-2 flex min-h-11 items-center justify-center rounded-lg border border-[#8bd8fa55] bg-[#0a2d4b] px-4 py-2.5 text-center text-[13px] font-extrabold text-[#e9f8ff] no-underline md:col-auto" href="/contact?interest=enterprise-commerce">Enterprise sales</Link>
        </nav>
      </header>

      <section className="grid gap-6 bg-[radial-gradient(circle_at_88%_12%,#1e648b4a,transparent_34%)] px-4 pb-7 pt-11 md:px-[max(5vw,24px)] md:pb-10 md:pt-[72px] xl:grid-cols-[minmax(0,1fr)_minmax(260px,.45fr)]">
        <div>
          <p className={eyebrow}>{LEGAL_ENTITY_NAME} COMMERCIAL PLATFORM</p>
          <h1 className="mt-3 max-w-[1050px] text-[clamp(36px,11vw,52px)] font-black leading-[0.98] tracking-[-0.05em] md:text-[clamp(40px,5vw,72px)]">AI capabilities, applications, courses, and executive services in one secure commercial platform.</h1>
          <p className="max-w-4xl text-[17px] leading-[1.65] text-[#b8d5e6]">Use gold actions for direct purchase and enrollment paths. Enterprise applications, advisory, and protection engagements route through governed commercial assessment when self-service checkout is not the correct path.</p>
          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
            <Link className={commerceButton} href="/ai-marketplace">Shop AI Marketplace</Link>
            <Link className={commerceButton} href="/academy">Shop approved courses</Link>
            <Link className={secondaryButton} href="/apps">Browse applications</Link>
            <Link className={secondaryButton} href="/contact?interest=enterprise-commerce">Request enterprise pricing</Link>
          </div>
        </div>
        <aside className="self-start rounded-2xl border border-[#6db8d833] bg-[#082a45] p-5 shadow-2xl">
          <span className={eyebrow}>COMMERCE MODEL</span>
          <strong className="my-2 block text-xl">Secure, entitlement-based, and fail closed</strong>
          <p className="m-0 leading-[1.65] text-[#b8d5e6]">Direct checkout appears only where the required commercial controls are available. Consultation paths remain visually distinct from transactions.</p>
        </aside>
      </section>

      <section className="grid gap-3 px-4 pb-6 sm:grid-cols-2 md:px-[max(5vw,24px)] xl:grid-cols-5" aria-label="Store capabilities">
        {[
          ["AI MARKETPLACE", "Purchase", "Skills, agents, workflows, packs, and protected artifacts"],
          ["APPLICATIONS", "Assess", "SaaS, private cloud, hybrid, and on-premises options"],
          ["COURSES", "Enroll", "Approved professional learning and course-completion pathways"],
          ["SERVICES", "Proposals", "Advisory, protection, and enterprise engagements"],
          ["FULFILLMENT", "Protected", "Portal access, licensing, downloads, and billing"],
        ].map(([label, value, copy]) => (
          <article key={label} className="rounded-[14px] border border-[#6db8d833] bg-[#08243c] p-[18px]">
            <span className={eyebrow}>{label}</span>
            <strong className="my-2 block text-2xl">{value}</strong>
            <p className="m-0 leading-[1.55] text-[#b8d5e6]">{copy}</p>
          </article>
        ))}
      </section>

      <section className="px-4 py-8 md:px-[max(5vw,24px)]">
        <div className="grid items-end gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,.55fr)]">
          <div><p className={eyebrow}>SHOP BY OFFERING</p><h2 className="mt-2 text-[clamp(32px,4vw,50px)] font-black leading-none tracking-[-0.04em]">Start with one capability and expand across the {LEGAL_ENTITY_NAME} platform.</h2></div>
          <p className="m-0 text-[17px] leading-[1.65] text-[#b8d5e6]">Each category routes to its actual production purchase, enrollment, or enterprise engagement workflow.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <article key={category.title} className="flex min-h-0 flex-col rounded-[14px] border border-[#6db8d833] bg-[linear-gradient(150deg,#0d3556,#071e33)] p-5 shadow-xl xl:min-h-[300px]">
              <div className="flex items-start justify-between gap-3"><span className={eyebrow}>{category.eyebrow}</span><small className="text-right text-[#9edfff]">{category.status}</small></div>
              <h3 className="text-[23px] font-black tracking-[-0.03em]">{category.title}</h3>
              <p className="m-0 leading-[1.55] text-[#b8d5e6]">{category.copy}</p>
              <Link className={`${category.commerce ? commerceButton : secondaryButton} mt-6 xl:mt-auto`} href={category.href}>{category.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#6db8d833] bg-[#05182a] px-4 py-8 md:px-[max(5vw,24px)]">
        <div className="grid items-end gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,.55fr)]">
          <div><p className={eyebrow}>SECURE COMMERCE</p><h2 className="mt-2 text-[clamp(32px,4vw,50px)] font-black leading-none tracking-[-0.04em]">Commercial controls built for trusted customer transactions.</h2></div>
          <p className="m-0 text-[17px] leading-[1.65] text-[#b8d5e6]">Payment, subscription, fulfillment, and delivery controls remain fail closed when required services are not configured.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {commerceControls.map(([title, copy]) => <article key={title} className="rounded-[14px] border border-[#6db8d833] bg-[#08243c] p-[18px]"><h3 className="text-[23px] font-black tracking-[-0.03em]">{title}</h3><p className="m-0 leading-[1.55] text-[#b8d5e6]">{copy}</p></article>)}
        </div>
      </section>

      <section className="grid items-center gap-6 bg-[radial-gradient(circle_at_90%_10%,#1e648b3d,transparent_35%),#06192a] px-4 py-10 md:px-[max(5vw,24px)] xl:grid-cols-[minmax(0,1fr)_auto]">
        <div><p className={eyebrow}>ENTERPRISE PURCHASING</p><h2 className="mt-2 text-[clamp(32px,4vw,50px)] font-black leading-none tracking-[-0.04em]">Need bundled applications, team training, deployment support, or a custom agreement?</h2><p className="text-[17px] leading-[1.65] text-[#b8d5e6]">{LEGAL_ENTITY_NAME} can coordinate enterprise pricing, procurement documentation, implementation planning, and controlled deployment.</p></div>
        <div className="grid gap-3 sm:flex sm:flex-wrap xl:justify-end"><Link className={secondaryButton} href="/contact?interest=enterprise-commerce">Contact enterprise sales</Link><Link className={secondaryButton} href="/portal">Open customer portal</Link></div>
      </section>
    </main>
  );
}
