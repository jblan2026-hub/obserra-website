export type FloridaClassDRecordRole =
  | "student"
  | "instructor"
  | "school_admin"
  | "compliance_admin"
  | "system";

export type FloridaClassDEnrollmentStatus =
  | "pending_identity"
  | "pending_entitlement"
  | "enrolled"
  | "in_progress"
  | "instruction_complete"
  | "exam_eligible"
  | "completed"
  | "failed"
  | "withdrawn";

export type FloridaClassDAttendanceStatus = "present" | "partial" | "absent" | "makeup_required" | "made_up";
export type FloridaClassDModuleStatus = "locked" | "available" | "in_progress" | "remediation_required" | "complete";
export type FloridaClassDIdentityStatus = "unverified" | "pending" | "verified" | "rejected";
export type FloridaClassDLiveSessionStatus = "scheduled" | "live" | "break" | "ended" | "cancelled";
export type FloridaClassDLiveSegmentType = "instruction" | "break";
export type FloridaClassDInteractionType =
  | "student_question"
  | "instructor_answer"
  | "instructor_prompt"
  | "student_response"
  | "hand_raise"
  | "poll_response";

export type FloridaClassDStudentIdentity = {
  studentId: string;
  clerkUserId: string;
  legalName: string;
  dateOfBirth: string;
  identityStatus: FloridaClassDIdentityStatus;
  verifiedAt?: string;
  verifiedBy?: string;
};

export type FloridaClassDEnrollment = {
  enrollmentId: string;
  studentId: string;
  courseId: "florida-class-d-40-hour";
  cohortId: string;
  status: FloridaClassDEnrollmentStatus;
  enrolledAt: string;
  entitlementId?: string;
};

export type FloridaClassDCohort = {
  cohortId: string;
  startDate: string;
  endDate: string;
  instructorIds: string[];
  capacity: number;
  status: "draft" | "scheduled" | "active" | "closed" | "cancelled";
};

export type FloridaClassDAttendanceEntry = {
  attendanceId: string;
  enrollmentId: string;
  day: 1 | 2 | 3 | 4 | 5;
  status: FloridaClassDAttendanceStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  instructionalMinutesCredited: number;
  attestedByInstructorId?: string;
};

export type FloridaClassDInstructionTimeEntry = {
  timeEntryId: string;
  enrollmentId: string;
  moduleId: number;
  startedAt: string;
  endedAt: string;
  creditedMinutes: number;
  source: "lms_session" | "instructor_attested_makeup";
};

export type FloridaClassDLiveSession = {
  liveSessionId: string;
  cohortId: string;
  day: 1 | 2 | 3 | 4 | 5;
  lessonId: string;
  instructorClerkUserId: string;
  instructorLicenseNumber: string;
  status: FloridaClassDLiveSessionStatus;
  segmentType: FloridaClassDLiveSegmentType;
  startedAt?: string;
  endedAt?: string;
};

export type FloridaClassDDeviceLease = {
  leaseId: string;
  enrollmentId: string;
  liveSessionId: string;
  clerkSessionId: string;
  browserInstanceId: string;
  acquiredAt: string;
  lastHeartbeatAt: string;
  releasedAt?: string;
};

export type FloridaClassDPresenceChallenge = {
  challengeId: string;
  liveSessionId: string;
  enrollmentId: string;
  challengeType: "presence_code" | "lesson_check" | "instructor_prompt";
  issuedAt: string;
  expiresAt: string;
  retryExpiresAt?: string;
  status: "pending" | "passed" | "retry_required" | "failed";
  attemptCount: number;
};

export type FloridaClassDLiveTimeTotal = {
  enrollmentId: string;
  day: 1 | 2 | 3 | 4 | 5;
  connectedSeconds: number;
  instructionalPresenceSeconds: number;
  breakPresenceSeconds: number;
  absentSeconds: number;
  lastHeartbeatAt?: string;
};

