import "server-only";

export const FLORIDA_CLASS_D_LIVE_POLICY = {
  policyVersion: "2026-08-13-live-v1",
  physicalInstructionLocationState: "FL",
  tlsRequired: true,
  singleDeviceRequired: true,
  dailyInstructorAttendanceVerificationRequired: true,
  challengeIntervalMinutes: 110,
  challengeRetryMinutes: 5,
  heartbeatSeconds: 60,
  stalePresenceSeconds: 150,
  breakMinutes: 15,
  breaksCountTowardInstruction: false,
  liveLessonsPerDay: 4,
  instructionalMinutesPerLesson: 120,
  instructionalMinutesPerDay: 480,
  trackedBreakMinutesPerDay: 45,
  requiredInstructionalMinutes: 2400,
  minimumScreenSecondsPer50Words: 60,
  studentQuestionsEnabled: true,
  instructorAnswersEnabled: true,
  handRaiseEnabled: true,
  pollsEnabled: true,
  interactionRetentionRequired: true,
} as const;

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDLiveInstructionEnabled() {
  return (
    enabled(process.env.OBSERRA_FDACS_CLASS_D_LIVE_ENABLED) &&
    process.env.OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active" &&
    Boolean(process.env.OBSERRA_FDACS_DS_LICENSE_NUMBER?.trim()) &&
    Boolean(process.env.OBSERRA_FDACS_DI_LICENSE_NUMBER?.trim())
  );
}

export function getFloridaClassDInstructorLicenseNumber() {
  return process.env.OBSERRA_FDACS_DI_LICENSE_NUMBER?.trim() || null;
}

export function getFloridaClassDSchoolLicenseNumber() {
  return process.env.OBSERRA_FDACS_DS_LICENSE_NUMBER?.trim() || null;
}

export function minimumScreenSeconds(wordCount: number) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  return Math.ceil((wordCount / 50) * FLORIDA_CLASS_D_LIVE_POLICY.minimumScreenSecondsPer50Words);
}
