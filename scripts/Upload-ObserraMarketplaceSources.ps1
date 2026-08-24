$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host 'Obserra Marketplace Azure uploader v5.0 - clean Azure source names'

$TenantId = '7d8b7b64-c80c-4c8a-a514-66f6b1cf8607'
$SubscriptionId = '38d660ff-611e-4f6c-ad29-70f5cf118f52'
$ResourceGroup = 'rg-obserra-prod-eastus'
$StorageAccount = 'stobserramktv1238d660'
$SourceContainer = 'marketplace-v12-source'
$CatalogRevision = '487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2'
$Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/$StorageAccount/blobServices/default/containers/$SourceContainer"

function ConvertTo-SafeText {
  param([AllowNull()]$Value)
  $parts = @()
  foreach ($entry in @($Value)) {
    if ($null -ne $entry) { $parts += [string]$entry }
  }
  $text = [string]::Join("`n", [string[]]$parts)
  return $text.Trim()
}

$azCommand = Get-Command az -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $azCommand) {
  throw 'Azure CLI (az) is required. Install Microsoft Azure CLI, reopen PowerShell, and rerun this script.'
}

$azSource = ConvertTo-SafeText $azCommand.Source
if (-not $azSource) { $azSource = ConvertTo-SafeText $azCommand.Definition }
if (-not $azSource) { throw 'Unable to resolve the installed Azure CLI command path.' }

$script:AzExecutable = $azSource
$script:AzPrefix = @()
$script:AzExitCode = 0

if ([IO.Path]::GetExtension($azSource).ToLowerInvariant() -eq '.cmd') {
  $azCmdDir = Split-Path -Parent $azSource
  $azRoot = Split-Path -Parent $azCmdDir
  $pythonCandidates = @(
    (Join-Path $azRoot 'python.exe'),
    (Join-Path $azCmdDir 'python.exe')
  )
  $azPython = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
  if (-not $azPython) {
    throw "Azure CLI is installed through a .cmd wrapper at $azSource, but its Python runtime could not be resolved."
  }
  $script:AzExecutable = $azPython
  $script:AzPrefix = @('-IBm', 'azure.cli')
  Write-Host "Azure CLI execution path: direct Python runtime ($azPython)"
} else {
  Write-Host "Azure CLI execution path: $azSource"
}

function Invoke-AzCli {
  param(
    [Parameter(Mandatory=$true)][string[]]$Arguments,
    [switch]$DiscardErrors
  )
  $allArguments = @($script:AzPrefix) + @($Arguments)
  if ($DiscardErrors) {
    & $script:AzExecutable @allArguments 2>$null
  } else {
    & $script:AzExecutable @allArguments
  }
  $script:AzExitCode = $LASTEXITCODE
}

function Test-BlobDataAccess {
  Invoke-AzCli -DiscardErrors -Arguments @(
    'storage','blob','list',
    '--auth-mode','login',
    '--account-name',$StorageAccount,
    '--container-name',$SourceContainer,
    '--num-results','1',
    '--only-show-errors',
    '--output','none'
  ) | Out-Null
  return ($script:AzExitCode -eq 0)
}

$bundleName = 'Obserra_Marketplace_v12_Production_Source_Upload_Bundle.zip'
$downloads = Join-Path $HOME 'Downloads'
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundleCandidates = @(
  (Join-Path $scriptRoot $bundleName),
  (Join-Path $downloads $bundleName)
)
$bundle = $bundleCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $bundle) {
  $bundle = Get-ChildItem -LiteralPath $downloads -Filter $bundleName -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $bundle) {
  throw "Put $bundleName in Downloads (or beside this script) and run again."
}

