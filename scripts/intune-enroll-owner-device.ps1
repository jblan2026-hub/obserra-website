[CmdletBinding()]
param([switch]$VerifyOnly)

$ErrorActionPreference = "Stop"
$criticalEndpoints = @(
  "login.microsoftonline.com",
  "device.login.microsoftonline.com",
  "enrollment.manage.microsoft.com",
  "portal.manage.microsoft.com",
  "manage.microsoft.com",
  "graph.microsoft.com"
)

$failures = @()
foreach ($endpoint in $criticalEndpoints) {
  $result = Test-NetConnection -ComputerName $endpoint -Port 443 -WarningAction SilentlyContinue
  if (-not $result.TcpTestSucceeded) { $failures += $endpoint }
}
if ($failures.Count -gt 0) {
  throw "Required Microsoft enrollment endpoints are unreachable on TCP 443: $($failures -join ', ')"
}

if (-not $VerifyOnly) {
  Start-Process "ms-device-enrollment:?mode=mdm"
  Read-Host "Complete the Microsoft work-account and Intune enrollment window, then press Enter"
}

$joinStatus = (& dsregcmd /status | Out-String)
$joined = $joinStatus -match "AzureAdJoined\s*:\s*YES" -or $joinStatus -match "WorkplaceJoined\s*:\s*YES"
$mdmConfigured = $joinStatus -match "MdmUrl\s*:\s*https://"
$enterpriseTasks = @(Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.TaskPath -like "\Microsoft\Windows\EnterpriseMgmt\*" })
if (-not $joined -or -not $mdmConfigured -or $enterpriseTasks.Count -lt 1) {
  throw "Windows does not yet prove both Entra registration and Intune MDM enrollment. Open Settings > Accounts > Access work or school and retry enrollment."
}

[ordered]@{
  schemaVersion = "obserra-owner-device-enrollment-v1"
  verifiedAt = (Get-Date).ToUniversalTime().ToString("o")
  entraRegistered = $joined
  mdmConfigured = $mdmConfigured
  enterpriseManagementTaskCount = $enterpriseTasks.Count
  testedTcp443Endpoints = $criticalEndpoints
  nextAction = "Open Company Portal, sync the device, and wait for the Obserra compliance policy to report compliant before enforcing Conditional Access."
} | ConvertTo-Json -Depth 5
