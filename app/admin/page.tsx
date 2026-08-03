import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { courses } from "../academy/courseData";
import { academyStateFromUser, getAcademyAggregateMetrics, ownerEmailAllowed } from "../../lib/academy";
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
  if (!ownerEmailAllowed(emails)) return <main className="admin-denied"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><h1>Owner access required</h1><p>This secured control room is restricted to the approved Obserra owner account.</p></main>;
  const state = academyStateFromUser(user!);
  const metrics = await getAcademyAggregateMetrics();
  return <main className="admin-shell"><header><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><span>SECURED OWNER CONTROL ROOM</span></header><section className="admin-hero"><p>Signed in owner: {emails[0]}</p><h1>Obserra site administration</h1><p>Protected Academy controls, completion records, and release readiness. Public website content remains managed through the private Obserra source repository and Vercel project access.</p></section><section className="admin-grid"><article><span>Catalog courses</span><strong>{courses.length}</strong><small>Structured paid courses in Academy</small></article><article><span>Learner accounts</span><strong>{metrics.learnerAccounts}</strong><small>Private learner accounts</small></article><article><span>Paid enrollments</span><strong>{metrics.enrollments}</strong><small>Verified course access records</small></article><article><span>Issued certificates</span><strong>{metrics.certificates}</strong><small>Completion records across the catalog</small></article><article><span>Your enrolled courses</span><strong>{Object.keys(state.entitlements).length}</strong><small>Owner learning access</small></article><article><span>Your certificates</span><strong>{Object.values(state.progress).filter((item) => item.certificateId).length}</strong><small>Owner completion records</small></article></section><section className="admin-section"><h2>Course release control</h2><div className="admin-course-list">{courses.map((course) => <article key={course.id}><div><span>{course.department}</span><h3>{course.title}</h3><p>{course.modules.length} interactive lessons, 25 question final, and 80 percent certificate threshold</p></div><div><b>{metrics.coursesByEnrollment[course.id] ?? 0} verified enrollments</b><a href={`/academy/learn/${course.id}`}>Open owner learner view</a></div></article>)}</div></section><section className="admin-section"><h2>Owner access path</h2><p>Use the approved owner email to sign in at <a href="/sign-in">/sign-in</a>, then open <a href="/admin">/admin</a>. The owner email is stored as a protected Vercel environment variable and is never exposed in public website code. The approved owner account receives private review access to every Academy course without changing paid learner access.</p></section></main>;
}
