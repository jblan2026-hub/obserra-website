export type ApplicationLaunchResolution =
  | { status: "ready"; url: string; environmentKey: string }
  | { status: "not-configured" | "not-approved"; environmentKey: string };

export function applicationLaunchEnvironmentKey(slug: string) {
  return `APP_LAUNCH_${slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;
}

function approvedLaunchHosts() {
  return new Set(
    (process.env.APP_LAUNCH_ALLOWED_HOSTS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase().replace(/\.$/, ""))
      .filter(Boolean),
  );
}

export function resolveApprovedApplicationLaunchUrl(slug: string): ApplicationLaunchResolution {
  const environmentKey = applicationLaunchEnvironmentKey(slug);
  const raw = process.env[environmentKey]?.trim();
  if (!raw) return { status: "not-configured", environmentKey };

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return { status: "not-approved", environmentKey };
  }

  const host = target.hostname.toLowerCase().replace(/\.$/, "");
  const allowedHosts = approvedLaunchHosts();
  const invalid =
    target.protocol !== "https:" ||
    !host ||
    Boolean(target.username || target.password || target.hash || target.search) ||
    Boolean(target.port && target.port !== "443") ||
    !allowedHosts.has(host);

  if (invalid) return { status: "not-approved", environmentKey };
  return { status: "ready", url: target.toString(), environmentKey };
}
