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

function validateSigningKey(name: string, key: string) {
  if (Buffer.byteLength(key, "utf8") < 32) throw new Error(`${name} must contain at least 32 bytes`);
  return key;
}

function currentSigningKey() {
  const key = process.env.ACADEMY_ACCESS_SIGNING_SECRET;
  if (!key) throw new Error("Academy access signing is not configured");
  return validateSigningKey("ACADEMY_ACCESS_SIGNING_SECRET", key);
}

function previousSigningKey() {
  const key = process.env.ACADEMY_ACCESS_PREVIOUS_SIGNING_SECRET;
  return key ? validateSigningKey("ACADEMY_ACCESS_PREVIOUS_SIGNING_SECRET", key) : null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function signatureMatches(payload: string, suppliedSignature: string, key: string) {
  const expectedSignature = sign(payload, key);
  if (suppliedSignature.length !== expectedSignature.length) return false;
  return timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expectedSignature));
}

export function serializeAcademyAccess(state: AnonymousAcademyState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload, currentSigningKey())}`;
}

export function parseAcademyAccess(value?: string): AnonymousAcademyState | null {
  if (!value) return null;
  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature) return null;
  const currentKey = currentSigningKey();
  const previousKey = previousSigningKey();
  if (!signatureMatches(payload, suppliedSignature, currentKey) && (!previousKey || !signatureMatches(payload, suppliedSignature, previousKey))) return null;
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
