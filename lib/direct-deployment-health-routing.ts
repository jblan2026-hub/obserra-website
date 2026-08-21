import { CANONICAL_PUBLIC_VERCEL_PROJECT_ID } from "./auth/runtime-config";

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
  if (environment.VERCEL_ENV?.trim() !== "production") return false;
  if (environment.VERCEL_PROJECT_ID?.trim() !== CANONICAL_PUBLIC_VERCEL_PROJECT_ID) return false;

  const normalizedHost = host.trim().toLowerCase().replace(/\.$/, "");
  return normalizedHost.endsWith(".vercel.app");
}
