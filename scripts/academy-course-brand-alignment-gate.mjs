import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const requireFile = (file) => {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Required Academy file is missing: ${file}`);
  return read(file);
};
const requireTerms = (file, terms) => {
  const source = requireFile(file);
  for (const term of terms) {
    if (!source.includes(term)) throw new Error(`${file} is missing required contract term: ${term}`);
  }
  return source;
};

const LEGAL_NAME = "Obserra Executive Protection & Intelligence, LLC";
const OFFICIAL_LOGO = "/brand/obserra-logo.png";
const OFFICIAL_GOLD = "#f4ba55";
const CATALOG_FILE = "app/academy/generated/studio-catalog.json";

const catalog = JSON.parse(requireFile(CATALOG_FILE));
if (catalog.schemaVersion !== "1.2") throw new Error("Academy Studio catalog schemaVersion must equal 1.2");
if (!Array.isArray(catalog.courses) || catalog.courses.length === 0) {
  throw new Error("Academy release requires a nonempty approved Studio catalog. Synthetic Website course generation is prohibited.");
}
if (catalog.publisher !== LEGAL_NAME) throw new Error(`Academy catalog publisher must equal ${LEGAL_NAME}`);
if (catalog.officialLogo !== OFFICIAL_LOGO) throw new Error(`Academy catalog officialLogo must equal ${OFFICIAL_LOGO}`);

function durationMinutes(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  const hoursMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*hours?$/);
  if (hoursMatch) return Math.round(Number(hoursMatch[1]) * 60);
  const minutesMatch = normalized.match(/^(\d+)\s*min(?:ute)?s?$/);
  if (minutesMatch) return Number(minutesMatch[1]);
  return null;
}

const ids = new Set();
const titles = new Set();
const lessonCounts = {};
const courseEvidence = [];

for (const course of catalog.courses) {
  if (!course || typeof course !== "object") throw new Error("Academy catalog contains an invalid course record");
  if (!course.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.id)) throw new Error(`Invalid production course slug: ${course.id ?? "unknown"}`);
  if (ids.has(course.id)) throw new Error(`Duplicate course ID: ${course.id}`);
  if (titles.has(course.title)) throw new Error(`Duplicate course title: ${course.title}`);
  ids.add(course.id);
  titles.add(course.title);

  if (!course.title || course.title.length < 12) throw new Error(`Course title is not production ready: ${course.id}`);
  if (!course.description || course.description.length < 80) throw new Error(`Course description is incomplete: ${course.id}`);
  if (!course.audience || !course.track || !course.department || !course.level) throw new Error(`Course identity metadata is incomplete: ${course.id}`);
  if (!Array.isArray(course.outcomes) || course.outcomes.length < 3) throw new Error(`Course outcomes are incomplete: ${course.id}`);
  if (!Array.isArray(course.modules) || course.modules.length === 0) throw new Error(`Course ${course.id} has no approved lessons`);
  if (course.moduleCount !== course.modules.length) throw new Error(`Course ${course.id} moduleCount does not match its approved lesson array`);
  if (!course.commerce || course.commerce.model !== "one-time-payment" || !(course.commerce.price > 0) || course.commerce.currency !== "USD") {
    throw new Error(`Course ${course.id} has invalid commerce metadata`);
  }
  if (!course.completion || course.completion.allLessonsRequired !== true || course.completion.assessmentRequired !== true) {
    throw new Error(`Course ${course.id} has invalid completion requirements`);
  }
  if (!(course.completion.passingScore >= 0 && course.completion.passingScore <= 100)) throw new Error(`Course ${course.id} has an invalid passing score`);
  if (course.completion.certificateIssued !== true) throw new Error(`Course ${course.id} is not configured to issue a certificate`);
  if (!course.certificate || course.certificate.issuer !== LEGAL_NAME || course.certificate.verificationRequired !== true) {
    throw new Error(`Course ${course.id} has invalid certificate metadata`);
  }
  if (!course.branding || !course.disclaimer || course.acknowledgementRequired !== true) throw new Error(`Course ${course.id} is missing branding or legal policy`);
  if (!['approved', 'published'].includes(course.releaseStatus)) throw new Error(`Course ${course.id} is not approved for Website publication`);

  const advertisedMinutes = durationMinutes(course.duration);
  if (!advertisedMinutes) throw new Error(`Course ${course.id} has an unsupported advertised duration: ${course.duration}`);
  let lessonMinutesTotal = 0;
  const moduleIds = new Set();
  for (const [index, module] of course.modules.entries()) {
    if (!module.id || moduleIds.has(module.id)) throw new Error(`Course ${course.id} contains a missing or duplicate module ID`);
    moduleIds.add(module.id);
    if (module.sequence !== index + 1) throw new Error(`Course ${course.id} has a nonsequential lesson order`);
    if (!module.title || !module.description || !module.format) throw new Error(`Course ${course.id} lesson ${index + 1} is incomplete`);
    const minutes = durationMinutes(module.duration);
    if (!minutes || minutes <= 0) throw new Error(`Course ${course.id} lesson ${index + 1} has an invalid duration`);
    lessonMinutesTotal += minutes;
  }
  if (lessonMinutesTotal !== advertisedMinutes) {
    throw new Error(`Course ${course.id} lesson minutes (${lessonMinutesTotal}) do not match advertised duration (${advertisedMinutes})`);
  }

  lessonCounts[course.id] = course.modules.length;
  courseEvidence.push({
    id: course.id,
    title: course.title,
    duration: course.duration,
    advertisedMinutes,
    lessonCount: course.modules.length,
    lessonMinutes: lessonMinutesTotal,
    price: course.commerce.price,
    passingScore: course.completion.passingScore,
    releaseStatus: course.releaseStatus,
  });
}

requireTerms("app/academy/courseData.ts", [
  "studio-catalog.json",
  "record.modules.map",
  "record.commerce.price",
  "record.releaseStatus",
]);
requireTerms("app/academy/AcademyClient.tsx", [
  OFFICIAL_LOGO,
  "/api/academy/checkout?course=${course.id}",
  "saved progress, assessments, and certificates",
]);
requireTerms("app/academy/[courseId]/page.tsx", [
  LEGAL_NAME,
  OFFICIAL_LOGO,
  "course.title",
  "course.description",
  "course.duration",
  "course.modules.length",
  "course.outcomes.map",
  "course.modules.map",
  "/api/academy/checkout?course=${course.id}",
]);
requireTerms("app/api/academy/checkout/route.ts", [
  "studioCourseForId",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "courseId: course.id",
  "checkout.sessions.create",
]);
requireTerms("lib/academy.ts", [
  "completedLessons.length !== course.modules.length",
  "signedCertificate",
  "signCertificateClaim",
  "findVerifiedCertificate",
]);
requireTerms("lib/certificate-signing.ts", [
  LEGAL_NAME,
  "Dr. Jody Blanchard",
  "Ed25519",
  "OBSERRA_CERTIFICATE_SIGNING_PRIVATE_KEY",
  "verifyCertificateClaim",
]);
requireTerms("app/academy/certificate/[courseId]/CertificateView.tsx", [
  LEGAL_NAME,
  OFFICIAL_LOGO,
  "Dr. Jody Blanchard",
  "Cryptographically signed",
  "/api/academy/certificate/verify?certificateId=",
]);
requireTerms("app/api/academy/certificate/verify/route.ts", [
  "findVerifiedCertificate",
  "x-obserra-certificate-verification",
  "valid",
]);

const brandFiles = [
  "app/academy/academy.css",
  "app/academy/[courseId]/course-page.css",
  "app/academy/certificate/[courseId]/certificate.css",
  "app/academy/certificate/[courseId]/brand-certificate.css",
];
let goldReferences = 0;
for (const file of brandFiles) {
  const source = requireFile(file).toLowerCase();
  if (source.includes(OFFICIAL_GOLD)) goldReferences += 1;
  if (!source.includes("#0") && !source.includes("black")) throw new Error(`${file} is missing the Obserra black or dark foundation`);
}
if (goldReferences < 2) throw new Error("Official Obserra gold is not consistently applied across Academy surfaces");

const evidence = {
  schemaVersion: "2.0",
  generatedAt: new Date().toISOString(),
  sourceOfTruth: CATALOG_FILE,
  legalName: LEGAL_NAME,
  officialLogo: OFFICIAL_LOGO,
  palette: { foundation: "black", primaryText: "white", accent: OFFICIAL_GOLD },
  courseCount: catalog.courses.length,
  lessonCounts,
  courses: courseEvidence,
  certificateSignatureAlgorithm: "Ed25519",
  autoPublication: "approved-or-published Studio records are synchronized and linked without Website lesson regeneration",
};

const evidenceDir = path.join(root, "artifacts", "academy-release-evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, "course-brand-alignment.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`[Academy Alignment] Validated ${catalog.courses.length} individually authored courses from the approved Studio catalog.`);
