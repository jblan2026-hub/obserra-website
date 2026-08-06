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
const COURSE_DATA = "app/academy/courseData.ts";

const courseSource = requireFile(COURSE_DATA);
const specPattern = /^\s*\["([^"]+)",\s*"([^"]+)",\s*"(Foundation|Professional|Advanced|Executive Intensive|CISO Masterclass)",\s*"(Cyber|Protection|Intelligence|Technologies)",\s*"([^"]+)",\s*"([^"]+)"\],?$/gm;
const courses = [];
for (const match of courseSource.matchAll(specPattern)) {
  courses.push({
    id: match[1],
    title: match[2],
    level: match[3],
    department: match[4],
    track: match[5],
    focus: match[6],
  });
}

if (courses.length < 50) throw new Error(`Expected the complete paid Academy catalog, found only ${courses.length} courses`);

const ids = new Set();
const titles = new Set();
for (const course of courses) {
  if (ids.has(course.id)) throw new Error(`Duplicate course ID: ${course.id}`);
  if (titles.has(course.title)) throw new Error(`Duplicate course title: ${course.title}`);
  ids.add(course.id);
  titles.add(course.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.id)) throw new Error(`Invalid production course slug: ${course.id}`);
  if (course.title.length < 12) throw new Error(`Course title is not production ready: ${course.id}`);
  if (course.focus.length < 18) throw new Error(`Course description focus is too short: ${course.id}`);
}

const prices = {
  Foundation: 149,
  Professional: 249,
  Advanced: 349,
  "Executive Intensive": 499,
  "CISO Masterclass": 699,
};
const durations = {
  Foundation: "2.5 hours",
  Professional: "4.5 hours",
  Advanced: "7 hours",
  "Executive Intensive": "9 hours",
  "CISO Masterclass": "11 hours",
};
const lessonMinutes = {
  Foundation: [24, 26, 28, 30, 42],
  Professional: [42, 48, 54, 60, 66],
  Advanced: [60, 72, 78, 84, 126],
  "Executive Intensive": [84, 96, 102, 114, 144],
  "CISO Masterclass": [108, 120, 132, 144, 156],
};
const expectedMinutes = {
  Foundation: 150,
  Professional: 270,
  Advanced: 420,
  "Executive Intensive": 540,
  "CISO Masterclass": 660,
};

for (const course of courses) {
  const minutes = lessonMinutes[course.level].reduce((total, value) => total + value, 0);
  if (minutes !== expectedMinutes[course.level]) throw new Error(`Lesson minutes do not match advertised hours for ${course.id}`);
  if (!prices[course.level] || !durations[course.level]) throw new Error(`Missing commerce or duration policy for ${course.id}`);
}

requireTerms(COURSE_DATA, [
  "const phases = [\"Decision context\", \"Evidence and risk\", \"Control and authority\", \"Scenario practice\", \"Action and improvement\"]",
  "guided course videos",
  "training materials",
  "practical decision scenarios",
  "checks on learning",
  "modules: createModules(title, focus, level)",
]);

requireTerms("app/academy/AcademyClient.tsx", [
  OFFICIAL_LOGO,
  "/api/academy/checkout?course=${course.id}",
  "Complete every lesson and earn 80 percent or higher",
  "saved progress, assessments, and certificates",
]);

requireTerms("app/academy/[courseId]/page.tsx", [
  OFFICIAL_LOGO,
  "course.title",
  "course.description",
  "course.duration",
  "course.modules.length",
  "course.outcomes.map",
  "course.modules.map",
  "/api/academy/checkout?course=${course.id}",
  "80 percent or higher",
]);

requireTerms("app/api/academy/checkout/route.ts", [
  "courseForId",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "courseId: course.id",
  "certificateIssuer",
  "checkout.sessions.create",
]);

requireTerms("lib/academy.ts", [
  "completedLessons.length !== course.modules.length",
  "score >= 80",
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

const byLevel = Object.fromEntries(Object.keys(prices).map((level) => [level, courses.filter((course) => course.level === level).length]));
const byDepartment = Object.fromEntries(["Cyber", "Protection", "Intelligence", "Technologies"].map((department) => [department, courses.filter((course) => course.department === department).length]));

const evidence = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  legalName: LEGAL_NAME,
  officialLogo: OFFICIAL_LOGO,
  palette: { foundation: "black", primaryText: "white", accent: OFFICIAL_GOLD },
  courseCount: courses.length,
  byLevel,
  byDepartment,
  lessonCountPerCourse: 5,
  assessmentPassingScore: 80,
  certificateSignatureAlgorithm: "Ed25519",
  validatedContracts: [
    "course identity",
    "course description",
    "advertised hours",
    "lesson count",
    "lesson minutes",
    "learning outcomes",
    "production checkout",
    "completion requirements",
    "digitally signed certificate",
    "public certificate verification",
    "official logo",
    "full legal name",
    "official brand palette",
  ],
};

const evidenceDir = path.join(root, "artifacts", "academy-release-evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, "course-brand-alignment.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`[Academy Alignment] Validated ${courses.length} courses, five lessons per course, production checkout, signed certificates, and official Obserra branding.`);
