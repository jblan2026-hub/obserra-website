import { NextResponse } from "next/server";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { ACADEMY_BRAND_NAME } from "../../../../lib/legal-identity";
import { lessonBrief } from "../../../academy/courseExperience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

type TutorRequest = {
  courseId?: string;
  lessonIndex?: number;
  question?: string;
};

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

function extractOutputText(payload: OpenAIResponse) {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text?.trim())
    .filter((item): item is string => Boolean(item))
    .join("\n\n");
}

function groundedPreviewAnswer(question: string, lesson: NonNullable<ReturnType<typeof lessonBrief>>) {
  const normalized = question.toLowerCase();
  const objective = lesson.objectives[0] ?? lesson.focus;
  const application = lesson.businessApplication[0] ?? lesson.decide;
  const authority = lesson.authorities[0];
  const practice = lesson.guidedPractice[0];

  if (normalized.includes("quiz") || normalized.includes("question")) {
    return `Here are three ungraded practice questions for ${lesson.title}:\n\n1. What evidence would you require before acting on ${lesson.focus}?\n2. Which stakeholder has the legitimate authority to approve or escalate the decision described in this lesson?\n3. How would you document the decision so another executive or auditor could understand the reasoning?\n\nUse the lesson's mastery criteria and decision rubric to evaluate your answers. These are practice questions only and are not drawn from the graded final assessment.`;
  }

  if (normalized.includes("example") || normalized.includes("scenario")) {
    return `A practical way to apply this lesson is to start with the documented scenario: ${lesson.scenario}\n\nWork it in four steps. First, identify the decision that actually has to be made. Second, separate verified evidence from assumptions. Third, identify the person or function with authority to act. Fourth, record the action, rationale, owner, and follow up evidence.\n\nA useful business application from this lesson is: ${application}\n\nThe professional standard is not simply reaching an answer. It is reaching a defensible answer with evidence, authority, and traceability.`;
  }

  if (normalized.includes("apply") || normalized.includes("business") || normalized.includes("enterprise")) {
    return `For enterprise application, treat ${lesson.title} as a decision workflow rather than a vocabulary exercise. Your first objective is to ${objective}. Then map the decision to the responsible business owner, the evidence required, the control or policy involved, and the escalation threshold.\n\nStart with this guided practice step: ${practice?.instruction ?? lesson.decide}\n\nEvidence to produce: ${practice?.evidence ?? "A documented decision record with owner, rationale, evidence, and next action."}\n\nThat makes the lesson usable inside governance, risk, cybersecurity, legal, operational, or executive decision processes rather than leaving it as theory.`;
  }

  if (normalized.includes("study") || normalized.includes("plan") || normalized.includes("prepare")) {
    return `A focused study plan for ${lesson.title}:\n\n1. Restate the lesson focus in your own words: ${lesson.focus}\n2. Review the mastery objectives and explain each without looking at the lesson.\n3. Work the applied scenario and document your evidence, authority, decision, and next action.\n4. Compare your work against the decision rubric and correct weak practice.\n5. Review the authoritative reference${authority ? ` from ${authority.publisher}: ${authority.reference}` : "s supplied in this lesson"}.\n6. Complete the knowledge check only after you can explain why each incorrect option is weaker.\n\nI can also quiz you interactively on any of these steps.`;
  }

  return `This lesson is about ${lesson.focus}\n\nWhy it matters: ${lesson.whyItMatters}\n\nA strong professional approach is to observe the available evidence, decide within legitimate authority, and act in a way that is proportionate and traceable. One key mastery objective is to ${objective}.\n\n${authority ? `Authoritative grounding: ${authority.publisher}, ${authority.reference}. ${authority.whyItMatters}\n\n` : ""}Practical next step: ${application}\n\nTell me whether you want a simpler explanation, an enterprise example, an ungraded quiz, a study plan, or feedback on how you would handle the scenario.`;
}

