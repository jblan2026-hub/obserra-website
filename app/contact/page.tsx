import type { Metadata } from "next";
import Image from "next/image";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact | Obserra Executive Protection & Intelligence LLC",
  description:
    "Contact OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC for enterprise cybersecurity advisory, executive protection, intelligence, EIOS product briefings, Academy licensing, and scoped implementation planning.",
  alternates: { canonical: "/contact" },
  keywords: ["contact obserra", "obserra consultation", "executive protection consulting", "cybersecurity advisory contact"],
  openGraph: {
    title: "Contact Obserra | Confidential Enterprise Consultation",
    description: "Start a confidential conversation on cybersecurity, protection, intelligence, EIOS, and professional training.",
    url: "https://www.obserrallc.com/contact",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Contact Obserra" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Obserra | Confidential Enterprise Consultation",
    description: "Engage Obserra for executive cybersecurity, protection, and intelligence advisory.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

const engagementTracks = [
  {
    title: "Executive Security Advisory",
    copy: "Cybersecurity leadership, enterprise risk, governance, and strategic advisory for executive and board stakeholders.",
    action: "mailto:info@obserrallc.com?subject=Executive%20Security%20Advisory%20Inquiry",
    cta: "Request advisory consultation",
  },
  {
    title: "EIOS Platform Briefing",
    copy: "Enterprise intelligence operating model walkthrough, adoption pathway, and implementation readiness review.",
    action: "mailto:info@obserrallc.com?subject=EIOS%20Enterprise%20Briefing%20Request",
    cta: "Book EIOS enterprise briefing",
  },
  {
    title: "Academy and Workforce Training",
    copy: "Paid course enrollment, enterprise cohort planning, and professional upskilling programs with completion verification.",
    action: "mailto:info@obserrallc.com?subject=Academy%20Enterprise%20Training%20Inquiry",
    cta: "Discuss training options",
  },
];

const growthLinks = [
  {
    label: "Publish tracked LinkedIn post",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dlinkedin%26utm_medium%3Dorganic_social%26utm_campaign%3Dlead_acceleration",
  },
  {
    label: "Publish tracked Facebook post",
    href: "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dfacebook%26utm_medium%3Dorganic_social%26utm_campaign%3Dlead_acceleration",
  },
  {
    label: "Publish tracked X post",
    href: "https://x.com/intent/post?text=Explore%20Obserra%20enterprise%20intelligence%2C%20cybersecurity%2C%20and%20professional%20training.&url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dx%26utm_medium%3Dorganic_social%26utm_campaign%3Dlead_acceleration",
  },
  {
    label: "Send tracked referral email",
    href: "mailto:?subject=Obserra%20Enterprise%20Intelligence&body=Explore%20Obserra%20enterprise%20intelligence%20and%20security%20solutions%3A%20https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Demail%26utm_medium%3Dreferral%26utm_campaign%3Dlead_acceleration",
  },
];

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact Obserra",
        url: "https://www.obserrallc.com/contact",
        mainEntity: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com",
          email: "info@obserrallc.com",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "info@obserrallc.com",
            availableLanguage: ["English"],
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.obserrallc.com/contact" }
        ]
      }
    ]
  };

  return (
    <main className="contact-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <header className="contact-nav">
        <a href="/" className="contact-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" width={286} height={55} />
          <span>CONTACT</span>
        </a>
        <nav aria-label="Contact navigation">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/eios">EIOS</a>
          <a href="/apps">Applications</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <section className="contact-hero">
        <p className="contact-eyebrow">OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC</p>
        <h1>Start an enterprise commercial conversation.</h1>
        <p>
          Engage Obserra for cybersecurity leadership, protective intelligence, executive protection advisory,
          enterprise risk guidance, AI governance, and productized intelligence solutions including EIOS with commercial delivery discipline.
        </p>
        <div className="contact-actions">
          <a className="contact-button" href="mailto:info@obserrallc.com?subject=Obserra%20Confidential%20Consultation">Request executive consultation</a>
          <a className="contact-outline" href="/services">Review enterprise services</a>
        </div>
      </section>

      <section className="contact-grid" aria-label="Contact pathways">
        {engagementTracks.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
            <a href={item.action}>{item.cta}</a>
          </article>
        ))}
      </section>

      <section className="contact-confidence">
        <div>
          <p className="contact-eyebrow">BUYER CONFIDENCE</p>
          <h2>Built for enterprise leaders who cannot afford unclear answers.</h2>
          <p>
            Obserra engagements are scoped, security-conscious, and outcome-oriented. We align executive context,
            risk posture, and practical execution without disrupting critical operating paths.
          </p>
        </div>
        <ul>
          <li>Veteran-owned organization</li>
          <li>Fortune 500 CISO leadership background</li>
          <li>Enterprise cybersecurity and risk advisory</li>
          <li>Protective intelligence and executive protection alignment</li>
          <li>Paid professional training through Obserra Academy</li>
        </ul>
      </section>

      <section className="contact-confidence">
        <div>
          <p className="contact-eyebrow">FREE ADVERTISING CONNECTION</p>
          <h2>Launch free tracked promotion that can generate leads and sales conversations.</h2>
          <p>
            Use these no-cost distribution links to publish trackable posts and referrals.
            Each link includes campaign attribution so your team can identify channel performance.
          </p>
        </div>
        <ul>
          {growthLinks.map((item) => (
            <li key={item.label}><a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>{item.label}</a></li>
          ))}
          <li><a href="mailto:info@obserrallc.com?subject=Free%20Lead%20Generation%20and%20Advertising%20Strategy%20Session">Book free lead-generation strategy session</a></li>
        </ul>
      </section>

      <footer className="contact-footer">
        <Image src="/brand/obserra-logo.png" alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" width={180} height={35} />
        <p>
          Copyright Obserra Executive Protection &amp; Intelligence LLC. All rights reserved. Proprietary material.
          No unauthorized reproduction, distribution, recording, or use.
        </p>
      </footer>
    </main>
  );
}
