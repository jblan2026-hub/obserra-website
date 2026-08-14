import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { licenseRepository } from "../../../lib/license-repository";
import { productEntitlementRegistry, seatsAvailable, validateLicenseRecord } from "../../../lib/licensing";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: `Licenses and Entitlements | ${LEGAL_ENTITY_NAME} Customer Portal`,
  description: `Review verified ${LEGAL_ENTITY_NAME} licenses, seat capacity, renewal status, deployment rights, and entitlement policies.`,
  robots: { index: false, follow: false },
};

function formatDate(value?: string) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default async function LicenseCenterPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/licenses");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const result = await licenseRepository.listForSubject({ subjectId: userId, tenantId: orgId || undefined, email });
  const records = result.records.filter((record) => validateLicenseRecord(record).length === 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/95 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-amber-400">{LEGAL_ENTITY_NAME} CUSTOMER PORTAL</p>
            <h1 className="mt-2 text-2xl font-semibold">Licenses and Entitlements</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/portal" className="rounded-lg border border-white/15 px-4 py-2 hover:border-amber-400">Dashboard</Link>
            <Link href="/portal/success" className="rounded-lg border border-white/15 px-4 py-2 hover:border-amber-400">Customer Success</Link>
            <Link href="/apps" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950">Browse Applications</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs tracking-[0.18em] text-slate-400">VERIFIED LICENSES</p>
            <strong className="mt-3 block text-3xl">{records.length}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs tracking-[0.18em] text-slate-400">ACTIVE PRODUCTS</p>
            <strong className="mt-3 block text-3xl">{records.filter((record) => record.status === "active").length}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs tracking-[0.18em] text-slate-400">SEATS AVAILABLE</p>
            <strong className="mt-3 block text-3xl">{records.reduce((total, record) => total + seatsAvailable(record), 0)}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs tracking-[0.18em] text-slate-400">SOURCE STATUS</p>
            <strong className="mt-3 block text-lg capitalize">{result.authoritative ? result.source : "Unavailable"}</strong>
          </article>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-amber-400">LICENSE INVENTORY</p>
              <h2 className="mt-2 text-2xl font-semibold">Verified commercial access</h2>
              <p className="mt-2 max-w-3xl text-slate-300">Only licenses reconciled from an authoritative commercial source are displayed. Missing or invalid records are withheld rather than estimated.</p>
            </div>
            <Link href="/contact?interest=enterprise-licensing" className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-300">Licensing support</Link>
          </div>

          {records.length ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {records.map((record) => {
                const entitlements = productEntitlementRegistry.filter((entry) => entry.productSlug === record.productSlug);
                return (
                  <article key={record.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{record.productSlug}</p>
                        <h3 className="mt-2 text-xl font-semibold capitalize">{record.licenseType} license</h3>
                      </div>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">{record.status}</span>
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="text-slate-400">Seats purchased</dt><dd className="mt-1 font-semibold">{record.seatsPurchased}</dd></div>
                      <div><dt className="text-slate-400">Seats assigned</dt><dd className="mt-1 font-semibold">{record.seatsAssigned}</dd></div>
                      <div><dt className="text-slate-400">Seats available</dt><dd className="mt-1 font-semibold">{seatsAvailable(record)}</dd></div>
                      <div><dt className="text-slate-400">Renewal</dt><dd className="mt-1 font-semibold">{formatDate(record.renewalAt)}</dd></div>
                      <div><dt className="text-slate-400">Support level</dt><dd className="mt-1 font-semibold">{record.supportLevel || "Not specified"}</dd></div>
                      <div><dt className="text-slate-400">Maintenance</dt><dd className="mt-1 font-semibold">{record.maintenanceActive ? "Active" : "Inactive"}</dd></div>
                    </dl>
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">REGISTERED ENTITLEMENTS</p>
                      {entitlements.length ? <ul className="mt-3 space-y-2 text-sm text-slate-300">{entitlements.map((entry) => <li key={entry.id}>• {entry.name}</li>)}</ul> : <p className="mt-3 text-sm text-slate-400">No entitlement policy is registered for this product yet.</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <h3 className="text-xl font-semibold">No verified licenses are available.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-slate-300">{result.message || "The licensing system returned no authoritative records for this account."}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/apps" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950">Browse applications</Link>
                <Link href="/contact?interest=license-reconciliation" className="rounded-lg border border-white/20 px-4 py-2 font-semibold">Request reconciliation</Link>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
