import "server-only";

import { randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

export const FLORIDA_CLASS_D_ACCEPTANCE_DOMAINS = [
  "identity_enrollment",
  "live_media",
  "attendance_time",
  "presence_challenges",
  "observer_access",
  "makeup",
  "recorded_makeup",
  "exam",
  "retest",
  "completion",
  "completion_documents",
  "lias_workflow",
  "inspection_packet",
  "quality_capa",
  "retention",
  "security_headers",
  "mobile_desktop",
  "accessibility",
] as const;

export type FloridaClassDAcceptanceDomain = typeof FLORIDA_CLASS_D_ACCEPTANCE_DOMAINS[number];
export type FloridaClassDAcceptanceStatus = "not_run" | "passed" | "failed" | "blocked";

export type FloridaClassDAcceptanceRun = {
  id: string;
  environment_type: "development" | "sandbox" | "staging" | "uat";
  release_commit_sha: string;
  test_identity_reference: string;
  synthetic_identity_confirmed: boolean;
  status: "in_progress" | "passed" | "failed" | "aborted";
  started_by_clerk_user_id: string;
  started_at: string;
  completed_at?: string | null;
  summary?: string | null;
};

export type FloridaClassDAcceptanceCheck = {
  id: string;
  run_id: string;
  domain: FloridaClassDAcceptanceDomain;
  status: FloridaClassDAcceptanceStatus;
  evidence_reference?: string | null;
  operator_note?: string | null;
  verified_by_clerk_user_id: string;
  verified_at: string;
};

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDExamError("Regulated Class D data service is not configured.", 503, "FDACS_REGULATED_DATA_NOT_CONFIGURED");
  }
  return { key, url };
}

export async function floridaClassDRegulatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "Regulated Class D data request failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_REGULATED_DATA_REQUEST_FAILED",
    );
  }
  return payload as T;
}

export async function listFloridaClassDAcceptanceRuns() {
  return floridaClassDRegulatedRequest<FloridaClassDAcceptanceRun[]>(
    "fdacs_class_d_acceptance_runs?select=id,environment_type,release_commit_sha,test_identity_reference,synthetic_identity_confirmed,status,started_by_clerk_user_id,started_at,completed_at,summary&order=started_at.desc&limit=50",
  );
}

export async function listFloridaClassDAcceptanceChecks(runId: string) {
  const params = new URLSearchParams({
    select: "id,run_id,domain,status,evidence_reference,operator_note,verified_by_clerk_user_id,verified_at",
    run_id: `eq.${runId}`,
    order: "domain.asc",
  });
  return floridaClassDRegulatedRequest<FloridaClassDAcceptanceCheck[]>(`fdacs_class_d_acceptance_checks?${params.toString()}`);
}

export async function createFloridaClassDAcceptanceRun(input: {
  environmentType: FloridaClassDAcceptanceRun["environment_type"];
  releaseCommitSha: string;
  testIdentityReference: string;
  actorUserId: string;
}) {
  if (!/^[0-9a-f]{40}$/.test(input.releaseCommitSha)) {
    throw new FloridaClassDExamError("Release commit SHA must be 40 lowercase hexadecimal characters.", 400, "FDACS_ACCEPTANCE_INVALID_COMMIT");
  }
  if (input.testIdentityReference.trim().length < 3) {
    throw new FloridaClassDExamError("A synthetic test identity reference is required.", 400, "FDACS_ACCEPTANCE_IDENTITY_REQUIRED");
  }
  const [run] = await floridaClassDRegulatedRequest<FloridaClassDAcceptanceRun[]>("fdacs_class_d_acceptance_runs", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      environment_type: input.environmentType,
      release_commit_sha: input.releaseCommitSha,
      test_identity_reference: input.testIdentityReference.trim(),
      synthetic_identity_confirmed: true,
      started_by_clerk_user_id: input.actorUserId,
      correlation_id: randomUUID(),
    }),
  });
  if (!run) throw new FloridaClassDExamError("Acceptance run was not created.", 502, "FDACS_ACCEPTANCE_CREATE_FAILED");
  return run;
}

export async function recordFloridaClassDAcceptanceCheck(input: {
  runId: string;
  domain: FloridaClassDAcceptanceDomain;
  status: FloridaClassDAcceptanceStatus;
  evidenceReference?: string;
  operatorNote?: string;
  actorUserId: string;
}) {
  if (!FLORIDA_CLASS_D_ACCEPTANCE_DOMAINS.includes(input.domain)) {
    throw new FloridaClassDExamError("Invalid acceptance domain.", 400, "FDACS_ACCEPTANCE_INVALID_DOMAIN");
  }
  if (input.status === "passed" && (input.evidenceReference?.trim().length ?? 0) < 3) {
    throw new FloridaClassDExamError("Passed acceptance checks require an evidence reference.", 400, "FDACS_ACCEPTANCE_EVIDENCE_REQUIRED");
  }
  const query = new URLSearchParams({ on_conflict: "run_id,domain" });
  await floridaClassDRegulatedRequest(`fdacs_class_d_acceptance_checks?${query.toString()}`, {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      run_id: input.runId,
      domain: input.domain,
      status: input.status,
      evidence_reference: input.evidenceReference?.trim() || null,
      operator_note: input.operatorNote?.trim() || null,
      verified_by_clerk_user_id: input.actorUserId,
      verified_at: new Date().toISOString(),
      correlation_id: randomUUID(),
    }),
  });
}

export async function finalizeFloridaClassDAcceptanceRun(input: {
  runId: string;
  summary?: string;
  actorUserId: string;
}) {
  return floridaClassDRegulatedRequest<{ run_id: string; status: "passed"; passed_domains: number }>("rpc/fdacs_class_d_finalize_acceptance_run", {
    method: "POST",
    body: JSON.stringify({
      p_run_id: input.runId,
      p_actor_clerk_user_id: input.actorUserId,
      p_summary: input.summary?.trim() || null,
      p_correlation_id: randomUUID(),
    }),
  });
}
