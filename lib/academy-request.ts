export function validateAcademyJsonMutation(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!origin) return { status: 403, error: "Forbidden" } as const;

  try {
    if (new URL(origin).origin !== requestUrl.origin) {
      return { status: 403, error: "Forbidden" } as const;
    }
  } catch {
    return { status: 403, error: "Forbidden" } as const;
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { status: 415, error: "Unsupported media type" } as const;
  }
  return null;
}
