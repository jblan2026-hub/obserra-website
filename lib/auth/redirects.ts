const REDIRECT_BASE = new URL("https://www.obserrallc.com");
const DEFAULT_REDIRECT = "/portal";
const MAX_REDIRECT_LENGTH = 2_000;

function normalizedRelativeRedirect(value: string | undefined) {
  const candidate = value?.trim();
  if (
    !candidate ||
    candidate.length > MAX_REDIRECT_LENGTH ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) return null;

  try {
    const parsed = new URL(candidate, REDIRECT_BASE);
    if (parsed.origin !== REDIRECT_BASE.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function safeRelativeRedirect(
  value: string | string[] | undefined,
  fallback = DEFAULT_REDIRECT,
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return normalizedRelativeRedirect(candidate)
    ?? normalizedRelativeRedirect(fallback)
    ?? DEFAULT_REDIRECT;
}
