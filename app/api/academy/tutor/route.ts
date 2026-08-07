import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
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

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
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

  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) {
    return NextResponse.json({ error: "Paid course access is required" }, { status: 403, headers: responseHeaders });
  }

  const lesson = lessonBrief(courseId, lessonIndex);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson context is unavailable" }, { status: 404, headers: responseHeaders });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "The Obserrian Academy Tutor is not configured for this environment." },
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

  const developerInstruction = `You are the Obserrian Academy Tutor for a paid Obserra Academy learner.

Your scope is the learner's current purchased course and current lesson. Teach the learner at a professional level. Do not act as an independent legal, regulatory, safety, medical, employment, licensing, or certification authority. Distinguish law, regulation, standards, recognized guidance, organizational policy, and professional practice. Never invent a requirement, citation, case, or source. If the supplied material does not establish a claim, say that the course context does not establish it.

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
      return NextResponse.json({ error: "The Academy Tutor is temporarily unavailable." }, { status: 502, headers: responseHeaders });
    }

    const answer = extractOutputText(payload);
    if (!answer) {
      return NextResponse.json({ error: "The Academy Tutor returned no instructional response." }, { status: 502, headers: responseHeaders });
    }

    return NextResponse.json(
      {
        answer,
        courseId,
        lessonIndex,
        lessonTitle: lesson.title,
        sourceCount: lesson.authorities.length,
        assessmentIntegrity: "The tutor does not provide graded final assessment answers.",
      },
      { status: 200, headers: responseHeaders },
    );
  } catch (error) {
    console.error("academy tutor request failed", error);
    return NextResponse.json({ error: "The Academy Tutor is temporarily unavailable." }, { status: 502, headers: responseHeaders });
  }
}
