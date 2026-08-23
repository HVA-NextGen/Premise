@description('Azure region for all resources.')
param location string

@description('Tags applied to all resources.')
param tags object

@description('Unique-ish token for resource names.')
param resourceToken string

@description('APIM AI-gateway base URL (server-side only).')
param apimGatewayUrl string = ''

@secure()
@description('APIM subscription key (server-side secret).')
param apimSubscriptionKey string = ''

@description('Model deployment name behind the gateway.')
param apimModelDeploymentName string = ''

@description('Optional Azure OpenAI API version.')
param apimApiVersion string = ''

var appName = 'premise-web-${resourceToken}'

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'plan-${resourceToken}'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource web 'Microsoft.Web/sites@2024-04-01' = {
  name: appName
  location: location
  tags: union(tags, { 'azd-service-name': 'web' })
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appCommandLine: 'node server.js'
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'APIM_GATEWAY_URL'
          value: apimGatewayUrl
        }
        {
          name: 'APIM_SUBSCRIPTION_KEY'
          value: apimSubscriptionKey
        }
        {
          name: 'APIM_MODEL_DEPLOYMENT_NAME'
          value: apimModelDeploymentName
        }
        {
          name: 'APIM_API_VERSION'
          value: apimApiVersion
        }
      ]
    }
  }
}

output WEB_URI string = 'https://${web.properties.defaultHostName}'
output WEB_NAME string = web.name
