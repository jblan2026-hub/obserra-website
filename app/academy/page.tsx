import type { Metadata } from "next";
import { publicAcademyCatalog } from "../../lib/academy-control";
import AcademyControlledClient from "./AcademyControlledClient";
import { courses as sourceCourses } from "./courseCatalog";
import { courseIsLiveForPurchase, courseOfferForCourse } from "./courseOffers";
import "../cinematic-media.css";
import "./academy-commercial.css";
import "./academy-world-class.css";
import "./academy-cinematic-campaigns.css";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Obserra Academy | Governed Cybersecurity, Intelligence, Protection and AI Course Roadmap",
  description: "Review the governed Obserra Academy course-development roadmap and the controlled production status of cybersecurity, executive protection, intelligence, AI governance, and technology training.",
  alternates: { canonical: "/academy" },
  keywords: ["cybersecurity training roadmap", "executive protection training", "AI governance training", "intelligence training", "CISO education"],
  openGraph: {
    title: "Obserra Academy | Governed Professional Training Roadmap",
    description: "Course products enter live enrollment only after content, assessment, accessibility, commerce, certificate, and owner-approval gates pass.",
    url: "https://www.obserrallc.com/academy",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Academy",
    description: "A governed professional-training development roadmap with controlled commercial release gates.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default async function AcademyPage() {
  const runtime = await publicAcademyCatalog(sourceCourses);
  const publicCourses = runtime.controlPlane === "operational" ? runtime.courses : [];
  const cinematicMediaEnabled = process.env.NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED === "true";
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Academy governed course roadmap",
        numberOfItems: publicCourses.length,
        itemListElement: publicCourses.map((course, index) => {
          const offer = courseOfferForCourse(course);
          const livePurchase = courseIsLiveForPurchase(course.id);
          return {
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
                price: offer.offerPrice,
                priceCurrency: "USD",
                availability: livePurchase ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              },
            },
          };
        }),
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
      <AcademyControlledClient
        courses={publicCourses}
        controlPlane={runtime.controlPlane}
        cinematicMediaEnabled={cinematicMediaEnabled}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
    </>
  );
}
