import type { Metadata } from "next";
import Link from "next/link";
import { verifyAcademyCertificate } from "../../../lib/academy-certificate-verification";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify Certificate | Obserra Academy",
  description: "Verify an Obserra Academy course completion certificate using its credential ID.",
  alternates: { canonical: "/academy/verify" },
};

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ certificateId?: string }>;
}) {
  const { certificateId = "" } = await searchParams;
  const normalized = certificateId.trim().toUpperCase();
  const result = normalized ? await verifyAcademyCertificate(normalized) : null;

  return (
    <main style={{ minHeight: "100vh", background: "#06111f", color: "#f7f4eb", padding: "72px 20px" }}>
      <section style={{ width: "min(920px, 100%)", margin: "0 auto" }}>
        <p style={{ color: "#c7a75d", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
          Obserra Academy Credential Services
        </p>
        <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)", lineHeight: 1.05, margin: "12px 0 18px" }}>
          Verify a certificate
        </h1>
        <p style={{ maxWidth: 720, color: "#b7c3d1", fontSize: "1.08rem", lineHeight: 1.7 }}>
          Enter the credential ID printed on an Obserra Academy certificate. Verification confirms the learner,
          course, completion date, training duration, and final assessment result recorded by Obserra Academy.
        </p>

        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "32px 0" }}>
          <label htmlFor="certificateId" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
            Certificate ID
          </label>
          <input
            id="certificateId"
            name="certificateId"
            defaultValue={normalized}
            placeholder="OBS-COURSEID-XXXXXXXX"
            autoComplete="off"
            required
            style={{
              flex: "1 1 420px",
              minHeight: 54,
              borderRadius: 10,
              border: "1px solid #38506a",
              background: "#0a1a2c",
              color: "#ffffff",
              padding: "0 16px",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              minHeight: 54,
              borderRadius: 10,
              border: "1px solid #d8bc72",
              background: "#c7a75d",
              color: "#07111d",
              padding: "0 24px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Verify credential
          </button>
        </form>

        {result?.valid ? (
          <article style={{ border: "1px solid #3b7c68", borderRadius: 16, background: "#0b211f", padding: 28 }}>
            <p style={{ color: "#72d7b5", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Verified credential
            </p>
            <h2 style={{ fontSize: "2rem", margin: "8px 0 22px" }}>{result.courseTitle}</h2>
            <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              <div><dt style={{ color: "#8fa5b9" }}>Learner</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.learnerName}</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Credential ID</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.certificateId}</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Level</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.level}</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Department</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.department}</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Training duration</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.trainingHours}</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Assessment score</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{result.assessmentScore}%</dd></div>
              <div><dt style={{ color: "#8fa5b9" }}>Completed</dt><dd style={{ margin: "6px 0 0", fontWeight: 700 }}>{new Date(result.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</dd></div>
            </dl>
          </article>
        ) : result ? (
          <article style={{ border: "1px solid #8a4b4b", borderRadius: 16, background: "#261418", padding: 28 }}>
            <p style={{ color: "#ff9b9b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Credential not verified
            </p>
            <p style={{ color: "#d9c7ca", lineHeight: 1.7 }}>
              The credential ID is invalid or does not match a completed Obserra Academy record. Check the ID and try again.
            </p>
          </article>
        ) : null}

        <p style={{ marginTop: 32 }}>
          <Link href="/academy" style={{ color: "#d8bc72" }}>Return to Obserra Academy</Link>
        </p>
      </section>
    </main>
  );
}
