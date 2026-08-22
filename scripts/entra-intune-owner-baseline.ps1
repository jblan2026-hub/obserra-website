[CmdletBinding()]
param(
  [string]$TenantId = "5a08a33a-d2b5-491d-ac6d-32f325138143",
  [string]$OwnerUserPrincipalName = "",
  [switch]$Enforce,
  [switch]$AcknowledgeSingleAdminRecoveryRisk,
  [string]$EvidencePath = "./obserra-entra-intune-owner-evidence.json"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

if ($TenantId -ne "5a08a33a-d2b5-491d-ac6d-32f325138143") {
  throw "The workforce tenant does not match the approved Obserra Entra/Intune tenant."
}

if (-not (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
  Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force -AllowClobber
}
Import-Module Microsoft.Graph.Authentication

$scopes = @(
  "Directory.Read.All",
  "Group.ReadWrite.All",
  "LicenseAssignment.ReadWrite.All",
  "Organization.Read.All",
  "Policy.ReadWrite.ConditionalAccess",
  "DeviceManagementConfiguration.ReadWrite.All",
  "DeviceManagementManagedDevices.Read.All",
  "User.Read",
  "UserAuthenticationMethod.Read.All"
)
Connect-MgGraph -TenantId $TenantId -Scopes $scopes -NoWelcome

function Invoke-Graph {
  param(
    [Parameter(Mandatory)][ValidateSet("GET", "POST", "PATCH", "DELETE")][string]$Method,
    [Parameter(Mandatory)][string]$Uri,
    [object]$Body
  )
  if ($null -eq $Body) {
    return Invoke-MgGraphRequest -Method $Method -Uri $Uri -OutputType PSObject
  }
  return Invoke-MgGraphRequest -Method $Method -Uri $Uri -Body ($Body | ConvertTo-Json -Depth 20 -Compress) -ContentType "application/json" -OutputType PSObject
}

function Get-Collection {
  param([Parameter(Mandatory)][string]$Uri)
  $items = @()
  $next = $Uri
  while ($next) {
    $page = Invoke-Graph -Method GET -Uri $next
    $items += @($page.value)
    $next = $page.'@odata.nextLink'
  }
  return @($items)
}

$context = Get-MgContext
if ($context.TenantId -ne $TenantId) { throw "Microsoft Graph authenticated to the wrong tenant." }
$owner = Invoke-Graph -Method GET -Uri "https://graph.microsoft.com/v1.0/me?`$select=id,displayName,userPrincipalName,accountEnabled"
if (-not $owner.accountEnabled) { throw "The signed-in owner account is disabled." }
if ($OwnerUserPrincipalName -and $owner.userPrincipalName -ne $OwnerUserPrincipalName) {
  throw "Signed-in user $($owner.userPrincipalName) is not the requested owner $OwnerUserPrincipalName."
}

$groupName = "Obserra Production Operators"
$encodedGroupFilter = [uri]::EscapeDataString("displayName eq '$groupName'")
$groups = Get-Collection "https://graph.microsoft.com/v1.0/groups?`$filter=$encodedGroupFilter&`$select=id,displayName,securityEnabled"
if ($groups.Count -gt 1) { throw "More than one production operator group exists." }
if ($groups.Count -eq 0) {
  $group = Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/groups" -Body @{
    displayName = $groupName
    description = "Exact one-owner assignment boundary for Obserra production administration and Intune compliance."
    mailEnabled = $false
    mailNickname = "obserra-production-operators"
    securityEnabled = $true
  }
} else {
  $group = $groups[0]
}
if (-not $group.securityEnabled) { throw "The production operator group is not security-enabled." }

$members = Get-Collection "https://graph.microsoft.com/v1.0/groups/$($group.id)/members?`$select=id,userPrincipalName"
$unexpectedMembers = @($members | Where-Object { $_.id -ne $owner.id })
if ($unexpectedMembers.Count -gt 0) {
  throw "The production operator group contains users other than the signed-in owner. Review before continuing."
}
if (-not ($members | Where-Object { $_.id -eq $owner.id })) {
  Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/groups/$($group.id)/members/`$ref" -Body @{
    '@odata.id' = "https://graph.microsoft.com/v1.0/directoryObjects/$($owner.id)"
  } | Out-Null
}

$licenseDetails = Get-Collection "https://graph.microsoft.com/v1.0/users/$($owner.id)/licenseDetails"
$intuneLicensed = [bool]($licenseDetails.servicePlans | Where-Object {
  $_.servicePlanName -match '^INTUNE' -and $_.provisioningStatus -eq "Success"
})
$assignedSkuId = $null
if (-not $intuneLicensed) {
  $skus = Get-Collection "https://graph.microsoft.com/v1.0/subscribedSkus"
  $candidate = $skus | Where-Object {
    $_.capabilityStatus -eq "Enabled" -and
    $_.prepaidUnits.enabled -gt $_.consumedUnits -and
    ($_.servicePlans | Where-Object { $_.servicePlanName -match '^INTUNE' -and $_.provisioningStatus -eq "Success" })
  } | Sort-Object { $_.skuPartNumber } | Select-Object -First 1
  if (-not $candidate) { throw "No available enabled Intune-capable license seat was found." }
  Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/users/$($owner.id)/assignLicense" -Body @{
    addLicenses = @(@{ skuId = $candidate.skuId; disabledPlans = @() })
    removeLicenses = @()
  } | Out-Null
  $assignedSkuId = $candidate.skuId
  $licenseDetails = Get-Collection "https://graph.microsoft.com/v1.0/users/$($owner.id)/licenseDetails"
  $intuneLicensed = [bool]($licenseDetails.servicePlans | Where-Object {
    $_.servicePlanName -match '^INTUNE' -and $_.provisioningStatus -eq "Success"
  })
}
if (-not $intuneLicensed) { throw "The owner Intune license did not converge." }

$policyName = "Obserra Owner Windows Production Compliance"
$encodedPolicyFilter = [uri]::EscapeDataString("displayName eq '$policyName'")
$policies = Get-Collection "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies?`$filter=$encodedPolicyFilter"
if ($policies.Count -gt 1) { throw "More than one owner Windows compliance policy exists." }
$policyBody = @{
  '@odata.type' = '#microsoft.graph.windows10CompliancePolicy'
  displayName = $policyName
  description = "Owner-only production administration device baseline: encryption, Secure Boot, code integrity, health attestation, and strong lock policy."
  passwordRequired = $true
  passwordBlockSimple = $true
  passwordRequiredToUnlockFromIdle = $true
  passwordMinutesOfInactivityBeforeLock = 15
  passwordMinimumLength = 14
  passwordMinimumCharacterSetCount = 3
  passwordRequiredType = "alphanumeric"
  requireHealthyDeviceReport = $true
  bitLockerEnabled = $true
  secureBootEnabled = $true
  codeIntegrityEnabled = $true
  storageRequireEncryption = $true
}
if ($policies.Count -eq 0) {
  $policy = Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies" -Body $policyBody
} else {
  $policy = $policies[0]
  Invoke-Graph -Method PATCH -Uri "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies/$($policy.id)" -Body $policyBody | Out-Null
}
Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies/$($policy.id)/assign" -Body @{
  assignments = @(@{
    target = @{
      '@odata.type' = '#microsoft.graph.groupAssignmentTarget'
      groupId = $group.id
    }
  })
} | Out-Null

$caName = "Obserra Owner - MFA and compliant device for Microsoft administration"
$encodedCaFilter = [uri]::EscapeDataString("displayName eq '$caName'")
$caPolicies = Get-Collection "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies?`$filter=$encodedCaFilter"
if ($caPolicies.Count -gt 1) { throw "More than one Obserra owner Conditional Access policy exists." }

$managedDevices = Get-Collection "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$filter=userId%20eq%20'$($owner.id)'&`$select=id,deviceName,operatingSystem,complianceState,userId,lastSyncDateTime"
$compliantDevices = @($managedDevices | Where-Object { $_.complianceState -eq "compliant" })
$authMethods = Get-Collection "https://graph.microsoft.com/v1.0/users/$($owner.id)/authentication/methods"
$strongMethods = @($authMethods | Where-Object {
  $_.'@odata.type' -notin @('#microsoft.graph.passwordAuthenticationMethod', '#microsoft.graph.emailAuthenticationMethod')
})

$caState = "enabledForReportingButNotEnforced"
if ($Enforce) {
  if (-not $AcknowledgeSingleAdminRecoveryRisk) {
    throw "Enforcement requires -AcknowledgeSingleAdminRecoveryRisk because this tenant has one human administrator."
  }
  if ($compliantDevices.Count -lt 1) { throw "Enforcement blocked: the signed-in owner has no compliant Intune device." }
  if ($strongMethods.Count -lt 1) { throw "Enforcement blocked: the signed-in owner has no strong authentication method." }
  $caState = "enabled"
}

$caBody = @{
  displayName = $caName
  state = $caState
  conditions = @{
    clientAppTypes = @("all")
    applications = @{
      includeApplications = @("797f4846-ba00-4fd7-ba43-dac1f8f63013", "MicrosoftAdminPortals")
      excludeApplications = @()
    }
    users = @{
      includeGroups = @($group.id)
      excludeGroups = @()
      includeUsers = @()
      excludeUsers = @()
      includeRoles = @()
      excludeRoles = @()
    }
  }
  grantControls = @{
    operator = "AND"
    builtInControls = @("mfa", "compliantDevice")
    customAuthenticationFactors = @()
    termsOfUse = @()
  }
}
if ($caPolicies.Count -eq 0) {
  $caPolicy = Invoke-Graph -Method POST -Uri "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies" -Body $caBody
} else {
  $caPolicy = $caPolicies[0]
  Invoke-Graph -Method PATCH -Uri "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/$($caPolicy.id)" -Body $caBody | Out-Null
}

$evidence = [ordered]@{
  schemaVersion = "obserra-entra-intune-owner-baseline-v1"
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  tenantId = $TenantId
  owner = [ordered]@{
    id = $owner.id
    userPrincipalName = $owner.userPrincipalName
    displayName = $owner.displayName
  }
  productionOperatorGroup = [ordered]@{
    id = $group.id
    displayName = $groupName
    exactMemberCount = 1
  }
  licensing = [ordered]@{
    intuneLicensed = $intuneLicensed
    newlyAssignedSkuId = $assignedSkuId
    assignedOwnerSeats = 1
  }
  compliancePolicy = [ordered]@{
    id = $policy.id
    displayName = $policyName
    assignedGroupId = $group.id
  }
  managedDevices = [ordered]@{
    ownerDeviceCount = $managedDevices.Count
    compliantOwnerDeviceCount = $compliantDevices.Count
  }
  conditionalAccess = [ordered]@{
    id = $caPolicy.id
    displayName = $caName
    state = $caState
    requires = @("mfa", "compliantDevice")
    targets = @("Azure Management", "Microsoft Admin Portals")
  }
  nextAction = if ($caState -eq "enabled") {
    "Conditional Access is enforced. Retain tested recovery access and monitor sign-in logs."
  } else {
    "Enroll the owner Windows device, verify compliance, then rerun with -Enforce -AcknowledgeSingleAdminRecoveryRisk."
  }
}
$evidence | ConvertTo-Json -Depth 10 | Set-Content -Path $EvidencePath -Encoding UTF8
$evidence | ConvertTo-Json -Depth 10

Disconnect-MgGraph | Out-Null
