import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { courses as academyCourses } from "../academy/courseCatalog";
import { academyStateFromUser } from "../../lib/academy";
import { learnWorldsProductForCourse } from "../../lib/learnworlds";
import "./portal.css";

export const metadata: Metadata = {
  title: "Customer Dashboard | Obserra",
  description: "Access your protected Obserra customer workspace for Academy, applications, licenses, reports, billing, certificates, support, and account security.",
  alternates: { canonical: "/portal" },
  robots: { index: false, follow: false },
};

const dashboardModules = [
  { eyebrow: "ACADEMY", title: "Learning workspace", copy: "Review your Academy course shells, resume entitled learning, and track which programs are available or still in production.", href: "/portal#academy-shells", action: "View course shells", state: "Available" },
  { eyebrow: "APPLICATIONS", title: "Obserra applications", copy: "Review secure enterprise applications and request deployment, licensing, or technical evaluation support.", href: "/apps", action: "View applications", state: "Available" },
  { eyebrow: "CERTIFICATES", title: "Completion records", copy: "Request certificate assistance, verification support, or corrections to approved completion records.", href: "/contact?interest=certificate-support", action: "Certificate support", state: "Support-enabled" },
  { eyebrow: "LICENSING", title: "Enterprise licensing", copy: "Coordinate renewals, procurement, user allocation, team training, and application deployment planning.", href: "/contact?interest=enterprise-licensing", action: "Contact licensing", state: "Request-based" },
  { eyebrow: "BILLING", title: "Orders and invoicing", copy: "Request receipts, invoice support, payment clarification, enrollment assistance, or procurement documentation.", href: "/contact?interest=billing-support", action: "Billing support", state: "Request-based" },
  { eyebrow: "REPORTS", title: "Executive deliverables", copy: "Request approved reports, advisory deliverables, board materials, engagement documents, and secure distribution support.", href: "/contact?interest=customer-reports", action: "Request reports", state: "Controlled release" },
  { eyebrow: "SUPPORT", title: "Customer support", copy: "Open a confidential support pathway for Academy, applications, advisory, protection, billing, or active engagements.", href: "/contact?interest=customer-support", action: "Open support", state: "Available" },
  { eyebrow: "SECURITY", title: "Account and session controls", copy: "Manage your verified identity, passwordless methods, multifactor authentication, profile, and active sessions.", href: "/portal#account-security", action: "Manage account", state: "Available" },
];

const roadmap = [
  ["Organization administration", "Planned", "Tenant-aware roles, members, and delegated administration will activate after organizational authorization controls are validated."],
  ["License inventory", "Planned", "Assigned products, seats, renewal dates, and entitlements require a production licensing system of record."],
  ["Order history", "Planned", "Verified transaction history will activate after Stripe customer reconciliation and account ownership controls are complete."],
  ["Downloads center", "Planned", "Secure files will activate with expiring links, authorization checks, malware controls, and download audit records."],
  ["Support case tracking", "Planned", "Case status and correspondence require a connected support platform and customer-scoped authorization."],
  ["API credentials", "Future", "Scoped API credentials will be introduced only with rotation, revocation, least privilege, logging, and tenant isolation."],
];

const departmentOrder = ["Cyber", "Technologies", "Protection", "Intelligence"] as const;
const departmentLabels = {
  Cyber: "Cybersecurity and executive risk",
  Technologies: "AI, data, software, and technology",
  Protection: "Executive protection and safety",
  Intelligence: "Intelligence and leadership",
} as const;

function learnerShellState(courseId: string, enrolledCourseIds: Set<string>) {
  if (enrolledCourseIds.has(courseId)) {
    return {
      label: "Enrolled",
      tone: "enrolled",
      href: `/academy/learn/${courseId}`,
      action: "Open course",
      note: "Your learner entitlement is active.",
    } as const;
  }

  const product = learnWorldsProductForCourse(courseId);
  if (product?.status === "published") {
    return {
      label: "Available",
      tone: "available",
      href: `/academy/${courseId}`,
      action: "View course",
      note: "Course publication and enrollment are active.",
    } as const;
  }
  if (product?.status === "sandbox") {
    return {
      label: "Pilot shell",
      tone: "pilot",
      href: null,
      action: null,
      note: "The course shell is visible while media and learner testing are completed.",
    } as const;
  }
  return {
    label: "In production",
    tone: "production",
    href: null,
    action: null,
    note: "The governed course shell is ready while lessons, media, assessment, and release evidence are finalized.",
  } as const;
}

