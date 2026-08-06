import "server-only";

export type OwnerSiteChangeOperation =
  | {
      kind: "course-release-update";
      manifestPath: string;
      title?: string;
      description?: string;
      audience?: string;
      instructionalHours?: number;
      price?: number;
      ownerNotes?: string;
    }
  | {
      kind: "store-product-update";
      productSlug: string;
      description?: string;
      pricing?: string;
      features?: string[];
      integrations?: string[];
    }
  | {
      kind: "marketing-campaign-update";
      productSlug: string;
      headline?: string;
      shortDescription?: string;
      longDescription?: string;
      primaryCta?: string;
      secondaryCta?: string;
    };

export type OwnerSiteChangePlan = {
  summary: string;
  rationale: string;
  risk: "low" | "medium" | "high";
  requiresOwnerApproval: true;
  operations: OwnerSiteChangeOperation[];
};

const allowedKinds = new Set(["course-release-update", "store-product-update", "marketing-campaign-update"]);

function gatewayConfig() {
  const token = process.env.AI_GATEWAY_API_KEY?.trim();
  const model = process.env.OBSERRA_OWNER_AI_MODEL?.trim();
  if (!token) throw new Error("AI_GATEWAY_API_KEY is not configured");
  if (!model) throw new Error("OBSERRA_OWNER_AI_MODEL is not configured");
  return { token, model };
}

function validatePlan(candidate: unknown): OwnerSiteChangePlan {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) throw new Error("AI returned an invalid plan");
  const plan = candidate as Partial<OwnerSiteChangePlan>;
  if (typeof plan.summary !== "string" || typeof plan.rationale !== "string") throw new Error("AI plan summary is incomplete");
  if (!Array.isArray(plan.operations) || plan.operations.length === 0 || plan.operations.length > 12) throw new Error("AI plan must contain 1 through 12 operations");
  if (!plan.operations.every((operation) => operation && typeof operation === "object" && allowedKinds.has(String((operation as { kind?: unknown }).kind)))) {
    throw new Error("AI plan contains an unauthorized operation");
  }
  for (const operation of plan.operations) {
    if (operation.kind === "course-release-update") {
      if (!operation.manifestPath.startsWith("academy-releases/pending/") || !operation.manifestPath.endsWith("/course.release.json")) {
        throw new Error("AI plan contains an invalid course manifest path");
      }
      if (operation.price !== undefined && (!Number.isFinite(operation.price) || operation.price < 0)) throw new Error("AI plan contains an invalid price");
      if (operation.instructionalHours !== undefined && (!Number.isFinite(operation.instructionalHours) || operation.instructionalHours <= 0)) throw new Error("AI plan contains invalid instructional hours");
    }
  }
  return {
    summary: plan.summary,
    rationale: plan.rationale,
    risk: plan.risk === "high" || plan.risk === "medium" ? plan.risk : "low",
    requiresOwnerApproval: true,
    operations: plan.operations,
  };
}

export async function planOwnerSiteChange(instruction: string, context?: string): Promise<OwnerSiteChangePlan> {
  if (instruction.trim().length < 8) throw new Error("Provide a specific website change instruction");
  const { token, model } = gatewayConfig();
  const system = `You are the governed Obserra website change planner. Convert the owner's instruction into JSON only. Never output code, markdown, shell commands, arbitrary file paths, deletions, secrets, deployments, or direct publication. Allowed operation kinds are course-release-update, store-product-update, and marketing-campaign-update. Course manifest paths must start with academy-releases/pending/ and end with /course.release.json. Return: {"summary":string,"rationale":string,"risk":"low"|"medium"|"high","requiresOwnerApproval":true,"operations":array}. Preserve truthful product claims. Do not mark an unapproved course as published.`;

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Instruction:\n${instruction}\n\nAvailable context:\n${context ?? "No additional context supplied."}` },
      ],
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`AI Gateway planning failed with ${response.status}`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI Gateway returned no change plan");
  return validatePlan(JSON.parse(raw));
}
