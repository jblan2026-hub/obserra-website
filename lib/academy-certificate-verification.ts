import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { academyStateFromUser, courseForId } from "./academy";

export type VerifiedCertificate = {
  valid: true;
  certificateId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  department: string;
  level: string;
  trainingHours: string;
  completedAt: string;
  assessmentScore: number;
};

export type CertificateVerificationResult =
  | VerifiedCertificate
  | { valid: false; certificateId: string; reason: "not-found" | "invalid-format" };

const certificatePattern = /^OBS-[A-Z0-9]{4,80}-[A-F0-9]{8}$/;

function normalizeCertificateId(value: string) {
  return value.trim().toUpperCase();
}

function learnerNameForUser(user: {
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return "Obserra Academy Learner";
  const [localPart] = email.split("@");
  return localPart || "Obserra Academy Learner";
}

export async function verifyAcademyCertificate(rawCertificateId: string): Promise<CertificateVerificationResult> {
  const certificateId = normalizeCertificateId(rawCertificateId);
  if (!certificatePattern.test(certificateId)) {
    return { valid: false, certificateId, reason: "invalid-format" };
  }

  const client = await clerkClient();
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;

  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    totalCount = page.totalCount;

    for (const user of page.data) {
      const state = academyStateFromUser(user);
      for (const [courseId, progress] of Object.entries(state.progress)) {
        if (progress.certificateId !== certificateId) continue;
        const course = courseForId(courseId);
        if (!course || !progress.completedAt || (progress.assessmentScore ?? 0) < 80) continue;

        return {
          valid: true,
          certificateId,
          learnerName: learnerNameForUser(user),
          courseId,
          courseTitle: course.title,
          department: course.department,
          level: course.level,
          trainingHours: course.duration,
          completedAt: progress.completedAt,
          assessmentScore: progress.assessmentScore ?? 0,
        };
      }
    }

    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);

  return { valid: false, certificateId, reason: "not-found" };
}
