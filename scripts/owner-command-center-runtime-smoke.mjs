const baseUrl = (process.env.OWNER_SMOKE_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const ownerMarkers = [
  "PRIVATE OWNER OPERATIONS",
  "Private Course Content Review",
  "OWNER VERIFIED",
  "OWNER ANSWER KEY",
];

function requireHeader(response, name, expectedFragment) {
  const value = response.headers.get(name) ?? "";
  if (!value.toLowerCase().includes(expectedFragment.toLowerCase())) {
    throw new Error(`Owner Command Center smoke failed: ${name} did not include ${expectedFragment}. Received: ${value || "missing"}`);
  }
}

async function request(pathname, redirect = "manual") {
  return fetch(`${baseUrl}${pathname}`, {
    redirect,
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Obserra-Owner-Command-Center-CI-Smoke/1.0",
    },
    signal: AbortSignal.timeout(15_000),
  });
}

const publicResponse = await request("/academy", "follow");
if (publicResponse.status >= 500) {
  throw new Error(`Public Academy smoke failed with HTTP ${publicResponse.status}.`);
}
const publicBody = await publicResponse.text();
if (!/Obserra/i.test(publicBody)) {
  throw new Error("Public Academy smoke failed: expected Obserra content was not rendered.");
}

const ownerResponse = await request("/command-center");
const permittedAnonymousStatuses = new Set([301, 302, 303, 307, 308, 401, 403, 404]);
if (!permittedAnonymousStatuses.has(ownerResponse.status)) {
  throw new Error(`Anonymous owner route returned unsafe HTTP ${ownerResponse.status}; expected redirect or denial.`);
}

requireHeader(ownerResponse, "cache-control", "no-store");
requireHeader(ownerResponse, "x-robots-tag", "noindex");
requireHeader(ownerResponse, "x-frame-options", "deny");
requireHeader(ownerResponse, "referrer-policy", "no-referrer");
requireHeader(ownerResponse, "x-content-type-options", "nosniff");

const ownerBody = await ownerResponse.text();
for (const marker of ownerMarkers) {
  if (ownerBody.includes(marker)) {
    throw new Error(`Anonymous owner route exposed protected marker: ${marker}`);
  }
}

const location = ownerResponse.headers.get("location") ?? "";
if (ownerResponse.status >= 300 && ownerResponse.status < 400 && !location) {
  throw new Error("Anonymous owner route redirected without a Location header.");
}

console.log(
  JSON.stringify({
    contract: "owner-command-center-runtime-smoke-v1",
    publicAcademyStatus: publicResponse.status,
    anonymousOwnerStatus: ownerResponse.status,
    anonymousOwnerRedirect: location || null,
    protectedContentExposed: false,
    privateCacheControl: true,
    privateRobotsControl: true,
    frameDenied: true,
  }),
);
