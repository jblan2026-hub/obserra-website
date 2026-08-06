import "server-only";

import type { OwnerSiteChangePlan } from "./owner-ai-site-changes";

const repository = "jblan2026-hub/obserra-website";
const defaultBranch = "main";

export type OwnerCourseReleaseAction = {
  manifestPath: string;
  price: number;
  decision: "approved" | "rejected";
  notes?: string;
  approvedBy: string;
};

type GitHubContent = { content: string; sha: string; encoding: string };
type GitHubRef = { object: { sha: string } };
type GitHubPullRequest = { number: number; html_url: string; state: string };

type StoreCatalog = { applications: Array<Record<string, any>> };
type MarketingCatalog = { campaigns: Array<Record<string, any>> };

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
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub publishing request failed with ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export async function readRepositoryJson<T>(path: string, ref = defaultBranch): Promise<{ value: T; sha: string }> {
  const result = await githubRequest<GitHubContent>(`/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`);
  if (result.encoding !== "base64") throw new Error("Unsupported GitHub content encoding");
  const decoded = Buffer.from(result.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { value: JSON.parse(decoded) as T, sha: result.sha };
}

export async function writeRepositoryJson(path: string, value: unknown, sha: string, message: string, branch: string) {
  if (!branch.startsWith("owner-preview/")) throw new Error("Website publishing is restricted to owner preview branches");
  return githubRequest<{ commit: { sha: string } }>(`/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      branch,
      sha,
      content: Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8").toString("base64"),
    }),
  });
}

async function createOwnerPreviewBranch(label: string) {
  const mainRef = await githubRequest<GitHubRef>(`/git/ref/heads/${defaultBranch}`);
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "site-change";
  const branch = `owner-preview/${safeLabel}-${crypto.randomUUID().slice(0, 8)}`;
  await githubRequest(`/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainRef.object.sha }),
  });
  return branch;
}

async function openPreviewPullRequest(branch: string, title: string, body: string) {
  return githubRequest<GitHubPullRequest>(`/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title,
      head: branch,
      base: defaultBranch,
      body,
      draft: true,
      maintainer_can_modify: false,
    }),
  });
}

function updateCourseManifest(value: Record<string, any>, operation: Extract<OwnerSiteChangePlan["operations"][number], { kind: "course-release-update" }>) {
  value.course = { ...(value.course ?? {}) };
  value.commerce = { ...(value.commerce ?? {}) };
  value.ownerApproval = { ...(value.ownerApproval ?? {}) };
  if (operation.title !== undefined) value.course.title = operation.title;
  if (operation.description !== undefined) value.course.description = operation.description;
  if (operation.audience !== undefined) value.course.audience = operation.audience;
  if (operation.instructionalHours !== undefined) value.course.instructionalHours = operation.instructionalHours;
  if (operation.price !== undefined) {
    value.commerce.price = operation.price;
    value.commerce.currency = "USD";
    value.ownerApproval.priceApproved = false;
  }
  if (operation.ownerNotes !== undefined) value.ownerApproval.notes = operation.ownerNotes;
  value.course.releaseStatus = "pending-approval";
  value.ownerApproval.status = "pending";
  value.ownerApproval.approvedBy = null;
  value.ownerApproval.approvedAt = null;
  return value;
}

export async function createOwnerAiPreview(plan: OwnerSiteChangePlan, approvedBy: string) {
  if (!plan.requiresOwnerApproval || plan.operations.length === 0) throw new Error("A reviewed AI change plan is required");
  const branch = await createOwnerPreviewBranch(plan.summary);
  const changedPaths: string[] = [];

  const storeOperations = plan.operations.filter((operation) => operation.kind === "store-product-update");
  if (storeOperations.length) {
    const path = "app/apps/store-catalog.json";
    const { value, sha } = await readRepositoryJson<StoreCatalog>(path, defaultBranch);
    for (const operation of storeOperations) {
      const product = value.applications.find((entry) => entry.slug === operation.productSlug);
      if (!product) throw new Error(`Unknown store product ${operation.productSlug}`);
      if (operation.description !== undefined) product.description = operation.description;
      if (operation.pricing !== undefined) product.pricing = operation.pricing;
      if (operation.features !== undefined) product.features = operation.features;
      if (operation.integrations !== undefined) product.integrations = operation.integrations;
    }
    await writeRepositoryJson(path, value, sha, `Owner AI preview: update ${storeOperations.length} store product record(s)`, branch);
    changedPaths.push(path);
  }

  const marketingOperations = plan.operations.filter((operation) => operation.kind === "marketing-campaign-update");
  if (marketingOperations.length) {
    const path = "app/apps/marketing-catalog.json";
    const { value, sha } = await readRepositoryJson<MarketingCatalog>(path, defaultBranch);
    for (const operation of marketingOperations) {
      let campaign = value.campaigns.find((entry) => entry.slug === operation.productSlug);
      if (!campaign) {
        campaign = { slug: operation.productSlug, status: "draft", approval: { approved: false, claimsReviewed: false } };
        value.campaigns.push(campaign);
      }
      if (operation.headline !== undefined) campaign.headline = operation.headline;
      if (operation.shortDescription !== undefined) campaign.shortDescription = operation.shortDescription;
      if (operation.longDescription !== undefined) campaign.longDescription = operation.longDescription;
      if (operation.primaryCta !== undefined) campaign.primaryCta = operation.primaryCta;
      if (operation.secondaryCta !== undefined) campaign.secondaryCta = operation.secondaryCta;
      campaign.status = "draft";
      campaign.approval = { approved: false, approvedBy: null, approvedAt: null, claimsReviewed: false };
    }
    await writeRepositoryJson(path, value, sha, `Owner AI preview: update ${marketingOperations.length} marketing campaign(s)`, branch);
    changedPaths.push(path);
  }

  for (const operation of plan.operations.filter((entry) => entry.kind === "course-release-update")) {
    const { value, sha } = await readRepositoryJson<Record<string, any>>(operation.manifestPath, defaultBranch);
    updateCourseManifest(value, operation);
    await writeRepositoryJson(operation.manifestPath, value, sha, `Owner AI preview: update Academy release ${value.course?.id ?? "course"}`, branch);
    changedPaths.push(operation.manifestPath);
  }

  const pullRequest = await openPreviewPullRequest(
    branch,
    `Owner AI preview: ${plan.summary}`,
    [
      "## Governed owner AI website preview",
      "",
      plan.rationale,
      "",
      `Requested by: **${approvedBy}**`,
      `Risk classification: **${plan.risk}**`,
      "",
      "### Changed governed records",
      ...changedPaths.map((path) => `* \`${path}\``),
      "",
      "Vercel will create a preview deployment for this branch. Production remains unchanged until the owner reviews the preview, confirms the end to end checks are green, and merges this pull request.",
    ].join("\n"),
  );

  return {
    previewBranch: branch,
    pullRequestNumber: pullRequest.number,
    pullRequestUrl: pullRequest.html_url,
    changedPaths,
    productionChanged: false,
  };
}

