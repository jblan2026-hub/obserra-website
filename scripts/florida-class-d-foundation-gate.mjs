import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const courseSource = read("lib/florida-class-d.ts");
const publicPage = read("app/florida-security-training/page.tsx");
const header = read("app/HomeHeader.tsx");

const failures = [];
const gate = (name, assertion) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}: ${error.message}`);
  }
};

const expectedModules = [
  [1, "Legal Aspects of Private Security", 6],
  [2, "Role of Private Security Officers", 2],
  [3, "Security Officer Conduct", 3],
  [4, "Principles of Communications", 2],
  [5, "Observation and Incident Reporting", 4],
  [6, "Principles of Access Control", 1],
  [7, "Patrols", 1],
  [8, "Principles of Safeguarding Information", 1],
  [9, "Physical Security", 1],
  [10, "Interviewing Techniques", 1],
  [11, "Emergency Preparedness", 1.5],
  [12, "Safety Awareness", 2.5],
  [13, "Medical Emergencies", 4.5],
  [14, "Terrorism", 2.5],
  [15, "Event Security and Special Assignments", 1],
  [16, "Communications Systems", 1],
  [17, "Special Issues", 4],
  [18, "Introduction to Weapons", 1],
];

const moduleRows = [...courseSource.matchAll(/\{ id: (\d+), title: "([^"]+)", hours: ([\d.]+), day: (\d), assessment: "([^"]+)" \}/g)]
  .map((match) => ({
    id: Number(match[1]),
    title: match[2],
    hours: Number(match[3]),
    day: Number(match[4]),
    assessment: match[5],
  }));

gate("provider identity is canonical", () => {
  assert.match(courseSource, /provider: "Obserra Executive Protection & Intelligence LLC"/);
});

gate("course remains fail-closed and coming soon", () => {
  assert.match(courseSource, /status: "coming-soon"/);
  assert.match(publicPage, /COMING SOON · LMS IN PROGRESS/);
  assert.match(publicPage, /Enrollment and payment are not yet enabled/);
  assert.doesNotMatch(publicPage, /Buy now|Purchase now|Enroll now|checkout/i);
});

gate("Florida Training navigation is present", () => {
  assert.match(header, /label: "Florida Training", href: "\/florida-security-training"/);
});

gate("course metadata fixes five days and forty instructional hours", () => {
  assert.match(courseSource, /instructionalHours: 40/);
  assert.match(courseSource, /instructionalDays: 5/);
  assert.match(courseSource, /hoursPerDay: 8/);
});

gate("all eighteen controlled curriculum modules are present in order", () => {
  assert.equal(moduleRows.length, 18);
  assert.deepEqual(
    moduleRows.map(({ id, title, hours }) => [id, title, hours]),
    expectedModules,
  );
});

gate("module hours total exactly forty", () => {
  assert.equal(moduleRows.reduce((sum, module) => sum + module.hours, 0), 40);
});

gate("every module has a learning check or applied assessment", () => {
  assert.equal(moduleRows.filter((module) => module.assessment.trim().length > 0).length, 18);
});

gate("certification exam is separately controlled", () => {
  assert.match(courseSource, /examQuestions: 170/);
  assert.match(courseSource, /passingCorrectAnswers: 128/);
  assert.match(publicPage, /certification examination is controlled separately from the 40 instructional hours/i);
});

gate("licensure and approval are not misrepresented", () => {
  assert.match(publicPage, /Completing training does not itself issue a Florida Class D Security Officer license/);
  assert.match(publicPage, /will not represent this course as state-approved until the applicable approval process is complete/);
});

gate("regulated LMS lifecycle declares required administrative controls", () => {
  const requiredPhrases = [
    "identity-verification",
    "automatic course entitlement",
    "Instructional-time and attendance evidence",
    "automatic remediation routing",
    "Controlled 170-question certification examination",
    "Pass/fail, retest, and instructor-review workflow",
    "FDACS/LIAS reporting queue",
    "Inspection-ready student records",
    "Quality analytics",
  ];
  for (const phrase of requiredPhrases) assert.match(courseSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

if (failures.length) {
  console.error(`\nFlorida Class D foundation gate failed: ${failures.length} control(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("\nFlorida Class D foundation gate PASSED. Public release remains intentionally locked.");
}
