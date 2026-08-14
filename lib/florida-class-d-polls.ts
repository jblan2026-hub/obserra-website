import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FloridaClassDLivePoll = {
  id?: string;
  question?: string;
  options?: string[];
  status?: "open" | "closed";
  opened_at?: string;
  closed_at?: string | null;
  correct_option_index?: number | null;
  response_count?: number;
};

export type FloridaClassDStudentPollState = {
  activePoll: FloridaClassDLivePoll | null;
  response: {
    pollId: string;
    selectedOptionIndex: number;
    submittedAt: string | null;
  } | null;
};

export type FloridaClassDParticipationAnalytics = {
  enrollmentId: string;
  questionCount: number;
  handRaiseCount: number;
  pollResponseCount: number;
  pollCorrectCount: number;
  scoredPollResponseCount: number;
  pollsPresented: number;
  pollResponseRate: number;
};

type StaffActor = {
  userId: string;
  role: FloridaClassDStaffRole;
};

export class FloridaClassDPollError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDPollError";
  }
}

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDPollError("Class D live poll persistence is not configured.", 503, "FDACS_POLL_PERSISTENCE_NOT_CONFIGURED");
  }
  return { key, url };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDPollError("Class D live poll persistence returned an invalid response.", 502, "FDACS_POLL_INVALID_RESPONSE");
    }
  }
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDPollError(
      typeof record?.message === "string" ? record.message : "Class D live poll operation failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_POLL_PERSISTENCE_FAILED",
    );
  }
  return payload as T;
}

function rpc<T>(name: string, body: Record<string, unknown>) {
  return request<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDPollError(`Invalid ${field}.`, 400, "FDACS_POLL_INVALID_IDENTIFIER");
}

function normalizeOptions(options: string[]) {
  if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
    throw new FloridaClassDPollError("A live poll requires between two and six answer options.", 400, "FDACS_POLL_INVALID_OPTIONS");
  }
  return options.map((option) => {
    const normalized = option.trim();
    if (!normalized || normalized.length > 500) {
      throw new FloridaClassDPollError("Poll options must contain between 1 and 500 characters.", 400, "FDACS_POLL_INVALID_OPTION_TEXT");
    }
    return normalized;
  });
}

export async function getFloridaClassDActivePoll(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const query = new URLSearchParams({
    select: "id,question,options,status,opened_at",
    live_session_id: `eq.${liveSessionId}`,
    status: "eq.open",
    order: "opened_at.desc",
    limit: "1",
  });
  const rows = await request<FloridaClassDLivePoll[]>(`fdacs_class_d_live_polls?${query}`);
  return rows[0] ?? null;
}

export async function getFloridaClassDStudentPollState(userId: string, liveSessionId: string): Promise<FloridaClassDStudentPollState> {
  requireUuid(liveSessionId, "live session id");
  const activePoll = await getFloridaClassDActivePoll(liveSessionId);
  if (!activePoll?.id) return { activePoll: null, response: null };

  const sessionQuery = new URLSearchParams({ select: "cohort_id", id: `eq.${liveSessionId}`, limit: "1" });
  const sessions = await request<Array<{ cohort_id?: string }>>(`fdacs_class_d_live_sessions?${sessionQuery}`);
  const cohortId = sessions[0]?.cohort_id;
  if (!cohortId || !UUID_PATTERN.test(cohortId)) {
    throw new FloridaClassDPollError("Live session was not found.", 404, "FDACS_POLL_SESSION_NOT_FOUND");
  }

  const enrollmentQuery = new URLSearchParams({
    select: "id",
    cohort_id: `eq.${cohortId}`,
    clerk_user_id: `eq.${userId}`,
    limit: "1",
  });
  const enrollments = await request<Array<{ id?: string }>>(`fdacs_class_d_enrollments?${enrollmentQuery}`);
  const enrollmentId = enrollments[0]?.id;
  if (!enrollmentId || !UUID_PATTERN.test(enrollmentId)) {
    throw new FloridaClassDPollError("Student is not enrolled in this live cohort.", 403, "FDACS_POLL_NOT_ENROLLED");
  }

  const responseQuery = new URLSearchParams({
    select: "poll_id,selected_option_index,submitted_at",
    poll_id: `eq.${activePoll.id}`,
    enrollment_id: `eq.${enrollmentId}`,
    limit: "1",
  });
  const responses = await request<Array<{
    poll_id?: string;
    selected_option_index?: number;
    submitted_at?: string | null;
  }>>(`fdacs_class_d_live_poll_responses?${responseQuery}`);
  const response = responses[0];
  return {
    activePoll,
    response: response?.poll_id && typeof response.selected_option_index === "number"
      ? {
          pollId: response.poll_id,
          selectedOptionIndex: response.selected_option_index,
          submittedAt: response.submitted_at ?? null,
        }
      : null,
  };
}