export default async function PortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const user = await currentUser();
  const displayName = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Customer";
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || "Verified Obserra account";
  const academyState = academyStateFromUser({ privateMetadata: user?.privateMetadata ?? {} });
  const enrolledCourseIds = new Set(Object.keys(academyState.entitlements));
  const mappedShellCount = academyCourses.filter((course) => learnWorldsProductForCourse(course.id)).length;

  return (
    <main className="portal-page">
      <header className="portal-nav">
        <Link href="/" className="portal-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>CUSTOMER DASHBOARD</span>
        </Link>
        <nav aria-label="Portal navigation">
          <Link href="#academy-shells">My courses</Link><Link href="/academy">Academy</Link><Link href="/apps">Applications</Link><Link href="/trust">Trust</Link><Link href="/contact">Contact</Link>
          <Link className="portal-cta" href="/contact?interest=customer-support">Get support</Link>
          <div className="portal-account-bar" aria-label="Account menu"><UserButton /></div>
        </nav>
      </header>

      <section className="portal-command" aria-labelledby="dashboard-title">
        <div className="portal-command-copy">
          <p className="portal-eyebrow">AUTHENTICATED CUSTOMER WORKSPACE</p>
          <h1 id="dashboard-title">Welcome, {displayName}.</h1>
          <p>Your Obserra identity is verified. This dashboard centralizes active customer pathways and shows which account capabilities are available, request-based, controlled, or still pending production data integration.</p>
          <div className="portal-actions"><Link className="portal-button" href="#academy-shells">View course shells</Link><Link className="portal-outline" href="/contact?interest=customer-support">Open customer support</Link></div>
        </div>
        <aside className="portal-profile" aria-label="Authenticated account summary">
          <div className="portal-profile-head"><div><span>VERIFIED ACCOUNT</span><strong>{displayName}</strong><p>{primaryEmail}</p></div><UserButton /></div>
          <dl><div><dt>Identity</dt><dd>Active</dd></div><div><dt>Portal access</dt><dd>Protected</dd></div><div><dt>Account data</dt><dd>Controlled release</dd></div></dl>
        </aside>
      </section>

      <section className="portal-kpis" aria-label="Customer dashboard status">
        <article><span>IDENTITY STATUS</span><strong>Verified</strong><p>Clerk-authenticated session</p></article>
        <article><span>COURSE SHELLS</span><strong>{academyCourses.length}</strong><p>Visible Academy programs</p></article>
        <article><span>MY ENROLLMENTS</span><strong>{enrolledCourseIds.size}</strong><p>Verified learner entitlements</p></article>
        <article><span>LEARNWORLDS MAPPINGS</span><strong>{mappedShellCount}</strong><p>Governed commercial mappings</p></article>
      </section>

      <section className="portal-section portal-learning-shells" id="academy-shells" aria-labelledby="academy-shells-title">
        <div className="portal-section-heading">
          <div><p className="portal-eyebrow">MY ACADEMY</p><h2 id="academy-shells-title">Your course dashboard now includes every governed Academy shell.</h2></div>
          <p>Course shells are visible before final video and production release so learners can see the planned catalog. A shell does not grant enrollment, unlock protected lessons, or authorize purchase. Only verified entitlements and published courses activate learner actions.</p>
        </div>
        <div className="portal-shell-legend" aria-label="Course shell status legend">
          <span className="portal-shell-badge enrolled">Enrolled</span>
          <span className="portal-shell-badge available">Available</span>
          <span className="portal-shell-badge pilot">Pilot shell</span>
          <span className="portal-shell-badge production">In production</span>
        </div>
        {departmentOrder.map((department) => {
          const departmentCourses = academyCourses.filter((course) => course.department === department);
          if (!departmentCourses.length) return null;
          return (
            <section className="portal-shell-group" key={department} aria-labelledby={`shell-group-${department.toLowerCase()}`}>
              <div className="portal-shell-group-heading">
                <div><p className="portal-eyebrow">{department.toUpperCase()}</p><h3 id={`shell-group-${department.toLowerCase()}`}>{departmentLabels[department]}</h3></div>
                <span>{departmentCourses.length} course{departmentCourses.length === 1 ? "" : "s"}</span>
              </div>
              <div className="portal-course-shell-grid">
                {departmentCourses.map((course) => {
                  const shell = learnerShellState(course.id, enrolledCourseIds);
                  return (
                    <article className="portal-course-shell" key={course.id}>
                      <div className="portal-course-shell-top">
                        <span className={`portal-shell-badge ${shell.tone}`}>{shell.label}</span>
                        <small>{course.level}</small>
                      </div>
                      <p className="portal-course-track">{course.track}</p>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      <dl>
                        <div><dt>Duration</dt><dd>{course.duration}</dd></div>
                        <div><dt>Modules</dt><dd>{course.modules.length}</dd></div>
                      </dl>
                      <p className="portal-course-shell-note">{shell.note}</p>
                      {shell.href && shell.action ? <Link href={shell.href}>{shell.action} →</Link> : <span className="portal-shell-disabled" aria-disabled="true">Learner access opens after release</span>}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <section className="portal-workspace" aria-labelledby="workspace-title">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">CUSTOMER WORKSPACE</p><h2 id="workspace-title">Access the services connected to your Obserra relationship.</h2></div><p>Module status reflects current production readiness. Request-based modules connect you to the responsible Obserra team without presenting invented balances, licenses, transactions, cases, or records.</p></div>
        <div className="portal-grid">
          {dashboardModules.map((module) => <article className="portal-card" key={module.title}><div className="portal-card-top"><small>{module.eyebrow}</small><span>{module.state}</span></div><h3>{module.title}</h3><p>{module.copy}</p><Link href={module.href}>{module.action} →</Link></article>)}
        </div>
      </section>

      <section className="portal-section" id="account-security">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">ACCOUNT SECURITY</p><h2>Manage identity and session controls through your secure account menu.</h2></div><p>Your Clerk account menu supports profile management, authentication methods, multifactor configuration where enabled, and active session controls.</p></div>
        <div className="portal-security">
          <div><h3>Active protections</h3><ul><li>Server-side identity verification</li><li>Protected portal middleware</li><li>Secure session management</li><li>Account-level sign-out</li><li>Canonical host enforcement</li><li>Preview indexing restrictions</li></ul></div>
          <div><h3>Manage your account</h3><p>Open the account control to review your profile, authentication factors, connected methods, and active sessions.</p><div className="portal-account-control"><UserButton showName /></div></div>
        </div>
      </section>

      <section className="portal-section portal-roadmap-section">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">CONTROLLED CAPABILITY ROADMAP</p><h2>Customer data modules will activate only when their systems of record and controls are ready.</h2></div><p>This preserves accuracy, tenant isolation, privacy, auditability, and least-privilege access as the portal expands.</p></div>
        <div className="portal-roadmap">{roadmap.map(([title,state,copy]) => <article key={title}><div><span>{state}</span><h3>{title}</h3></div><p>{copy}</p></article>)}</div>
      </section>

      <section className="portal-section"><div className="portal-support"><div><p className="portal-eyebrow">CUSTOMER ASSISTANCE</p><h2>Reach the correct Obserra team through one confidential request.</h2><p>Use customer support for enrollment, certificates, billing, licensing, reports, application access, active engagements, or account assistance.</p></div><div className="portal-actions"><Link className="portal-button" href="/contact?interest=customer-support">Open support request</Link><a className="portal-outline" href="mailto:info@obserrallc.com">Email support</a></div></div></section>

      <footer className="portal-footer"><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><nav><Link href="/trust">Trust Center</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></nav></footer>
    </main>
  );
}
