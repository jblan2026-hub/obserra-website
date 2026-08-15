import type { Metadata } from "next";
import { publicAcademyCatalog } from "../../lib/academy-control";
import AcademyControlledClient from "./AcademyControlledClient";
import AcademyCommerceNotice from "./AcademyCommerceNotice";
import { courses as sourceCourses } from "./courseCatalog";
import "./academy-commercial.css";
import "./academy-payment.css";
import "./academy-world-class.css";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Obserra Academy | Cybersecurity, Intelligence, Protection and Artificial Intelligence Training",
  description: "Search and evaluate professional Obserra Academy courses covering cybersecurity, executive protection, intelligence, artificial intelligence governance, and secure technology leadership.",
  alternates: { canonical: "/academy" },
  keywords: ["cybersecurity training", "executive protection training", "artificial intelligence governance training", "intelligence training", "Chief Information Security Officer education"],
  openGraph: {
    title: "Obserra Academy | Professional Security and Executive Training",
    description: "Secure, account based professional training with assessments and Obserra Certificates of Training.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Academy",
    description: "Professional training with secure enrollment, assessments, and completion certificates.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default async function AcademyPage({ searchParams }: { searchParams: Promise<{ enrollment?: string }> }) {
  const runtime = await publicAcademyCatalog(sourceCourses);
  const commerceState = await searchParams;
  const publicCourses = runtime.controlPlane === "operational" ? runtime.courses : [];
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Academy professional course catalog",
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
              name: "Obserra Academy",
              url: "https://www.obserrallc.com/academy",
            },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
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
      <AcademyCommerceNotice status={commerceState.enrollment} />
      <AcademyControlledClient courses={publicCourses} controlPlane={runtime.controlPlane} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
    </>
  );
}
