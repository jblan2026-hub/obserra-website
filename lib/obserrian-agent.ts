import "server-only";

import { courses } from "../app/academy/courseData";
import { marketplaceApps } from "../app/apps/appsData";

export type ObserrianAction = { label: string; href: string; reason?: string };
export type ObserrianReply = { answer: string; actions: ObserrianAction[]; followUpPrompts: string[]; confidence: number; groundedIn: string[] };
type ObserrianRequest = { message: string; pathname: string; conversation?: Array<{ role: "user" | "assistant"; content: string }> };

const gatewayUrl = "https://ai-gateway.vercel.sh/v1/chat/completions";

function compactCatalog() {
  return {
    applications: marketplaceApps.map((app) => ({ slug: app.slug, name: app.name, status: app.status, category: app.category, value: app.value, features: app.features, integrations: app.integrations, pricing: app.pricing, href: `/apps/${app.slug}` })),
    courses: courses.map((course) => ({ id: course.id, title: course.title, department: course.department, level: course.level, track: course.track, duration: course.duration, price: course.price, audience: course.audience, description: course.description, outcomes: course.outcomes, lessons: course.modules.map((module) => ({ title: module.title, duration: module.duration, format: module.format })), href: `/academy/${course.id}` })),
  };
}

function fallbackReply(message: string, pathname: string): ObserrianReply {
  const input = message.toLowerCase();
  if (input.includes("course") || input.includes("training") || pathname.startsWith("/academy")) {
    const recommended = courses.slice(0, 3);
    return {
      answer: "I can narrow the best course by your role, desired outcome, experience level, available time, and budget. Which of those should I optimize first?",
      actions: recommended.map((course) => ({ label: course.title, href: `/academy/${course.id}`, reason: `${course.level}, ${course.duration}, $${course.price}` })),
      followUpPrompts: ["I am a security leader", "I need AI governance training", "My budget is under $300"],
      confidence: 0.72,
      groundedIn: ["Obserra Academy course catalog"],
    };
  }
  if (input.includes("app") || input.includes("software") || pathname.startsWith("/apps")) {
    const recommended = marketplaceApps.filter((app) => app.status !== "Coming Soon").slice(0, 3);
    return {
      answer: "I can match the right Obserra application to your business problem, team size, implementation timeline, required integrations, and subscription preference. What outcome matters most?",
      actions: recommended.map((app) => ({ label: app.name, href: `/apps/${app.slug}`, reason: app.value })),
      followUpPrompts: ["Reduce cyber risk", "Improve compliance", "Need an executive dashboard"],
      confidence: 0.72,
      groundedIn: ["Obserra application marketplace"],
    };
  }
  return {
    answer: "What are you trying to improve right now: enterprise visibility, cybersecurity, AI governance, executive protection, or workforce capability? I will identify the strongest Obserra path and next action.",
    actions: [{ label: "Browse applications", href: "/apps" }, { label: "Explore Academy", href: "/academy" }, { label: "Review EIOS", href: "/eios" }, { label: "Speak with Obserra", href: "/contact" }],
    followUpPrompts: ["I need a SaaS solution", "I need team training", "I need advisory support"],
    confidence: 0.68,
    groundedIn: ["Obserra website navigation"],
  };
}

function parseReply(text: string): ObserrianReply | null {
  try {
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const value = JSON.parse(cleaned) as Partial<ObserrianReply>;
    if (typeof value.answer !== "string" || !Array.isArray(value.actions) || !Array.isArray(value.followUpPrompts)) return null;
    return {
      answer: value.answer.slice(0, 2400),
      actions: value.actions.slice(0, 4).filter((action): action is ObserrianAction => Boolean(action && typeof action.label === "string" && typeof action.href === "string" && action.href.startsWith("/"))),
      followUpPrompts: value.followUpPrompts.slice(0, 4).filter((item): item is string => typeof item === "string"),
      confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0.5)),
      groundedIn: Array.isArray(value.groundedIn) ? value.groundedIn.slice(0, 8).filter((item): item is string => typeof item === "string") : [],
    };
  } catch { return null; }
}

export async function answerObserrian(request: ObserrianRequest): Promise<ObserrianReply> {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const model = process.env.OBSERRIAN_AI_MODEL?.trim();
  if (!apiKey || !model) return fallbackReply(request.message, request.pathname);

  const system = [
    "You are Obserrian, the official consultative AI guide and sales advisor for OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC.",
    "Use only the supplied Obserra application and Academy catalogs plus the current page path.",
    "Your goal is to understand the visitor's desired business outcome and guide them to the best legitimate Obserra product, course, EIOS briefing, or consultation.",
    "Ask one concise discovery question when role, problem, urgency, team size, timeline, budget, or desired outcome is missing. Do not interrogate or ask multiple questions at once.",
    "After enough context exists, recommend no more than three best-fit options and explain why each fits.",
    "Use strong but accurate conversion actions such as View course, Compare application, Start enrollment, Request demo, Request briefing, or Contact Obserra.",
    "Never pressure the visitor, fabricate scarcity, make guarantees, or invent availability, credentials, prices, integrations, outcomes, or discounts.",
    "Distinguish available, pilot, and coming-soon products accurately.",
    "For complaints, acknowledge the concern, identify the category, and route to /contact with an appropriate reason while still providing useful immediate guidance.",
    "For certificates, state that they are Obserra course-completion records, not government licenses or third-party professional certifications.",
    "Return JSON only with answer, actions, followUpPrompts, confidence, and groundedIn.",
    "actions must contain at most four objects with label, href, and optional reason. href must begin with /.",
    `Current path: ${request.pathname}`,
    `Catalog: ${JSON.stringify(compactCatalog())}`,
  ].join("\n");

  try {
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, ...(request.conversation ?? []).slice(-8), { role: "user", content: request.message.slice(0, 2000) }] }),
      signal: AbortSignal.timeout(18_000),
      cache: "no-store",
    });
    if (!response.ok) return fallbackReply(request.message, request.pathname);
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return parseReply(payload.choices?.[0]?.message?.content ?? "") ?? fallbackReply(request.message, request.pathname);
  } catch { return fallbackReply(request.message, request.pathname); }
}
