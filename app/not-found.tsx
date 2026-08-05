import Link from "next/link";
import Image from "next/image";
import "./commercial-pages.css";

export default function NotFound() {
  return <main className="commercial-page"><div className="commercial-shell">
    <section className="commercial-hero"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={230} height={44} priority /><p className="commercial-eyebrow" style={{marginTop:32}}>PAGE NOT FOUND</p><h1>This path is no longer available.</h1><p>The page may have moved, been consolidated, or no longer be part of the current Obserra experience. Continue through a verified destination below.</p></section>
    <section className="commercial-grid">
      <article className="commercial-card"><span>Platform</span><h2>Obserra Applications</h2><p>Explore enterprise applications, EIOS, governance, risk, assurance, and intelligence solutions.</p><Link href="/apps">View applications →</Link></article>
      <article className="commercial-card"><span>Training</span><h2>Obserra Academy</h2><p>Browse paid professional courses with secure enrollment, saved progress, assessments, and certificates.</p><Link href="/academy">Browse Academy →</Link></article>
      <article className="commercial-card"><span>Engagement</span><h2>Contact Obserra</h2><p>Start a confidential conversation about advisory, protection, intelligence, applications, or training.</p><Link href="/contact">Contact Obserra →</Link></article>
    </section>
  </div></main>;
}
