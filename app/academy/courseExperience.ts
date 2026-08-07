import { curriculumForCourse } from "./courseCurriculum";
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

export type GuidedPracticeStep = {
  title: string;
  instruction: string;
  evidence: string;
};

export type DecisionRubricRow = {
  criterion: string;
  strong: string;
  weak: string;
};

export type FailureMode = {
  pattern: string;
  whyItFails: string;
  correction: string;
};

export type LessonBrief = {
  title: string;
  format: string;
  focus: string;
  whyItMatters: string;
  objectives: string[];
  observe: string;
  decide: string;
  act: string;
  instruction: InstructionSection[];
  guidedPractice: GuidedPracticeStep[];
  decisionRubric: DecisionRubricRow[];
  failureModes: FailureMode[];
  masteryCriteria: string[];
  reflectionPrompts: string[];
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

function phaseInstruction({
  courseTitle,
  focus,
  outcome,
  moduleTitle,
  phaseIndex,
  subject,
  workProduct,
  authorities,
}: {
  courseTitle: string;
  focus: string;
  outcome: string;
  moduleTitle: string;
  phaseIndex: number;
  subject: string;
  workProduct: string;
  authorities: readonly AuthorityReference[];
}): InstructionSection[] {
  const primary = authorities[0];
  const secondary = authorities[1] ?? authorities[0];
  const phase = phaseNames[phaseIndex] ?? "professional application";

  return [
    {
      heading: "Professional concept",
      body: `${subject} This is the substantive subject matter for ${moduleTitle} within ${courseTitle}. The learner should be able to explain the concept in the context of ${focus}, recognize where it changes a real decision, and distinguish the underlying professional method from a memorized definition.`,
      application: `Apply the concept by producing a ${workProduct}. The work product should show how the learner can ${outcome.toLowerCase()} using the subject taught in this lesson rather than generic risk language.`,
    },
    {
      heading: "Authoritative basis",
      body: `${primary.reference}, published by ${primary.publisher}, is directly relevant to this lesson. ${primary.whyItMatters} ${secondary.reference} provides an additional authoritative lens. The course uses these references to explain why the lesson matters and to separate established requirements or recognized guidance from Obserra teaching examples and organizational choices.`,
      application: `In the ${workProduct}, identify the specific requirement, control objective, governance principle, professional expectation, or risk management concept from ${primary.reference} that supports the recommendation. If the source is guidance rather than law, label it accurately instead of presenting it as a legal mandate.`,
    },
    {
      heading: "How the work is performed",
      body: `During the ${phase} phase, a practitioner begins with the stated objective, applies the lesson subject, gathers the minimum reliable evidence needed to understand the issue, identifies the authorized decision owner, compares realistic options, selects a proportionate response, and defines verification. The process must preserve facts, assumptions, confidence, limitations, dependencies, and escalation triggers so another qualified professional can review the reasoning.`,
      application: `Build the ${workProduct} with an objective, relevant evidence, key assumptions, authority, options considered, selected action, owner, due date, success measure, escalation trigger, residual risk, and unresolved limitation.`,
    },
    {
      heading: "Business translation",
      body: `The lesson must be usable inside an organization. Translate ${subject.toLowerCase()} into business consequences such as continuity, cost, safety, customer impact, regulatory or contractual exposure, workforce behavior, trust, delivery speed, and executive accountability. Explain not only what should be done, but who must decide, what the implementation burden is, what could fail, and what evidence will show whether the action created the intended outcome.`,
      application: `Brief the ${workProduct} in three layers: what the organization needs to understand, why it matters to the business or mission, and what accountable next action should occur now.`,
    },
  ];
}

function createObjectives(subject: string, outcome: string, workProduct: string, authority: AuthorityReference) {
  return [
    `Explain the lesson subject accurately in professional terms: ${subject}`,
    `Apply the subject to a realistic decision and use it to ${outcome.toLowerCase()}.`,
    `Use evidence, assumptions, uncertainty, and ${authority.reference} to support or challenge a proposed action.`,
    `Create a defensible ${workProduct} that identifies ownership, options, consequences, residual risk, and verification.`,
    "Translate the professional analysis into a concise business recommendation that another leader can review and act on.",
  ];
}

function createGuidedPractice(subject: string, workProduct: string, authority: AuthorityReference): GuidedPracticeStep[] {
  return [
    {
      title: "Frame the decision",
      instruction: `Write the exact decision the organization must make about ${subject.toLowerCase()}. Define the desired business or mission outcome, the affected stakeholders, and the deadline for a decision.`,
      evidence: "A one sentence decision statement, named decision owner, affected stakeholders, and decision deadline.",
    },
    {
      title: "Build the evidence picture",
      instruction: "Separate verified facts, indicators, assumptions, estimates, and unknowns. For each important fact, note the source, age, scope, and whether another source corroborates it.",
      evidence: "An evidence table with source, freshness, confidence, limitation, and any conflicting information.",
    },
    {
      title: "Apply the authoritative basis",
      instruction: `Review ${authority.reference} and identify the control objective, governance expectation, professional principle, or risk management concept that is relevant to the decision. Distinguish clearly between mandatory obligations and recognized guidance.`,
      evidence: `A citation or reference note showing how ${authority.reference} informs the proposed action without overstating what the source requires.`,
    },
    {
      title: "Compare realistic options",
      instruction: "Develop at least two viable response options plus a deliberate no change or defer option when appropriate. Compare expected benefit, cost, effort, dependencies, operational impact, human impact, residual risk, and reversibility.",
      evidence: "An option comparison that shows why the preferred choice is stronger and what risk remains after implementation.",
    },
    {
      title: `Build the ${workProduct}`,
      instruction: `Convert the analysis into a professional ${workProduct}. Name the accountable owner, approver, implementation steps, due dates, escalation triggers, and the evidence required to verify completion.`,
      evidence: `A complete ${workProduct} that another qualified professional can review without reconstructing the reasoning from memory.`,
    },
    {
      title: "Test the recommendation",
      instruction: "Challenge the preferred recommendation. Ask what fact could make it wrong, what failure mode could create harm, what dependency could block execution, and what metric or evidence will demonstrate that the intended outcome was achieved.",
      evidence: "A documented challenge, residual limitation, success measure, review date, and condition that would trigger reassessment.",
    },
  ];
}

function createDecisionRubric(subject: string, workProduct: string): DecisionRubricRow[] {
  return [
    {
      criterion: "Subject matter accuracy",
      strong: `The recommendation applies ${subject.toLowerCase()} correctly and uses the actual course concepts rather than generic terminology.`,
      weak: "The recommendation sounds plausible but does not demonstrate the specific professional knowledge taught in the lesson.",
    },
    {
      criterion: "Evidence quality",
      strong: "Facts, assumptions, unknowns, source quality, freshness, confidence, and limitations are explicit and materially connected to the decision.",
      weak: "The conclusion depends on unverified claims, stale information, unsupported certainty, or evidence that is not relevant to the decision.",
    },
    {
      criterion: "Authority and accountability",
      strong: "The accountable owner, required approver, governing obligation or guidance, escalation path, and decision boundary are clear.",
      weak: "The recommendation assumes authority, bypasses approval, confuses guidance with a mandate, or leaves ownership ambiguous.",
    },
    {
      criterion: "Business and human impact",
      strong: "Options are compared using operational, financial, safety, security, privacy, customer, workforce, and stakeholder consequences that are relevant to the situation.",
      weak: "The recommendation optimizes a single technical or operational factor without considering second order consequences or affected stakeholders.",
    },
    {
      criterion: "Implementation and proof",
      strong: `The ${workProduct} defines the action, owner, timeline, dependencies, residual risk, success measure, evidence, and reassessment trigger.`,
      weak: "The recommendation ends with an opinion or task list and does not show how completion, effectiveness, or residual risk will be verified.",
    },
  ];
}

function createFailureModes(subject: string): FailureMode[] {
  return [
    {
      pattern: "Tool first thinking",
      whyItFails: `Starting with a preferred product, control, or tactic can bypass the actual decision and distort how ${subject.toLowerCase()} should be analyzed.`,
      correction: "Define the objective, evidence, authority, and risk first. Select tools or controls only after the problem and success criteria are clear.",
    },
    {
      pattern: "False certainty",
      whyItFails: "Treating assumptions, estimates, model output, indicators, or incomplete reporting as verified facts can produce an overconfident and indefensible recommendation.",
      correction: "Label facts, assumptions, confidence, unknowns, and limitations separately and state what evidence would cause the decision to change.",
    },
    {
      pattern: "Authority drift",
      whyItFails: "A technically reasonable action can still create legal, operational, safety, privacy, or governance problems when the person making the decision does not have the required authority.",
      correction: "Identify the accountable owner and approver before consequential action and route exceptions or escalations through the defined governance path.",
    },
    {
      pattern: "Closure without verification",
      whyItFails: "Marking work complete because a task was performed does not establish that risk was reduced, the control works, or the intended outcome was achieved.",
      correction: "Define objective closure evidence, independently verify high impact changes where appropriate, and reassess residual risk after implementation.",
    },
  ];
}

function createMasteryCriteria(subject: string, workProduct: string, authority: AuthorityReference) {
  return [
    `You can explain ${subject.toLowerCase()} accurately without relying on the course wording.` ,
    "You can distinguish verified facts, assumptions, uncertainty, and missing information in a realistic case.",
    `You can explain how ${authority.reference} informs the decision and correctly label whether it is law, regulation, standard, framework, or recognized guidance.`,
    `You can create a usable ${workProduct} with ownership, authority, options, implementation, residual risk, and verification.`,
    "You can defend the recommendation against a reasonable challenge and describe what evidence would cause you to revise it.",
    "You can translate the lesson into an executive, operational, technical, or protective next action appropriate to your role and authority.",
  ];
}

function createReflectionPrompts(subject: string, workProduct: string) {
  return [
    `Where does ${subject.toLowerCase()} appear in your current organization, role, client environment, or professional practice?`,
    "Which current decision in your environment is being made with weak evidence, unclear ownership, or an untested assumption?",
    `What would make a ${workProduct} credible to a skeptical executive, auditor, customer, investigator, or operational leader?`,
    "What is one process, policy, architecture, training, or governance change you would make after completing this lesson and how would you measure the result?",
  ];
}

function createVideoChapters({
  courseTitle,
  moduleTitle,
  subject,
  totalMinutes,
  instruction,
  example,
  workProduct,
}: {
  courseTitle: string;
  moduleTitle: string;
  subject: string;
  totalMinutes: number;
  instruction: readonly InstructionSection[];
  example: PracticeExample;
  workProduct: string;
}): VideoChapter[] {
  const chapterContent = [
    ["Lesson mission", `Welcome to ${courseTitle}. The specific subject for ${moduleTitle} is: ${subject}`],
    [instruction[0]?.heading ?? "Professional concept", instruction[0]?.body ?? subject],
    [instruction[1]?.heading ?? "Authoritative basis", instruction[1]?.body ?? "Use authoritative sources to support the decision."],
    ["Documented practice example", `${example.organization}: ${example.summary} The professional takeaway is: ${example.takeaway}`],
    [instruction[2]?.heading ?? "Professional method", instruction[2]?.body ?? "Apply a repeatable professional method."],
    [instruction[3]?.heading ?? "Business translation", instruction[3]?.body ?? "Translate the lesson into a business decision."],
    ["Applied work product", `Use the lesson to create a ${workProduct}. It should show evidence, authority, options, an accountable action, and verification rather than simply restating the course material.`],
    ["Operational takeaway", "Close the lesson by stating the next action, success measure, escalation threshold, and one improvement that should be incorporated into normal operations."],
  ] as const;

  return chapterContent.map(([title, narration], index) => ({
    timestamp: chapterTimestamp(totalMinutes, index, chapterContent.length),
    title,
    narration,
  }));
}

function createMaterials({
  courseTitle,
  moduleTitle,
  focus,
  subject,
  outcome,
  workProduct,
  authorities,
  example,
}: {
  courseTitle: string;
  moduleTitle: string;
  focus: string;
  subject: string;
  outcome: string;
  workProduct: string;
  authorities: readonly AuthorityReference[];
  example: PracticeExample;
}): TrainingMaterial[] {
  return [
    {
      title: "Professional lesson brief",
      purpose: "Use this brief to prepare for the lesson and retain the specific subject matter after completion.",
      content: [
        `Course: ${courseTitle}`,
        `Lesson: ${moduleTitle}`,
        `Published focus: ${focus}`,
        `Lesson subject: ${subject}`,
        `Learning outcome: ${outcome}`,
        `Required practice artifact: ${workProduct}`,
        `Documented example: ${example.organization}, ${example.title}`,
      ],
    },
    {
      title: "Authority and standards reference sheet",
      purpose: "Use these primary and authoritative references to understand why the lesson is taught and what established practice supports it.",
      content: authorities.map((authority) => `${authority.reference}: ${authority.whyItMatters} Source: ${authority.url}`),
    },
    {
      title: `${workProduct.charAt(0).toUpperCase()}${workProduct.slice(1)} worksheet`,
      purpose: "Use this worksheet during the scenario to turn the lesson into a professional work product.",
      content: [
        "Objective: What business, mission, safety, security, privacy, governance, or technology outcome must be protected or improved?",
        "Subject application: Which specific concept from this lesson changes the analysis or recommended action?",
        "Evidence: Which facts are verified, what is assumed, what is unknown, and how current and reliable are the sources?",
        "Authority: Who owns the decision, what obligation, policy, or standard applies, and what approval is required?",
        "Options: What realistic alternatives exist and what are their benefit, cost, impact, dependencies, and residual risks?",
        "Action and verification: What is the approved next step, who owns it, when must it be completed, and what evidence will prove the result?",
      ],
    },
    {
      title: "Business implementation job aid",
      purpose: "Use this after the course to apply the lesson inside an organization.",
      content: [
        `Translate ${subject.toLowerCase()} into a concrete business or operational decision.`,
        "Cite the relevant standard, regulation, law, policy, or recognized professional guidance accurately.",
        "Name the accountable owner and required approver before consequential execution.",
        "Preserve evidence, assumptions, confidence, limitations, dependencies, and the decision rationale.",
        "Measure the result and update policy, process, architecture, training, or controls when evidence or outcomes change.",
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

function createKnowledgeCheck({
  courseId,
  moduleTitle,
  subject,
  outcome,
  authority,
  workProduct,
  index,
}: {
  courseId: string;
  moduleTitle: string;
  subject: string;
  outcome: string;
  authority: AuthorityReference;
  workProduct: string;
  index: number;
}): KnowledgeCheck {
  const correct = `Apply the lesson subject to current evidence, connect the decision to ${authority.reference}, identify the authorized owner, document the rationale in the ${workProduct}, and define verification and escalation criteria.`;
  const distractors = [
    "Choose the fastest available action and reconstruct the evidence and authority after the issue is closed.",
    "Rely on the most confident stakeholder and treat urgency as sufficient proof that the preferred action is correct.",
    "Delay every action until all uncertainty is eliminated even when an established threshold requires a timely and proportionate response.",
  ];
  const { options, answer } = rotateOptions(correct, distractors, courseId.length + moduleTitle.length + subject.length + index);
  return {
    question: `During ${moduleTitle.toLowerCase()}, which approach best demonstrates the lesson on ${subject.toLowerCase()} while helping the learner ${outcome.toLowerCase()}?`,
    options,
    answer,
    explanation: `The preferred response uses the actual lesson subject, current evidence, accountable authority, ${authority.reference}, a defined work product, proportionate action, and explicit verification. That combination makes the decision safer to execute and easier to review, audit, and improve.`,
  };
}

export function lessonBrief(courseId: string, index: number): LessonBrief | null {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return null;
  const module = course.modules[index];
  if (!module) return null;
  const curriculum = curriculumForCourse(course.id);
  if (!curriculum) return null;

  const focus = focusFromDescription(course.description);
  const outcome = course.outcomes[index % course.outcomes.length];
  const subject = curriculum.lessonSubjects[index];
  const workProduct = curriculum.workProducts[index];
  const totalMinutes = minutesFromDuration(module.duration);
  const grounding = groundingForCourse(course);
  const primaryAuthority = grounding.authorities[0];
  const instruction = phaseInstruction({
    courseTitle: course.title,
    focus,
    outcome,
    moduleTitle: module.title,
    phaseIndex: index,
    subject,
    workProduct,
    authorities: grounding.authorities,
  });
  const videoChapters = createVideoChapters({
    courseTitle: course.title,
    moduleTitle: module.title,
    subject,
    totalMinutes,
    instruction,
    example: grounding.example,
    workProduct,
  });

  return {
    title: module.title,
    format: module.format,
    focus: `This ${module.format.toLowerCase()} directly implements the published course focus on ${focus}. The specific lesson subject is ${subject}`,
    whyItMatters: `${subject} This matters because the lesson subject can directly affect operational performance, security or safety, financial outcomes, regulatory or contractual exposure, workforce behavior, customer impact, resilience, and executive accountability. The instruction is grounded in ${primaryAuthority.reference} and the additional authoritative references listed for the lesson.`,
    objectives: createObjectives(subject, outcome, workProduct, primaryAuthority),
    observe: "Start with the specific lesson subject. Identify the business objective, affected people, systems, data, services, or stakeholders, the current evidence, important assumptions, uncertainty, existing safeguards, and the information that would materially change the analysis.",
    decide: `Use ${primaryAuthority.reference}, the other listed authorities, the course subject, business impact, and assigned decision rights to compare realistic options. Select a proportionate action, explain why alternatives are weaker, and state the residual risk or limitation that remains.`,
    act: `Create the ${workProduct}, assign an accountable owner, execute through the approved process, preserve the evidence and rationale, communicate what must happen next, and define objective evidence that will verify whether the action worked.`,
    instruction,
    guidedPractice: createGuidedPractice(subject, workProduct, primaryAuthority),
    decisionRubric: createDecisionRubric(subject, workProduct),
    failureModes: createFailureModes(subject),
    masteryCriteria: createMasteryCriteria(subject, workProduct, primaryAuthority),
    reflectionPrompts: createReflectionPrompts(subject, workProduct),
    authorities: [...grounding.authorities],
    practiceExample: grounding.example,
    businessApplication: [
      `Use the lesson subject to create a ${workProduct} for an actual business or operational decision.`,
      `Use ${primaryAuthority.reference} and the other listed authorities to explain why the proposed control, governance practice, technical approach, or leadership action is defensible.`,
      "Compare at least two realistic options using business impact, implementation effort, dependencies, residual risk, and measurable success criteria.",
      "Document the approved decision, implement through the correct authority, verify the result, and feed lessons learned into normal operations.",
    ],
    scenario: `${curriculum.scenario} During this lesson, focus specifically on ${subject.toLowerCase()} and produce the ${workProduct}.`,
    videoTitle: `${module.title}: Guided Obserra Academy Instruction`,
    videoDuration: module.duration,
    videoChapters,
    transcript: videoChapters.map((chapter) => `${chapter.timestamp} — ${chapter.title}. ${chapter.narration}`),
    materials: createMaterials({
      courseTitle: course.title,
      moduleTitle: module.title,
      focus,
      subject,
      outcome,
      workProduct,
      authorities: grounding.authorities,
      example: grounding.example,
    }),
    check: createKnowledgeCheck({
      courseId: course.id,
      moduleTitle: module.title,
      subject,
      outcome,
      authority: primaryAuthority,
      workProduct,
      index,
    }),
  };
}

const assessmentLenses = [
  "subject matter understanding",
  "evidence quality and uncertainty",
  "authority and governance",
  "business impact and trade offs",
  "implementation, verification, and improvement",
] as const;

export function finalAssessment(courseId: string): KnowledgeCheck[] {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];
  const curriculum = curriculumForCourse(course.id);
  if (!curriculum) return [];

  const grounding = groundingForCourse(course);
  const focus = focusFromDescription(course.description);

  return Array.from({ length: 25 }, (_, index) => {
    const moduleIndex = index % course.modules.length;
    const module = course.modules[moduleIndex];
    const outcome = course.outcomes[index % course.outcomes.length];
    const authority = grounding.authorities[index % grounding.authorities.length];
    const subject = curriculum.lessonSubjects[moduleIndex];
    const workProduct = curriculum.workProducts[moduleIndex];
    const lens = assessmentLenses[Math.floor(index / course.modules.length) % assessmentLenses.length];
    const correct = `Apply ${subject.toLowerCase()} to the current facts, evaluate the ${lens} issue, connect the recommendation to ${authority.reference}, identify the accountable decision owner, document the decision in the ${workProduct}, and define verification and escalation criteria.`;
    const distractors = [
      "Choose the least expensive or fastest option first and use the final outcome as the only evidence that the decision was appropriate.",
      "Escalate immediately to the highest level of leadership without first clarifying the lesson subject, facts, authority, or the specific decision required.",
      "Wait for complete certainty before taking any action even when established thresholds require a timely and proportionate response.",
    ];
    const { options, answer } = rotateOptions(correct, distractors, course.id.length + index * 7 + module.title.length + subject.length);
    return {
      question: `${String(index + 1).padStart(2, "0")}. In a ${module.title.toLowerCase()} situation involving ${focus}, which response best demonstrates ${lens} and the course instruction on ${subject.toLowerCase()}?`,
      options,
      answer,
      explanation: `The strongest response applies the actual course subject and combines evidence, accountable decision rights, ${authority.reference}, a defined professional work product, proportionate action, verification, and improvement.`,
    };
  });
}

/**
 * The learner client receives only question text and choices. Answer keys stay
 * in the server only Academy assessment route, which is the authoritative scorer.
 */
export function finalAssessmentQuestions(courseId: string): AssessmentQuestion[] {
  return finalAssessment(courseId).map(({ question, options }) => ({ question, options }));
}
