const baseUrl = String(process.env.OWNER_SMOKE_BASE_URL ?? "").trim();

if (!baseUrl) {
  throw new Error("OWNER_SMOKE_BASE_URL is required");
}

const origin = new URL(baseUrl).origin;
const timeoutMs = 8_000;

async function request(pathname) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: "text/html,application/json",
      "User-Agent": "Obserra-Public-Owner-Separation-Smoke/1.0",
    },
  });
  return response;
}

async function assertPublicRoute() {
  const response = await request("/");
  if (response.status !== 200) {
    throw new Error(`Public homepage returned ${response.status}; expected 200`);
  }

  const body = await response.text();
  for (const prohibited of [
    "PRIVATE ACADEMY REVIEW SITE",
    "OWNER COMMAND CENTER",
    "OWNER COURSE CONTENT REVIEW",
    "OWNER VERIFIED",
  ]) {
    if (body.includes(prohibited)) {
      throw new Error(`Public homepage leaked private owner marker: ${prohibited}`);
    }
  }
}

async function assertPrivateRouteAbsent(pathname) {
  const response = await request(pathname);
  if (![401, 403, 404].includes(response.status)) {
    throw new Error(`${pathname} returned ${response.status}; expected a fail-closed 401, 403, or 404`);
  }

  const body = await response.text();
  for (const prohibited of [
    "OWNER COURSE CONTENT REVIEW",
    "OWNER VERIFIED",
    "PRIVATE ACADEMY REVIEW SITE",
  ]) {
    if (body.includes(prohibited)) {
      throw new Error(`${pathname} disclosed private owner content while denied`);
    }
  }
}

await assertPublicRoute();
for (const pathname of [
  "/command-center",
  "/command-center/academy",
  "/command-center/academy/example-course",
  "/api/command-center/academy",
]) {
  await assertPrivateRouteAbsent(pathname);
}

console.log("Public website owner-site separation smoke passed.");
