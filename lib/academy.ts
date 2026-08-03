import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { courses } from "../app/academy/courseData";

export type CourseProgress = {
  completedLessons: number[];
  assessmentScore?: number;
  completedAt?: string;
  certificateId?: string;
};

export type AcademyState = {
  entitlements: Record<string, { enrolledAt: string; paymentReference: string }>;
  progress: Record<string, CourseProgress>;
};

const emptyState = (): AcademyState => ({ entitlements: {}, progress: {} });

export function courseForId(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function academyStateFromUser(user: { privateMetadata: Record<string, unknown> }): AcademyState {
  const raw = user.privateMetadata?.academy;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
  const candidate = raw as Partial<AcademyState>;
  return {
    entitlements: candidate.entitlements && typeof candidate.entitlements === "object" ? candidate.entitlements : {},
    progress: candidate.progress && typeof candidate.progress === "object" ? candidate.progress : {},
  };
}

async function saveState(userId: string, state: AcademyState) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { privateMetadata: { academy: state } });
}

export async function grantCourseAccess(userId: string, courseId: string, paymentReference: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const state = academyStateFromUser(user);
  if (!state.entitlements[courseId]) {
    state.entitlements[courseId] = { enrolledAt: new Date().toISOString(), paymentReference };
    await saveState(userId, state);
  }
}

export async function markLessonComplete(userId: string, courseId: string, lessonIndex: number) {
  const course = courseForId(courseId);
  if (!course || lessonIndex < 0 || lessonIndex >= course.modules.length) throw new Error("Invalid course lesson");
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  state.progress[courseId] = {
    ...current,
    completedLessons: [...new Set([...current.completedLessons, lessonIndex])].sort((a, b) => a - b),
  };
  await saveState(userId, state);
  return state.progress[courseId];
}

export async function recordAssessment(userId: string, courseId: string, score: number) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  if (current.completedLessons.length !== course.modules.length) throw new Error("Complete every lesson before the assessment");
  const passed = score >= 80;
  state.progress[courseId] = {
    ...current,
    assessmentScore: score,
    ...(passed && !current.certificateId ? {
      completedAt: new Date().toISOString(),
      certificateId: `OBS-${courseId.toUpperCase().replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    } : {}),
  };
  await saveState(userId, state);
  return state.progress[courseId];
}

export function ownerEmailAllowed(emails: string[]) {
  const owner = process.env.OBSERRA_OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner && emails.some((email) => email.toLowerCase() === owner));
}

function emailsForUser(user: { emailAddresses: { emailAddress: string }[] }) {
  return user.emailAddresses.map((item) => item.emailAddress);
}

/**
 * The owner account is server-allowlisted, never granted through a public
 * route. A matching Clerk account receives private review access to each
 * course without altering the paid learner enrollment path.
 */
export async function academyStateWithOwnerAccess(userId: string, courseId: string) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const state = academyStateFromUser(user);
  if (state.entitlements[courseId]) return state;
  if (!ownerEmailAllowed(emailsForUser(user))) return state;
  state.entitlements[courseId] = {
    enrolledAt: new Date().toISOString(),
    paymentReference: "owner-administrator-access",
  };
  await saveState(userId, state);
  return state;
}

export async function getAcademyAggregateMetrics() {
  const client = await clerkClient();
  const users = [] as Awaited<ReturnType<typeof client.users.getUserList>>["data"];
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    users.push(...page.data);
    totalCount = page.totalCount;
    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);

  let enrollments = 0;
  let certificates = 0;
  const coursesByEnrollment = Object.fromEntries(courses.map((course) => [course.id, 0])) as Record<string, number>;
  for (const user of users) {
    const state = academyStateFromUser(user);
    for (const courseId of Object.keys(state.entitlements)) {
      enrollments += 1;
      if (courseId in coursesByEnrollment) coursesByEnrollment[courseId] += 1;
    }
    certificates += Object.values(state.progress).filter((progress) => progress.certificateId).length;
  }
  return { learnerAccounts: totalCount, enrollments, certificates, coursesByEnrollment, sampledLearners: users.length };
}
