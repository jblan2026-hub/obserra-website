import { NextRequest, NextResponse } from "next/server";
import {
  advisorActions,
  buildAdvisorGrounding,
  fallbackAdvisorAnswer,
  normalizeAdvisorPath,
  OBSERRIAN_FALLBACK_MODELS,
  OBSERRIAN_PRIMARY_MODEL,
  OBSERRIAN_SYSTEM_PROMPT,
  type ObserrianConversationMessage,
} from "../../../lib/obserrian-advisor";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_OPTIONS,
  type ObserraLocale,
} from "../../../lib/regional-localization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_CHARS = 1_000;
const MAX_MESSAGE_CHARS = 1_200;
const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_CHARS = 5_000;
const MAX_RESPONSE_CHARS = 2_800;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

const responseHeaders = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow",
};

type AdvisorPayload = {
  question?: unknown;
  pathname?: unknown;
  conversation?: unknown;
  locale?: unknown;
};

type GatewayResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function clientKey(request: NextRequest) {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

function withinRateLimit(request: NextRequest) {
  const now = Date.now();
  const key = clientKey(request);
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else if (current.count >= RATE_LIMIT) {
    return false;
  } else {
    current.count += 1;
  }

  if (requestBuckets.size > 2_000) {
    for (const [entryKey, bucket] of requestBuckets) {
      if (bucket.resetAt <= now) requestBuckets.delete(entryKey);
      if (requestBuckets.size <= 1_500) break;
    }
  }
  return true;
}

function sameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function normalizedConversation(value: unknown): ObserrianConversationMessage[] {
  if (!Array.isArray(value)) return [];
  const result: ObserrianConversationMessage[] = [];
  let totalChars = 0;

  for (const candidate of value.slice(-MAX_HISTORY_MESSAGES)) {
    if (!candidate || typeof candidate !== "object") continue;
    const role = "role" in candidate ? candidate.role : null;
    const content = "content" in candidate ? candidate.content : null;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const clean = content.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!clean) continue;
    if (totalChars + clean.length > MAX_HISTORY_CHARS) break;
    totalChars += clean.length;
    result.push({ role, content: clean });
  }

  return result;
}

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim() || null;
}

function localeLabel(locale: ObserraLocale) {
  return LOCALE_OPTIONS.find((option) => option.locale === locale)?.label || locale;
}

async function generateAdvisorAnswer(
  token: string,
  question: string,
  pathname: string,
  conversation: ObserrianConversationMessage[],
  locale: ObserraLocale,
) {
  const grounding = buildAdvisorGrounding(question, pathname);
  const messages = [
    { role: "system", content: OBSERRIAN_SYSTEM_PROMPT },
    ...conversation,
    {
      role: "user",
      content: `RESPONSE LANGUAGE: ${localeLabel(locale)} (${locale}). Answer in this language unless the visitor explicitly asks for another language. Preserve Obserra, Obserra LLC, Obserra EIOS, Obserrian, NIST, CMMC, FDACS, product names, URLs, acronyms, numbers, and exact commercial status words such as Available, Pilot, and Coming Soon.\n\nCURRENT PAGE: ${pathname}\n\nGROUNDING:\n${grounding}\n\nVISITOR QUESTION:\n${question}`,
    },
  ];

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: OBSERRIAN_PRIMARY_MODEL,
      messages,
      max_tokens: 700,
      temperature: 0.2,
      stream: false,
      providerOptions: {
        gateway: {
          models: [...OBSERRIAN_FALLBACK_MODELS],
          caching: "auto",
        },
      },
    }),
    signal: AbortSignal.timeout(18_000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`AI Gateway returned ${response.status}`);
  const payload = (await response.json()) as GatewayResponse;
  const answer = payload.choices?.[0]?.message?.content?.replace(/\s+$/g, "").trim();
  if (!answer) throw new Error("AI Gateway returned an empty advisor response");
  return answer.slice(0, MAX_RESPONSE_CHARS);
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403, headers: responseHeaders });
  }
  if (!withinRateLimit(request)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { ...responseHeaders, "retry-after": "60" } },
    );
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "json_required" }, { status: 415, headers: responseHeaders });
  }

  let payload: AdvisorPayload;
  try {
    payload = (await request.json()) as AdvisorPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: responseHeaders });
  }

  const question = typeof payload.question === "string" ? payload.question.replace(/\s+/g, " ").trim() : "";
  if (!question || question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json({ error: "invalid_question" }, { status: 400, headers: responseHeaders });
  }

  const pathname = normalizeAdvisorPath(typeof payload.pathname === "string" ? payload.pathname : "/");
  const conversation = normalizedConversation(payload.conversation);
  const locale = isSupportedLocale(payload.locale) ? payload.locale : DEFAULT_LOCALE;
  const actions = advisorActions(question, pathname);
  const token = gatewayToken();

  if (!token) {
    return NextResponse.json(
      {
        text: fallbackAdvisorAnswer(question, pathname),
        actions,
        mode: "grounded-fallback",
        locale,
      },
      { status: 200, headers: responseHeaders },
    );
  }

  try {
    const text = await generateAdvisorAnswer(token, question, pathname, conversation, locale);
    return NextResponse.json({ text, actions, mode: "ai", locale }, { status: 200, headers: responseHeaders });
  } catch {
    return NextResponse.json(
      {
        text: fallbackAdvisorAnswer(question, pathname),
        actions,
        mode: "grounded-fallback",
        locale,
      },
      { status: 200, headers: responseHeaders },
    );
  }
}
