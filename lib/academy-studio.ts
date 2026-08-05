import catalog from "../app/academy/generated/studio-catalog.json";

export type StudioModule = {
  id: string;
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
  outcomes: string[];
  modules: StudioModule[];
  price: number;
  currency: string;
  paymentLink: string | null;
  stripePriceId: string | null;
  license: {
    type: "named-learner";
    purchaseModel: "one-time-payment";
    accessPolicy: "until-completion";
    transferable: false;
    expiresAt: null;
  };
  completion: {
    allLessonsRequired: boolean;
    assessmentRequired: boolean;
    passingScore: number;
  };
  certificate: {
    issued: boolean;
    issuer: string;
    verificationMode: "certificate-id";
    recordRetention: "permanent";
  };
  version: string;
  releaseStatus: "approved" | "published";
  effectiveDate: string | null;
};

const records = (catalog.courses ?? []) as StudioCourseRecord[];

export function studioCourseForId(courseId: string) {
  return records.find((course) => course.id === courseId) ?? null;
}

export function studioCourses() {
  return records;
}

export function studioCourseIsApproved(courseId: string) {
  const course = studioCourseForId(courseId);
  return Boolean(course && ["approved", "published"].includes(course.releaseStatus));
}

export function studioLicenseMetadata(courseId: string) {
  const course = studioCourseForId(courseId);
  return course?.license ?? {
    type: "named-learner" as const,
    purchaseModel: "one-time-payment" as const,
    accessPolicy: "until-completion" as const,
    transferable: false as const,
    expiresAt: null,
  };
}

export function studioCertificateMetadata(courseId: string) {
  const course = studioCourseForId(courseId);
  return course?.certificate ?? {
    issued: true,
    issuer: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    verificationMode: "certificate-id" as const,
    recordRetention: "permanent" as const,
  };
}
