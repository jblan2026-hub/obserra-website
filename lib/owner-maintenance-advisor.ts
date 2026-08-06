import "server-only";

export type MaintenanceRecommendation = {
  id: string;
  category: "dependency" | "security" | "performance" | "quality" | "content" | "deployment";
  title: string;
  summary: string;
  priority: "low" | "medium" | "high" | "critical";
  evidence: string[];
  proposedInstruction: string;
  requiresPreview: true;
};

export type MaintenanceSnapshot = {
  generatedAt: string;
  branch: string;
  recommendations: MaintenanceRecommendation[];
  releasePolicy: {
    previewRequired: true;
    testsRequired: true;
    productionApprovalRequired: true;
  };
};

const repository = "jblan2026-hub/obserra-website";

function githubHeaders() {
  const token = process.env.OBSERRA_GITHUB_PUBLISH_TOKEN?.trim();
  if (!token) throw new Error("OBSERRA_GITHUB_PUBLISH_TOKEN is not configured");
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readFile(path: string, ref = "main") {
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Unable to inspect ${path}: ${response.status}`);
  const payload = await response.json() as { content: string; encoding: string };
  if (payload.encoding !== "base64") throw new Error(`Unsupported encoding for ${path}`);
  return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function buildMaintenanceSnapshot(ref = "main"): Promise<MaintenanceSnapshot> {
  const [packageText, smokeText] = await Promise.all([
    readFile("package.json", ref),
    readFile("scripts/production-smoke.mjs", ref),
  ]);
  const pkg = JSON.parse(packageText) as { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  const dependencies = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const recommendations: MaintenanceRecommendation[] = [];

  if (!pkg.scripts?.typecheck) {
    recommendations.push({
      id: "quality-typecheck",
      category: "quality",
      title: "Add an explicit TypeScript gate",
      summary: "The package scripts expose build, lint, and tests but no standalone typecheck command.",
      priority: "high",
      evidence: ["package.json has no typecheck script"],
      proposedInstruction: "Add a typecheck script using tsc --noEmit, include it in the release validation workflow, and create a preview branch.",
      requiresPreview: true,
    });
  }

  if (!pkg.scripts?.["test:e2e"] && !pkg.scripts?.["test:preview"]) {
    recommendations.push({
      id: "quality-preview-e2e",
      category: "quality",
      title: "Create a dedicated preview end-to-end gate",
      summary: "Production smoke coverage exists, but there is no separate preview validation command that blocks promotion.",
      priority: "critical",
      evidence: ["test:production exists", "No test:e2e or test:preview script exists"],
      proposedInstruction: "Create a preview end-to-end test command that validates Academy, Obserrian, product catalog, images, owner controls, and certificate verification before production approval.",
      requiresPreview: true,
    });
  }

  if (!smokeText.includes("protection-intelligence")) {
    recommendations.push({
      id: "quality-protection-smoke",
      category: "quality",
      title: "Add protection-page image and route validation",
      summary: "The production smoke suite does not explicitly validate the executive protection visual experience.",
      priority: "high",
      evidence: ["No dedicated protection-intelligence asset assertion found"],
      proposedInstruction: "Add end-to-end assertions for the protection-intelligence page, including hero media, Open Graph image, visible images, and HTTP asset status.",
      requiresPreview: true,
    });
  }

  if (!smokeText.toLowerCase().includes("credential")) {
    recommendations.push({
      id: "quality-credential-assets",
      category: "quality",
      title: "Add credential asset verification",
      summary: "Certification and credential images are not covered by an automated asset gate.",
      priority: "high",
      evidence: ["No credential image assertions found in production smoke tests"],
      proposedInstruction: "Discover all credential image references, validate each asset path, and add automated EC-Council and credential image smoke checks.",
      requiresPreview: true,
    });
  }

  if (!dependencies.ai && !dependencies["@ai-sdk/react"]) {
    recommendations.push({
      id: "ai-sdk-governance",
      category: "dependency",
      title: "Standardize Obserrian on the Vercel AI SDK",
      summary: "AI calls are implemented through direct gateway fetches rather than a typed AI SDK agent runtime.",
      priority: "medium",
      evidence: ["No ai or @ai-sdk/react dependency found"],
      proposedInstruction: "Migrate Obserrian and owner AI planning to the current Vercel AI SDK ToolLoopAgent pattern, preserve fallbacks, and validate through preview.",
      requiresPreview: true,
    });
  }

  recommendations.push({
    id: "maintenance-dependency-review",
    category: "dependency",
    title: "Run controlled dependency and security review",
    summary: "Review framework, identity, payment, analytics, animation, and UI dependencies for supported updates and security advisories.",
    priority: "medium",
    evidence: Object.entries(dependencies).map(([name, version]) => `${name}: ${version}`).slice(0, 12),
    proposedInstruction: "Review current dependency releases and security advisories, propose only supported upgrades, update lockfiles, run lint, typecheck, tests, build, and preview smoke tests.",
    requiresPreview: true,
  });

  return {
    generatedAt: new Date().toISOString(),
    branch: ref,
    recommendations,
    releasePolicy: { previewRequired: true, testsRequired: true, productionApprovalRequired: true },
  };
}
