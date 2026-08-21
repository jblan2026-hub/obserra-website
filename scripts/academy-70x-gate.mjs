import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const assertions = [];

function check(name, condition) {
  assertions.push({ name, passed: Boolean(condition) });
}

const courseData = read("app/academy/courseData.ts");
const courseCatalog = read("app/academy/courseCatalog.ts");
const curriculum = read("app/academy/courseCurriculum.ts");
const experience = read("app/academy/courseExperience.ts");
const grounding = read("app/academy/courseGrounding.ts");
const academyClient = read("app/academy/AcademyClient.tsx");
const coursePage = read("app/academy/[courseId]/page.tsx");
const player = read("app/academy/learn/CoursePlayer.tsx");
const learnerLayout = read("app/academy/learn/layout.tsx");
const assessmentRoute = read("app/api/academy/assessment/route.ts");
const progressRoute = read("app/api/academy/progress/route.ts");
const checkoutRoute = read("app/api/academy/checkout/route.ts");
const tutorRoute = read("app/api/academy/tutor/route.ts");
const packageJson = JSON.parse(read("package.json"));

const courseMatches = [...courseData.matchAll(/^\s*\["([a-z0-9-]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\],?$/gm)];
const courseIds = courseMatches.map((match) => match[1]);
const courseTitles = courseMatches.map((match) => match[2]);
const courseLevels = courseMatches.map((match) => match[3]);
const courseDepartments = courseMatches.map((match) => match[4]);
const curriculumProfileIds = [...curriculum.matchAll(/^\s{2}"([a-z0-9-]+)": \{/gm)].map((match) => match[1]);

check("catalog contains exactly 60 live courses", courseIds.length === 60);
check("course ids are unique", new Set(courseIds).size === courseIds.length);
check("course titles are unique", new Set(courseTitles).size === courseTitles.length);
check("all five course levels are represented", new Set(courseLevels).size === 5);
check("all four live departments are represented", new Set(courseDepartments).size === 4);
check("live Cyber catalog count is 26", courseDepartments.filter((value) => value === "Cyber").length === 26);
check("live Protection catalog count is 8", courseDepartments.filter((value) => value === "Protection").length === 8);
check("live Intelligence catalog count is 5", courseDepartments.filter((value) => value === "Intelligence").length === 5);
check("live Technologies catalog count is 21", courseDepartments.filter((value) => value === "Technologies").length === 21);
check("Foundation catalog count is 10", courseLevels.filter((value) => value === "Foundation").length === 10);
check("Professional catalog count is 15", courseLevels.filter((value) => value === "Professional").length === 15);
check("Advanced catalog count is 15", courseLevels.filter((value) => value === "Advanced").length === 15);
check("Executive Intensive catalog count is 11", courseLevels.filter((value) => value === "Executive Intensive").length === 11);
check("CISO Masterclass catalog count is 9", courseLevels.filter((value) => value === "CISO Masterclass").length === 9);
check("live Foundation price remains 99", /Foundation: 99,/.test(courseData));
check("live Professional price remains 149", /Professional: 149,/.test(courseData));
check("live Advanced price remains 199", /Advanced: 199,/.test(courseData));
check("live Executive Intensive price remains 249", /"Executive Intensive": 249,/.test(courseData));
check("live CISO Masterclass price remains 299", /"CISO Masterclass": 299,/.test(courseData));
check("live Foundation duration remains 2.5 hours", /Foundation: "2\.5 hours",/.test(courseData));
check("live Professional duration remains 4.5 hours", /Professional: "4\.5 hours",/.test(courseData));
check("live Advanced duration remains 7 hours", /Advanced: "7 hours",/.test(courseData));
check("live Executive Intensive duration remains 9 hours", /"Executive Intensive": "9 hours",/.test(courseData));
check("live CISO Masterclass duration remains 11 hours", /"CISO Masterclass": "11 hours",/.test(courseData));
check("curriculum contains exactly 60 course specific profiles", curriculumProfileIds.length === 60);
check("curriculum profile ids are unique", new Set(curriculumProfileIds).size === curriculumProfileIds.length);
check("every live course has a course specific curriculum", courseIds.every((id) => curriculumProfileIds.includes(id)));
check("curriculum has no unpublished course profile", curriculumProfileIds.every((id) => courseIds.includes(id)));

for (const id of courseIds) {
  check(`course id ${id} is route safe`, /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id));
  check(`course id ${id} has no traversal token`, !id.includes("..") && !id.includes("/") && !id.includes("\\"));
  check(`course id ${id} has curriculum coverage`, curriculumProfileIds.includes(id));
}

const expectedDurations = {
  Foundation: 150,
  Professional: 270,
  Advanced: 420,
  "Executive Intensive": 540,
  "CISO Masterclass": 660,
};

const durationPatterns = {
  Foundation: /level === "Foundation" \? \[([^\]]+)\]/,
  Professional: /level === "Professional" \? \[([^\]]+)\]/,
  Advanced: /level === "Advanced" \? \[([^\]]+)\]/,
  "Executive Intensive": /level === "Executive Intensive" \? \[([^\]]+)\]/,
  "CISO Masterclass": /: \[([^\]]+)\];\s*\n\s*const phases/,
};

