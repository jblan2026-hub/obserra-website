import "server-only";

import { notFound, redirect } from "next/navigation";

const OWNER_SITE_PATHS = new Set(["/command-center", "/control-alignment", "/course"]);

function configuredOwnerSiteOrigin() {
  const raw = String(process.env.OBSERRA_OWNER_SITE_URL ?? "").trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    return null;
  }

  return new URL(`${url.protocol}//${url.host}/`);
}

export function redirectToOwnerSite(pathname: string) {
  if (!OWNER_SITE_PATHS.has(pathname)) notFound();
  const origin = configuredOwnerSiteOrigin();
  if (!origin) notFound();
  redirect(new URL(pathname, origin).toString());
}
