import type { Metadata } from "next";
import AcademyClient from "./AcademyClient";
import { courses } from "./courseData";

export const metadata: Metadata = {
  title: "Academy | Paid Professional Security, Intelligence & Technology Training",
  description: "Obserra Academy offers paid, interactive training in cybersecurity, protective operations, intelligence, and secure technology governance.",
  alternates: { canonical: "/academy" },
};

export default function AcademyPage() {
  const catalogSchema = {
    "@context": "https://schema.org",
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
  };
  return <><AcademyClient /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }} /></>;
}
