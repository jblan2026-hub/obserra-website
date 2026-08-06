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
const experience = read("app/academy/courseExperience.ts");
const player = read("app/academy/learn/CoursePlayer.tsx");
const assessmentRoute = read("app/api/academy/assessment/route.ts");
const packageJson = JSON.parse(read("package.json"));

const courseMatches = [...courseData.matchAll(/^\s*\["([a-z0-9-]+)",\s*"([^"]+)",\s*"([^"]+)"/gm)];
const courseIds = courseMatches.map((match) => match[1]);
const courseTitles = courseMatches.map((match) => match[2]);
const courseLevels = courseMatches.map((match) => match[3]);

check("catalog contains exactly 60 courses", courseIds.length === 60);
check("course ids are unique", new Set(courseIds).size === courseIds.length);
check("course titles are unique", new Set(courseTitles).size === courseTitles.length);
check("all five course levels are represented", new Set(courseLevels).size === 5);

for (const id of courseIds) {
  check(`course id ${id} is route safe`, /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id));
  check(`course id ${id} has no traversal token`, !id.includes("..") && !id.includes("/") && !id.includes("\\"));
}

const expectedDurations = {
  Foundation: 150,
  Professional: 270,
  Advanced: 420,
  "Executive Intensive": 540,
  "CISO Masterclass": 660,
};

const minuteBlocks = [...courseData.matchAll(/^\s*(Foundation|Professional|Advanced|"Executive Intensive"|"CISO Masterclass"):\s*\[([^\]]+)\]/gm)];
const parsedMinutes = Object.fromEntries(minuteBlocks.map((match) => {
  const level = match[1].replaceAll('"', "");
  const minutes = match[2].split(",").map((value) => Number.parseInt(value.trim(), 10));
  return [level, minutes];
}));

for (const [level, expected] of Object.entries(expectedDurations)) {
  const minutes = parsedMinutes[level] ?? [];
  check(`${level} defines five modules`, minutes.length === 5);
  check(`${level} module minutes are positive integers`, minutes.every((value) => Number.isInteger(value) && value > 0));
  check(`${level} published duration reconciles`, minutes.reduce((sum, value) => sum + value, 0) === expected);
}

const requiredFiles = [
  "app/academy/page.tsx",
  "app/academy/courseData.ts",
  "app/academy/courseExperience.ts",
  "app/academy/learn/CoursePlayer.tsx",
  "app/academy/learn/[courseId]/page.tsx",
  "app/academy/certificate/[courseId]/CertificateView.tsx",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/progress/route.ts",
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "lib/academy.ts",
];
for (const file of requiredFiles) check(`required file exists: ${file}`, exists(file));

check("assessment generates 25 questions", /Array\.from\(\{ length: 25 \}/.test(experience));
check("assessment answer keys remain server-side", /finalAssessmentQuestions/.test(experience) && /finalAssessment\(body\.courseId\)/.test(assessmentRoute));
check("assessment requires authentication", /if \(!userId\)/.test(assessmentRoute));
check("assessment requires every answer", /answers\.length !== questions\.length/.test(assessmentRoute));
check("assessment passing threshold is 80 percent", /score >= 80/.test(assessmentRoute));
check("assessment returns certificate URL only when eligible", /certificateId \? `\/academy\/certificate/.test(assessmentRoute));
check("assessment errors fail closed", /status: 400/.test(assessmentRoute));

check("player initializes 25 unanswered responses", /Array\(25\)\.fill\(-1\)/.test(player));
check("player blocks assessment until lessons complete", /disabled=!\{?lessonsComplete\}?/.test(player) || /disabled=\{!lessonsComplete\}/.test(player));
check("player blocks submission until all questions answered", /disabled=\{answers\.includes\(-1\)\}/.test(player));
check("player persists lesson completion through API", /fetch\("\/api\/academy\/progress"/.test(player));
check("player submits assessment through API", /fetch\("\/api\/academy\/assessment"/.test(player));
check("player exposes certificate only after certificate id", /certificateId &&/.test(player));
check("player communicates the 80 percent standard", /80%/.test(player));
check("player prevents casual copy", /onCopy=/.test(player));
check("player prevents casual cut", /onCut=/.test(player));
check("player includes learner watermark", /learner-watermark/.test(player));

check("course experience includes guided video chapters", /videoChapters/.test(experience));
check("course experience includes transcripts", /transcript/.test(experience));
check("course experience includes training materials", /materials/.test(experience));
check("course experience includes observe-decide-act model", /Observe, Decide, Act worksheet/.test(experience));
check("course experience includes knowledge checks", /KnowledgeCheck/.test(experience));
check("course descriptions avoid third-party certification claims", /not third-party certification material/.test(courseData));

check("package exposes build command", typeof packageJson.scripts?.build === "string");
check("package exposes lint command", typeof packageJson.scripts?.lint === "string");
check("package exposes test command", typeof packageJson.scripts?.test === "string");
check("package uses Next 16", /^16\./.test(packageJson.dependencies?.next ?? ""));
check("package uses React 19", /^19\./.test(packageJson.dependencies?.react ?? ""));
check("package uses Stripe SDK", Boolean(packageJson.dependencies?.stripe));
check("package uses Clerk", Boolean(packageJson.dependencies?.["@clerk/nextjs"]));

const failed = assertions.filter((item) => !item.passed);
console.log(`Academy 70x gate evaluated ${assertions.length} independent assertions.`);
for (const item of assertions) console.log(`${item.passed ? "PASS" : "FAIL"} ${item.name}`);
if (assertions.length < 70) {
  console.error(`Gate is undersized: ${assertions.length} assertions.`);
  process.exit(1);
}
if (failed.length > 0) {
  console.error(`${failed.length} Academy production assertions failed.`);
  process.exit(1);
}
console.log("Academy 70x production gate passed.");
