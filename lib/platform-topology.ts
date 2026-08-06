export type ObserraDeploymentTarget = {
  key: "website-live" | "website-lcn2" | "integrated-services";
  projectName: string;
  role: "primary-web" | "secondary-web" | "integrated-services";
};

export const sharedPlatformCapabilities = [
  "authentication",
  "authorization",
  "ai-orchestration",
  "academy-catalog",
  "application-catalog",
  "telemetry",
  "health-readiness",
  "maintenance-advisor",
  "preview-publishing",
  "pricing-intelligence",
  "certificate-verification",
] as const;

export const deploymentTargets: ObserraDeploymentTarget[] = [
  { key: "website-live", projectName: "obserra-website-live", role: "primary-web" },
  { key: "website-lcn2", projectName: "obserra-website-lcn2", role: "secondary-web" },
  { key: "integrated-services", projectName: "obserra-integrated-services", role: "integrated-services" },
];

export function resolveDeploymentTarget(): ObserraDeploymentTarget {
  const projectName = process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("integrated-services")
    ? "obserra-integrated-services"
    : process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("website-lcn2")
      ? "obserra-website-lcn2"
      : process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("website-live")
        ? "obserra-website-live"
        : process.env.OBSERRA_DEPLOYMENT_TARGET || "obserra-website-live";

  return deploymentTargets.find((target) => target.projectName === projectName) ?? deploymentTargets[0];
}

export function platformDependencySummary() {
  return {
    sourceModel: "single-source-shared-platform",
    sharedCapabilityCount: sharedPlatformCapabilities.length,
    targetCount: deploymentTargets.length,
    externalCriticalDependencies: ["Clerk", "Stripe", "Vercel AI Gateway", "GitHub"],
    designRule: "Build common capability once and consume it across all targets.",
  };
}