for (const [level, expected] of Object.entries(expectedDurations)) {
  const match = courseData.match(durationPatterns[level]);
  const minutes = match?.[1].split(",").map((value) => Number.parseInt(value.trim(), 10)) ?? [];
  check(`${level} defines five published lessons`, minutes.length === 5);
  check(`${level} lesson minutes are positive integers`, minutes.every((value) => Number.isInteger(value) && value > 0));
  check(`${level} published duration reconciles`, minutes.reduce((sum, value) => sum + value, 0) === expected);
}

const requiredFiles = [
  "app/academy/page.tsx",
  "app/academy/AcademyClient.tsx",
  "app/academy/courseData.ts",
  "app/academy/courseCatalog.ts",
  "app/academy/courseCurriculum.ts",
  "app/academy/courseExperience.ts",
  "app/academy/courseGrounding.ts",
  "app/academy/[courseId]/page.tsx",
  "app/academy/learn/CoursePlayer.tsx",
  "app/academy/learn/layout.tsx",
  "app/academy/learn/ai-native-learning.css",
  "app/academy/learn/[courseId]/page.tsx",
  "app/academy/certificate/[courseId]/CertificateView.tsx",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/progress/route.ts",
  "app/api/academy/tutor/route.ts",
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "lib/academy.ts",
  "lib/academy-identity.ts",
];
for (const file of requiredFiles) check(`required file exists: ${file}`, exists(file));

check(
  "catalog preserves reviewed baseline and additive governed Studio merge",
  /mergedCourses/.test(courseCatalog)
    && /additive-governed-merge/.test(courseCatalog)
    && /baseline-fallback/.test(courseCatalog),
);
check(
  "catalog exposes accepted and rejected Studio publication evidence",
  /acceptedStudioCourses/.test(courseCatalog)
    && /rejectedStudioCourses/.test(courseCatalog)
    && /schemaSupported/.test(courseCatalog),
);
check("catalog fails closed to live production contract", /live-production-contract/.test(courseCatalog));
check(
  "checkout uses only approved Studio records and protects overridden pricing",
  /studioCourseIsApproved\(course\.id\)/.test(checkoutRoute)
    && /useGovernedStripePrice/.test(checkoutRoute)
    && /course\.price === baseCourse\.price/.test(checkoutRoute)
    && /course\.title === baseCourse\.title/.test(checkoutRoute),
);
check(
  "checkout live fallback charges the validated website course price",
  /const amountCents = academyCourseAmountCents\(course\.price\)/.test(checkoutRoute)
    && /if \(amountCents === null\)/.test(checkoutRoute)
    && /unit_amount: amountCents/.test(checkoutRoute),
);
check("checkout live fallback uses website title", /name: course\.title/.test(checkoutRoute));
check("checkout emits catalog parity evidence", /x-obserra-catalog-parity/.test(checkoutRoute));
check(
  "checkout consults the authoritative course control plane",
  /publicAcademyCourse\(baseCourse\)/.test(checkoutRoute)
    && /runtimeCourse\.controlPlane !== "operational"/.test(checkoutRoute),
);
check(
  "checkout blocks new purchases while preserving committed entitlements",
  /!runtimeCourse\.control\.purchaseEnabled/.test(checkoutRoute)
    && /x-obserra-existing-entitlements/.test(checkoutRoute)
    && /preserved/.test(checkoutRoute),
);

