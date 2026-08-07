const baseUrl = String(process.env.OWNER_SMOKE_BASE_URL ?? "").trim();

if (!baseUrl) {
  throw new Error("OWNER_SMOKE_BASE_URL is required");
}

const origin = new URL(baseUrl).origin;
const ownerOrigin = "https://owner.obserrallc.com";
const timeoutMs = 8_000;
const privateMarkers = [
  "PRIVATE ACADEMY REVIEW SITE",
  "OWNER COMMAND CENTER",
  "OWNER COURSE CONTENT REVIEW",
  "OWNER VERIFIED",
];

async function request(pathname) {
  return fetch(new URL(pathname, origin), {
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: "text/html,application/json",
      "User-Agent": "Obserra-Public-Owner-Separation-Smoke/1.1",
    },
  });
}

function assertNoPrivateMarkers(body, context) {
  for (const prohibited of privateMarkers) {
    if (body.includes(prohibited)) {
      throw new Error(`${context} leaked private owner marker: ${prohibited}`);
    }
  }
}

async function assertPublicRoute() {
  const response = await request("/");
  if (response.status !== 200) {
    throw new Error(`Public homepage returned ${response.status}; expected 200`);
  }
  assertNoPrivateMarkers(await response.text(), "Public homepage");
}

function assertApprovedOwnerRedirect(pathname, response) {
  const location = response.headers.get("location");
  if (!location) {
    throw new Error(`${pathname} returned ${response.status} without a redirect location`);
  }
  const destination = new URL(location, origin);
  const localGateway = destination.origin === origin && destination.pathname === "/owner-access";
  const separateOwnerSite = destination.origin === ownerOrigin;
  if (!localGateway && !separateOwnerSite) {
    throw new Error(`${pathname} redirected to an unapproved destination: ${destination.toString()}`);
  }
  if (destination.pathname.startsWith("/command-center") && destination.origin === origin) {
    throw new Error(`${pathname} remained on the public origin instead of the private owner boundary`);
  }
}

async function assertPrivateRouteSeparated(pathname) {
  const response = await request(pathname);
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    assertApprovedOwnerRedirect(pathname, response);
    return;
  }
  if (![401, 403, 404].includes(response.status)) {
    throw new Error(`${pathname} returned ${response.status}; expected an approved private-site redirect or fail-closed denial`);
  }
  assertNoPrivateMarkers(await response.text(), pathname);
}

await assertPublicRoute();
for (const pathname of [
  "/command-center",
  "/command-center/academy",
  "/command-center/academy/example-course",
  "/api/owner/academy",
]) {
  await assertPrivateRouteSeparated(pathname);
}

console.log("Public website owner-site separation smoke passed.");
