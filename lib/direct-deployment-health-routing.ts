import { CANONICAL_PUBLIC_VERCEL_PROJECT_ID } from "./auth/runtime-config";
import { isProductionRuntime } from "./runtime-environment";

const DIRECT_DEPLOYMENT_HEALTH_PATHS = new Set([
  "/api/health",
  "/api/academy/commerce-health",
  "/api/florida-class-d/health/live",
  "/api/florida-class-d/health/ready",
]);

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

type DirectDeploymentHealthRequest = {
  pathname: string;
  method: string;
  host: string;
  environment?: RuntimeEnvironment;
};

export function shouldServeDirectDeploymentHealth({
  pathname,
  method,
  host,
  environment = process.env,
}: DirectDeploymentHealthRequest) {
  if (method.toUpperCase() !== "GET") return false;
  if (!DIRECT_DEPLOYMENT_HEALTH_PATHS.has(pathname)) return false;

  const normalizedHost = host.trim().toLowerCase().replace(/\.$/, "");
  if (!normalizedHost) return false;

  const vercelDirect =
    environment.VERCEL_ENV?.trim() === "production" &&
    environment.VERCEL_PROJECT_ID?.trim() === CANONICAL_PUBLIC_VERCEL_PROJECT_ID &&
    normalizedHost.endsWith(".vercel.app");
  if (vercelDirect) return true;

  const azureDirect =
    isProductionRuntime(environment) &&
    environment.OBSERRA_HOSTING_PROVIDER?.trim().toLowerCase() === "azure-app-service" &&
    normalizedHost.endsWith(".azurewebsites.net");
  return azureDirect;
}
