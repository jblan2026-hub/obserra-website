import "server-only";

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

export async function approveCourseRelease(action: OwnerCourseReleaseAction) {
  if (!Number.isFinite(action.price) || action.price < 0) throw new Error("Price must be zero or greater");
  if (!action.manifestPath.startsWith("academy-releases/pending/") || !action.manifestPath.endsWith("/course.release.json")) {
    throw new Error("Invalid course release manifest path");
  }

  const branch = await createOwnerPreviewBranch(`academy-${action.decision}`);
  const { value, sha } = await readRepositoryJson<Record<string, any>>(action.manifestPath, defaultBranch);
  value.commerce = { ...(value.commerce ?? {}), price: action.price, currency: "USD" };
  value.course = {
    ...(value.course ?? {}),
    releaseStatus: action.decision === "approved" ? "approved" : "pending-approval",
  };
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