$Expected = @(
  [pscustomobject]@{ CatalogName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_v1.0.0(2).zip'; BlobName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_v1.0.0.zip'; Bytes=36065188; Sha256='aed67e7e3d268a6e08d25b9f64db3fd8b7a562f3da475eb1d7c72aa837db0cb2' },
  [pscustomobject]@{ CatalogName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_2_Addons_v1.0.0(2).zip'; BlobName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_2_Addons_v1.0.0.zip'; Bytes=37082309; Sha256='54aa4257f901b421d4746dd34c66c9e736fecfa592a2c2a7b13bfafce849cdf4' },
  [pscustomobject]@{ CatalogName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_3_Final_5000_v1.0.0(2).zip'; BlobName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_3_Final_5000_v1.0.0.zip'; Bytes=67081573; Sha256='56254d63f0589e37eef37d1cd4669ca29968b571e927de77d0ee61f68079e049' },
  [pscustomobject]@{ CatalogName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_4_Advanced_2000_v1.0.0(2).zip'; BlobName='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_4_Advanced_2000_v1.0.0.zip'; Bytes=29266792; Sha256='b38e0f65034ec44bdab747f580188eb353928eb435b3fa68bf5ad102d655666c' },
  [pscustomobject]@{ CatalogName='Obserra_EPI_AI_Marketplace_Suite_v1.0.0 (2)(1).zip'; BlobName='Obserra_EPI_AI_Marketplace_Suite_v1.0.0.zip'; Bytes=42285741; Sha256='1a4c3fe2b6113753d346649c5e74786e3be23d34701f0c21398a1e7f316f49e3' },
  [pscustomobject]@{ CatalogName='Obserra_EPI_Marketplace_Builder_and_Assurance_Toolkit_v1.0.1(2).zip'; BlobName='Obserra_EPI_Marketplace_Builder_and_Assurance_Toolkit_v1.0.1.zip'; Bytes=6344213; Sha256='49bea45f6bd38f72e389d1273ecc188f93b5766cc6759563cc7a4768a4fd7450' }
)

$work = Join-Path $env:TEMP ('obserra-marketplace-v12-upload-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $work -Force | Out-Null
$createdRoleId = ''

try {
  Write-Host "Using production bundle: $bundle"
  Expand-Archive -LiteralPath $bundle -DestinationPath $work -Force

  Write-Host 'Locating the six canonical Marketplace archives by byte size and SHA-256...'
  $stage = Join-Path $work 'staged-clean-names'
  New-Item -ItemType Directory -Path $stage -Force | Out-Null
  $allZipCandidates = @(
    Get-ChildItem -LiteralPath $work -Filter '*.zip' -File -Recurse -ErrorAction SilentlyContinue
    Get-ChildItem -LiteralPath $downloads -Filter '*.zip' -File -Recurse -ErrorAction SilentlyContinue
  ) | Sort-Object FullName -Unique
  $Resolved = @()
  foreach ($item in $Expected) {
    $match = $null
    foreach ($candidate in ($allZipCandidates | Where-Object Length -eq $item.Bytes)) {
      $hash = (Get-FileHash -LiteralPath $candidate.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($hash -eq $item.Sha256) { $match = $candidate; break }
    }
    if (-not $match) { throw "Required archive was not found by verified bytes/hash for $($item.BlobName)" }
    $stagedPath = Join-Path $stage $item.BlobName
    Copy-Item -LiteralPath $match.FullName -Destination $stagedPath -Force
    $stagedHash = (Get-FileHash -LiteralPath $stagedPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($stagedHash -ne $item.Sha256) { throw "Staged SHA-256 mismatch for $($item.BlobName)" }
    $Resolved += [pscustomobject]@{ Expected=$item; Path=$stagedPath }
    Write-Host "  OK  $($item.BlobName) <- $($match.Name)"
  }

  $accountJson = Invoke-AzCli -DiscardErrors -Arguments @('account','show','--output','json')
  $account = $null
  if ($script:AzExitCode -eq 0 -and (ConvertTo-SafeText $accountJson)) {
    try { $account = $accountJson | ConvertFrom-Json } catch { $account = $null }
  }

  if (-not $account -or $account.tenantId -ne $TenantId) {
    Write-Host 'Azure sign-in required. Complete the device-code sign-in for the Obserra production tenant.'
    Invoke-AzCli -Arguments @('login','--tenant',$TenantId,'--use-device-code','--output','none') | Out-Null
    if ($script:AzExitCode -ne 0) { throw 'Azure login failed.' }
  }

  Invoke-AzCli -Arguments @('account','set','--subscription',$SubscriptionId) | Out-Null
  if ($script:AzExitCode -ne 0) { throw 'Unable to select the Obserra production Azure subscription.' }

  $accountJson = Invoke-AzCli -Arguments @('account','show','--output','json')
  if ($script:AzExitCode -ne 0 -or -not (ConvertTo-SafeText $accountJson)) { throw 'Unable to read the active Azure account.' }
  $account = $accountJson | ConvertFrom-Json
  if ($account.tenantId -ne $TenantId -or $account.id -ne $SubscriptionId) { throw 'Azure tenant/subscription mismatch.' }

  $principalOutput = Invoke-AzCli -DiscardErrors -Arguments @('ad','signed-in-user','show','--query','id','-o','tsv')
  if ($script:AzExitCode -ne 0) { throw 'Unable to resolve the signed-in Azure user object ID.' }
  $principalId = ConvertTo-SafeText $principalOutput
  if (-not $principalId) { throw 'This uploader requires an interactive Azure user session.' }

  Write-Host 'Checking effective Blob data-plane access to the private Marketplace source container...'
  $hasBlobAccess = Test-BlobDataAccess
  if ($hasBlobAccess) {
    Write-Host 'Blob data-plane access is already effective.'
  } else {
    Write-Host 'Blob data-plane access is not yet effective. Granting temporary Storage Blob Data Contributor access...'
    $createdRoleOutput = Invoke-AzCli -Arguments @(
      'role','assignment','create',
      '--assignee-object-id',$principalId,
      '--assignee-principal-type','User',
      '--role','Storage Blob Data Contributor',
      '--scope',$Scope,
      '--query','id',
      '-o','tsv'
    )
    $createExit = $script:AzExitCode
    $createdRoleId = ConvertTo-SafeText $createdRoleOutput
    if ($createExit -ne 0) { throw 'Azure rejected the temporary Storage Blob Data Contributor role assignment.' }
    if (-not $createdRoleId) { throw 'Azure created no readable role-assignment ID.' }

    Write-Host 'Waiting for Azure RBAC propagation to the Blob data plane...'
    $hasBlobAccess = $false
    for ($attempt = 1; $attempt -le 36; $attempt++) {
      Start-Sleep -Seconds 5
      if (Test-BlobDataAccess) {
        $hasBlobAccess = $true
        Write-Host "Blob data-plane access verified after $($attempt * 5) seconds."
        break
      }
    }
    if (-not $hasBlobAccess) { throw 'Blob data-plane access did not become effective within 180 seconds.' }
  }

  foreach ($resolved in $Resolved) {
    $item = $resolved.Expected
    $targetNames = @(
      [pscustomobject]@{ Name=$item.BlobName; Kind='canonical-clean' },
      [pscustomobject]@{ Name=$item.CatalogName; Kind='private-catalog-compatibility' }
    )
    foreach ($target in $targetNames) {
      Write-Host "Uploading $($target.Kind) source object: $($target.Name)..."
      Invoke-AzCli -Arguments @(
        'storage','blob','upload',
        '--auth-mode','login',
        '--account-name',$StorageAccount,
        '--container-name',$SourceContainer,
        '--name',$target.Name,
        '--file',$resolved.Path,
        '--content-type','application/zip',
        '--metadata',"sha256=$($item.Sha256)",'source_role=sellable-product-collection',"name_role=$($target.Kind)",
        '--overwrite','true',
        '--only-show-errors',
        '--output','none'
      ) | Out-Null
      if ($script:AzExitCode -ne 0) { throw "Azure upload failed for $($target.Name)." }

      $remoteBytesOutput = Invoke-AzCli -Arguments @(
        'storage','blob','show',
        '--auth-mode','login',
        '--account-name',$StorageAccount,
        '--container-name',$SourceContainer,
        '--name',$target.Name,
        '--query','properties.contentLength',
        '-o','tsv',
        '--only-show-errors'
      )
      if ($script:AzExitCode -ne 0) { throw "Unable to verify the uploaded blob $($target.Name)." }
      $remoteBytesText = ConvertTo-SafeText $remoteBytesOutput
      if (-not $remoteBytesText) { throw "Azure returned no byte length for $($target.Name)." }
      $remoteBytes = [int64]$remoteBytesText
      if ($remoteBytes -ne $item.Bytes) { throw "Remote byte-length mismatch for $($target.Name): $remoteBytes" }
      Write-Host "  VERIFIED  $($target.Name)  $remoteBytes bytes"
    }
  }

  $remoteNamesOutput = @(Invoke-AzCli -Arguments @(
    'storage','blob','list',
    '--auth-mode','login',
    '--account-name',$StorageAccount,
    '--container-name',$SourceContainer,
    '--query',"[?ends_with(name, '.zip')].name",
    '-o','tsv',
    '--only-show-errors'
  ))
  if ($script:AzExitCode -ne 0) { throw 'Unable to verify the Azure source-container inventory.' }
  $remoteNames = @($remoteNamesOutput | ForEach-Object { ConvertTo-SafeText $_ } | Where-Object { $_ })
  foreach ($item in $Expected) {
    if ($remoteNames -notcontains $item.BlobName) { throw "Azure source verification did not find canonical clean blob $($item.BlobName)" }
    if ($remoteNames -notcontains $item.CatalogName) { throw "Azure source verification did not find private compatibility alias $($item.CatalogName)" }
  }

  $receipt = [ordered]@{
    contract='obserra-marketplace-v12-six-source-upload-receipt-v1'
    storageAccount=$StorageAccount
    sourceContainer=$SourceContainer
    archiveCount=6
    canonicalBlobCount=6
    privateCompatibilityAliasCount=6
    catalogRevision=$CatalogRevision
    uploadedAt=(Get-Date).ToUniversalTime().ToString('o')
    archives=@($Expected | ForEach-Object { [ordered]@{ catalogName=$_.CatalogName; blobName=$_.BlobName; bytes=$_.Bytes; sha256=$_.Sha256 } })
  }
  $receiptPath = Join-Path $downloads 'marketplace-v12-six-source-upload-receipt.json'
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
  Write-Host "UPLOAD_COMPLETE $receiptPath"

  $receiptData = Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
  if ($receiptData.contract -ne 'obserra-marketplace-v12-six-source-upload-receipt-v1' -or $receiptData.archiveCount -ne 6) {
    throw 'Upload receipt contract verification failed.'
  }
  Write-Host "UPLOAD_VERIFIED $receiptPath"
}
finally {
  if ($createdRoleId) {
    Write-Host 'Removing the temporary Storage Blob Data Contributor role added by this uploader...'
    Invoke-AzCli -Arguments @('role','assignment','delete','--ids',$createdRoleId,'--only-show-errors') | Out-Null
    if ($script:AzExitCode -ne 0) {
      Write-Warning "Temporary role cleanup did not complete. Role assignment ID: $createdRoleId"
    }
  }
  Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
}
