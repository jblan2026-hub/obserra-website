param(
  [string[]]$SourceRoots = @((Get-Location).Path, (Join-Path $HOME 'Downloads'))
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$TenantId = '7d8b7b64-c80c-4c8a-a514-66f6b1cf8607'
$SubscriptionId = '38d660ff-611e-4f6c-ad29-70f5cf118f52'
$ResourceGroup = 'rg-obserra-prod-eastus'
$StorageAccount = 'stobserramktv1238d660'
$SourceContainer = 'marketplace-v12-source'
$Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/$StorageAccount/blobServices/default/containers/$SourceContainer"

$Expected = @(
  [pscustomobject]@{ Name='Obserra_EPI_AI_Agent_Capability_Skills_Repository_v1.0.0(2).zip'; Bytes=36065188; Sha256='aed67e7e3d268a6e08d25b9f64db3fd8b7a562f3da475eb1d7c72aa837db0cb2' },
  [pscustomobject]@{ Name='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_2_Addons_v1.0.0(2).zip'; Bytes=37082309; Sha256='54aa4257f901b421d4746dd34c66c9e736fecfa592a2c2a7b13bfafce849cdf4' },
  [pscustomobject]@{ Name='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_3_Final_5000_v1.0.0(2).zip'; Bytes=67081573; Sha256='56254d63f0589e37eef37d1cd4669ca29968b571e927de77d0ee61f68079e049' },
  [pscustomobject]@{ Name='Obserra_EPI_AI_Agent_Capability_Skills_Repository_Set_4_Advanced_2000_v1.0.0(2).zip'; Bytes=29266792; Sha256='b38e0f65034ec44bdab747f580188eb353928eb435b3fa68bf5ad102d655666c' },
  [pscustomobject]@{ Name='Obserra_EPI_AI_Marketplace_Suite_v1.0.0 (2)(1).zip'; Bytes=42285741; Sha256='1a4c3fe2b6113753d346649c5e74786e3be23d34701f0c21398a1e7f316f49e3' },
  [pscustomobject]@{ Name='Obserra_EPI_Marketplace_Builder_and_Assurance_Toolkit_v1.0.1(2).zip'; Bytes=6344213; Sha256='49bea45f6bd38f72e389d1273ecc188f93b5766cc6759563cc7a4768a4fd7450' }
)

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw 'Azure CLI (az) is required. Install it, then rerun this script.'
}

$roots = $SourceRoots | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique
if (-not $roots) { throw 'No valid source folders were found.' }

Write-Host 'Locating the six canonical Marketplace archives by size and SHA-256...'
$allZipCandidates = foreach ($root in $roots) {
  Get-ChildItem -LiteralPath $root -Filter '*.zip' -File -Recurse -ErrorAction SilentlyContinue
}
$allZipCandidates = $allZipCandidates | Sort-Object FullName -Unique

$Resolved = @()
foreach ($item in $Expected) {
  $match = $null
  foreach ($candidate in ($allZipCandidates | Where-Object Length -eq $item.Bytes)) {
    $hash = (Get-FileHash -LiteralPath $candidate.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($hash -eq $item.Sha256) { $match = $candidate; break }
  }
  if (-not $match) { throw "Required archive not found by hash: $($item.Name)" }
  $Resolved += [pscustomobject]@{ Expected=$item; Path=$match.FullName }
  Write-Host "  OK  $($item.Name) <- $($match.Name)"
}

try {
  $account = az account show --output json 2>$null | ConvertFrom-Json
} catch {
  $account = $null
}
if (-not $account -or $account.tenantId -ne $TenantId) {
  az login --tenant $TenantId --use-device-code --output none
}
az account set --subscription $SubscriptionId
$account = az account show --output json | ConvertFrom-Json
if ($account.tenantId -ne $TenantId -or $account.id -ne $SubscriptionId) { throw 'Azure tenant/subscription mismatch.' }

$principalId = (az ad signed-in-user show --query id -o tsv 2>$null).Trim()
if (-not $principalId) { throw 'This uploader requires an interactive Azure user session.' }

$existingRoleId = (az role assignment list --assignee-object-id $principalId --scope $Scope --query "[?roleDefinitionName=='Storage Blob Data Contributor'] | [0].id" -o tsv).Trim()
$createdRoleId = $null
if (-not $existingRoleId) {
  Write-Host 'Granting the signed-in owner temporary Blob Data Contributor access to the private source container...'
  $createdRoleId = (az role assignment create --assignee-object-id $principalId --assignee-principal-type User --role 'Storage Blob Data Contributor' --scope $Scope --query id -o tsv).Trim()
  $ready = $null
  for ($attempt = 0; $attempt -lt 18; $attempt++) {
    Start-Sleep -Seconds 5
    $ready = (az role assignment list --assignee-object-id $principalId --scope $Scope --query "[?roleDefinitionName=='Storage Blob Data Contributor'] | [0].id" -o tsv).Trim()
    if ($ready) { break }
  }
  if (-not $ready) { throw 'Azure Blob Data Contributor role did not become effective.' }
}

try {
  foreach ($resolved in $Resolved) {
    $item = $resolved.Expected
    Write-Host "Uploading $($item.Name)..."
    az storage blob upload `
      --auth-mode login `
      --account-name $StorageAccount `
      --container-name $SourceContainer `
      --name $item.Name `
      --file $resolved.Path `
      --content-type 'application/zip' `
      --metadata "sha256=$($item.Sha256)" 'source_role=sellable-product-collection' `
      --overwrite true `
      --only-show-errors `
      --output none

    $remoteBytes = [int64](az storage blob show --auth-mode login --account-name $StorageAccount --container-name $SourceContainer --name $item.Name --query properties.contentLength -o tsv --only-show-errors)
    if ($remoteBytes -ne $item.Bytes) { throw "Remote byte-length mismatch for $($item.Name): $remoteBytes" }
  }

  $remoteNames = az storage blob list --auth-mode login --account-name $StorageAccount --container-name $SourceContainer --query "[?ends_with(name, '.zip')].name" -o tsv --only-show-errors
  foreach ($item in $Expected) {
    if ($remoteNames -notcontains $item.Name) { throw "Azure source verification did not find $($item.Name)" }
  }

  $receipt = [ordered]@{
    contract='obserra-marketplace-v12-six-source-upload-receipt-v1'
    storageAccount=$StorageAccount
    sourceContainer=$SourceContainer
    archiveCount=6
    catalogRevision='487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2'
    uploadedAt=(Get-Date).ToUniversalTime().ToString('o')
    archives=@($Expected | ForEach-Object { [ordered]@{ name=$_.Name; bytes=$_.Bytes; sha256=$_.Sha256 } })
  }
  $receiptPath = Join-Path (Get-Location).Path 'marketplace-v12-six-source-upload-receipt.json'
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
  Write-Host "UPLOAD_COMPLETE $receiptPath"
}
finally {
  if ($createdRoleId) {
    Write-Host 'Removing the temporary Blob Data Contributor role added by this uploader...'
    az role assignment delete --ids $createdRoleId --only-show-errors
  }
}
