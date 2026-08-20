import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { CourseProgress } from "./academy";

export type AnonymousAcademyState = {
  courses: Record<string, { paymentReference: string; enrolledAt: string }>;
  progress: Record<string, CourseProgress>;
  learnerName: string;
  expiresAt: number;
};

const cookieName = "obserra_academy_access";
const emptyState = (): AnonymousAcademyState => ({ courses: {}, progress: {}, learnerName: "Obserra EPI Academy Learner", expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365 });

function signingKey() {
  const key = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key) throw new Error("Academy access is not configured");
  return key;
}

function sign(payload: string) {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function serializeAcademyAccess(state: AnonymousAcademyState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseAcademyAccess(value?: string): AnonymousAcademyState | null {
  if (!value) return null;
  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = sign(payload);
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expectedSignature))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AnonymousAcademyState;
    if (!parsed || typeof parsed !== "object" || !parsed.courses || !parsed.progress || typeof parsed.expiresAt !== "number" || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function accessCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 };
}

export function newAcademyState() { return emptyState(); }

export function markAnonymousLessonComplete(state: AnonymousAcademyState, courseId: string, lessonIndex: number, lessonCount: number) {
  if (!state.courses[courseId] || lessonIndex < 0 || lessonIndex >= lessonCount) throw new Error("Paid course access is required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  state.progress[courseId] = { ...current, completedLessons: [...new Set([...current.completedLessons, lessonIndex])].sort((a, b) => a - b) };
  return state.progress[courseId];
}

export function recordAnonymousAssessment(state: AnonymousAcademyState, courseId: string, score: number, lessonCount: number) {
  if (!state.courses[courseId]) throw new Error("Paid course access is required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  if (current.completedLessons.length !== lessonCount) throw new Error("Complete every lesson before the assessment");
  const passed = score >= 80;
  state.progress[courseId] = {
    ...current,
    assessmentScore: score,
    ...(passed && !current.certificateId ? { completedAt: new Date().toISOString(), certificateId: `OBS-${courseId.toUpperCase().replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } : {}),
  };
  return state.progress[courseId];
}
export { cookieName as academyAccessCookieName };
