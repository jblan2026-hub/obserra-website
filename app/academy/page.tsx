import type { Metadata } from "next";
import Link from "next/link";
import { publicAcademyCatalog } from "../../lib/academy-control";
import { academyLicensedSalesEnabled } from "../../lib/academy-licensing";
import AcademyControlledClient from "./AcademyControlledClient";
import AcademyCommerceNotice from "./AcademyCommerceNotice";
import { courses as sourceCourses } from "./courseCatalog";
import { ACADEMY_BRAND_NAME, LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./academy-commercial.css";
import "./academy-payment.css";
import "./academy-sales-status.css";
import "./academy-world-class.css";
import "./premium-academy.css";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Academy | Cybersecurity, Intelligence & AI Training",
  description: `Search and evaluate professional ${ACADEMY_BRAND_NAME} courses covering cybersecurity, executive protection, intelligence, artificial intelligence governance, and secure technology leadership.`,
  alternates: { canonical: "/academy" },
  keywords: ["cybersecurity training", "executive protection training", "artificial intelligence governance training", "intelligence training", "Chief Information Security Officer education"],
  openGraph: {
    title: `${ACADEMY_BRAND_NAME} | Professional Security and Executive Training`,
    description: "Secure, account-based professional training with assessments and Certificates of Course Completion.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: ACADEMY_BRAND_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: ACADEMY_BRAND_NAME,
    description: "Professional training with secure enrollment, assessments, and clearly bounded course-completion records.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default async function AcademyPage({ searchParams }: { searchParams: Promise<{ enrollment?: string }> }) {
  const runtime = await publicAcademyCatalog(sourceCourses);
  const commerceState = await searchParams;
  const licensedSalesEnabled = academyLicensedSalesEnabled();
  const publicCourses = runtime.controlPlane === "operational" ? runtime.courses : [];
  const courseIsPurchasable = (courseId: string) => {
    const control = runtime.controls[courseId];
    return licensedSalesEnabled && control?.lifecycle === "published" && control.purchaseEnabled === true;
  };
  const purchaseAvailability = Object.fromEntries(
    publicCourses.map((course) => [course.id, courseIsPurchasable(course.id)]),
  );
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${ACADEMY_BRAND_NAME} professional course catalog`,
        numberOfItems: publicCourses.length,
        itemListElement: publicCourses.map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name: course.title,
            description: course.description,
            url: `https://www.obserrallc.com/academy/${course.id}`,
            provider: {
              "@type": "Organization",
              name: LEGAL_ENTITY_NAME,
              alternateName: ACADEMY_BRAND_NAME,
              url: "https://www.obserrallc.com",
            },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "USD",
              availability: courseIsPurchasable(course.id)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: ACADEMY_BRAND_NAME, item: "https://www.obserrallc.com/academy" },
        ],
      },
    ],
  };

  return (
    <>
      <AcademyCommerceNotice status={commerceState.enrollment ?? (!licensedSalesEnabled ? "licensing-pending" : undefined)} />
      <section className="academy-commerce-notice" role="status">
        <strong>Florida Class D LMS platform is live</strong>
        <p>The regulated LMS can be reviewed now. Florida Class D enrollment and payment remain locked until licensing and production activation are complete.</p>
        <Link href="/florida-security-training">Open Florida Class D LMS</Link>
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
    </>
  );
}
