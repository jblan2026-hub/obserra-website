[CmdletBinding()]
param(
    [string]$ReleaseRoot = "C:\Users\jblan\OneDrive\Desktop\Final Production Release Apps",
    [string]$RepositoryRoot = "C:\Users\jblan\OneDrive\Desktop\obserra-website"
)

$ErrorActionPreference = "Stop"

function Invoke-ObserraPublish {
    Write-Host "[$(Get-Date -Format s)] Validating and publishing Obserra FINAL releases..."
    Push-Location $RepositoryRoot
    try {
        node .\scripts\sync-final-apps.mjs $ReleaseRoot
        Write-Host "[$(Get-Date -Format s)] Publish completed."
    }
    catch {
        Write-Error "Publish failed: $($_.Exception.Message)"
    }
    finally {
        Pop-Location
    }
}

if (-not (Test-Path $ReleaseRoot)) {
    New-Item -ItemType Directory -Force -Path $ReleaseRoot | Out-Null
}
if (-not (Test-Path $RepositoryRoot)) {
    throw "Repository root not found: $RepositoryRoot"
}

Write-Host "Obserra Release Publisher is watching: $ReleaseRoot"
Write-Host "Drop an approved app artifact and release-manifest.json into an app's FINAL folder."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $ReleaseRoot
$watcher.Filter = "*"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
$watcher.EnableRaisingEvents = $true

$script:lastPublish = [DateTime]::MinValue
$action = {
    $now = Get-Date
    if (($now - $script:lastPublish).TotalSeconds -lt 10) { return }
    $script:lastPublish = $now
    Start-Sleep -Seconds 5
    Invoke-ObserraPublish
}

$events = @(
    Register-ObjectEvent $watcher Created -Action $action,
    Register-ObjectEvent $watcher Changed -Action $action,
    Register-ObjectEvent $watcher Renamed -Action $action
)

Invoke-ObserraPublish
try {
    while ($true) { Wait-Event -Timeout 5 | Out-Null }
}
finally {
    foreach ($event in $events) { Unregister-Event -SourceIdentifier $event.Name -ErrorAction SilentlyContinue }
    $watcher.Dispose()
}
