import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const paths = {
  validation: "lib/florida-class-d-production-owner-validation.ts",
  identity: "lib/florida-class-d-production-owner-identity.ts",
  commandCenter: "app/florida-security-training/owner-validation/page.tsx",
  identityPage: "app/florida-security-training/owner-validation/identity/page.tsx",
  identityClient: "app/florida-security-training/owner-validation/identity/OwnerIdentityValidationClient.tsx",
  identityApi: "app/api/florida-class-d/owner-validation/identity/route.ts",
  mutationBoundary: "lib/florida-class-d-mutation-boundary.ts",
  providerRouting: "lib/auth/provider-routing.ts",
};

function source(path) {
  assert.ok(existsSync(path), `${path} must exist`);
  return readFileSync(path, "utf8");
}

function identityModule({ principal, stripe }) {
  const output = ts.transpileModule(source(paths.identity), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    URL,
    Set,
    require: (specifier) => {
      if (specifier === "server-only") return {};
      if (specifier === "./stripe") return { getStripe: () => stripe };
      if (specifier === "./florida-class-d-production-owner-validation") {
        return {
          requireFloridaClassDProductionOwnerValidationPrincipal: async () => principal,
        };
      }
      throw new Error(`Unexpected import ${specifier}`);
    },
  });
  return module.exports;
}

test("AAL2 owner can inspect production validation readiness without provider authorization bypass", () => {
  const validation = source(paths.validation);
  const page = source(paths.commandCenter);

  assert.match(validation, /export async function requireFloridaClassDProductionOwnerPrincipal\(/);
  assert.match(page, /requireFloridaClassDProductionOwnerPrincipal/);
  assert.doesNotMatch(page, /requireFloridaClassDProductionOwnerValidationPrincipal\(\)/);
  assert.match(page, /configuration\.blockingKeys/);
  assert.match(page, /Production owner validation is blocked/);
});

test("production owner identity diagnostic creates only a live hosted document plus matching-selfie session", async () => {
  const calls = [];
  const principal = {
    principalId: "obserra-owner-0001",
    sessionId: "b9cf1c2d-b039-4cd4-b7e7-b3b8bff2e463",
    releaseCommitSha: "54cdf7091239eb49996d3e0c00263fd0b2378858",
  };
  const stripe = {
    identity: {
      verificationSessions: {
        create: async (body, options) => {
          calls.push({ body, options });
          return {
            id: "vs_owner_validation_12345678",
            url: "https://verify.stripe.com/start/test-owner-validation",
            status: "requires_input",
            livemode: true,
            metadata: body.metadata,
          };
        },
        retrieve: async () => { throw new Error("not used"); },
      },
    },
  };

  const api = identityModule({ principal, stripe });
  const result = await api.createFloridaClassDProductionOwnerIdentityVerification();

  assert.equal(calls.length, 1);
  const [{ body, options }] = calls;
  assert.equal(body.type, "document");
  assert.equal(body.options.document.require_matching_selfie, true);
  assert.deepEqual([...body.options.document.allowed_types], ["driving_license", "id_card", "passport"]);
  assert.equal(body.return_url, "https://www.obserrallc.com/florida-security-training/owner-validation/identity?provider_return=1");
  assert.equal(body.metadata.obserra_surface, "fdacs_production_owner_validation");
  assert.equal(body.metadata.obserra_principal_id, principal.principalId);
  assert.equal(body.metadata.obserra_auth_session_id, principal.sessionId);
  assert.equal(body.metadata.obserra_release_sha, principal.releaseCommitSha);
  assert.match(options.idempotencyKey, /^fdacs-owner-idv-v1-/);
  assert.equal(result.verificationSessionId, "vs_owner_validation_12345678");
  assert.equal(result.providerLivemode, true);
  assert.equal(result.trainingCreditEligible, false);
  assert.equal(result.enrollmentCreated, false);
  assert.equal(result.fdacsApprovalClaimed, false);
  assert.equal("email" in result, false);
  assert.equal("document" in result, false);
});

test("production owner identity status accepts only a session bound to the same principal, AAL2 session, and release", async () => {
  const principal = {
    principalId: "obserra-owner-0001",
    sessionId: "b9cf1c2d-b039-4cd4-b7e7-b3b8bff2e463",
    releaseCommitSha: "54cdf7091239eb49996d3e0c00263fd0b2378858",
  };
  let session = {
    id: "vs_owner_validation_12345678",
    status: "verified",
    livemode: true,
    last_error: null,
    metadata: {
      obserra_surface: "fdacs_production_owner_validation",
      obserra_principal_id: principal.principalId,
      obserra_auth_session_id: principal.sessionId,
      obserra_release_sha: principal.releaseCommitSha,
    },
  };
  const stripe = {
    identity: {
      verificationSessions: {
        create: async () => { throw new Error("not used"); },
        retrieve: async () => session,
      },
    },
  };
  const api = identityModule({ principal, stripe });

  const ready = await api.getFloridaClassDProductionOwnerIdentityVerificationStatus(session.id);
  assert.deepEqual(
    JSON.parse(JSON.stringify(ready)),
    {
      status: "verified",
      verified: true,
      providerLivemode: true,
      providerErrorCode: null,
      trainingCreditEligible: false,
      enrollmentCreated: false,
      fdacsApprovalClaimed: false,
    },
  );

  session = { ...session, metadata: { ...session.metadata, obserra_release_sha: "a".repeat(40) } };
  await assert.rejects(
    api.getFloridaClassDProductionOwnerIdentityVerificationStatus("vs_owner_validation_12345678"),
    /bound to this owner validation session/,
  );
});

test("owner identity API stays same-origin governed, private, non-credit, and separate from learner persistence", () => {
  const api = source(paths.identityApi);
  const page = source(paths.identityPage);
  const client = source(paths.identityClient);
  const boundary = source(paths.mutationBoundary);
  const routing = source(paths.providerRouting);
  const identity = source(paths.identity);

  assert.match(boundary, /OWNER_VALIDATION_PREFIX/);
  assert.match(api, /createFloridaClassDProductionOwnerIdentityVerification/);
  assert.match(api, /getFloridaClassDProductionOwnerIdentityVerificationStatus/);
  assert.match(api, /private, no-store/);
  assert.match(api, /httpOnly:\s*true/);
  assert.match(api, /secure:\s*true/);
  assert.match(api, /sameSite:\s*"lax"/);
  assert.match(api, /trainingCreditEligible:\s*false/);
  assert.match(page, /requireFloridaClassDProductionOwnerPrincipal/);
  assert.match(client, /\/api\/florida-class-d\/owner-validation\/identity/);
  assert.match(client, /window\.location\.assign/);
  assert.doesNotMatch(identity, /floridaClassDPersistenceRequest|fdacs_class_d_create_pre_enrollment|student_identities|enrollments/);
  assert.match(routing, /\/florida-security-training\/owner-validation/);
});