export async function POST(request: Request) {
  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.json({ error: "Identity service is unavailable" }, { status: 503, headers: responseHeaders });
  }
  if (!identity.principalId || !identity.identity) {
    return NextResponse.json({ error: "Sign in is required" }, { status: 401, headers: responseHeaders });
  }

  let body: TutorRequest;
  try {
    body = (await request.json()) as TutorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: responseHeaders });
  }

  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  const lessonIndex = Number.isInteger(body.lessonIndex) ? Number(body.lessonIndex) : -1;
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const course = courseForId(courseId);

  if (!course || lessonIndex < 0 || lessonIndex >= course.modules.length || question.length < 2 || question.length > 1400) {
    return NextResponse.json({ error: "Invalid tutor request" }, { status: 400, headers: responseHeaders });
  }

  const state = await academyStateWithOwnerAccess(
    identity.principalId,
    courseId,
    identity.identity.roles,
  );
  if (!state.entitlements[courseId]) {
    return NextResponse.json({ error: "Paid course access is required" }, { status: 403, headers: responseHeaders });
  }

  const lesson = lessonBrief(courseId, lessonIndex);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson context is unavailable" }, { status: 404, headers: responseHeaders });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error("academy tutor unavailable: OPENAI_API_KEY is not configured");
    return NextResponse.json(
      {
        error: "Academy AI tutor is temporarily unavailable",
        code: "ACADEMY_TUTOR_UNAVAILABLE",
        retryable: true,
      },
      { status: 503, headers: responseHeaders },
    );
  }

  const authorityContext = lesson.authorities
    .map((authority) => `${authority.reference} | ${authority.publisher} | ${authority.whyItMatters} | ${authority.url}`)
    .join("\n");
  const instructionContext = lesson.instruction
    .map((section) => `${section.heading}: ${section.body}\nApplication: ${section.application}`)
    .join("\n\n");
  const practiceContext = lesson.guidedPractice
    .map((step) => `${step.title}: ${step.instruction}\nEvidence to produce: ${step.evidence}`)
    .join("\n\n");
  const rubricContext = lesson.decisionRubric
    .map((row) => `${row.criterion}\nStrong practice: ${row.strong}\nWeak practice: ${row.weak}`)
    .join("\n\n");

  const developerInstruction = `You are the Obserrian Academy Tutor for a ${ACADEMY_BRAND_NAME} learner.

Your scope is the learner's current authorized course and current lesson. Teach the learner at a professional level. Do not act as an independent legal, regulatory, safety, medical, employment, licensing, or certification authority. Distinguish law, regulation, standards, recognized guidance, organizational policy, and professional practice. Never invent a requirement, citation, case, or source. If the supplied material does not establish a claim, say that the course context does not establish it.

Do not provide answers to the course's graded final assessment or help bypass assessment integrity. You may explain concepts, create ungraded practice questions, walk through realistic scenarios, challenge a learner's reasoning, provide feedback against the supplied professional decision rubric, build study plans, translate concepts into business use, and help the learner prepare professional work products.

Do not treat fluent output as verified evidence. When the learner asks about a current law, regulation, standard, product, threat, or event that is not established in the supplied lesson context, explain that current verification is required rather than fabricating an answer.

Use the course material below as the primary instructional grounding. Structure substantive answers around the concept, why it matters, authoritative grounding, practical application, decision quality, and a check for understanding when appropriate. Keep advice within the learner's legitimate role and authority.

COURSE
Title: ${course.title}
Published description: ${course.description}
Audience: ${course.audience}
Published duration: ${course.duration}
Learning outcomes: ${course.outcomes.join(" | ")}

CURRENT LESSON
Title: ${lesson.title}
Format: ${lesson.format}
Published lesson focus: ${lesson.focus}
Why it matters: ${lesson.whyItMatters}
Mastery objectives: ${lesson.objectives.join(" | ")}
Scenario: ${lesson.scenario}
Business application: ${lesson.businessApplication.join(" | ")}
Mastery criteria: ${lesson.masteryCriteria.join(" | ")}
Reflection prompts: ${lesson.reflectionPrompts.join(" | ")}

AUTHORITATIVE REFERENCES
${authorityContext}

COURSE INSTRUCTION
${instructionContext}

GUIDED PROFESSIONAL PRACTICE
${practiceContext}

DECISION QUALITY RUBRIC
${rubricContext}

DOCUMENTED PRACTICE EXAMPLE
${lesson.practiceExample.organization}: ${lesson.practiceExample.summary}
Takeaway: ${lesson.practiceExample.takeaway}
Source: ${lesson.practiceExample.url}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OBSERRA_ACADEMY_AI_MODEL?.trim() || "gpt-5.1",
        input: [
          { role: "developer", content: [{ type: "input_text", text: developerInstruction }] },
          { role: "user", content: [{ type: "input_text", text: question }] },
        ],
        max_output_tokens: 1400,
        store: false,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    const payload = (await response.json()) as OpenAIResponse;
    if (!response.ok) {
      console.error("academy tutor model request failed", { status: response.status, message: payload.error?.message });
      return NextResponse.json(
        {
          answer: groundedPreviewAnswer(question, lesson),
          courseId,
          lessonIndex,
          lessonTitle: lesson.title,
          sourceCount: lesson.authorities.length,
          mode: "grounded-course-assistant-fallback",
          assessmentIntegrity: "The tutor does not provide graded final assessment answers.",
        },
        { status: 200, headers: responseHeaders },
      );
    }

    const answer = extractOutputText(payload);
    if (!answer) {
      return NextResponse.json(
        {
          answer: groundedPreviewAnswer(question, lesson),
          courseId,
          lessonIndex,
          lessonTitle: lesson.title,
          sourceCount: lesson.authorities.length,
          mode: "grounded-course-assistant-fallback",
          assessmentIntegrity: "The tutor does not provide graded final assessment answers.",
        },
        { status: 200, headers: responseHeaders },
      );
    }

    return NextResponse.json(
      {
        answer,
        courseId,
        lessonIndex,
        lessonTitle: lesson.title,
        sourceCount: lesson.authorities.length,
        mode: "ai-course-tutor",
        assessmentIntegrity: "The tutor does not provide graded final assessment answers.",
      },
      { status: 200, headers: responseHeaders },
    );
  } catch (error) {
    console.error("academy tutor request failed", error);
    return NextResponse.json(
      {
        answer: groundedPreviewAnswer(question, lesson),
        courseId,
        lessonIndex,
        lessonTitle: lesson.title,
        sourceCount: lesson.authorities.length,
        mode: "grounded-course-assistant-fallback",
        assessmentIntegrity: "The tutor does not provide graded final assessment answers.",
      },
      { status: 200, headers: responseHeaders },
    );
  }
}
