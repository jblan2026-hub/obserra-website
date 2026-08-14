import "server-only";

import { getFloridaClassDIdentityVerificationStatus } from "./florida-class-d-identity-verification";

export type FloridaClassDStudentAccessDecision = {
  allowed: boolean;
  reason: "allowed" | "enrollment_required" | "identity_required" | "entitlement_required" | "regulated_service_unavailable";
};

export async function evaluateFloridaClassDStudentAccess(userId: string): Promise<FloridaClassDStudentAccessDecision> {
  try {
    const status = await getFloridaClassDIdentityVerificationStatus(userId);
    if (!status.enrollmentId) return { allowed: false, reason: "enrollment_required" };
    if (!status.instructorAttestationRecorded || status.identityStatus !== "verified") {
      return { allowed: false, reason: "identity_required" };
    }
    if (
      !status.instructionalAccessGranted ||
      !["enrolled", "in_progress", "instruction_complete", "exam_eligible"].includes(status.enrollmentStatus ?? "")
    ) {
      return { allowed: false, reason: "entitlement_required" };
    }
    return { allowed: true, reason: "allowed" };
  } catch {
    return { allowed: false, reason: "regulated_service_unavailable" };
  }
}
