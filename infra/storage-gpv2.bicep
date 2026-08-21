targetScope = 'resourceGroup'

@description('Azure region for the Obserra production storage account.')
param location string

@description('Stable suffix used for globally unique resource names.')
param resourceSuffix string

@description('Production resource tags.')
param tags object

var storageAccountName = 'stobserraprod${resourceSuffix}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: union(tags, {
    dataService: 'gpv2'
    resilience: 'geo-redundant'
  })
  sku: {
    name: 'Standard_GRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowCrossTenantReplication: false
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: true
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    supportsHttpsTrafficOnly: true
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      ipRules: []
      virtualNetworkRules: []
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 30
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 30
    }
    isVersioningEnabled: true
  }
}

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output storageKind string = storageAccount.kind
output storageSku string = storageAccount.sku.name
