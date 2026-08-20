import Link from "next/link";
import Image from "next/image";
import {
  ACADEMY_BRAND_NAME,
  EIOS_BRAND_NAME,
  LEGAL_ENTITY_NAME,
} from "@/lib/legal-identity";
import "./commercial-pages.css";

export default function NotFound() {
  return <main className="commercial-page"><div className="commercial-shell">
    <section className="commercial-hero"><Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={230} height={44} priority /><p className="commercial-eyebrow" style={{marginTop:32}}>PAGE NOT FOUND</p><h1>This path is no longer available.</h1><p>The page may have moved, been consolidated, or no longer be part of the current {LEGAL_ENTITY_NAME} experience. Continue through a verified destination below.</p></section>
    <section className="commercial-grid">
      <article className="commercial-card"><span>Platform</span><h2>{EIOS_BRAND_NAME}</h2><p>Explore enterprise intelligence, governance, risk, assurance, and executive decision support.</p><Link href="/eios">Explore EIOS →</Link></article>
      <article className="commercial-card"><span>Training</span><h2>{ACADEMY_BRAND_NAME}</h2><p>Review professional courses and the enrollment, learning, assessment, and completion controls applicable to each offering.</p><Link href="/academy">Explore Academy →</Link></article>
      <article className="commercial-card"><span>Engagement</span><h2>Contact {LEGAL_ENTITY_NAME}</h2><p>Start a confidential conversation about advisory, protection, intelligence, secure technology, or training.</p><Link href="/contact">Contact {LEGAL_ENTITY_NAME} →</Link></article>
    </section>
  </div></main>;
}
