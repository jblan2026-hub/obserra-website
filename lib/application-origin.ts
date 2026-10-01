import { CANONICAL_PUBLIC_ORIGIN } from "./legal-identity";

/** The application stays on www until the separate platform is explicitly configured. */
export function applicationOrigin(environment: Readonly<Record<string, string | undefined>> = process.env) {
  const configured = environment.OBSERRA_APPLICATION_ORIGIN?.trim();
  if (!configured) return CANONICAL_PUBLIC_ORIGIN;
  const origin = new URL(configured);
  if (
    origin.protocol !== "https:" || origin.username || origin.password ||
    origin.port || origin.pathname !== "/" || origin.search || origin.hash ||
    !["www.obserrallc.com", "platform.obserrallc.com"].includes(origin.hostname)
  ) {
    throw new Error("OBSERRA_APPLICATION_ORIGIN must be the approved Obserra website or platform HTTPS origin.");
  }
  return origin.origin;
}
