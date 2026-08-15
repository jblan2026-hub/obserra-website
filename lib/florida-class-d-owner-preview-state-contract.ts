const COUNT_TABLES = {
  cohorts: "fdacs_class_d_cohorts",
  studentIdentities: "fdacs_class_d_student_identities",
  enrollments: "fdacs_class_d_enrollments",
  liveSessions: "fdacs_class_d_live_sessions",
  attendanceEntries: "fdacs_class_d_attendance_entries",
  presenceChallenges: "fdacs_class_d_presence_challenges",
  examAttempts: "fdacs_class_d_exam_attempts",
  completionRecords: "fdacs_class_d_completion_records",
  completionDocuments: "fdacs_class_d_completion_documents",
  liasReportingQueue: "fdacs_class_d_lias_reporting_queue",
} as const;

export type FloridaClassDOwnerPreviewCountKey = keyof typeof COUNT_TABLES;

export type FloridaClassDOwnerPreviewState = {
  source: "fdacs_supabase_read_only";
  status: "ready" | "unavailable";
  observedAt: string;
  counts: Record<FloridaClassDOwnerPreviewCountKey, number | null>;
  blockingReason: string | null;
  regulatedWritesAuthorized: false;
  productionRuntimeAuthorized: false;
  trainingCreditEligible: false;
  completionAuthorized: false;
  certificateAuthorized: false;
  liasAuthorized: false;
};

export type FloridaClassDOwnerPreviewCountRequest = (
  table: string,
  init: RequestInit,
) => Promise<Response>;

function unavailableCounts(): FloridaClassDOwnerPreviewState["counts"] {
  return Object.fromEntries(Object.keys(COUNT_TABLES).map((key) => [key, null])) as FloridaClassDOwnerPreviewState["counts"];
}

function parseExactCount(response: Response) {
  const contentRange = response.headers.get("content-range")?.trim() || "";
  const match = /\/(\d+)$/.exec(contentRange);
  if (!match) throw new Error("FDACS database did not return an exact row count.");
  const count = Number(match[1]);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("FDACS database returned an invalid row count.");
  return count;
}

export async function evaluateFloridaClassDOwnerPreviewState(input: {
  request: FloridaClassDOwnerPreviewCountRequest;
  nowMs?: number;
}): Promise<FloridaClassDOwnerPreviewState> {
  const observedAt = new Date(input.nowMs ?? Date.now()).toISOString();
  try {
    const entries = await Promise.all(Object.entries(COUNT_TABLES).map(async ([key, table]) => {
      const response = await input.request(table, { method: "HEAD" });
      if (!response.ok) throw new Error(`FDACS database count failed for ${table}.`);
      return [key, parseExactCount(response)] as const;
    }));
    return {
      source: "fdacs_supabase_read_only",
      status: "ready",
      observedAt,
      counts: Object.fromEntries(entries) as FloridaClassDOwnerPreviewState["counts"],
      blockingReason: null,
      regulatedWritesAuthorized: false,
      productionRuntimeAuthorized: false,
      trainingCreditEligible: false,
      completionAuthorized: false,
      certificateAuthorized: false,
      liasAuthorized: false,
    };
  } catch {
    return {
      source: "fdacs_supabase_read_only",
      status: "unavailable",
      observedAt,
      counts: unavailableCounts(),
      blockingReason: "Authoritative FDACS row counts are unavailable; no zero-row assumption was made.",
      regulatedWritesAuthorized: false,
      productionRuntimeAuthorized: false,
      trainingCreditEligible: false,
      completionAuthorized: false,
      certificateAuthorized: false,
      liasAuthorized: false,
    };
  }
}
