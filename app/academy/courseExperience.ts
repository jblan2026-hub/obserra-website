import { courses } from "./courseData";

export type KnowledgeCheck = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type AssessmentQuestion = Pick<KnowledgeCheck, "question" | "options">;

export type VideoChapter = {
  timestamp: string;
  title: string;
  narration: string;
};

export type TrainingMaterial = {
  title: string;
  purpose: string;
  content: string[];
};

export type LessonBrief = {
  title: string;
  format: string;
  focus: string;
  observe: string;
  decide: string;
  act: string;
  videoTitle: string;
  videoDuration: string;
  videoChapters: VideoChapter[];
  transcript: string[];
  materials: TrainingMaterial[];
  check: KnowledgeCheck;
};

const principles = [
  [
    "Pause and establish the decision context before acting.",
    "Act immediately on the first incomplete signal.",
    "Treat urgency as proof that a request is legitimate.",
    "Skip documentation to save time.",
  ],
  [
    "Use trusted evidence and verify material claims before escalation.",
    "Rely on the most confident sounding source.",
    "Share sensitive context broadly so everyone can help.",
    "Assume an existing process covers every exception.",
  ],
  [
    "Apply the assigned authority and documented control path.",
    "Let the most senior available person improvise a decision.",
    "Bypass the control when the task feels routine.",
    "Delay every decision until perfect information exists.",
  ],
  [
    "Record the decision, evidence, and next action for accountable follow through.",
    "Keep decisions informal so they remain flexible.",
    "Delete notes after the immediate task ends.",
    "Treat the outcome as sufficient evidence by itself.",
  ],
  [
    "Escalate the change when risk, impact, or uncertainty exceeds the stated boundary.",
    "Keep changes local to avoid involving others.",
    "Make permanent exceptions during urgent work.",
    "Wait until the next scheduled review regardless of impact.",
  ],
];

function minutesFromDuration(duration: string) {
  const parsed = Number.parseInt(duration, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function chapterTimestamp(totalMinutes: number, index: number) {
  const minute = Math.max(0, Math.floor((totalMinutes / 5) * index));
  return `${String(minute).padStart(2, "0")}:00`;
}

function createVideoChapters(courseTitle: string, moduleTitle: string, focus: string, totalMinutes: number): VideoChapter[] {
  const chapterContent = [
    ["Mission context", `Welcome to ${courseTitle}. This chapter establishes why ${focus} matters and identifies the decision that the learner must be prepared to make.`],
    ["Evidence briefing", `Review the facts, assumptions, stakeholders, and warning indicators connected to ${moduleTitle.toLowerCase()}. Separate verified evidence from interpretation.`],
    ["Decision model", "Apply the Obserra method: observe the environment, decide within assigned authority, and act with proportionate controls and clear accountability."],
    ["Scenario walkthrough", `Work through a realistic ${focus} scenario. Compare available options, identify second-order consequences, and select the most defensible response.`],
    ["Operational takeaway", "Translate the lesson into a documented next action, an accountable owner, a measurable result, and a defined escalation threshold."],
  ] as const;

  return chapterContent.map(([title, narration], index) => ({
    timestamp: chapterTimestamp(totalMinutes, index),
    title,
    narration,
  }));
}

function createMaterials(courseTitle: string, moduleTitle: string, focus: string, outcome: string): TrainingMaterial[] {
  return [
    {
      title: "Executive lesson brief",
      purpose: "Use this one-page brief to prepare for the guided lesson and retain the core decision model.",
      content: [
        `Course: ${courseTitle}`,
        `Lesson: ${moduleTitle}`,
        `Primary focus: ${focus}`,
        `Required outcome: ${outcome}`,
      ],
    },
    {
      title: "Observe, Decide, Act worksheet",
      purpose: "Use this worksheet during the scenario to document evidence, authority, actions, and escalation triggers.",
      content: [
        "Observe: What facts are verified, what remains uncertain, and who is affected?",
        "Decide: What authority applies, what options exist, and what trade-offs must be accepted?",
        "Act: What is the next safe action, who owns it, and how will success be measured?",
        "Escalate: What condition requires additional authority or a change in response?",
      ],
    },
    {
      title: "Operational job aid",
      purpose: "Use this field-ready checklist after the course to support consistent execution.",
      content: [
        "Confirm the decision context before action.",
        "Validate material evidence through trusted sources.",
        "Apply least privilege and the assigned decision authority.",
        "Record the rationale, owner, deadline, and expected outcome.",
        "Review results and update the operating approach when evidence changes.",
      ],
    },
  ];
}

export function lessonBrief(courseId: string, index: number): LessonBrief | null {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return null;
  const module = course.modules[index];
  if (!module) return null;

  const outcome = course.outcomes[index % course.outcomes.length];
  const totalMinutes = minutesFromDuration(module.duration);
  const videoChapters = createVideoChapters(course.title, module.title, module.description, totalMinutes);

  return {
    title: module.title,
    format: module.format,
    focus: `In this guided ${module.format.toLowerCase()}, you will apply ${course.track.toLowerCase()} judgment to ${outcome.toLowerCase()}.`,
    observe: `Observe the business context, the people affected, and the facts that would change the decision. ${course.description}`,
    decide: "Choose a proportionate action that preserves accountability, privacy, safety, and operational continuity. Do not substitute speed for verification.",
    act: "Record the rationale, route the decision through the right owner, communicate the next safe action, and define the evidence required to close the issue.",
    videoTitle: `${module.title}: Guided Obserra Video Lesson`,
    videoDuration: module.duration,
    videoChapters,
    transcript: videoChapters.map((chapter) => `${chapter.timestamp} — ${chapter.title}. ${chapter.narration}`),
    materials: createMaterials(course.title, module.title, module.description, outcome),
    check: {
      question: `Which approach best reflects the ${module.title.toLowerCase()} lesson?`,
      options: principles[index % principles.length],
      answer: 0,
      explanation: "Obserra Academy instruction emphasizes verified evidence, accountable authority, proportionate action, and documented follow through.",
    },
  };
}

export function finalAssessment(courseId: string): KnowledgeCheck[] {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];

  return Array.from({ length: 25 }, (_, index) => {
    const module = course.modules[index % course.modules.length];
    const outcome = course.outcomes[index % course.outcomes.length];
    const answerSet = principles[index % principles.length];
    return {
      question: `${String(index + 1).padStart(2, "0")}. During ${module.title.toLowerCase()}, what is the most defensible next step to ${outcome.toLowerCase()}?`,
      options: answerSet,
      answer: 0,
      explanation: "The correct response follows the course method: verify, apply authority, preserve evidence, act proportionately, and communicate the next accountable action.",
    };
  });
}

/**
 * The client receives only question text and choices. Answer keys remain in
 * the server-only assessment route, which is the authoritative scorer.
 */
export function finalAssessmentQuestions(courseId: string): AssessmentQuestion[] {
  return finalAssessment(courseId).map(({ question, options }) => ({ question, options }));
}
