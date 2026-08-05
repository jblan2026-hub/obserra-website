import type { Metadata } from "next";
import AcademyClient from "./AcademyClient";
import { courses } from "./courseData";
import "./academy-commercial.css";

export const metadata: Metadata = {
  title: "Training Academy | Paid Professional Security, Intelligence & Technology Training",
  description: "Obserra Training Academy offers paid, interactive training in cybersecurity, protective operations, intelligence, and secure technology governance.",
  alternates: { canonical: "/academy" },
  keywords: ["cybersecurity training", "executive protection training", "intelligence training", "paid professional courses"],
  openGraph: {
    title: "Obserra Training Academy | Professional Security and Intelligence Training",
    description: "Paid, interactive, certificate-based training across cybersecurity, protection, intelligence, and technology.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Training Academy | Professional Training",
    description: "Interactive paid training with final assessment and Obserra Certificate of Training.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function AcademyPage() {
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Training Academy professional course catalog",
        numberOfItems: courses.length,
        itemListElement: courses.map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name: course.title,
            description: course.description,
            url: `https://www.obserrallc.com/academy/${course.id}`,
            provider: { "@type": "Organization", name: "Obserra Training Academy", url: "https://www.obserrallc.com/academy" },
            offers: { "@type": "Offer", price: course.price, priceCurrency: "USD", availability: "https://schema.org/InStock" },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Training Academy", item: "https://www.obserrallc.com/academy" },
        ],
      },
    ],
  };

  return (
    <>
      <AcademyClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }} />
    </>
  );
}
