import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import {
  getFloridaClassDInstructorLicenseNumber,
  getFloridaClassDSchoolLicenseNumber,
} from "./florida-class-d-live-policy";
import {
  floridaClassDOwnerUatEvidenceSha256,
  floridaClassDOwnerUatExecutionAuthorized,
  floridaClassDOwnerUatProfileRequested,
  getFloridaClassDOwnerUatReport,
} from "./florida-class-d-owner-uat";
import { floridaClassDProductionActivationAuthorized } from "./florida-class-d-production-activation";
import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_ZONE_PATTERN = /^[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)+$/;

export type FloridaClassDScheduledLesson = {
  live_session_id?: string;
  training_day?: number;
  lesson_id?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
};

type StaffActor = {
  userId: string;
  role: FloridaClassDStaffRole;
};

export class FloridaClassDSchedulingError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDSchedulingError";
  }
}

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDSchedulingEnabled() {
  if (!enabled(process.env.OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED)) return false;
  if (floridaClassDOwnerUatProfileRequested()) {
    return floridaClassDOwnerUatExecutionAuthorized();
  }
  return (
    floridaClassDProductionActivationAuthorized()
    && process.env.OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active"
    && Boolean(getFloridaClassDInstructorLicenseNumber())
    && Boolean(getFloridaClassDSchoolLicenseNumber())
  );
}

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!floridaClassDSupabaseServerConfigAuthorized(url, key)) {
    throw new FloridaClassDSchedulingError("Class D scheduling persistence is not configured.", 503, "FDACS_SCHEDULE_PERSISTENCE_NOT_CONFIGURED");
  }
  return { key, url };
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDSchedulingError("Class D scheduling persistence returned an invalid response.", 502, "FDACS_SCHEDULE_INVALID_RESPONSE");
    }
  }
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDSchedulingError(
      typeof record?.message === "string" ? record.message : "Class D scheduling operation failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_SCHEDULE_PERSISTENCE_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDSchedulingError(`Invalid ${field}.`, 400, "FDACS_SCHEDULE_INVALID_IDENTIFIER");
}

function isCalendarDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizedDates(trainingDates: string[]) {
  if (trainingDates.length !== 5) {
    throw new FloridaClassDSchedulingError("Exactly five training dates are required.", 400, "FDACS_SCHEDULE_FIVE_DATES_REQUIRED");
  }
  const dates = trainingDates.map((value) => value.trim());
  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    if (!isCalendarDate(date)) {
      throw new FloridaClassDSchedulingError("Training dates must be valid calendar dates in YYYY-MM-DD format.", 400, "FDACS_SCHEDULE_INVALID_DATE");
    }
    if (index > 0 && date <= dates[index - 1]) {
      throw new FloridaClassDSchedulingError("Training dates must be strictly increasing.", 400, "FDACS_SCHEDULE_DATES_NOT_INCREASING");
    }
  }
  return dates;
}

export async function prepareFloridaClassDOwnerUatCohort(
  actor: StaffActor,
  correlationId: string,
) {
  if (actor.role !== "school_admin" && actor.role !== "compliance_admin") {
    throw new FloridaClassDSchedulingError(
      "Owner UAT cohort preparation requires school or compliance administration.",
      403,
      "FDACS_OWNER_UAT_COHORT_ADMIN_REQUIRED",
    );
  }
  requireUuid(correlationId, "correlation id");
  const report = getFloridaClassDOwnerUatReport();
  const evidenceSha256 = floridaClassDOwnerUatEvidenceSha256();
  if (!report.authorized || !report.releaseCommitSha || !report.expiresAt || !evidenceSha256) {
    throw new FloridaClassDSchedulingError(
      "The exact-release owner UAT authorization is incomplete.",
      503,
      "FDACS_OWNER_UAT_COHORT_NOT_AUTHORIZED",
    );
  }
  const cohortId = await rpc<string>("fdacs_class_d_create_owner_uat_cohort", {
    p_release_commit_sha: report.releaseCommitSha,
    p_expires_at: report.expiresAt,
    p_authorization_evidence_sha256: evidenceSha256,
    p_actor_ref: actor.userId,
    p_correlation_id: correlationId,
  });
  requireUuid(cohortId, "owner UAT cohort id");
  return cohortId;
}

export async function publishFloridaClassDCohortSchedule(actor: StaffActor, input: {
  cohortId: string;
  trainingDates: string[];
  dayStartLocal: string;
  timeZone: string;
  instructorClerkUserId: string;
  correlationId: string;
}) {
  if (actor.role !== "school_admin" && actor.role !== "compliance_admin") {
    throw new FloridaClassDSchedulingError("Class D scheduling requires school or compliance administration.", 403, "FDACS_SCHEDULE_ADMIN_REQUIRED");
  }
  if (!floridaClassDSchedulingEnabled()) {
    throw new FloridaClassDSchedulingError("Class D scheduling is not enabled for this controlled runtime.", 503, "FDACS_SCHEDULE_NOT_ENABLED");
  }
  requireUuid(input.cohortId, "cohort id");
  requireUuid(input.correlationId, "correlation id");
  const trainingDates = normalizedDates(input.trainingDates);
  const dayStartLocal = input.dayStartLocal.trim();
  const timeZone = input.timeZone.trim();
  const instructorClerkUserId = input.instructorClerkUserId.trim();
  if (!TIME_PATTERN.test(dayStartLocal)) {
    throw new FloridaClassDSchedulingError("Daily start time must use 24-hour HH:MM format.", 400, "FDACS_SCHEDULE_INVALID_START_TIME");
  }
  if (!TIME_ZONE_PATTERN.test(timeZone) || timeZone.length > 80) {
    throw new FloridaClassDSchedulingError("A valid IANA time zone is required.", 400, "FDACS_SCHEDULE_INVALID_TIME_ZONE");
  }
  if (instructorClerkUserId.length < 3 || instructorClerkUserId.length > 255) {
    throw new FloridaClassDSchedulingError("A valid licensed instructor identity is required.", 400, "FDACS_SCHEDULE_INVALID_INSTRUCTOR");
  }
  const ownerUat = floridaClassDOwnerUatExecutionAuthorized();
  const common = {
    p_cohort_id: input.cohortId,
    p_training_dates: trainingDates,
    p_day_start_local: `${dayStartLocal}:00`,
    p_time_zone: timeZone,
    p_instructor_clerk_user_id: instructorClerkUserId,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  };
  const rows = ownerUat
    ? await rpc<FloridaClassDScheduledLesson[]>("fdacs_class_d_publish_owner_uat_schedule", {
        ...common,
        p_release_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA?.trim().toLowerCase() || "",
      })
    : await (async () => {
        const instructorLicenseNumber = getFloridaClassDInstructorLicenseNumber();
        const schoolLicenseNumber = getFloridaClassDSchoolLicenseNumber();
        if (!instructorLicenseNumber || !schoolLicenseNumber) {
          throw new FloridaClassDSchedulingError("Active Class DI and DS license configuration is required before production scheduling.", 503, "FDACS_SCHEDULE_LICENSE_CONFIGURATION_REQUIRED");
        }
        return rpc<FloridaClassDScheduledLesson[]>("fdacs_class_d_publish_cohort_schedule", {
          ...common,
          p_instructor_license_number: instructorLicenseNumber,
          p_school_license_number: schoolLicenseNumber,
        });
      })();
  if (!Array.isArray(rows) || rows.length !== 20) {
    throw new FloridaClassDSchedulingError("The cohort schedule did not produce exactly 20 regulated live lessons.", 502, "FDACS_SCHEDULE_SESSION_COUNT_INVALID");
  }
  return rows;
}