export async function getFloridaClassDInstructorPolls(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const pollQuery = new URLSearchParams({
    select: "id,question,options,status,opened_at,closed_at,correct_option_index",
    live_session_id: `eq.${liveSessionId}`,
    order: "opened_at.desc",
    limit: "100",
  });
  const responseQuery = new URLSearchParams({
    select: "poll_id",
    live_session_id: `eq.${liveSessionId}`,
    limit: "5000",
  });
  const [polls, responses] = await Promise.all([
    request<FloridaClassDLivePoll[]>(`fdacs_class_d_live_polls?${pollQuery}`),
    request<Array<{ poll_id?: string }>>(`fdacs_class_d_live_poll_responses?${responseQuery}`),
  ]);
  const responseCounts = new Map<string, number>();
  for (const response of responses) {
    if (!response.poll_id) continue;
    responseCounts.set(response.poll_id, (responseCounts.get(response.poll_id) ?? 0) + 1);
  }
  return polls.map((poll) => ({ ...poll, response_count: poll.id ? responseCounts.get(poll.id) ?? 0 : 0 }));
}

export async function openFloridaClassDLivePoll(actor: StaffActor, input: {
  liveSessionId: string;
  question: string;
  options: string[];
  correctOptionIndex?: number | null;
  correlationId: string;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  const question = input.question.trim();
  if (question.length < 3 || question.length > 1000) {
    throw new FloridaClassDPollError("Poll question must contain between 3 and 1000 characters.", 400, "FDACS_POLL_INVALID_QUESTION");
  }
  const options = normalizeOptions(input.options);
  const correctOptionIndex = input.correctOptionIndex ?? null;
  if (correctOptionIndex !== null && (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length)) {
    throw new FloridaClassDPollError("Correct poll option is out of range.", 400, "FDACS_POLL_INVALID_CORRECT_OPTION");
  }
  const pollId = await rpc<string>("fdacs_class_d_open_live_poll", {
    p_live_session_id: input.liveSessionId,
    p_question: question,
    p_options: options,
    p_correct_option_index: correctOptionIndex,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
  if (typeof pollId !== "string" || !UUID_PATTERN.test(pollId)) {
    throw new FloridaClassDPollError("Live poll was not created correctly.", 502, "FDACS_POLL_CREATE_INVALID");
  }
  return pollId;
}

export async function closeFloridaClassDLivePoll(actor: StaffActor, input: {
  pollId: string;
  correlationId: string;
}) {
  requireUuid(input.pollId, "poll id");
  requireUuid(input.correlationId, "correlation id");
  await rpc<null>("fdacs_class_d_close_live_poll", {
    p_poll_id: input.pollId,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
  return { closed: true };
}

export async function submitFloridaClassDLivePollResponse(userId: string, input: {
  pollId: string;
  selectedOptionIndex: number;
  responseMilliseconds?: number | null;
  correlationId: string;
}) {
  requireUuid(input.pollId, "poll id");
  requireUuid(input.correlationId, "correlation id");
  if (!Number.isInteger(input.selectedOptionIndex) || input.selectedOptionIndex < 0 || input.selectedOptionIndex > 5) {
    throw new FloridaClassDPollError("Poll response option is invalid.", 400, "FDACS_POLL_RESPONSE_INVALID_OPTION");
  }
  const responseMilliseconds = input.responseMilliseconds ?? null;
  if (responseMilliseconds !== null && (!Number.isInteger(responseMilliseconds) || responseMilliseconds < 0 || responseMilliseconds > 7_200_000)) {
    throw new FloridaClassDPollError("Poll response timing is invalid.", 400, "FDACS_POLL_RESPONSE_INVALID_TIMING");
  }
  const responseId = await rpc<string>("fdacs_class_d_submit_live_poll_response", {
    p_poll_id: input.pollId,
    p_clerk_user_id: userId,
    p_selected_option_index: input.selectedOptionIndex,
    p_response_milliseconds: responseMilliseconds,
    p_correlation_id: input.correlationId,
  });
  if (typeof responseId !== "string" || !UUID_PATTERN.test(responseId)) {
    throw new FloridaClassDPollError("Live poll response was not recorded correctly.", 502, "FDACS_POLL_RESPONSE_INVALID");
  }
  return responseId;
}

export async function getFloridaClassDParticipationAnalytics(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const sessionQuery = new URLSearchParams({ select: "id,cohort_id", id: `eq.${liveSessionId}`, limit: "1" });
  const sessions = await request<Array<{ id?: string; cohort_id?: string }>>(`fdacs_class_d_live_sessions?${sessionQuery}`);
  const cohortId = sessions[0]?.cohort_id;
  if (!cohortId || !UUID_PATTERN.test(cohortId)) throw new FloridaClassDPollError("Live session was not found.", 404, "FDACS_POLL_SESSION_NOT_FOUND");

  const enrollmentQuery = new URLSearchParams({ select: "id", cohort_id: `eq.${cohortId}`, limit: "250" });
  const interactionQuery = new URLSearchParams({ select: "enrollment_id,interaction_type", live_session_id: `eq.${liveSessionId}`, limit: "5000" });
  const pollQuery = new URLSearchParams({ select: "id", live_session_id: `eq.${liveSessionId}`, limit: "100" });
  const responseQuery = new URLSearchParams({ select: "enrollment_id,poll_id,is_correct", live_session_id: `eq.${liveSessionId}`, limit: "5000" });
  const [enrollments, interactions, polls, responses] = await Promise.all([
    request<Array<{ id?: string }>>(`fdacs_class_d_enrollments?${enrollmentQuery}`),
    request<Array<{ enrollment_id?: string | null; interaction_type?: string }>>(`fdacs_class_d_live_interactions?${interactionQuery}`),
    request<Array<{ id?: string }>>(`fdacs_class_d_live_polls?${pollQuery}`),
    request<Array<{ enrollment_id?: string; poll_id?: string; is_correct?: boolean | null }>>(`fdacs_class_d_live_poll_responses?${responseQuery}`),
  ]);

  const pollsPresented = polls.length;
  const analytics = new Map<string, FloridaClassDParticipationAnalytics>();
  for (const enrollment of enrollments) {
    if (!enrollment.id) continue;
    analytics.set(enrollment.id, {
      enrollmentId: enrollment.id,
      questionCount: 0,
      handRaiseCount: 0,
      pollResponseCount: 0,
      pollCorrectCount: 0,
      scoredPollResponseCount: 0,
      pollsPresented,
      pollResponseRate: 0,
    });
  }

  for (const interaction of interactions) {
    if (!interaction.enrollment_id) continue;
    const row = analytics.get(interaction.enrollment_id);
    if (!row) continue;
    if (interaction.interaction_type === "student_question") row.questionCount += 1;
    if (interaction.interaction_type === "hand_raise") row.handRaiseCount += 1;
  }

  for (const response of responses) {
    if (!response.enrollment_id) continue;
    const row = analytics.get(response.enrollment_id);
    if (!row) continue;
    row.pollResponseCount += 1;
    if (typeof response.is_correct === "boolean") {
      row.scoredPollResponseCount += 1;
      if (response.is_correct) row.pollCorrectCount += 1;
    }
  }

  for (const row of analytics.values()) {
    row.pollResponseRate = pollsPresented > 0 ? Number((row.pollResponseCount / pollsPresented).toFixed(4)) : 0;
  }
  return analytics;
}
