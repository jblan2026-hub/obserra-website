import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/academy/certificate/verify/route.ts", "utf8");
const academy = fs.readFileSync("lib/academy.ts", "utf8");
const legacyClerk = fs.readFileSync("lib/academy-legacy-clerk.ts", "utf8");
const signing = fs.readFileSync("lib/certificate-signing.ts", "utf8");
const certificatePage = fs.readFileSync("app/academy/certificate/[courseId]/page.tsx", "utf8");
const certificateView = fs.readFileSync("app/academy/certificate/[courseId]/CertificateView.tsx", "utf8");

test("certificate verification rejects malformed IDs before expensive lookup", () => {
  assert.match(route, /CERTIFICATE_ID_PATTERN/);
  assert.match(route, /!CERTIFICATE_ID_PATTERN\.test\(certificateId\)/);
  const validationPosition = route.indexOf("CERTIFICATE_ID_PATTERN.test(certificateId)");
  const lookupPosition = route.indexOf("findVerifiedCertificate(certificateId)");
  assert.ok(validationPosition >= 0 && lookupPosition > validationPosition);
});

test("certificate verification uses Vercel anti spoof client IP headers", () => {
  assert.match(route, /x-vercel-forwarded-for/);
  assert.match(route, /x-forwarded-for/);
  assert.match(route, /x-real-ip/);
});

test("certificate verification bounds per client and per instance request volume", () => {
  assert.match(route, /CLIENT_REQUEST_LIMIT = 12/);
  assert.match(route, /INSTANCE_REQUEST_LIMIT = 120/);
  assert.match(route, /clientBucket\.requests >= CLIENT_REQUEST_LIMIT/);
  assert.match(route, /state\.instance\.requests >= INSTANCE_REQUEST_LIMIT/);
  assert.match(route, /guardedResponse\([^\n]+429/);
  assert.match(route, /retry-after/);
});

test("certificate verification bounds concurrent expensive Clerk scans", () => {
  assert.match(route, /MAX_CONCURRENT_LOOKUPS = 4/);
  assert.match(route, /state\.inFlight >= MAX_CONCURRENT_LOOKUPS/);
  assert.match(route, /state\.inFlight \+= 1/);
  assert.match(route, /guard\.state\.inFlight = Math\.max\(0, guard\.state\.inFlight - 1\)/);
});

test("certificate verification fails closed when the backing identity service is unavailable", () => {
  assert.match(route, /Certificate verification is temporarily unavailable/);
  assert.match(route, /guardedResponse\([^\n]+503/);
  assert.match(route, /private, no-store, max-age=0/);
});

test("public certificate verification minimizes learner data while preserving course identity", () => {
  const publicPayloadStart = route.indexOf("const publicCertificate = {");
  const publicPayloadEnd = route.indexOf("};", publicPayloadStart);
  assert.ok(publicPayloadStart >= 0 && publicPayloadEnd > publicPayloadStart);
  const publicPayload = route.slice(publicPayloadStart, publicPayloadEnd);
  assert.match(publicPayload, /learnerName/);
  assert.match(publicPayload, /courseTitle/);
  assert.match(publicPayload, /courseVersion/);
  assert.match(publicPayload, /completedAt/);
  assert.doesNotMatch(publicPayload, /assessmentScore/);
  assert.doesNotMatch(publicPayload, /email/);
  assert.doesNotMatch(publicPayload, /paymentReference/);
});

test("new signed certificate claims bind learner name, canonical course title, and semantic version", () => {
  assert.match(signing, /schemaVersion: "1\.2"/);
  assert.match(signing, /courseTitle: string/);
  assert.match(signing, /courseVersion: string/);
  assert.match(signing, /learnerName: string/);
  assert.match(signing, /courseTitle: input\.courseTitle/);
  assert.match(signing, /courseVersion: input\.courseVersion/);
  assert.match(signing, /learnerName: input\.learnerName/);
  assert.match(signing, /\^\\d\+\\\.\\d\+\\\.\\d\+\$/);
  assert.match(academy, /courseTitle: course\.title/);
  assert.match(academy, /courseVersion: governedCourseVersion\(courseId\)/);
  assert.match(academy, /learnerName: result\.learnerName/);
});

test("legacy schema 1.0 and 1.1 certificates remain explicitly supported", () => {
  assert.match(signing, /schemaVersion: "1\.0"/);
  assert.match(signing, /schemaVersion: "1\.1"/);
  assert.match(signing, /claim\.schemaVersion !== "1\.0" && claim\.schemaVersion !== "1\.1" && claim\.schemaVersion !== "1\.2"/);
  assert.match(academy, /signed\.schemaVersion === "1\.0" \? course\.title : signed\.courseTitle/);
  assert.match(academy, /signed\.schemaVersion === "1\.0" \? governedCourseVersion\(courseId\) : signed\.courseVersion/);
});

test("certificate presentation renders signed title, governed version, signed learner identity, and canonical credential name", () => {
  assert.match(certificatePage, /signed\.schemaVersion === "1\.0" \? course\.title : signed\.courseTitle/);
  assert.match(certificatePage, /const courseVersion = signed\.schemaVersion === "1\.0"[\s\S]*\? \(publication\.version \|\| BASELINE_COURSE_VERSION\)[\s\S]*: signed\.courseVersion/);
  assert.match(certificatePage, /const learnerName = signed\.schemaVersion === "1\.2"[\s\S]*\? signed\.learnerName[\s\S]*: academyLearnerDisplayName\(identity\.identity\)/);
  assert.match(certificatePage, /publicationForCourse\(courseId\)/);
  assert.match(certificatePage, /BASELINE_COURSE_VERSION/);
  assert.match(certificateView, /Certificate of Course Completion/);
  assert.match(certificateView, /Course Version/);
});

test("legacy certificate lookup retains an explicit bounded Clerk scan only in the compatibility module", () => {
  assert.match(academy, /import\("\.\/academy-legacy-clerk"\)/);
  assert.doesNotMatch(academy, /@clerk\/nextjs\/server/);
  assert.match(legacyClerk, /offset < 10_000/);
  assert.match(legacyClerk, /pageSize = 100/);
});
