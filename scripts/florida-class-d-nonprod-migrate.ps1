[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z]{20}$')]
    [string]$ProjectRef,

    [Parameter(Mandatory = $true)]
    [ValidateSet('development','sandbox','staging','uat')]
    [string]$Environment,

    [Parameter(Mandatory = $true)]
    [ValidateSet('APPLY-SYNTHETIC-NONPROD')]
    [string]$AuthorizationToken
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot '.env.local'
$migrationDir = Join-Path $repoRoot 'supabase\migrations'
$evidenceDir = Join-Path $repoRoot 'artifacts\fdacs-nonprod-migration-evidence'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$evidencePath = Join-Path $evidenceDir "fdacs-nonprod-migration-$timestamp.txt"

function Stop-FailClosed([string]$Message) {
    throw "FAIL CLOSED: $Message"
}

if (!(Test-Path $migrationDir)) {
    Stop-FailClosed "Migration directory not found: $migrationDir"
}

if (!(Test-Path $envPath)) {
    Stop-FailClosed '.env.local is required so the script can verify the configured nonproduction runtime target.'
}

$envLines = Get-Content $envPath
function Get-LocalEnvValue([string]$Name) {
    $match = $envLines | Where-Object { $_ -match ('^\s*' + [regex]::Escape($Name) + '\s*=') } | Select-Object -Last 1
    if (!$match) { return '' }
    return ($match -replace ('^\s*' + [regex]::Escape($Name) + '\s*=\s*'), '').Trim()
}

$runtimeEnvironment = (Get-LocalEnvValue 'OBSERRA_FDACS_RUNTIME_ENVIRONMENT').ToLowerInvariant()
$acceptanceAuthorized = (Get-LocalEnvValue 'OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED').ToLowerInvariant()
$syntheticOnly = (Get-LocalEnvValue 'OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY').ToLowerInvariant()
$supabaseUrl = Get-LocalEnvValue 'OBSERRA_SUPABASE_URL'
$dsStatus = (Get-LocalEnvValue 'OBSERRA_FDACS_DS_LICENSE_STATUS').ToLowerInvariant()
$dsLicense = Get-LocalEnvValue 'OBSERRA_FDACS_DS_LICENSE_NUMBER'

if ($Environment -eq 'production') {
    Stop-FailClosed 'Production is not an accepted target for this runner.'
}
if ($runtimeEnvironment -ne $Environment) {
    Stop-FailClosed "Configured runtime environment '$runtimeEnvironment' does not match requested '$Environment'."
}
if ($acceptanceAuthorized -ne 'enabled') {
    Stop-FailClosed 'OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED must be enabled.'
}
if ($syntheticOnly -ne 'enabled') {
    Stop-FailClosed 'OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY must be enabled.'
}
if ($dsStatus -eq 'active' -or ![string]::IsNullOrWhiteSpace($dsLicense)) {
    Stop-FailClosed 'Class DS production license fields must remain unset/non-active for this nonproduction migration run.'
}

$expectedUrl = "https://$ProjectRef.supabase.co"
if ($supabaseUrl -ne $expectedUrl) {
    Stop-FailClosed "OBSERRA_SUPABASE_URL does not match the explicitly authorized project reference. Expected $expectedUrl."
}

$featureFlags = @(
    'OBSERRA_FDACS_CLASS_D_LIVE_ENABLED',
    'OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED',
    'OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED',
    'OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED',
    'OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED'
)
foreach ($flag in $featureFlags) {
    if ((Get-LocalEnvValue $flag).ToLowerInvariant() -eq 'enabled') {
        Stop-FailClosed "$flag must remain disabled during controlled nonproduction database migration."
    }
}

$migrations = Get-ChildItem $migrationDir -File -Filter '*fdacs_class_d*.sql' | Sort-Object Name
if ($migrations.Count -lt 20) {
    Stop-FailClosed "Expected the complete Florida Class D migration inventory, found only $($migrations.Count)."
}

$prefixes = @($migrations | ForEach-Object { $_.Name.Split('_')[0] })
if (($prefixes | Select-Object -Unique).Count -ne $prefixes.Count) {
    Stop-FailClosed 'Duplicate Florida Class D migration timestamp prefixes detected.'
}

