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
const CATALOG_PUBLISHER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const OFFICIAL_LOGO = "/brand/obserra-logo.png";
const OFFICIAL_GOLD = "#f4ba55";
const APPROVED_GOLD_VARIANTS = [OFFICIAL_GOLD, "#f2b94f", "#f2bd5a", "#f2c768", "#f3ca71", "#e7ac43", "#f9cf72"];
const CATALOG_FILE = "app/academy/generated/studio-catalog.json";
const BASELINE_SOURCE_FILE = "app/academy/courseData.ts";
const BASELINE_PUBLICATION_FILE = "supabase/migrations/20260814025522_academy_baseline_publication_controls.sql";

const catalog = JSON.parse(requireFile(CATALOG_FILE));
if (catalog.schemaVersion !== "1.2") throw new Error("Academy Studio catalog schemaVersion must equal 1.2");
if (!Array.isArray(catalog.courses)) throw new Error("Academy Studio catalog courses must be an array");
if (catalog.publisher !== CATALOG_PUBLISHER) throw new Error(`Academy catalog publisher must equal ${CATALOG_PUBLISHER}`);

const baselineSource = requireFile(BASELINE_SOURCE_FILE);
const baselinePublication = requireFile(BASELINE_PUBLICATION_FILE);
const baselineIds = [...baselineSource.matchAll(/^\s*\["([a-z0-9]+(?:-[a-z0-9]+)*)"/gm)].map((match) => match[1]);
const publishedIds = [...baselinePublication.matchAll(/\('([a-z0-9]+(?:-[a-z0-9]+)*)'\)/g)].map((match) => match[1]);
if (baselineIds.length !== 60 || new Set(baselineIds).size !== 60) {
  throw new Error("Academy reviewed baseline must contain exactly 60 unique course IDs");
}
if (publishedIds.length !== 60 || new Set(publishedIds).size !== 60) {
  throw new Error("Academy publication control must contain exactly 60 unique course IDs");
}
if (baselineIds.some((id) => !publishedIds.includes(id)) || publishedIds.some((id) => !baselineIds.includes(id))) {
  throw new Error("Academy reviewed baseline and publication control course IDs must match exactly");
}
if (baselineIds.some((id) => id.includes("class-d") || id.includes("security-officer"))) {
  throw new Error("Regulated Florida Class D training must not be included in generic Academy publication");
}
if (catalog.courses.length === 0) {
  if (catalog.generatedAt !== null || catalog.officialLogo !== null) {
    throw new Error("An empty Studio override catalog must remain explicitly ungenerated");
  }
} else if (catalog.officialLogo !== OFFICIAL_LOGO) {
  throw new Error(`A nonempty Academy Studio catalog officialLogo must equal ${OFFICIAL_LOGO}`);
}

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
  "mergeStudioCourses",
  "const specs: CourseSpec[]",
  "function createModules",
  "function createCourse",
]);
requireTerms("app/academy/studioCatalog.ts", [
  "./generated/studio-catalog.json",
  "parseStudioCatalog",
  "mergeStudioCourseSets",
]);
requireTerms("app/academy/studioCatalogCore.mjs", [
  "source.modules",
  "source.commerce?.price",
  "source.releaseStatus",
]);
requireTerms("app/academy/AcademyClient.tsx", [
  OFFICIAL_LOGO,
  "<AcademyCheckoutForm",
  "saved progress, assessments, and a verifiable completion record",
]);
requireTerms("app/academy/[courseId]/page.tsx", [
  CATALOG_PUBLISHER,
  OFFICIAL_LOGO,
  "course.title",
  "course.description",
  "course.duration",
  "course.modules.length",
  "course.outcomes.map",
  "course.modules.map",
  "<AcademyCheckoutForm",
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
  "app/academy/academy-commercial.css",
  "app/academy/academy-world-class.css",
  "app/academy/[courseId]/course-page.css",
  "app/academy/certificate/[courseId]/certificate.css",
  "app/academy/certificate/[courseId]/brand-certificate.css",
];
let goldReferences = 0;
let darkFoundationReferences = 0;
for (const file of brandFiles) {
  const source = requireFile(file).toLowerCase();
  if (APPROVED_GOLD_VARIANTS.some((color) => source.includes(color))) goldReferences += 1;
  if (source.includes("#0") || source.includes("black")) darkFoundationReferences += 1;
}
if (goldReferences < 3) throw new Error("The approved Obserra gold palette is not consistently applied across Academy surfaces");
if (darkFoundationReferences < 4) throw new Error("The Obserra black or dark foundation is not consistently applied across Academy surfaces");

const evidence = {
  schemaVersion: "2.0",
  generatedAt: new Date().toISOString(),
  sourceOfTruth: BASELINE_SOURCE_FILE,
  publicationAuthority: BASELINE_PUBLICATION_FILE,
  studioOverrideSource: CATALOG_FILE,
  legalName: LEGAL_NAME,
  officialLogo: OFFICIAL_LOGO,
  palette: { foundation: "black", primaryText: "white", accent: OFFICIAL_GOLD },
  courseCount: baselineIds.length,
  studioOverrideCount: catalog.courses.length,
  baselineCourseIds: baselineIds,
  lessonCounts,
  courses: courseEvidence,
  certificateSignatureAlgorithm: "Ed25519",
  publicationModel: "60 reviewed baseline courses are controlled by the audited Supabase publication migration; approved Studio records may override matching course IDs",
};

const evidenceDir = path.join(root, "artifacts", "academy-release-evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, "course-brand-alignment.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`[Academy Alignment] Validated ${baselineIds.length} reviewed baseline courses, exact Supabase publication parity, and ${catalog.courses.length} approved Studio overrides.`);
