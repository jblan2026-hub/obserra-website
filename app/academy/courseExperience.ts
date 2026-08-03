import { courses } from "./courseData";

export type KnowledgeCheck = { question: string; options: string[]; answer: number; explanation: string };

const principles = [
  ["Pause and establish the decision context before acting.", "Act immediately on the first incomplete signal.", "Treat urgency as proof that a request is legitimate.", "Skip documentation to save time."],
  ["Use trusted evidence and verify material claims before escalation.", "Rely on the most confident sounding source.", "Share sensitive context broadly so everyone can help.", "Assume an existing process covers every exception."],
  ["Apply the assigned authority and documented control path.", "Let the most senior available person improvise a decision.", "Bypass the control when the task feels routine.", "Delay every decision until perfect information exists."],
  ["Record the decision, evidence, and next action for accountable follow through.", "Keep decisions informal so they remain flexible.", "Delete notes after the immediate task ends.", "Treat the outcome as sufficient evidence by itself."],
  ["Escalate the change when risk, impact, or uncertainty exceeds the stated boundary.", "Keep changes local to avoid involving others.", "Make permanent exceptions during urgent work.", "Wait until the next scheduled review regardless of impact."],
];

export function lessonBrief(courseId: string, index: number) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return null;
  const module = course.modules[index];
  if (!module) return null;
  const outcome = course.outcomes[index % course.outcomes.length];
  return {
    title: module.title,
    format: module.format,
    focus: `In this guided ${module.format.toLowerCase()}, you will apply ${course.track.toLowerCase()} judgment to ${outcome.toLowerCase()}.`,
    observe: `Observe the business context, the people affected, and the facts that would change the decision. ${course.description}`,
    decide: `Choose a proportionate action that preserves accountability, privacy, and operational continuity. Do not substitute speed for verification.`,
    act: `Record the rationale, route the decision through the right owner, and communicate the next safe action in clear terms.`,
    check: {
      question: `Which approach best reflects the ${module.title.toLowerCase()} lesson?`,
      options: principles[index % principles.length],
      answer: 0,
      explanation: "Obserra Academy instruction emphasizes evidence, accountable authority, and proportionate action.",
    } satisfies KnowledgeCheck,
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
      explanation: "The correct response follows the course method: verify, apply authority, preserve evidence, and communicate the next accountable action.",
    };
  });
}
