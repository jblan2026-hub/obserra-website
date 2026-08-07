import { courses } from "./courseData";
import {
  groundingForCourse,
  type AuthorityReference,
  type PracticeExample,
} from "./courseGrounding";

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

export type InstructionSection = {
  heading: string;
  body: string;
  application: string;
};

export type LessonBrief = {
  title: string;
  format: string;
  focus: string;
  whyItMatters: string;
  observe: string;
  decide: string;
  act: string;
  instruction: InstructionSection[];
  authorities: AuthorityReference[];
  practiceExample: PracticeExample;
  businessApplication: string[];
  scenario: string;
  videoTitle: string;
  videoDuration: string;
  videoChapters: VideoChapter[];
  transcript: string[];
  materials: TrainingMaterial[];
  check: KnowledgeCheck;
};

const phaseNames = [
  "decision context",
  "evidence and risk",
  "control and authority",
  "scenario practice",
  "action and improvement",
] as const;

function minutesFromDuration(duration: string) {
  const parsed = Number.parseInt(duration, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function chapterTimestamp(totalMinutes: number, index: number, chapterCount: number) {
  const minute = Math.max(0, Math.floor((totalMinutes / chapterCount) * index));
  return `${String(minute).padStart(2, "0")}:00`;
}

function focusFromDescription(description: string) {
  const match = description.match(/focused on (.+?)\. It uses/i);
  return match?.[1] ?? description;
}

function phaseInstruction(
  courseTitle: string,
  focus: string,
  outcome: string,
  moduleTitle: string,
  phaseIndex: number,
  authorities: readonly AuthorityReference[],
): InstructionSection[] {
  const primary = authorities[0];
  const secondary = authorities[1] ?? authorities[0];
  const phase = phaseNames[phaseIndex] ?? "professional application";

  const phaseBody = [
    `Professional work begins by defining the decision before selecting a control or action. In ${courseTitle}, ${focus} must be connected to a business objective, the people or assets affected, the decision owner, the acceptable level of risk, and the consequence of getting the decision wrong. The learner should be able to explain the issue in language that an operational leader can act on, not merely repeat technical terminology.`,
    `Evidence quality determines whether a risk decision is defensible. For ${focus}, learners should distinguish verified facts, assumptions, indicators, estimates, and unknowns. Evidence should be evaluated for source reliability, freshness, scope, relevance, and whether another source can corroborate the conclusion. The goal is not perfect certainty. The goal is an explicit level of confidence that supports a proportionate decision.`,
    `Controls only work when authority, ownership, and verification are clear. During ${moduleTitle}, learners identify who may approve an action, which policy or standard governs it, what evidence proves the control operated, and what condition requires escalation. A mature organization avoids both uncontrolled improvisation and bureaucratic paralysis by defining decision rights before pressure arrives.`,
    `Scenario practice converts concepts into judgment. Learners should examine competing priorities, incomplete information, time pressure, stakeholder impact, and second order consequences. The strongest answer is the one that remains lawful, evidence based, proportionate, operationally realistic, and reviewable after the event.`,
    `Improvement is part of the control, not an afterthought. Learners should translate ${focus} into repeatable operating practices, measurable outcomes, named ownership, review cadence, exception handling, and evidence retention. The final question is whether the organization can show that the decision reduced risk or improved performance without creating unacceptable new exposure.`,
  ][phaseIndex] ?? `Apply ${focus} using explicit evidence, accountable authority, proportionate action, and measurable follow through.`;

  return [
    {
      heading: "Professional concept",
      body: phaseBody,
      application: `Use this concept to ${outcome.toLowerCase()} while preserving business context, accountability, and a clear record of why the decision was made.`,
    },
    {
      heading: "Authoritative basis",
      body: `${primary.reference}, published by ${primary.publisher}, is directly relevant to this lesson. ${primary.whyItMatters} ${secondary.reference} adds a second authoritative lens so the learner can compare the course method with established professional expectations rather than relying on unsupported opinion.`,
      application: `When applying the lesson, identify which requirement, control objective, risk principle, or governance expectation from ${primary.reference} supports the proposed action and record that connection in the decision evidence.`,
    },
    {
      heading: "How the work is performed",
      body: `A practitioner working in ${phase} should begin with the stated objective, collect the minimum evidence needed to understand the issue, identify the accountable owner, compare available options, select a proportionate response, and define how the result will be verified. This sequence keeps ${focus} connected to real operating decisions instead of turning the lesson into passive awareness training.`,
      application: `Produce a concise decision record containing the objective, facts, assumptions, authority, selected action, owner, due date, success measure, escalation trigger, and unresolved limitation.`,
    },
    {
      heading: "Business translation",
      body: `In a business environment, ${focus} affects cost, continuity, trust, regulatory exposure, workforce behavior, customer impact, and executive confidence. The professional must therefore translate technical or operational findings into choices leaders can compare. The recommendation should state the expected benefit, implementation burden, residual risk, dependencies, and what evidence would cause the recommendation to change.`,
      application: `Brief the decision in three layers: what happened or may happen, why it matters to the organization, and what accountable next action should occur now.`,
    },
  ];
}

function createVideoChapters(
  courseTitle: string,
  moduleTitle: string,
  focus: string,
  totalMinutes: number,
  instruction: readonly InstructionSection[],
  example: PracticeExample,
): VideoChapter[] {
  const chapterContent = [
    ["Course mission", `Welcome to ${courseTitle}. This lesson focuses on ${focus} and the professional decision represented by ${moduleTitle}.`],
    [instruction[0]?.heading ?? "Professional concept", instruction[0]?.body ?? "Establish the decision context before acting."],
    [instruction[1]?.heading ?? "Authoritative basis", instruction[1]?.body ?? "Use authoritative sources to support the decision."],
    ["Documented practice example", `${example.organization}: ${example.summary} The operational lesson is: ${example.takeaway}`],
    [instruction[2]?.heading ?? "Professional method", instruction[2]?.body ?? "Apply a repeatable professional method."],
    [instruction[3]?.heading ?? "Business translation", instruction[3]?.body ?? "Translate the lesson into a business decision."],
    ["Applied scenario", `Work the lesson as a realistic ${focus} decision. Identify facts, uncertainty, authority, options, consequences, the accountable owner, and the evidence required to verify the outcome.`],
    ["Operational takeaway", `Close the lesson by documenting the next action, success measure, escalation threshold, and one improvement that should be incorporated into the operating process.`],
  ] as const;

  return chapterContent.map(([title, narration], index) => ({
    timestamp: chapterTimestamp(totalMinutes, index, chapterContent.length),
    title,
    narration,
  }));
}

function createMaterials(
  courseTitle: string,
  moduleTitle: string,
  focus: string,
  outcome: string,
  authorities: readonly AuthorityReference[],
  example: PracticeExample,
): TrainingMaterial[] {
  return [
    {
      title: "Professional lesson brief",
      purpose: "Use this brief to prepare for the lesson and retain the decision model after completion.",
      content: [
        `Course: ${courseTitle}`,
        `Lesson: ${moduleTitle}`,
        `Published focus: ${focus}`,
        `Learning outcome: ${outcome}`,
        `Documented example: ${example.organization}, ${example.title}`,
      ],
    },
    {
      title: "Authority and standards reference sheet",
      purpose: "Use these primary and authoritative references to understand why the lesson is taught and what established practice supports it.",
      content: authorities.map((authority) => `${authority.reference}: ${authority.whyItMatters} Source: ${authority.url}`),
    },
    {
      title: "Evidence and decision worksheet",
      purpose: "Use this worksheet during the scenario to document evidence, authority, actions, and escalation triggers.",
      content: [
        "Objective: What business, mission, safety, security, privacy, or governance outcome must be protected?",
        "Evidence: Which facts are verified, what is assumed, what is unknown, and how fresh are the sources?",
        "Authority: Who owns the decision, what policy or obligation applies, and what approval is required?",
        "Options: What alternatives exist and what are their cost, impact, dependencies, and residual risks?",
        "Action: What is the next proportionate step, who owns it, and when must it be completed?",
        "Verification: What evidence will prove the action worked and what condition requires escalation?",
      ],
    },
    {
      title: "Business implementation job aid",
      purpose: "Use this after the course to apply the lesson inside an organization.",
      content: [
        "Translate the issue into business impact and decision language.",
        "Cite the relevant standard, regulation, law, policy, or recognized professional guidance.",
        "Name the accountable owner and required approver before execution.",
        "Preserve evidence, assumptions, confidence, limitations, and the decision rationale.",
        "Measure the result and update the process when outcomes or evidence change.",
      ],
    },
  ];
}

function rotateOptions(correct: string, distractors: readonly string[], seed: number) {
  const answer = Math.abs(seed) % 4;
  const options = [...distractors.slice(0, 3)];
  options.splice(answer, 0, correct);
  return { options, answer };
}

function createKnowledgeCheck(
  courseId: string,
  moduleTitle: string,
  focus: string,
  outcome: string,
  authority: AuthorityReference,
  index: number,
): KnowledgeCheck {
  const correct = `Verify the material facts, connect the decision to ${authority.reference}, apply the assigned authority, document the rationale, and define how the outcome will be verified.`;
  const distractors = [
    "Choose the fastest available action, then reconstruct the rationale after the issue is closed.",
    "Rely on the most confident stakeholder and treat urgency as sufficient evidence for the decision.",
    "Delay action until every uncertainty is eliminated, even when the current risk exceeds the stated tolerance.",
  ];
  const { options, answer } = rotateOptions(correct, distractors, courseId.length + moduleTitle.length + index);
  return {
    question: `During ${moduleTitle.toLowerCase()}, which approach most defensibly applies ${focus} so the learner can ${outcome.toLowerCase()}?`,
    options,
    answer,
    explanation: `The preferred response uses verified evidence, accountable authority, a recognized professional basis such as ${authority.reference}, proportionate action, and explicit verification. Those elements make the decision safer to execute and easier to defend, audit, and improve.`,
  };
}

export function lessonBrief(courseId: string, index: number): LessonBrief | null {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return null;
  const module = course.modules[index];
  if (!module) return null;

  const focus = focusFromDescription(course.description);
  const outcome = course.outcomes[index % course.outcomes.length];
  const totalMinutes = minutesFromDuration(module.duration);
  const grounding = groundingForCourse(course);
  const instruction = phaseInstruction(course.title, focus, outcome, module.title, index, grounding.authorities);
  const videoChapters = createVideoChapters(course.title, module.title, focus, totalMinutes, instruction, grounding.example);
  const primaryAuthority = grounding.authorities[0];

  return {
    title: module.title,
    format: module.format,
    focus: `This ${module.format.toLowerCase()} teaches the exact published course focus: ${focus}. The learner is expected to ${outcome.toLowerCase()}.`,
    whyItMatters: `${focus} matters because poor decisions in this area can create operational disruption, financial loss, safety or security exposure, regulatory or contractual consequences, and loss of stakeholder trust. This lesson connects the published Obserra course objective to recognized professional guidance and a practical operating method.`,
    observe: `Establish the decision context first. Identify the business objective, people and assets affected, verified facts, assumptions, uncertainty, existing safeguards, and the evidence that would materially change the decision.`,
    decide: `Compare the available options against the assigned authority, risk tolerance, stakeholder impact, and the relevant guidance in ${primaryAuthority.reference}. Select the most proportionate action and state the residual risk that remains after the decision.`,
    act: `Assign an accountable owner, execute through the approved process, preserve the evidence and rationale, communicate the next safe action, and define what evidence will verify that the intended outcome was achieved.`,
    instruction,
    authorities: [...grounding.authorities],
    practiceExample: grounding.example,
    businessApplication: [
      `Frame ${focus} as a business decision with a named owner and desired outcome.`,
      `Use ${primaryAuthority.reference} and the other listed authorities to justify the control, governance, or operating approach.`,
      "Convert findings into options with impact, effort, dependencies, residual risk, and measurable success criteria.",
      "Document the decision, implement the approved action, verify the result, and feed lessons learned into policy, process, architecture, or training.",
    ],
    scenario: `You are responsible for advising an organization on ${focus}. Evidence is incomplete, stakeholders disagree on urgency, and the decision has operational consequences. Build a recommendation that separates facts from assumptions, cites the relevant authoritative basis, identifies the accountable owner, compares at least two realistic options, and defines how the chosen action will be verified.`,
    videoTitle: `${module.title}: Guided Obserra Academy Instruction`,
    videoDuration: module.duration,
    videoChapters,
    transcript: videoChapters.map((chapter) => `${chapter.timestamp} — ${chapter.title}. ${chapter.narration}`),
    materials: createMaterials(course.title, module.title, focus, outcome, grounding.authorities, grounding.example),
    check: createKnowledgeCheck(course.id, module.title, focus, outcome, primaryAuthority, index),
  };
}

const assessmentLenses = [
  "evidence quality and uncertainty",
  "authority and governance",
  "business impact and trade offs",
  "implementation and verification",
  "continuous improvement and accountability",
] as const;

export function finalAssessment(courseId: string): KnowledgeCheck[] {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];

  const grounding = groundingForCourse(course);
  const focus = focusFromDescription(course.description);

  return Array.from({ length: 25 }, (_, index) => {
    const moduleIndex = index % course.modules.length;
    const module = course.modules[moduleIndex];
    const outcome = course.outcomes[index % course.outcomes.length];
    const authority = grounding.authorities[index % grounding.authorities.length];
    const lens = assessmentLenses[Math.floor(index / course.modules.length) % assessmentLenses.length];
    const correct = `Use current evidence to frame the ${lens} issue, connect the recommendation to ${authority.reference}, identify the accountable decision owner, select a proportionate action, and define verification and escalation criteria.`;
    const distractors = [
      "Choose the least expensive option first and use the final outcome as the only evidence that the decision was appropriate.",
      "Escalate immediately to the highest level of leadership without first clarifying facts, authority, or the specific decision required.",
      "Wait for complete certainty before taking any action, even when established thresholds require a timely and proportionate response.",
    ];
    const { options, answer } = rotateOptions(correct, distractors, course.id.length + index * 7 + module.title.length);
    return {
      question: `${String(index + 1).padStart(2, "0")}. In a ${module.title.toLowerCase()} situation involving ${focus}, which response best demonstrates ${lens} while helping the learner ${outcome.toLowerCase()}?`,
      options,
      answer,
      explanation: `The strongest response combines evidence, accountable decision rights, ${authority.reference}, proportionate action, and verification. That combination reflects the course objective and creates a decision record that can be reviewed and improved.`,
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
