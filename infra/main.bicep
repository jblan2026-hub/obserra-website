targetScope = 'resourceGroup'

@description('Azure region for all production resources.')
param location string = 'eastus'

@description('Stable suffix derived from the approved Azure subscription. Used only for globally unique resource names.')
param resourceSuffix string = '38d660'

@description('Production resource tags.')
param tags object = {
  workload: 'obserra-website'
  environment: 'production'
  owner: 'OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC'
  managedBy: 'bicep-github-oidc'
}

var appServicePlanName = 'asp-obserra-prod-eastus'
var webAppName = 'obserra-web-prod-${resourceSuffix}'
var stagingSlotName = 'staging'
var keyVaultName = 'kv-obserra-prod-${resourceSuffix}'
var logAnalyticsName = 'law-obserra-prod-eastus'
var appInsightsName = 'appi-obserra-prod-eastus'
var runtimeIdentityName = 'id-obserra-runtime-prod'

var supabaseIdentityUrl = 'https://ftkjhmtfyfkartfsnkjb.supabase.co'
var supabaseIdentityProjectRef = 'ftkjhmtfyfkartfsnkjb'
var supabaseIdentityPublishableKey = 'sb_publishable_mRE63bML7dsVY_YqaervqA_TUEWsxVB'
var academySupabaseUrl = 'https://nwxnyqlyzyufgoadtqxs.supabase.co'
var fdacsSupabaseUrl = 'https://ggkxgjhsbgbifiqrhavr.supabase.co'
var fdacsSupabaseProjectRef = 'ggkxgjhsbgbifiqrhavr'
var fdacsDocumentsBucket = 'fdacs-class-d-completion-documents'
var publicOrigin = 'https://www.obserrallc.com'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  sku: {
    name: 'PerGB2018'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    DisableIpMasking: false
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enablePurgeProtection: true
    softDeleteRetentionInDays: 90
    publicNetworkAccess: 'Enabled'
  }
}

resource runtimeIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: runtimeIdentityName
  location: location
  tags: tags
}

// Key Vault Secrets User: read-only data-plane access for App Service Key Vault references.
resource runtimeKeyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, runtimeIdentity.id, 'key-vault-secrets-user')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6'
    )
    principalId: runtimeIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: 'S1'
    tier: 'Standard'
    capacity: 2
  }
  kind: 'linux'
  properties: {
    reserved: true
    zoneRedundant: false
  }
}

