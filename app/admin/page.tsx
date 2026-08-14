import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { courses } from "../academy/courseData";
import { getAcademyAggregateMetrics, getAcademyCommerceMetrics, ownerEmailAllowed } from "../../lib/academy";
import AcademyCommerceProvisioner from "./AcademyCommerceProvisioner";
import "./admin.css";
import "./admin-refine.css";

export const metadata: Metadata = { title: "Owner Administration", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!ownerEmailAllowed(emails)) notFound();

  const [metrics, commerce] = await Promise.all([getAcademyAggregateMetrics(), getAcademyCommerceMetrics()]);
  const grossRevenue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(commerce.grossUsdCents / 100);
  const paidCheckouts = commerce.available ? commerce.paidCheckouts : 0;
  const enrollmentCoverage = metrics.enrollments > 0 ? `${Math.round((paidCheckouts / metrics.enrollments) * 100)}%` : "—";

  const coursePerformance = courses.map((course) => {
    const enrollments = metrics.coursesByEnrollment[course.id] ?? 0;
    const certificates = metrics.coursesByCertificate[course.id] ?? 0;
    const completionRate = enrollments > 0 ? `${Math.round((certificates / enrollments) * 100)}%` : "0%";
    return { course, enrollments, certificates, completionRate };
  });

  return <main className="admin-shell">
    <header><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} /><span>SECURED OWNER CONTROL ROOM</span></header>
    <section className="admin-hero"><p>Signed in owner: {emails[0]}</p><h1>Obserra site administration</h1><p>Protected Academy controls, commerce performance, traffic intelligence, and release readiness for OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC.</p></section>
    <section className="admin-grid">
      <article><span>Catalog courses</span><strong>{courses.length}</strong><small>Structured paid courses in Academy</small></article>
      <article><span>Learner accounts observed</span><strong>{metrics.learnerAccounts}</strong><small>Durable Academy learner records</small></article>
      <article><span>Anonymous paid access</span><strong>Secure</strong><small>Signed, server-verified learner access</small></article>
      <article><span>Verified enrollments</span><strong>{metrics.enrollments}</strong><small>Active durable learner records</small></article>
      <article><span>Stripe paid checkouts</span><strong>{commerce.available ? commerce.paidCheckouts : "—"}</strong><small>Live payment-provider count</small></article>
      <article><span>Gross USD collected</span><strong>{commerce.available ? grossRevenue : "—"}</strong><small>Payment-provider reported total</small></article>
      <article><span>Issued certificates</span><strong>{metrics.certificates}</strong><small>Signed durable completion records</small></article>
      <article><span>Enrollment coverage</span><strong>{enrollmentCoverage}</strong><small>Paid checkouts compared with stored enrollments</small></article>
    </section>
    <section className="admin-section"><h2>Commerce provisioning</h2><AcademyCommerceProvisioner /></section>
    <section className="admin-section"><h2>Website activity and tracking</h2><p>Privacy-first page views, top pages, conversion events, traffic sources, and API execution traces are available in private Vercel and Stripe consoles. Use the links below for rapid operational review.</p><div className="admin-action-row"><a href="https://vercel.com/obserra/obserra-website-live/analytics" target="_blank" rel="noreferrer">Open Vercel Web Analytics</a><a href="https://vercel.com/obserra/obserra-website-live/observability" target="_blank" rel="noreferrer">Open Vercel Observability</a><a href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer">Open Stripe Payments</a><a href="https://dashboard.stripe.com/events" target="_blank" rel="noreferrer">Open Stripe Events</a></div></section>
    <section className="admin-section"><h2>Course performance intelligence</h2><div className="admin-course-list">{coursePerformance.map(({ course, enrollments, certificates, completionRate }) => <article key={course.id}><div><span>{course.department}</span><h3>{course.title}</h3><p>{course.modules.length} interactive lessons, 25 question final, and 80 percent certificate threshold</p></div><div><b>{enrollments} enrollments</b><b>{certificates} certificates</b><b>{completionRate} completion rate</b><a href={`/academy/${course.id}`}>Open public course page</a></div></article>)}</div></section>
    <section className="admin-section"><h2>Admin access and passwordless security</h2><p>Admin access is controlled by signed-in Clerk account email allowlist. Configure OBSERRA_OWNER_EMAIL for single owner access or OBSERRA_OWNER_EMAILS for comma-separated multi-admin access. We do not generate or expose admin credentials in code.</p><p>For passwordless access with no username and password entry, configure Clerk to allow passkeys (WebAuthn) and/or email link sign-in, then disable password-based sign-in strategies in the Clerk dashboard for your production instance.</p></section>
  </main>;
}
