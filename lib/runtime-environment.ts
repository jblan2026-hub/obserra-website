export type ObserraRuntimeEnvironment = "production" | "preview" | "development" | "unknown";

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

function normalized(value: string | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || undefined;
}

export function obserraRuntimeEnvironment(
  environment: RuntimeEnvironment = process.env,
): ObserraRuntimeEnvironment {
  const explicit = normalized(environment.OBSERRA_RUNTIME_ENVIRONMENT);
  if (explicit === "production" || explicit === "preview" || explicit === "development") {
    return explicit;
  }

  const vercel = normalized(environment.VERCEL_ENV);
  if (vercel === "production" || vercel === "preview" || vercel === "development") {
    return vercel;
  }

  return "unknown";
}

export function isProductionRuntime(environment: RuntimeEnvironment = process.env) {
  return obserraRuntimeEnvironment(environment) === "production";
}

export function isPreviewRuntime(environment: RuntimeEnvironment = process.env) {
  return obserraRuntimeEnvironment(environment) === "preview";
}
