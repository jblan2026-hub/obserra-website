import "server-only";

import type { ObserrianReply } from "./obserrian-agent";

const repository = "jblan2026-hub/obserra-website";
const telemetryIssueNumber = 45;
const telemetryPrefix = "<!-- OBSERRIAN_TELEMETRY_V1 -->";

type ComplaintSeverity = "none" | "low" | "medium" | "high" | "critical";

export type ObserrianReviewRecord = {
  id: string;
  createdAt: string;
  pathname: string;
  question: string;
  answer: string;
  actions: ObserrianReply["actions"];
  confidence: number;
  groundedIn: string[];
  topic: string;
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  complaint: {
    detected: boolean;
    category: string | null;
    severity: ComplaintSeverity;
  };
};

export type ObserrianTrendSnapshot = {
  generatedAt: string;
  totalInteractions: number;
  negativeInteractions: number;
  complaints: number;
  topics: Array<{ name: string; count: number }>;
  intents: Array<{ name: string; count: number }>;
  complaintCategories: Array<{ name: string; count: number; highestSeverity: ComplaintSeverity }>;
  lowConfidenceQuestions: Array<{ question: string; pathname: string; confidence: number }>;
  recommendedAdjustments: string[];
};

type GitHubComment = { body?: string | null; created_at?: string };

function githubHeaders() {
  const token = process.env.OBSERRA_GITHUB_PUBLISH_TOKEN?.trim();
  if (!token) throw new Error("OBSERRA_GITHUB_PUBLISH_TOKEN is not configured");
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    ...init,
    headers: { ...githubHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Obserrian telemetry failed with ${response.status}`);
  return response.json() as Promise<T>;
}

function redact(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted-number]")
    .slice(0, 2400);
}

function classify(question: string, pathname: string) {
  const input = question.toLowerCase();
  const topic = pathname.startsWith("/academy") || /course|training|certificate|quiz|lesson/.test(input)
    ? "academy"
    : pathname.startsWith("/apps") || /app|software|subscription|product/.test(input)
      ? "applications"
      : pathname.startsWith("/eios") || /eios|executive intelligence/.test(input)
        ? "eios"
        : /protect|travel|threat|physical security/.test(input)
          ? "protection"
          : /cyber|risk|incident|identity|governance/.test(input)
            ? "cybersecurity"
            : "general";

  const complaintDetected = /complain|complaint|wrong|bad|broken|failed|failure|not working|doesn't work|does not work|refund|unhappy|disappointed|frustrated|misleading|overcharged|charged twice|cancel/.test(input);
  const critical = /fraud|breach|stolen|unsafe|threat|harassment|discrimination|legal action/.test(input);
  const high = /refund|overcharged|charged twice|cannot access|locked out|data loss/.test(input);
  const medium = /not working|broken|failed|misleading|cancel/.test(input);
  const severity: ComplaintSeverity = complaintDetected ? (critical ? "critical" : high ? "high" : medium ? "medium" : "low") : "none";
  const category = !complaintDetected ? null
    : /refund|charged|price|billing|payment/.test(input) ? "billing"
      : /access|login|sign in|locked/.test(input) ? "access"
        : /course|quiz|lesson|certificate/.test(input) ? "academy-experience"
          : /app|software|feature|integration/.test(input) ? "product-experience"
            : /privacy|data/.test(input) ? "privacy"
              : "general-service";
  const sentiment = complaintDetected || /unhappy|disappointed|frustrated|angry|bad/.test(input) ? "negative" as const : /thank|great|excellent|helpful/.test(input) ? "positive" as const : "neutral" as const;
  const intent = complaintDetected ? "complaint" : /buy|price|subscribe|enroll/.test(input) ? "purchase" : /compare|recommend|which/.test(input) ? "recommendation" : /how|what|why|explain/.test(input) ? "information" : "navigation";
  return { topic, intent, sentiment, complaint: { detected: complaintDetected, category, severity } };
}

function countBy(records: ObserrianReviewRecord[], key: (record: ObserrianReviewRecord) => string) {
  const counts = new Map<string, number>();
  for (const record of records) counts.set(key(record), (counts.get(key(record)) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function severityRank(value: ComplaintSeverity) {
  return ["none", "low", "medium", "high", "critical"].indexOf(value);
}

export function buildTrendSnapshot(records: ObserrianReviewRecord[]): ObserrianTrendSnapshot {
  const complaints = records.filter((record) => record.complaint.detected);
  const categoryMap = new Map<string, { count: number; highestSeverity: ComplaintSeverity }>();
  for (const record of complaints) {
    const category = record.complaint.category ?? "uncategorized";
    const current = categoryMap.get(category) ?? { count: 0, highestSeverity: "none" as ComplaintSeverity };
    current.count += 1;
    if (severityRank(record.complaint.severity) > severityRank(current.highestSeverity)) current.highestSeverity = record.complaint.severity;
    categoryMap.set(category, current);
  }
  const topTopics = countBy(records, (record) => record.topic);
  const lowConfidence = records.filter((record) => record.confidence < 0.65).slice(-20).map((record) => ({ question: record.question, pathname: record.pathname, confidence: record.confidence }));
  const recommendedAdjustments: string[] = [];
  if (lowConfidence.length >= 3) recommendedAdjustments.push("Add or improve grounded website content for recurring low-confidence questions.");
  if (complaints.some((record) => record.complaint.category === "billing")) recommendedAdjustments.push("Clarify pricing, refunds, cancellation, and payment terms.");
  if (complaints.some((record) => record.complaint.category === "access")) recommendedAdjustments.push("Improve sign-in, enrollment, entitlement, and account recovery guidance.");
  if ((topTopics[0]?.count ?? 0) >= 5) recommendedAdjustments.push(`Create or improve a high-visibility FAQ for the recurring ${topTopics[0].name} topic.`);
  return {
    generatedAt: new Date().toISOString(),
    totalInteractions: records.length,
    negativeInteractions: records.filter((record) => record.sentiment === "negative").length,
    complaints: complaints.length,
    topics: topTopics,
    intents: countBy(records, (record) => record.intent),
    complaintCategories: [...categoryMap.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.count - a.count),
    lowConfidenceQuestions: lowConfidence,
    recommendedAdjustments,
  };
}

function parseTelemetryComment(body: string | null | undefined): ObserrianReviewRecord | null {
  if (!body?.startsWith(telemetryPrefix)) return null;
  try {
    const json = body.slice(telemetryPrefix.length).trim();
    const record = JSON.parse(json) as ObserrianReviewRecord;
    return record?.id && record?.createdAt ? record : null;
  } catch {
    return null;
  }
}

export async function recordObserrianInteraction(input: { pathname: string; question: string; reply: ObserrianReply }) {
  const classification = classify(input.question, input.pathname);
  const record: ObserrianReviewRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    pathname: input.pathname.slice(0, 300),
    question: redact(input.question),
    answer: redact(input.reply.answer),
    actions: input.reply.actions.slice(0, 4),
    confidence: input.reply.confidence,
    groundedIn: input.reply.groundedIn,
    ...classification,
  };
  await githubRequest(`/issues/${telemetryIssueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body: `${telemetryPrefix}\n${JSON.stringify(record)}` }),
  });
  return record;
}

export async function getObserrianReviewData() {
  const comments = await githubRequest<GitHubComment[]>(`/issues/${telemetryIssueNumber}/comments?per_page=100`);
  const records = comments.map((comment) => parseTelemetryComment(comment.body)).filter((record): record is ObserrianReviewRecord => Boolean(record));
  return { records: [...records].reverse(), trends: buildTrendSnapshot(records) };
}
