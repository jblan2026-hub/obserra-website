import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createCustomerSuccessSnapshot } from "./customerSuccess";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: `Customer Success Center | ${LEGAL_ENTITY_NAME}`,
  description: "Protected customer workspace for subscriptions, adoption, licensing, renewals, support, and executive value reporting.",
  robots: { index: false, follow: false },
};

const statusLabel = {
  available: "Available",
  "request-based": "Request based",
  "integration-required": "Integration required",
} as const;

export default async function CustomerSuccessPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/success");

  const user = await currentUser();
  const displayName = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Customer";
  const snapshot = createCustomerSuccessSnapshot(userId, orgId || undefined);

  return (
    <main className="min-h-screen bg-[#020b14] text-white">
      <section className="border-b border-cyan-300/10 bg-[radial-gradient(circle_at_top_right,rgba(30,128,180,0.18),transparent_32%),linear-gradient(180deg,#061827_0%,#020b14_100%)] px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/portal" className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">← Customer Dashboard</Link>
            <Link href="/contact?interest=customer-support" className="rounded-md border border-amber-300/40 px-4 py-2 text-sm font-semibold text-amber-200">Open support</Link>
          </div>
          <div className="mt-12 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Protected Customer Success Center</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Customer outcomes without invented data.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Welcome, {displayName}. This workspace is structured for subscriptions, renewals, licensing, adoption, support, and executive value reporting. Metrics activate only when their verified systems of record are connected and tenant authorization is enforced.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.metrics.map((metric) => (
            <article key={metric.id} className="rounded-xl border border-cyan-300/10 bg-white/[0.035] p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{metric.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${metric.status === "healthy" ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-400/10 text-slate-300"}`}>{metric.status}</span>
              </div>
              <strong className="mt-5 block text-2xl text-white">{metric.value || "Pending integration"}</strong>
              <p className="mt-3 text-sm leading-6 text-slate-400">{metric.description}</p>
              <p className="mt-4 text-xs text-cyan-200/70">Source: {metric.source}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-12">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Customer lifecycle modules</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">A scalable operating layer for retention, adoption, and value realization.</h2>
          </div>
          <p className="text-base leading-7 text-slate-400">Each module declares its required systems so new providers can be connected without rewriting the page. Unverified financial, licensing, usage, or case data remains unavailable by design.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.modules.map((module) => (
            <article key={module.id} className="flex min-h-[280px] flex-col rounded-xl border border-cyan-300/10 bg-[#071522] p-6 shadow-2xl shadow-black/10">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{module.id.replaceAll("-", " ")}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">{statusLabel[module.status]}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold">{module.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">{module.description}</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Required systems</p>
                <p className="mt-2 text-sm text-slate-300">{module.requiredSystems.join(" · ")}</p>
              </div>
              <Link href={module.href} className="mt-5 inline-flex font-semibold text-amber-300">{module.action} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-cyan-300/10 bg-[#06121d] px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Data governance</p>
            <h2 className="mt-3 text-2xl font-semibold">Customer health scores will remain evidence based.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-400">Future scoring will require customer scoped subscriptions, licensing, usage, support, and engagement records. Every score must retain source attribution, calculation version, verification time, and authorization context.</p>
          </div>
          <Link href="/trust" className="rounded-md border border-cyan-300/30 px-5 py-3 font-semibold text-cyan-200">Review Trust Center</Link>
        </div>
      </section>
    </main>
  );
}
