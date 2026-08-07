import { auth, clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { courses } from "../../courseData";
import { ownerEmailAllowed } from "../../../../lib/academy";

export const dynamic = "force-dynamic";

async function authorizeOwnerReview() {
  if (process.env.VERCEL_ENV === "preview") {
    return { mode: "Vercel protected owner preview" } as const;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/academy/admin/review")}`);
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((item) => item.emailAddress);
  if (!ownerEmailAllowed(emails)) {
    redirect("/academy?admin=unauthorized");
  }

  return { mode: "Authenticated owner account" } as const;
}

export default async function AcademyOwnerReviewPage() {
  const access = await authorizeOwnerReview();

  const counts = courses.reduce<Record<string, number>>((result, course) => {
    result[course.level] = (result[course.level] ?? 0) + 1;
    return result;
  }, {});

  return (
    <main style={{ minHeight: "100vh", background: "#04111d", color: "#eef8ff", padding: "32px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <header style={{ display: "flex", gap: 24, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 28 }}>
          <div>
            <p style={{ color: "#f4c66a", fontWeight: 800, letterSpacing: ".12em", fontSize: 12, margin: 0 }}>OBSERRA ACADEMY OWNER REVIEW</p>
            <h1 style={{ fontSize: 38, margin: "8px 0 10px" }}>Review all 60 courses before commercial release.</h1>
            <p style={{ maxWidth: 900, color: "#bcd8e8", lineHeight: 1.7, margin: 0 }}>
              This owner workspace is isolated from customer records. The protected preview lets you inspect every lesson, the full final assessment, the sales page, and a certificate sample without creating a purchase, learner progress record, or issued certificate.
            </p>
            <p style={{ color: "#8fcde7", fontSize: 12, marginTop: 10 }}>Access mode: {access.mode}</p>
          </div>
          <Link href="/academy" style={{ color: "#92ddff", fontWeight: 800 }}>Return to Academy</Link>
        </header>

        <section style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 26 }}>
          <span style={pillStyle}>{courses.length} courses</span>
          {Object.entries(counts).map(([level, count]) => <span key={level} style={pillStyle}>{level}: {count}</span>)}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {courses.map((course, index) => (
            <article key={course.id} style={{ border: "1px solid rgba(111, 200, 231, .28)", borderRadius: 14, padding: 20, background: "#072238" }}>
              <p style={{ margin: 0, color: "#8fcde7", fontSize: 11, fontWeight: 800, letterSpacing: ".07em" }}>{String(index + 1).padStart(2, "0")} · {course.department} · {course.level}</p>
              <h2 style={{ fontSize: 20, lineHeight: 1.3, margin: "10px 0 8px" }}>{course.title}</h2>
              <p style={{ color: "#bfdceb", lineHeight: 1.6, fontSize: 14 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
                <span style={miniPillStyle}>{course.duration}</span>
                <span style={miniPillStyle}>{course.modules.length} lessons</span>
                <span style={miniPillStyle}>${course.price}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/academy/admin/review/${course.id}`} style={primaryLinkStyle}>Review course</Link>
                <Link href={`/academy/admin/review/${course.id}/certificate`} style={secondaryLinkStyle}>Review certificate</Link>
                <Link href={`/academy/${course.id}`} style={secondaryLinkStyle}>View sales page</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

const pillStyle = {
  border: "1px solid rgba(244, 198, 106, .4)",
  borderRadius: 999,
  padding: "8px 11px",
  color: "#f6d58e",
  background: "#0a2940",
  fontSize: 12,
  fontWeight: 800,
} as const;

const miniPillStyle = {
  border: "1px solid rgba(111, 200, 231, .3)",
  borderRadius: 999,
  padding: "6px 9px",
  color: "#cfe9f5",
  background: "#061a2b",
  fontSize: 11,
  fontWeight: 700,
} as const;

const primaryLinkStyle = {
  display: "inline-flex",
  borderRadius: 9,
  padding: "10px 13px",
  background: "#f4c66a",
  color: "#071522",
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none",
} as const;

const secondaryLinkStyle = {
  display: "inline-flex",
  border: "1px solid rgba(111, 200, 231, .45)",
  borderRadius: 9,
  padding: "10px 13px",
  color: "#cfeaf6",
  fontSize: 12,
  fontWeight: 800,
  textDecoration: "none",
} as const;
