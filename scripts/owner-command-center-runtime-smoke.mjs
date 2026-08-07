const baseUrl = (process.env.OWNER_SMOKE_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const prohibitedOwnerMarkers = [
  "Course Content, Publication, and Purchasing",
  "OWNER ID VERIFIED",
  "KNOWLEDGE CHECK AND ANSWER KEY",
  "FINAL ASSESSMENT · OWNER ANSWER KEY",
  "Publish and enable purchasing",
];

function requireHeader(response, name, expectedFragment) {
  const value = response.headers.get(name) ?? "";
  if (!value.toLowerCase().includes(expectedFragment.toLowerCase())) {
    throw new Error(`Owner containment smoke failed: ${name} did not include ${expectedFragment}. Received: ${value || "missing"}`);
  }
}

async function request(pathname, redirect = "manual") {
  return fetch(`${baseUrl}${pathname}`, {
    redirect,
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Obserra-Owner-Gateway-CI/1.0",
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
if (![302, 303, 307, 308].includes(ownerResponse.status)) {
  throw new Error(`Unauthenticated owner route returned HTTP ${ownerResponse.status}; expected a controlled identity redirect.`);
}
const location = ownerResponse.headers.get("location") ?? "";
if (!location.includes("/owner-access") || !location.includes("redirect_url")) {
  throw new Error(`Owner route did not redirect to the private owner gateway. Received: ${location || "missing"}`);
}

requireHeader(ownerResponse, "cache-control", "no-store");
requireHeader(ownerResponse, "x-robots-tag", "noindex");
requireHeader(ownerResponse, "x-frame-options", "deny");
requireHeader(ownerResponse, "referrer-policy", "no-referrer");
requireHeader(ownerResponse, "x-content-type-options", "nosniff");

const ownerBody = await ownerResponse.text();
for (const marker of prohibitedOwnerMarkers) {
  if (ownerBody.includes(marker)) {
    throw new Error(`Unauthenticated owner route exposed prohibited private marker: ${marker}`);
  }
}

console.log(
  JSON.stringify({
    contract: "owner-id-gateway-containment-smoke-v3",
    publicAcademyStatus: publicResponse.status,
    publicOwnerRouteStatus: ownerResponse.status,
    ownerGatewayRedirected: true,
    protectedContentExposed: false,
    privateCacheControl: true,
    privateRobotsControl: true,
    frameDenied: true,
  }),
);
