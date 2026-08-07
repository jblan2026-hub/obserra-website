const baseUrl = (process.env.OWNER_SMOKE_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const prohibitedOwnerMarkers = [
  "PRIVATE OWNER OPERATIONS",
  "Private Course Content Review",
  "OWNER VERIFIED",
  "OWNER ANSWER KEY",
  "CORRECT ANSWER",
];

function requireHeader(response, name, expectedFragment) {
  const value = response.headers.get(name) ?? "";
  if (!value.toLowerCase().includes(expectedFragment.toLowerCase())) {
    throw new Error(`Owner-site separation smoke failed: ${name} did not include ${expectedFragment}. Received: ${value || "missing"}`);
  }
}

async function request(pathname, redirect = "manual") {
  return fetch(`${baseUrl}${pathname}`, {
    redirect,
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Obserra-Public-Site-Owner-Separation-CI/1.0",
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
if (ownerResponse.status !== 404) {
  throw new Error(`Unconfigured public owner route returned HTTP ${ownerResponse.status}; expected fail-closed HTTP 404.`);
}

requireHeader(ownerResponse, "cache-control", "no-store");
requireHeader(ownerResponse, "x-robots-tag", "noindex");
requireHeader(ownerResponse, "x-frame-options", "deny");
requireHeader(ownerResponse, "referrer-policy", "no-referrer");
requireHeader(ownerResponse, "x-content-type-options", "nosniff");

const ownerBody = await ownerResponse.text();
for (const marker of prohibitedOwnerMarkers) {
  if (ownerBody.includes(marker)) {
    throw new Error(`Public owner route exposed prohibited private marker: ${marker}`);
  }
}

console.log(
  JSON.stringify({
    contract: "public-owner-site-separation-smoke-v2",
    publicAcademyStatus: publicResponse.status,
    publicOwnerRouteStatus: ownerResponse.status,
    protectedContentExposed: false,
    privateCacheControl: true,
    privateRobotsControl: true,
    frameDenied: true,
  }),
);
