import http from "k6/http";
import { check, fail, sleep } from "k6";

const TARGET_CONCURRENT_STUDENTS = 200;
const STATE_REFRESH_SECONDS = 15;
const HEARTBEAT_SECONDS = 60;
const MEDIA_REFRESH_SECONDS = 15 * 60;
const DEFAULT_DURATION = "10m";

function required(name) {
  const value = (__ENV[name] || "").trim();
  if (!value) fail(`${name} is required`);
  return value;
}

function targetOrigin() {
  const raw = required("FDACS_LOAD_TEST_ORIGIN");
  const url = new URL(raw);
  if (url.protocol !== "https:") fail("FDACS_LOAD_TEST_ORIGIN must use HTTPS");
  if (url.pathname !== "/" || url.search || url.hash) fail("FDACS_LOAD_TEST_ORIGIN must be an origin only");
  if (url.hostname === "www.obserrallc.com" && __ENV.ALLOW_PRODUCTION_LOAD_TEST !== "true") {
    fail("Production load testing is blocked unless ALLOW_PRODUCTION_LOAD_TEST=true is explicitly set");
  }
  return url.origin;
}

function identities() {
  const raw = required("FDACS_LOAD_TEST_IDENTITIES_JSON");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("FDACS_LOAD_TEST_IDENTITIES_JSON must be valid JSON");
  }
  if (!Array.isArray(parsed) || parsed.length !== TARGET_CONCURRENT_STUDENTS) {
    fail(`FDACS_LOAD_TEST_IDENTITIES_JSON must contain exactly ${TARGET_CONCURRENT_STUDENTS} real authenticated learner identities`);
  }
  for (const [index, identity] of parsed.entries()) {
    if (!identity || typeof identity !== "object") fail(`identity ${index + 1} is invalid`);
    if (typeof identity.cookie !== "string" || identity.cookie.length < 16) fail(`identity ${index + 1} cookie is invalid`);
    if (typeof identity.liveSessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(identity.liveSessionId)) fail(`identity ${index + 1} liveSessionId is invalid`);
    if (identity.browserInstanceId !== undefined && (typeof identity.browserInstanceId !== "string" || identity.browserInstanceId.length < 12)) {
      fail(`identity ${index + 1} browserInstanceId is invalid`);
    }
  }
  return parsed;
}

const ORIGIN = targetOrigin();
const IDENTITIES = identities();

export const options = {
  scenarios: {
    fdacs_200_authenticated_students: {
      executor: "constant-vus",
      vus: TARGET_CONCURRENT_STUDENTS,
      duration: (__ENV.FDACS_LOAD_TEST_DURATION || DEFAULT_DURATION).trim(),
      gracefulStop: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000", "p(99)<4000"],
    checks: ["rate>0.99"],
  },
};

let leaseId = null;
let lastHeartbeatAt = 0;
let lastStateRefreshAt = 0;
let lastMediaRefreshAt = 0;

function headers(identity) {
  return {
    cookie: identity.cookie,
    "content-type": "application/json",
    accept: "application/json",
  };
}

function post(identity, body, tags) {
  return http.post(`${ORIGIN}/api/florida-class-d/live`, JSON.stringify(body), {
    headers: headers(identity),
    redirects: 0,
    tags,
  });
}

function join(identity) {
  const response = post(identity, {
    action: "join",
    liveSessionId: identity.liveSessionId,
    browserInstanceId: identity.browserInstanceId || `k6-vu-${String(__VU).padStart(3, "0")}-obserra`,
  }, { operation: "join" });
  const ok = check(response, {
    "join returns 201": (r) => r.status === 201,
    "join returns device lease": (r) => {
      try {
        const body = r.json();
        return typeof body.deviceLeaseId === "string" && body.deviceLeaseId.length === 36;
      } catch {
        return false;
      }
    },
  });
  if (!ok) fail(`VU ${__VU} could not acquire regulated device lease: HTTP ${response.status}`);
  leaseId = response.json("deviceLeaseId");
}

function refreshState(identity) {
  const response = http.get(
    `${ORIGIN}/api/florida-class-d/live?liveSessionId=${encodeURIComponent(identity.liveSessionId)}`,
    { headers: headers(identity), redirects: 0, tags: { operation: "state" } },
  );
  check(response, {
    "state returns 200": (r) => r.status === 200,
    "state remains private no-store": (r) => (r.headers["Cache-Control"] || "").toLowerCase().includes("no-store"),
  });
}

function heartbeat(identity) {
  const response = post(identity, { action: "heartbeat", deviceLeaseId: leaseId }, { operation: "heartbeat" });
  check(response, {
    "heartbeat returns 200": (r) => r.status === 200,
    "heartbeat returns presence": (r) => {
      try {
        return Boolean(r.json("presence"));
      } catch {
        return false;
      }
    },
  });
}

function refreshMedia(identity) {
  const response = http.get(
    `${ORIGIN}/api/florida-class-d/media?liveSessionId=${encodeURIComponent(identity.liveSessionId)}`,
    { headers: headers(identity), redirects: 0, tags: { operation: "media" } },
  );
  check(response, {
    "media returns 200": (r) => r.status === 200,
    "media returns time-bounded Daily access": (r) => {
      try {
        const body = r.json();
        return body.provider === "daily" && typeof body.joinUrl === "string" && typeof body.tokenExpiresAt === "string";
      } catch {
        return false;
      }
    },
  });
}

export default function floridaClassDStudentLoad() {
  const identity = IDENTITIES[__VU - 1];
  const now = Date.now();

  if (!leaseId) {
    join(identity);
    refreshMedia(identity);
    refreshState(identity);
    lastHeartbeatAt = now;
    lastStateRefreshAt = now;
    lastMediaRefreshAt = now;
  }

  if (now - lastHeartbeatAt >= HEARTBEAT_SECONDS * 1000) {
    heartbeat(identity);
    lastHeartbeatAt = now;
  }

  if (now - lastStateRefreshAt >= STATE_REFRESH_SECONDS * 1000) {
    refreshState(identity);
    lastStateRefreshAt = now;
  }

  if (now - lastMediaRefreshAt >= MEDIA_REFRESH_SECONDS * 1000) {
    refreshMedia(identity);
    lastMediaRefreshAt = now;
  }

  sleep(1);
}

export function teardown() {
  // Device leases expire safely through the regulated stale-lease policy if a VU terminates abruptly.
}
