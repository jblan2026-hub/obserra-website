import type { Course } from "./courseData";

export type AcademyCommerceState = "sandbox-build" | "coming-soon" | "published";
export type AcademyContentState = "not-loaded" | "in-review" | "approved";

export type AcademyCourseOffer = {
  readonly courseId: string;
  readonly listPrice: number;
  readonly offerPrice: number;
  readonly savings: number;
  readonly offerLabel: string;
  readonly commerceState: AcademyCommerceState;
  readonly contentState: AcademyContentState;
  readonly livePurchaseEnabled: boolean;
  readonly statusLabel: string;
};

const CYBERSECURITY_FOUNDATIONS = "cybersecurity-foundations";

const governedOffers: Readonly<Record<string, AcademyCourseOffer>> = {
  [CYBERSECURITY_FOUNDATIONS]: {
    courseId: CYBERSECURITY_FOUNDATIONS,
    listPrice: 149,
    offerPrice: 99,
    savings: 50,
    offerLabel: "Launch offer",
    commerceState: "sandbox-build",
    contentState: "not-loaded",
    livePurchaseEnabled: false,
    statusLabel: "Course build and Sandbox validation in progress",
  },
};

export function courseOfferForId(courseId: string): AcademyCourseOffer | null {
  return governedOffers[courseId] ?? null;
}

export function courseOfferForCourse(course: Course): AcademyCourseOffer {
  return courseOfferForId(course.id) ?? {
    courseId: course.id,
    listPrice: course.price,
    offerPrice: course.price,
    savings: 0,
    offerLabel: "Planned price",
    commerceState: "coming-soon",
    contentState: "not-loaded",
    livePurchaseEnabled: false,
    statusLabel: "Coming soon - course content is not yet approved for sale",
  };
}

export function courseHasApprovedContent(courseId: string): boolean {
  return courseOfferForId(courseId)?.contentState === "approved";
}

export function courseIsLiveForPurchase(courseId: string): boolean {
  const offer = courseOfferForId(courseId);
  return Boolean(
    offer &&
    offer.commerceState === "published" &&
    offer.contentState === "approved" &&
    offer.livePurchaseEnabled,
  );
}

export const cybersecurityFoundationsOffer = governedOffers[CYBERSECURITY_FOUNDATIONS];
