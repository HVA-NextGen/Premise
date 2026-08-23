targetScope = 'subscription'

@minLength(1)
@description('Name of the azd environment; used to tag resources.')
param environmentName string

@minLength(1)
@description('Azure region for all resources.')
param location string

@description('Resource group to deploy into.')
param resourceGroupName string = 'rg-${environmentName}'

@description('APIM AI-gateway base URL (server-side only).')
param apimGatewayUrl string = ''

@secure()
@description('APIM subscription key (server-side secret).')
param apimSubscriptionKey string = ''

@description('Model deployment name behind the gateway.')
param apimModelDeploymentName string = ''

@description('Optional Azure OpenAI API version.')
param apimApiVersion string = ''

var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
}

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module resources './resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
    apimGatewayUrl: apimGatewayUrl
    apimSubscriptionKey: apimSubscriptionKey
    apimModelDeploymentName: apimModelDeploymentName
    apimApiVersion: apimApiVersion
  }
}

output AZURE_LOCATION string = location
output WEB_URI string = resources.outputs.WEB_URI
output WEB_NAME string = resources.outputs.WEB_NAME
