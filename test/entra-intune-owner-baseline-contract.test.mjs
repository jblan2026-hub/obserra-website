import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Entra and Intune converge to one licensed owner without stripping unrelated services", async () => {
  const baseline = await read("scripts/entra-intune-owner-baseline.ps1");
  const bootstrap = await read("scripts/obserra-owner-bootstrap.sh");

  assert.match(baseline, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.match(baseline, /Microsoft\.Graph\.Authentication/);
  assert.match(baseline, /\/me\?`\$select=id,displayName,userPrincipalName,accountEnabled/);
  assert.match(baseline, /Obserra Production Operators/);
  assert.match(baseline, /unexpectedMembers\.Count -gt 0/);

  assert.match(baseline, /DisableNonOwnerIntuneServicePlans/);
  assert.match(baseline, /servicePlanName -match '\^INTUNE'/);
  assert.match(baseline, /assignedByGroup/);
  assert.match(baseline, /this script will not mutate a shared license group/i);
  assert.match(baseline, /removeLicenses = @\(\)/);
  assert.match(baseline, /exactIntuneLicensedUserCount/);
  assert.match(baseline, /intuneLicensedUserIds\.Count -ne 1/);
  assert.match(bootstrap, /-DisableNonOwnerIntuneServicePlans/);

  assert.match(baseline, /Obserra Owner Windows Production Compliance/);
  assert.match(baseline, /bitLockerEnabled = \$true/);
  assert.match(baseline, /secureBootEnabled = \$true/);
  assert.match(baseline, /codeIntegrityEnabled = \$true/);
  assert.match(baseline, /storageRequireEncryption = \$true/);

  assert.match(baseline, /enabledForReportingButNotEnforced/);
  assert.match(baseline, /AcknowledgeSingleAdminRecoveryRisk/);
  assert.match(baseline, /compliantDevices\.Count -lt 1/);
  assert.match(baseline, /strongMethods\.Count -lt 1/);
  assert.match(baseline, /builtInControls = @\("mfa", "compliantDevice"\)/);
});
