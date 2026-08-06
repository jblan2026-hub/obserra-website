import catalog from "../app/academy/generated/studio-catalog.json";

export type StudioModule = {
  id: string;
  sequence: number;
  title: string;
  duration: string;
  format: string;
  description: string;
};

export type StudioCourseRecord = {
  id: string;
  title: string;
  department: string;
  level: string;
  track: string;
  audience: string;
  description: string;
  duration: string;
  prerequisites: string[];
  outcomes: string[];
  modules: StudioModule[];
  moduleCount: number;
  tags: Record<string, string[]>;
  commerce: {
    model: "one-time-payment";
    price: number;
    currency: string;
    paymentLink: string | null;
    stripePriceId: string | null;
  };
  licensing: {
    entitlementType: "course-enrollment";
    entitlementCode: string;
    accessPolicy: "until-completion";
    recurring: false;
    seatScope: "named-learner";
    transferable: false;
    expiresAtCompletion: true;
    completionRecordRetained: true;
  };
  completion: {
    allLessonsRequired: boolean;
    assessmentRequired: boolean;
    passingScore: number;
    certificateIssued: boolean;
    credentialType: "certificate-of-course-completion-only";
    credentialDisclaimer: string;
  };
  certificate: {
    issuer: string;
    templateId: string;
    title: "Certificate of Course Completion";
    certificateIdPattern: string;
    verificationRequired: true;
    transcriptRetained: true;
    isProfessionalCertification: false;
    isComplianceEvidence: false;
  };
  branding: Record<string, unknown>;
  disclaimer: Record<string, unknown>;
  acknowledgementRequired: true;
  version: string;
  releaseStatus: "approved" | "published";
};

type StudioCatalog = {
  schemaVersion: "1.2";
  courses: StudioCourseRecord[];
};

const governedCatalog = catalog as StudioCatalog;
const records = governedCatalog.courses ?? [];

export function studioCourseForId(courseId: string) {
  return records.find((course) => course.id === courseId) ?? null;
}

export function studioCourses() {
  return [...records];
}

export function studioCourseIsApproved(courseId: string) {
  const course = studioCourseForId(courseId);
  return Boolean(course && (course.releaseStatus === "approved" || course.releaseStatus === "published"));
}

export function studioLicenseMetadata(courseId: string) {
  const course = studioCourseForId(courseId);
  return course?.licensing ?? {
    entitlementType: "course-enrollment" as const,
    entitlementCode: `ACADEMY_${courseId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`,
    accessPolicy: "until-completion" as const,
    recurring: false as const,
    seatScope: "named-learner" as const,
    transferable: false as const,
    expiresAtCompletion: true as const,
    completionRecordRetained: true as const,
  };
}

export function studioCertificateMetadata(courseId: string) {
  const course = studioCourseForId(courseId);
  return course?.certificate ?? {
    issuer: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    templateId: "obserra-academy-course-completion-v1",
    title: "Certificate of Course Completion" as const,
    certificateIdPattern: `OBS-${courseId.toUpperCase().replace(/[^A-Z0-9]+/g, "")}-{UNIQUE}`,
    verificationRequired: true as const,
    transcriptRetained: true as const,
    isProfessionalCertification: false as const,
    isComplianceEvidence: false as const,
  };
}

export function safeStudioPaymentLink(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "buy.stripe.com") return null;
    return url;
  } catch {
    return null;
  }
}
