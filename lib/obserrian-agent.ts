import "server-only";

import { courses } from "../app/academy/courseData";
import { marketplaceApps } from "../app/apps/appsData";

export type ObserrianAction = {
  label: string;
  href: string;
  reason?: string;
};

export type ObserrianReply = {
  answer: string;
  actions: ObserrianAction[];
  followUpPrompts: string[];
  confidence: number;
  groundedIn: string[];
};

type ObserrianRequest = {
  message: string;
  pathname: string;
  conversation?: Array<{ role: "user" | "assistant"; content: string }>;
};

const gatewayUrl = "https://ai-gateway.vercel.sh/v1/chat/completions";

function compactCatalog() {
  return {
    applications: marketplaceApps.map((app) => ({
      slug: app.slug,
      name: app.name,
      status: app.status,
      category: app.category,
      value: app.value,
      features: app.features,
      integrations: app.integrations,
      pricing: app.pricing,
      href: `/apps/${app.slug}`,
    })),
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      department: course.department,
      level: course.level,
      track: course.track,
      duration: course.duration,
      price: course.price,
      audience: course.audience,
      description: course.description,
      outcomes: course.outcomes,
      lessons: course.modules.map((module) => ({ title: module.title, duration: module.duration, format: module.format })),
      href: `/academy/${course.id}`,
    })),
  };
}

function fallbackReply(message: string, pathname: string): ObserrianReply {
  const input = message.toLowerCase();
  if (input.includes("course") || input.includes("training") || pathname.startsWith("/academy")) {
    const recommended = courses.slice(0, 3);
    return {
      answer: "I can help you select an Obserra Academy course by role, experience level, desired outcome, duration, and budget. These current options are available in the Academy catalog.",
      actions: recommended.map((course) => ({ label: course.title, href: `/academy/${course.id}`, reason: `${course.level}, ${course.duration}, $${course.price}` })),
      followUpPrompts: ["Recommend a course for a CISO", "Show AI governance training", "Compare course prices"],
      confidence: 0.72,
      groundedIn: ["Obserra Academy course catalog"],
    };
  }
  if (input.includes("app") || input.includes("software") || pathname.startsWith("/apps")) {
    const recommended = marketplaceApps.filter((app) => app.status !== "Coming Soon").slice(0, 3);
    return {
      answer: "I can compare Obserra applications by business problem, deployment model, maturity, integrations, and subscription fit. These products are currently the strongest starting points.",
      actions: recommended.map((app) => ({ label: app.name, href: `/apps/${app.slug}`, reason: app.value })),
      followUpPrompts: ["Recommend an app for cyber risk", "Compare available products", "Explain EIOS integration"],
      confidence: 0.72,
      groundedIn: ["Obserra application marketplace"],
    };
  }
  return {
    answer: "I can guide you across Obserra applications, EIOS, Academy courses, executive protection, cybersecurity services, and owner-approved website workflows. Tell me the outcome you need, and I will recommend the most relevant next step.",
    actions: [
      { label: "Browse applications", href: "/apps" },
      { label: "Explore Academy", href: "/academy" },
      { label: "Review EIOS", href: "/eios" },
      { label: "Contact Obserra", href: "/contact" },
    ],
    followUpPrompts: ["Recommend an application", "Recommend a course", "Explain EIOS"],
    confidence: 0.65,
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
  } catch {
    return null;
  }
}

export async function answerObserrian(request: ObserrianRequest): Promise<ObserrianReply> {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const model = process.env.OBSERRIAN_AI_MODEL?.trim();
  if (!apiKey || !model) return fallbackReply(request.message, request.pathname);

  const catalog = compactCatalog();
  const system = [
    "You are Obserrian, the official interactive executive intelligence advisor for OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC.",
    "Use only the supplied Obserra application and Academy catalogs plus the current page path.",
    "Do not invent availability, credentials, prices, integrations, outcomes, or guarantees.",
    "Recommend concrete next actions and internal website paths. Never provide external links.",
    "Distinguish available, pilot, and coming-soon products accurately.",
    "For certificates, state that they are Obserra course-completion records, not government licenses or third-party professional certifications.",
    "Return JSON only with answer, actions, followUpPrompts, confidence, and groundedIn.",
    "actions must contain at most four objects with label, href, and optional reason. href must begin with /.",
    `Current path: ${request.pathname}`,
    `Catalog: ${JSON.stringify(catalog)}`,
  ].join("\n");

  try {
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...(request.conversation ?? []).slice(-6),
          { role: "user", content: request.message.slice(0, 2000) },
        ],
      }),
      signal: AbortSignal.timeout(18_000),
      cache: "no-store",
    });
    if (!response.ok) return fallbackReply(request.message, request.pathname);
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return parseReply(payload.choices?.[0]?.message?.content ?? "") ?? fallbackReply(request.message, request.pathname);
  } catch {
    return fallbackReply(request.message, request.pathname);
  }
}
