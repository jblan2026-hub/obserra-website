import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { courses } from "../academy/courseData";
import { academyStateFromUser, getAcademyAggregateMetrics, getAcademyCommerceMetrics, ownerEmailAllowed } from "../../lib/academy";
import "./admin.css";

export const metadata: Metadata = {
  title: "Owner Administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!ownerEmailAllowed(emails)) notFound();
  const state = academyStateFromUser(user!);
  const [metrics, commerce] = await Promise.all([getAcademyAggregateMetrics(), getAcademyCommerceMetrics()]);
  const grossRevenue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(commerce.grossUsdCents / 100);
  return <main className="admin-shell"><header><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><span>SECURED OWNER CONTROL ROOM</span></header><section className="admin-hero"><p>Signed in owner: {emails[0]}</p><h1>Obserra site administration</h1><p>Protected Academy controls, completion records, commerce performance, and release readiness. Public website content remains managed through the private Obserra source repository and Vercel project access.</p></section><section className="admin-grid"><article><span>Catalog courses</span><strong>{courses.length}</strong><small>Structured paid courses in Academy</small></article><article><span>Learner accounts</span><strong>{metrics.learnerAccounts}</strong><small>Private learner accounts</small></article><article><span>Verified enrollments</span><strong>{metrics.enrollments}</strong><small>Paid course access records</small></article><article><span>Stripe paid checkouts</span><strong>{commerce.available ? commerce.paidCheckouts : "—"}</strong><small>Live payment-provider count</small></article><article><span>Gross USD collected</span><strong>{commerce.available ? grossRevenue : "—"}</strong><small>Payment-provider reported total</small></article><article><span>Issued certificates</span><strong>{metrics.certificates}</strong><small>Completion records across the catalog</small></article><article><span>Your enrolled courses</span><strong>{Object.keys(state.entitlements).length}</strong><small>Owner learning access</small></article><article><span>Your certificates</span><strong>{Object.values(state.progress).filter((item) => item.certificateId).length}</strong><small>Owner completion records</small></article></section><section className="admin-section"><h2>Website activity</h2><p>Privacy-first page views, top pages, traffic sources, and the Academy checkout-started click event are collected by Vercel Web Analytics. The metrics remain in the private Vercel account rather than being exposed through the public site.</p><p><a href="https://vercel.com/obserra/obserra-integrated-services/analytics" target="_blank" rel="noreferrer">Open private Web Analytics</a></p></section><section className="admin-section"><h2>Course release control</h2><div className="admin-course-list">{courses.map((course) => <article key={course.id}><div><span>{course.department}</span><h3>{course.title}</h3><p>{course.modules.length} interactive lessons, 25 question final, and 80 percent certificate threshold</p></div><div><b>{metrics.coursesByEnrollment[course.id] ?? 0} verified enrollments</b><a href={`/academy/learn/${course.id}`}>Open owner learner view</a></div></article>)}</div></section><section className="admin-section"><h2>Owner access path</h2><p>Only the approved owner email can open this administration area. The allowlist is stored as a protected Vercel environment variable and is never exposed in public website code. Purchasers receive Academy accounts and course entitlements only; they cannot receive administrator access through checkout, invitation, or a public route.</p></section></main>;
}
