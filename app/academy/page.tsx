import type { Metadata } from "next";
import Link from "next/link";
import { publicAcademyCatalog } from "../../lib/academy-control";
import AcademyControlledClient from "./AcademyControlledClient";
import AcademyCommerceNotice from "./AcademyCommerceNotice";
import { courses as sourceCourses } from "./courseCatalog";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import "./academy-commercial.css";
import "./academy-payment.css";
import "./academy-sales-status.css";
import "./academy-world-class.css";

export const revalidate = 10;

const courseListDescription = (description: string) => {
  const normalized = description.replace(/\s+/g, " ").trim();
  return normalized.length <= 60 ? normalized : `${normalized.slice(0, 57).trimEnd()}...`;
};

export const metadata: Metadata = {
  title: "Obserra Academy | Cybersecurity, AI Governance, Intelligence and Executive Training",
  description:
    "Build practical capability with Obserra Academy courses in cybersecurity, AI governance, intelligence, executive protection, incident leadership, and secure technology.",
  alternates: { canonical: "/academy" },
  keywords: [
    "cybersecurity training",
    "AI governance training",
    "CISO training",
    "executive cybersecurity training",
    "intelligence training",
    "executive protection training",
    "incident response leadership training",
    "secure technology training",
  ],
  openGraph: {
    title: "Obserra Academy | Professional Cybersecurity and AI Governance Training",
    description:
      "Practical professional learning with governed enrollment, applied scenarios, assessments, course-aware AI support, and completion records.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Academy professional learning" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Academy | Cybersecurity, AI Governance and Intelligence Training",
    description:
      "Professional learning for cybersecurity, intelligence, protection, AI governance, and executive technology leadership.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default async function AcademyPage({ searchParams }: { searchParams: Promise<{ enrollment?: string }> }) {
  const runtime = await publicAcademyCatalog(sourceCourses);
  const commerceState = await searchParams;
  const publicCourses = runtime.controlPlane === "operational" ? runtime.courses : [];
  const courseIsPurchasable = (courseId: string) => {
    const control = runtime.controls[courseId];
    return control?.lifecycle === "published" && control.purchaseEnabled === true;
  };
  const purchaseAvailability = Object.fromEntries(
    publicCourses.map((course) => [course.id, courseIsPurchasable(course.id)]),
  );
  const purchasableCourseCount = publicCourses.filter((course) => courseIsPurchasable(course.id)).length;
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.obserrallc.com/academy/#page",
        name: "Obserra Academy",
        url: "https://www.obserrallc.com/academy",
        description:
          "Professional cybersecurity, AI governance, intelligence, executive protection, incident leadership, and secure technology training.",
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
        about: { "@id": "https://www.obserrallc.com/#organization" },
      },
      {
        "@type": "ItemList",
        name: "Obserra Academy professional course catalog",
        numberOfItems: publicCourses.length,
        itemListElement: publicCourses.map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.obserrallc.com/academy/${course.id}`,
          item: {
            "@type": "Course",
            name: course.title,
            description: courseListDescription(course.description),
            url: `https://www.obserrallc.com/academy/${course.id}`,
            provider: {
              "@type": "Organization",
              name: LEGAL_ENTITY_NAME,
              alternateName: "Obserra Academy",
              url: "https://www.obserrallc.com",
            },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "USD",
              availability: courseIsPurchasable(course.id)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: `https://www.obserrallc.com/academy/${course.id}`,
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Obserra Academy", item: "https://www.obserrallc.com/academy" },
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Obserra Academy" />
      <div className="academy-premium-page">
        <AcademyCommerceNotice status={commerceState.enrollment} />
        <section className="academy-premium-hero">
          <div className="academy-premium-hero__grid">
            <div>
              <p className="academy-premium-hero__eyebrow">OBSERRA ACADEMY</p>
              <h1>Build capability for the decisions that carry consequence.</h1>
              <p className="academy-premium-hero__lead">
                Professional learning for cybersecurity, intelligence, executive protection, AI governance,
                incident leadership, and secure technology. Courses are designed around applied judgment,
                controlled access, measurable completion, and practical operating outcomes.
              </p>
              <div className="academy-premium-hero__actions">
                <Link href="#courses">Browse courses</Link>
                <Link href="/academy/enterprise">Train an enterprise team</Link>
                <Link href="/florida-security-training">Florida Class D training</Link>
              </div>
            </div>
            <div className="academy-premium-hero__proof" aria-label="Obserra Academy learning model">
              <div><strong>{publicCourses.length} reviewed courses</strong><span>Cybersecurity, protection, intelligence, AI, technology, and leadership topics.</span></div>
              <div><strong>{purchasableCourseCount} currently open for purchase</strong><span>New sales activate course by course only after the learner edition and commercial controls are approved.</span></div>
              <div><strong>Applied learning</strong><span>Scenarios, outcomes, assessments, source-backed content, and course-aware AI support where enabled.</span></div>
              <div><strong>Governed completion</strong><span>Completion records and access are bounded by course-specific requirements and entitlement controls.</span></div>
            </div>
          </div>
        </section>

        <AcademyControlledClient
          courses={publicCourses}
          purchaseAvailability={purchaseAvailability}
          controlPlane={runtime.controlPlane}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
        />
      </div>
      <EnterpriseFooter />
    </>
  );
}
