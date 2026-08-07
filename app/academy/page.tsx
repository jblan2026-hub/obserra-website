import type { Metadata } from "next";
import AcademyClient from "./AcademyClient";
import { courses } from "./courseCatalog";
import "./academy-commercial.css";
import "./academy-world-class.css";

export const metadata: Metadata = {
  title: "Obserra Academy | Cybersecurity, Intelligence, Protection and AI Training",
  description: "Search and enroll in professional Obserra Academy courses covering cybersecurity, executive protection, intelligence, AI governance, and secure technology leadership.",
  alternates: { canonical: "/academy" },
  keywords: ["cybersecurity training", "executive protection training", "AI governance training", "intelligence training", "CISO education"],
  openGraph: {
    title: "Obserra Academy | Professional Security and Executive Training",
    description: "Secure, account based professional training with assessments and Obserra Certificates of Training.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Academy" }],
  },
  twitter: { card: "summary_large_image", title: "Obserra Academy", description: "Professional training with secure enrollment, assessments, and completion certificates.", images: ["/brand/visuals/obserra-cybersecurity.png"] },
};

export default function AcademyPage() {
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Academy professional course catalog",
        numberOfItems: courses.length,
        itemListElement: courses.map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name: course.title,
            description: course.description,
            url: `https://www.obserrallc.com/academy/${course.id}`,
            provider: { "@type": "Organization", name: "Obserra Academy", url: "https://www.obserrallc.com/academy" },
            offers: { "@type": "Offer", price: course.price, priceCurrency: "USD", availability: "https://schema.org/InStock" },
          },
        })),
      },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" }, { "@type": "ListItem", position: 2, name: "Obserra Academy", item: "https://www.obserrallc.com/academy" }] },
    ],
  };

  return <><AcademyClient /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }} /></>;
}