var commonAppSettings = [
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  {
    name: 'OBSERRA_RUNTIME_ENVIRONMENT'
    value: 'production'
  }
  {
    name: 'HOSTNAME'
    value: '0.0.0.0'
  }
  {
    name: 'NEXT_TELEMETRY_DISABLED'
    value: '1'
  }
  {
    name: 'WEBSITE_NODE_DEFAULT_VERSION'
    value: '~22'
  }
  {
    name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
    value: 'false'
  }
  {
    name: 'WEBSITE_RUN_FROM_PACKAGE'
    value: '1'
  }
  {
    name: 'WEBSITE_SWAP_WARMUP_PING_PATH'
    value: '/api/health'
  }
  {
    name: 'WEBSITE_SWAP_WARMUP_PING_STATUSES'
    value: '200'
  }
  {
    name: 'WEBSITE_WARMUP_PATH'
    value: '/api/health'
  }
  {
    name: 'WEBSITE_ADD_SITENAME_BINDINGS_IN_APPHOST_CONFIG'
    value: '1'
  }
  {
    name: 'OBSERRA_HOSTING_PROVIDER'
    value: 'azure-app-service'
  }
  {
    name: 'OBSERRA_EXPECTED_HOSTING_PROVIDER'
    value: 'azure-app-service'
  }
  {
    name: 'OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED'
    value: 'true'
  }
  {
    name: 'NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL'
    value: supabaseIdentityUrl
  }
  {
    name: 'NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY'
    value: supabaseIdentityPublishableKey
  }
  {
    name: 'OBSERRA_AUTH_SUPABASE_PROJECT_REF'
    value: supabaseIdentityProjectRef
  }
  {
    name: 'OBSERRA_ACADEMY_SUPABASE_URL'
    value: academySupabaseUrl
  }
  {
    name: 'OBSERRA_FDACS_SUPABASE_URL'
    value: fdacsSupabaseUrl
  }
  {
    name: 'OBSERRA_FDACS_SUPABASE_PROJECT_REF'
    value: fdacsSupabaseProjectRef
  }
  {
    name: 'OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER'
    value: 'daily'
  }
  {
    name: 'OBSERRA_FDACS_DOCUMENTS_BUCKET'
    value: fdacsDocumentsBucket
  }
  {
    name: 'OBSERRA_FDACS_PUBLIC_ORIGIN'
    value: publicOrigin
  }
  {
    name: 'OBSERRA_FDACS_RUNTIME_ENVIRONMENT'
    value: 'production'
  }
  {
    name: 'OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED'
    value: 'disabled'
  }
  {
    name: 'FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED'
    value: 'false'
  }
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
    value: appInsights.properties.ConnectionString
  }
  {
    name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
    value: '~3'
  }
  {
    name: 'CLERK_SECRET_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=clerk-secret-key)'
  }
  {
    name: 'STRIPE_SECRET_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=stripe-secret-key)'
  }
  {
    name: 'STRIPE_WEBHOOK_SECRET'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=stripe-webhook-secret)'
  }
  {
    name: 'ACADEMY_STRIPE_SECRET_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=academy-stripe-secret-key)'
  }
  {
    name: 'ACADEMY_STRIPE_WEBHOOK_SECRET'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=academy-stripe-webhook-secret)'
  }
  {
    name: 'OBSERRA_ACADEMY_SUPABASE_SERVICE_ROLE_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=academy-supabase-service-role-key)'
  }
  {
    name: 'OBSERRA_ACADEMY_EMAIL_HASH_SECRET'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=academy-email-hash-secret)'
  }
  {
    name: 'OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=fdacs-supabase-service-role-key)'
  }
  {
    name: 'OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=fdacs-record-encryption-key-base64)'
  }
  {
    name: 'OBSERRA_FDACS_DAILY_API_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=fdacs-daily-api-key)'
  }
  {
    name: 'STRIPE_IDENTITY_WEBHOOK_SECRET'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=stripe-identity-webhook-secret)'
  }
  {
    name: 'OPENAI_API_KEY'
    value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=openai-api-key)'
  }
]

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${runtimeIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    keyVaultReferenceIdentity: runtimeIdentity.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server.js'
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      healthCheckPath: '/api/health'
      appSettings: concat(commonAppSettings, [
        {
          name: 'OBSERRA_SLOT_NAME'
          value: 'production'
        }
      ])
    }
  }
}

resource stagingSlot 'Microsoft.Web/sites/slots@2023-12-01' = {
  parent: webApp
  name: stagingSlotName
  location: location
  kind: 'app,linux'
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${runtimeIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    keyVaultReferenceIdentity: runtimeIdentity.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server.js'
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      healthCheckPath: '/api/health'
      appSettings: concat(commonAppSettings, [
        {
          name: 'OBSERRA_SLOT_NAME'
          value: 'staging'
        }
      ])
    }
  }
}

// Keep only the slot identity marker sticky. Release SHA/deployment ID and application content swap together.
resource slotConfigNames 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: webApp
  name: 'slotConfigNames'
  properties: {
    appSettingNames: [
      'OBSERRA_SLOT_NAME'
    ]
  }
}

output webAppName string = webApp.name
output productionHostName string = webApp.properties.defaultHostName
output stagingHostName string = stagingSlot.properties.defaultHostName
output keyVaultName string = keyVault.name
output runtimeIdentityClientId string = runtimeIdentity.properties.clientId
output appServicePlanName string = appServicePlan.name