$cli = Get-Command supabase -ErrorAction SilentlyContinue
if (!$cli) {
    $npx = Get-Command npx -ErrorAction SilentlyContinue
    if (!$npx) {
        Stop-FailClosed 'Neither Supabase CLI nor npx is available.'
    }
    $useNpx = $true
} else {
    $useNpx = $false
}

function Invoke-Supabase([string[]]$Arguments) {
    if ($useNpx) {
        & npx --yes supabase @Arguments
    } else {
        & supabase @Arguments
    }
    return $LASTEXITCODE
}

function Ensure-SupabaseAuthentication {
    Write-Host 'Checking Supabase CLI authentication...'
    $authExit = Invoke-Supabase -Arguments @('projects','list')
    if ($authExit -eq 0) {
        Write-Host 'Supabase CLI authentication is ready.'
        return
    }

    Write-Host ''
    Write-Host 'Supabase CLI authentication check failed. Starting the official interactive login flow now.'
    Write-Host 'Complete the Supabase browser/device authorization locally. Do not paste any token into source files or chat.'
    Write-Host ''

    $loginExit = Invoke-Supabase -Arguments @('login')
    if ($loginExit -ne 0) {
        Stop-FailClosed 'Supabase CLI login did not complete successfully.'
    }

    $verifyExit = Invoke-Supabase -Arguments @('projects','list')
    if ($verifyExit -ne 0) {
        Stop-FailClosed 'Supabase CLI authentication could not be verified after login.'
    }

    Write-Host 'Supabase CLI authentication verified.'
}

New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

$branch = git -C $repoRoot branch --show-current
$commit = git -C $repoRoot rev-parse HEAD
if ([string]::IsNullOrWhiteSpace($branch) -or [string]::IsNullOrWhiteSpace($commit)) {
    Stop-FailClosed 'Unable to bind the migration execution to the current Git branch and commit.'
}

$evidence = @(
    'OBSERRA Florida Class D controlled nonproduction migration evidence',
    "GeneratedAt=$([DateTimeOffset]::Now.ToString('o'))",
    "GitBranch=$branch",
    "GitCommit=$commit",
    "RuntimeEnvironment=$Environment",
    "ProjectRef=$ProjectRef",
    "MigrationCount=$($migrations.Count)",
    'SyntheticIdentityOnly=true',
    'ClassDSProductionFieldsPresent=false',
    'RegulatedFeatureFlagsEnabled=false',
    'SecretsRecorded=false'
)
$evidence | Set-Content -Path $evidencePath -Encoding utf8

Write-Host 'Controlled Florida Class D nonproduction migration preflight passed.'
Write-Host "Target: $ProjectRef ($Environment)"
Write-Host "Migrations: $($migrations.Count)"
Write-Host 'Production license fields: fail closed'
Write-Host 'Synthetic identities only: enforced'
Write-Host 'No secret values will be written to evidence.'
Write-Host ''
Write-Host 'The Supabase CLI may securely prompt for authentication/database credentials. Do not paste those credentials into source files or chat.'

Push-Location $repoRoot
try {
    Ensure-SupabaseAuthentication

    $linkExit = Invoke-Supabase -Arguments @('link','--project-ref',$ProjectRef)
    if ($linkExit -ne 0) { Stop-FailClosed 'Supabase link failed after verified CLI authentication.' }

    $pushExit = Invoke-Supabase -Arguments @('db','push','--linked','--include-all')
    if ($pushExit -ne 0) { Stop-FailClosed 'Supabase migration push failed.' }

    if ($useNpx) {
        & npx --yes supabase migration list --linked | Tee-Object -FilePath $evidencePath -Append
    } else {
        & supabase migration list --linked | Tee-Object -FilePath $evidencePath -Append
    }
    if ($LASTEXITCODE -ne 0) { Stop-FailClosed 'Unable to capture linked migration inventory after push.' }

    Add-Content -Path $evidencePath -Value "Result=SUCCESS"
    Write-Host ''
    Write-Host 'Florida Class D nonproduction migrations applied successfully.'
    Write-Host "Evidence: $evidencePath"
}
catch {
    Add-Content -Path $evidencePath -Value "Result=FAIL_CLOSED"
    Add-Content -Path $evidencePath -Value "FailureType=$($_.Exception.GetType().FullName)"
    throw
}
finally {
    Pop-Location
}