export async function approveCourseRelease(action: OwnerCourseReleaseAction) {
  if (!Number.isFinite(action.price) || action.price < 0) throw new Error("Price must be zero or greater");
  if (!action.manifestPath.startsWith("academy-releases/pending/") || !action.manifestPath.endsWith("/course.release.json")) {
    throw new Error("Invalid course release manifest path");
  }

  const branch = await createOwnerPreviewBranch(`academy-${action.decision}`);
  const { value, sha } = await readRepositoryJson<Record<string, any>>(action.manifestPath, defaultBranch);
  value.commerce = { ...(value.commerce ?? {}), price: action.price, currency: "USD" };
  value.course = { ...(value.course ?? {}), releaseStatus: action.decision === "approved" ? "approved" : "pending-approval" };
  value.ownerApproval = {
    ...(value.ownerApproval ?? {}),
    status: action.decision,
    approvedBy: action.approvedBy,
    approvedAt: new Date().toISOString(),
    priceApproved: action.decision === "approved",
    notes: action.notes ?? "",
  };

  const result = await writeRepositoryJson(
    action.manifestPath,
    value,
    sha,
    `${action.decision === "approved" ? "Approve" : "Reject"} Academy course release ${value.course?.id ?? "course"}`,
    branch,
  );

  const pullRequest = await openPreviewPullRequest(
    branch,
    `Owner preview: ${action.decision} Academy course ${value.course?.title ?? value.course?.id ?? "course"}`,
    [
      "## Governed owner website preview",
      "",
      `Decision: **${action.decision}**`,
      `Price: **$${action.price.toFixed(2)} USD**`,
      `Manifest: \`${action.manifestPath}\``,
      "",
      "Vercel will create a preview deployment for this branch. Production remains unchanged until the owner reviews the preview, confirms all validation checks are green, and merges this pull request.",
    ].join("\n"),
  );

  return {
    commitSha: result.commit.sha,
    manifest: value,
    previewBranch: branch,
    pullRequestNumber: pullRequest.number,
    pullRequestUrl: pullRequest.html_url,
    productionChanged: false,
  };
}