check("public Academy states 60 published courses", /60 published courses/.test(academyClient));
check(
  "public Academy expands artificial intelligence before the AI abbreviation",
  /artificial intelligence \(AI\) native training/.test(academyClient),
);
check("public Academy says AI tutor requires access", /unlocked only with authorized course access/.test(academyClient));
check("public course page exposes published lesson count", /course\.modules\.length/.test(coursePage));
check("public course page exposes published duration", /\{course\.duration\}/.test(coursePage));
check("public course page exposes AI tutor after access", /Obserrian AI Tutor after authorized access/.test(coursePage));
check(
  "public course page renders the governed percent completion standard",
  /publication\.passingScore/.test(coursePage) && /percent completion standard/.test(coursePage),
);
check(
  "public course page preserves existing learner access when sales are paused",
  /Existing learner access/.test(coursePage)
    && /Existing learner access is preserved/.test(coursePage)
    && /does not revoke a learner entitlement/.test(coursePage),
);

check("assessment generates 25 questions", /Array\.from\(\{ length: 25 \}/.test(experience));
check("assessment answer keys remain server side", /finalAssessmentQuestions/.test(experience) && /finalAssessment\(body\.courseId\)/.test(assessmentRoute));
check("assessment requires Supabase authentication", /safeAcademyIdentity/.test(assessmentRoute) && /if \(!identity\.principalId/.test(assessmentRoute) && /status: 401/.test(assessmentRoute));
check("assessment requires every answer", /answers\.length !== questions\.length/.test(assessmentRoute));
check("assessment passing threshold is 80 percent", /score >= 80/.test(assessmentRoute));
check("assessment returns certificate URL only when eligible", /certificateId \? `\/academy\/certificate/.test(assessmentRoute));
check("assessment errors fail closed", /status: 400/.test(assessmentRoute));

check("lesson progress requires Supabase authentication", /safeAcademyIdentity/.test(progressRoute) && /if \(!identity\.principalId/.test(progressRoute) && /status: 401/.test(progressRoute));
check("lesson progress requires integer knowledge check answer", /checkAnswer/.test(progressRoute) && /Number\.isInteger\(body\.checkAnswer\)/.test(progressRoute));
check("lesson progress validates the server answer key", /body\.checkAnswer !== lesson\.check\.answer/.test(progressRoute));
check("lesson progress fails closed on incorrect knowledge check", /Complete the lesson knowledge check correctly/.test(progressRoute));
check("lesson progress disables caching", /private, no-store/.test(progressRoute));

check("player initializes 25 unanswered responses", /Array\(25\)\.fill\(-1\)/.test(player));
check("player blocks assessment until lessons complete", /disabled=\{!lessonsComplete\}/.test(player));
check("player blocks submission until all questions answered", /disabled=\{answers\.includes\(-1\)\}/.test(player));
check("player sends knowledge check answer with progress", /checkAnswer: checkedAnswer/.test(player));
check("player blocks lesson completion until knowledge check passes", /disabled=\{!activeLessonCompleted && !learningCheckPassed\}/.test(player));
check("player persists lesson completion through API", /fetch\("\/api\/academy\/progress"/.test(player));
check("player submits assessment through API", /fetch\("\/api\/academy\/assessment"/.test(player));
check("player exposes certificate only after certificate id", /certificateId &&/.test(player));
check("player communicates the 80 percent standard", /80%/.test(player));
check("player prevents casual copy", /onCopy=/.test(player));
check("player prevents casual cut", /onCut=/.test(player));
check("player includes learner watermark", /learner-watermark/.test(player));
check("player does not return null when assessment is active", /if \(!assessmentActive && !lesson\) return null/.test(player));
check("player exposes entitlement gated AI tutor", /Obserrian Academy Tutor/.test(player) && /\/api\/academy\/tutor/.test(player));
check("player pauses tutor during graded assessment", /Tutor is paused during the graded assessment/.test(player));
check("player presents guided lesson plan", /Guided lesson plan/.test(player));
check("player presents why this matters", /Why this matters/.test(player));
check("player presents mastery objectives", /Mastery objectives/.test(player));
check("player presents guided professional practice", /Guided professional practice/.test(player));
check("player presents professional decision rubric", /Professional decision rubric/.test(player));
check("player presents common failure modes", /Common failure modes/.test(player));
check("player presents authoritative grounding", /Authoritative grounding/.test(player));
check("player presents documented practice examples", /Documented practice example/.test(player));
check("player presents business application", /How to use this in an organization/.test(player));
check("player presents mastery criteria", /Mastery criteria/.test(player));
check("player presents reflection transfer", /Reflection and transfer/.test(player));

check("course experience requires course specific curriculum", /curriculumForCourse/.test(experience));
check("course experience uses lesson specific subjects", /curriculum\.lessonSubjects\[index\]/.test(experience));
check("course experience uses lesson specific work products", /curriculum\.workProducts\[index\]/.test(experience));
check("course experience creates five lesson objectives", /function createObjectives/.test(experience));
check("course experience creates six guided practice steps", /function createGuidedPractice/.test(experience) && /Test the recommendation/.test(experience));
check("course experience creates professional decision rubric", /function createDecisionRubric/.test(experience));
check("course experience teaches common failure modes", /function createFailureModes/.test(experience));
check("course experience defines mastery criteria", /function createMasteryCriteria/.test(experience));
check("course experience defines transfer reflection", /function createReflectionPrompts/.test(experience));
check("course experience includes guided lesson chapters", /videoChapters/.test(experience));
check("course experience includes transcripts", /transcript/.test(experience));
check("course experience includes training materials", /materials/.test(experience));
check("course experience includes observe decide act model", /observe:/.test(experience) && /decide:/.test(experience) && /act:/.test(experience));
check("course experience includes knowledge checks", /KnowledgeCheck/.test(experience));
check("course experience includes authoritative references", /authorities:/.test(experience) && /Authoritative basis/.test(experience));
check("course experience includes documented practice", /practiceExample/.test(experience));
check("course experience includes enterprise application", /businessApplication/.test(experience));
check("course descriptions preserve live non certification language", /not third-party certification material/.test(courseData));

check("Python course teaches Python fundamentals", /Python fundamentals for reliable security automation/.test(curriculum));
check("API course teaches HTTP and API contracts", /HTTP methods, resources, requests and responses/.test(curriculum));
check("Zero Trust course teaches no implicit trust", /no implicit trust based on network location/.test(curriculum));
check("LLM course teaches tokenization and transformer concepts", /tokenization, embeddings, transformer based next token prediction/.test(curriculum));
check("cloud course teaches shared responsibility", /Cloud service and deployment models, shared responsibility/.test(curriculum));
check("identity course teaches joiner mover leaver lifecycle", /joiner, mover, leaver events/.test(curriculum));
check("vulnerability course teaches CISA KEV prioritization", /CISA KEV/.test(curriculum));
check("incident course teaches enterprise crisis leadership", /difference between technical response and enterprise crisis leadership/.test(curriculum));
check("protective course preserves non tactical planning boundary", /without teaching offensive tactics/.test(curriculum));
check("insider course prohibits profiling", /avoid profiling or unsupported accusations/.test(curriculum));
check("board course teaches oversight rather than operations", /distinction between board oversight and operational management/.test(curriculum));
check("executive metrics course teaches numerator and denominator", /numerator and denominator/.test(curriculum));
check("AI native apps course teaches bounded authorization", /authorization at the action layer/.test(curriculum));
check("SSDL course teaches software supply chain controls", /protect the software supply chain/.test(curriculum));
check("data driven intelligence course teaches provenance", /Data driven risk intelligence from decision question to evidence/.test(curriculum));

check("grounding includes NIST CSF", /NIST CSF 2\.0/.test(grounding));
check("grounding includes NIST AI RMF", /NIST AI RMF 1\.0/.test(grounding));
check("grounding includes NIST SSDF", /NIST SP 800-218/.test(grounding));
check("grounding includes Zero Trust Architecture", /NIST SP 800-207/.test(grounding));
check("grounding includes current digital identity guidance", /NIST SP 800-63-4/.test(grounding));
check("grounding includes incident response guidance", /NIST SP 800-61 Rev\. 3/.test(grounding));
check("grounding includes vulnerability prioritization sources", /CISA KEV Catalog/.test(grounding));
check("grounding includes AI application security guidance", /OWASP LLM Top 10/.test(grounding));
check("grounding includes API security guidance", /OWASP API Security Top 10/.test(grounding));
check("grounding includes travel risk guidance", /ISO 31030:2021/.test(grounding));
check("grounding includes workplace safety law", /29 U\.S\.C\. § 654\(a\)\(1\)/.test(grounding));
check("grounding includes protective threat guidance", /U\.S\. Secret Service National Threat Assessment Center/.test(grounding));
check("grounding includes intelligence analytic standards", /Intelligence Community Directive 203/.test(grounding));
check("grounding includes SEC cyber disclosure requirements", /Regulation S-K Item 106/.test(grounding));
check("grounding includes public practice examples", /Google/.test(grounding) && /Equifax/.test(grounding) && /SolarWinds/.test(grounding));

check("tutor requires Supabase authentication", /safeAcademyIdentity/.test(tutorRoute) && /if \(!identity\.principalId/.test(tutorRoute) && /status: 401/.test(tutorRoute));
check("tutor requires paid entitlement", /Paid course access is required/.test(tutorRoute) && /state\.entitlements\[courseId\]/.test(tutorRoute));
check("tutor is scoped to current course", /courseForId\(courseId\)/.test(tutorRoute));
check("tutor is scoped to current lesson", /lessonBrief\(courseId, lessonIndex\)/.test(tutorRoute));
check("tutor receives mastery objectives", /Mastery objectives:/.test(tutorRoute));
check("tutor receives guided professional practice", /GUIDED PROFESSIONAL PRACTICE/.test(tutorRoute));
check("tutor receives decision quality rubric", /DECISION QUALITY RUBRIC/.test(tutorRoute));
check("tutor uses OpenAI Responses API", /https:\/\/api\.openai\.com\/v1\/responses/.test(tutorRoute));
check("tutor model is configurable", /OBSERRA_ACADEMY_AI_MODEL/.test(tutorRoute));
check("tutor uses supported GPT 5.1 fallback", /\|\| "gpt-5\.1"/.test(tutorRoute));
check("tutor disables response storage", /store: false/.test(tutorRoute));
check("tutor fails closed without API key", /OPENAI_API_KEY/.test(tutorRoute) && /status: 503/.test(tutorRoute));
check("tutor protects graded assessment integrity", /Do not provide answers to the course's graded final assessment/.test(tutorRoute));
check("tutor limits question length", /question\.length > 1400/.test(tutorRoute));
check("tutor disables caching", /private, no-store/.test(tutorRoute));
check("learner layout loads AI native styles", /ai-native-learning\.css/.test(learnerLayout));

check("package exposes build command", typeof packageJson.scripts?.build === "string");
check("package exposes lint command", typeof packageJson.scripts?.lint === "string");
check("package exposes test command", typeof packageJson.scripts?.test === "string");
check("package uses patched Next 16.3.1", packageJson.dependencies?.next === "16.3.1");
check("package uses matching eslint config 16.3.1", packageJson.devDependencies?.["eslint-config-next"] === "16.3.1");
check("package uses React 19", /^19\./.test(packageJson.dependencies?.react ?? ""));
check("package uses Stripe SDK", Boolean(packageJson.dependencies?.stripe));
check("package uses Clerk", Boolean(packageJson.dependencies?.["@clerk/nextjs"]));

const failed = assertions.filter((item) => !item.passed);
console.log(`Academy production gate evaluated ${assertions.length} independent assertions.`);
for (const item of assertions) console.log(`${item.passed ? "PASS" : "FAIL"} ${item.name}`);
if (assertions.length < 100) {
  console.error(`Gate is undersized: ${assertions.length} assertions.`);
  process.exit(1);
}
if (failed.length > 0) {
  console.error(`${failed.length} Academy production assertions failed.`);
  process.exit(1);
}
console.log("Academy production gate passed.");