export type FloridaClassDLiveInteraction = {
  interactionId: string;
  liveSessionId: string;
  enrollmentId?: string;
  actorRole: "student" | "instructor";
  actorClerkUserId: string;
  interactionType: FloridaClassDInteractionType;
  content?: string;
  parentInteractionId?: string;
  createdAt: string;
};

export type FloridaClassDModuleProgress = {
  progressId: string;
  enrollmentId: string;
  moduleId: number;
  status: FloridaClassDModuleStatus;
  instructionalMinutesCredited: number;
  learningCheckPassed: boolean;
  completedAt?: string;
};

export type FloridaClassDLearningCheckResult = {
  resultId: string;
  enrollmentId: string;
  moduleId: number;
  attempt: number;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
};

export type FloridaClassDRemediationRecord = {
  remediationId: string;
  enrollmentId: string;
  moduleId: number;
  reason: string;
  assignedAt: string;
  completedAt?: string;
  approvedByInstructorId?: string;
};

export type FloridaClassDAuditEvent = {
  eventId: string;
  occurredAt: string;
  actorRole: FloridaClassDRecordRole;
  actorId: string;
  enrollmentId?: string;
  entityType:
    | "identity"
    | "enrollment"
    | "cohort"
    | "attendance"
    | "instruction_time"
    | "live_session"
    | "device_lease"
    | "presence"
    | "presence_challenge"
    | "live_interaction"
    | "module_progress"
    | "learning_check"
    | "remediation"
    | "exam"
    | "completion"
    | "lias";
  entityId: string;
  action: string;
  correlationId: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
};

export const FLORIDA_CLASS_D_RECORD_CONTROLS = {
  appendOnlyAuditEvents: true,
  minimumInstructionalMinutes: 2400,
  requiredInstructionalDays: 5,
  requiredModules: 18,
  liveLessonsPerDay: 4,
  instructionalMinutesPerLiveLesson: 120,
  scheduledBreakMinutes: 15,
  breakMinutesAreTrackedButNotCredited: true,
  presenceHeartbeatSeconds: 60,
  presenceChallengeIntervalMinutes: 110,
  presenceChallengeRetryMinutes: 5,
  singleActiveDevicePerEnrollment: true,
  dailyAttendanceRequiresInstructorVerification: true,
  examRequiresInstructionComplete: true,
  paymentRequiresRegulatoryLaunchGate: true,
  completionRequiresInstructorReview: true,
  liasSubmissionIsAdministrativeAction: true,
  studentMayNotModifyAttendanceCredit: true,
  studentMayNotModifyInstructionTimeCredit: true,
  studentMayNotModifyExamEligibility: true,
} as const;

export const FLORIDA_CLASS_D_ADMIN_PERMISSIONS = {
  student: [
    "read_own_progress",
    "join_live_class",
    "respond_presence_challenge",
    "ask_live_question",
    "submit_live_response",
    "submit_learning_check",
  ],
  instructor: [
    "read_assigned_cohort",
    "operate_live_class",
    "view_live_presence",
    "issue_presence_challenge",
    "answer_student_questions",
    "launch_live_poll",
    "attest_attendance",
    "approve_makeup",
    "approve_remediation",
  ],
  school_admin: ["manage_cohorts", "manage_enrollments", "review_completion", "prepare_lias_queue"],
  compliance_admin: ["read_all_records", "export_inspection_record", "review_audit_history", "manage_record_holds"],
  system: ["append_audit_event", "calculate_progress", "enforce_sequential_access", "track_live_presence", "enforce_single_device"],
} as const;

export function isExamEligible(input: {
  identityStatus: FloridaClassDIdentityStatus;
  creditedInstructionalMinutes: number;
  completedModuleIds: number[];
  openRemediationModuleIds: number[];
}): boolean {
  const uniqueCompleted = new Set(input.completedModuleIds);
  return (
    input.identityStatus === "verified" &&
    input.creditedInstructionalMinutes >= FLORIDA_CLASS_D_RECORD_CONTROLS.minimumInstructionalMinutes &&
    uniqueCompleted.size === FLORIDA_CLASS_D_RECORD_CONTROLS.requiredModules &&
    input.openRemediationModuleIds.length === 0
  );
}
