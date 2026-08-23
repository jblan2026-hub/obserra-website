import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Vercel runtime bootstrap binds one production workload and proves the resulting public release", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/enable-vercel-key-vault-runtime.yml", import.meta.url),
    "utf8",
  );

  assert.match(
    workflow,
    /vars\.AZURE_CLIENT_ID \|\| 'dc3ff3e1-ea35-4879-afa9-fa3eee49df85'/,
  );
  assert.match(
    workflow,
    /vars\.AZURE_TENANT_ID \|\| '7d8b7b64-c80c-4c8a-a514-66f6b1cf8607'/,
  );
  assert.doesNotMatch(workflow, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.match(workflow, /oidcTokenConfig:\{enabled:true,issuerMode:"team"\}/);
  assert.match(workflow, /https:\/\/oidc\.vercel\.com\/\$\{VERCEL_TEAM_SLUG\}/);
  assert.match(workflow, /owner:\$\{VERCEL_TEAM_SLUG\}:project:\$\{VERCEL_PROJECT_NAME\}:environment:production/);
  assert.match(workflow, /--issuer "\$\{issuer\}"/);
  assert.match(workflow, /--subject "\$\{subject\}"/);
  assert.match(workflow, /--audiences "\$\{audience\}"/);
  assert.match(
    workflow,
    /az identity federated-credential update[\s\S]*--issuer "\$\{issuer\}"[\s\S]*--subject "\$\{subject\}"[\s\S]*--audiences "\$\{audience\}"/,
  );
  assert.match(workflow, /federated-credential show/);
  assert.doesNotMatch(workflow, /--parameters/);
  assert.doesNotMatch(workflow, /projects\/\$\{VERCEL_PROJECT_ID\}\/token/);
  assert.doesNotMatch(workflow, /oidc\.vercel\.com\/~token/);

  assert.match(workflow, /KEY_VAULT_SECRETS_USER_ROLE_ID: 4633458b-17de-408a-b874-0445c86b69e6/);
  assert.match(workflow, /roleDefinitionId/);
  assert.match(workflow, /networkAcls\.defaultAction \/\/ "Allow"/);
  assert.match(workflow, /The deployment identity intentionally has no Key Vault data-plane role/);
  assert.doesNotMatch(workflow, /az keyvault secret list/);
  assert.doesNotMatch(workflow, /az keyvault secret show/);
  assert.doesNotMatch(workflow, /decrypt=true/);

  assert.match(workflow, /type: "sensitive"/);
  assert.match(workflow, /OBSERRA_KEY_VAULT_TENANT_ID/);
  assert.match(workflow, /OBSERRA_KEY_VAULT_CLIENT_ID/);
  assert.match(workflow, /CLERK_SECRET_KEY/);
  assert.match(workflow, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.match(workflow, /OBSERRA_APPLICATIONS_SUPABASE_URL: https:\/\/ykmrlcfitsubqajgfnye\.supabase\.co/);
  assert.match(workflow, /OBSERRA_ACADEMY_SUPABASE_URL: https:\/\/nwxnyqlyzyufgoadtqxs\.supabase\.co/);
  assert.match(workflow, /OBSERRA_ACADEMY_SUPABASE_PROJECT_REF: nwxnyqlyzyufgoadtqxs/);
  assert.match(workflow, /OBSERRA_IDENTITY_RUNTIME_ENABLED: "true"/);
  assert.match(workflow, /\.key == \$binding\.key and \.value == \$binding\.value/);
  assert.match(workflow, /production_target and \.type == "plain"/);
  assert.match(workflow, /\.link\.type == "github"/);
  assert.match(workflow, /\.link\.productionBranch == "main"/);

  assert.match(workflow, /gitSource: \{ type: "github", org: \$org, repo: \$repo, ref: \$ref, sha: \$sha \}/);
  assert.match(workflow, /meta: \{ action: "key-vault-runtime-bootstrap" \}/);
  assert.match(workflow, /v13\/deployments\?forceNew=1&teamId=/);
  assert.match(workflow, /replacement_id="\$\(jq -er '\.id \/\/ \.uid \| strings'/);
  assert.doesNotMatch(workflow, /if: github\.event_name == 'push'/);
  assert.doesNotMatch(workflow, /vercel@latest/);
  assert.match(workflow, /\.id == \$deployment/);
  assert.match(workflow, /\.gitSource\.sha == \$sha/);
  assert.match(workflow, /exact_deployment_origin/);
  assert.match(workflow, /\/api\/apps\/commerce-health/);
  assert.match(workflow, /\/api\/academy\/commerce-health/);
  assert.match(workflow, /\.routing\.deploymentId == \$deployment/);
  assert.match(workflow, /\.routing\.gitCommitSha == \$sha/);
  assert.match(workflow, /actions: write/);
  assert.match(
    workflow,
    /actions\/workflows\/production-vercel-public-cutover\.yml\/dispatches/,
  );
  assert.match(
    workflow,
    /\{ref: "main", inputs: \{expected_deployment_id: \$deployment\}\}/,
  );
  assert.match(workflow, /if \[ "\$\{cutover_status\}" != "204" \]/);
  assert.doesNotMatch(workflow, /v2\/deployments\/\$\{replacement_id\}\/aliases/);
});

