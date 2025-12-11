#!/bin/bash
# Deploy script för Azure Container Apps
# Skapad: 2024-12-11
set -e

# =============================================================================
# KONFIGURATION - UPPDATERA DESSA VÄRDEN VID BEHOV
# =============================================================================
ACR_NAME="cifcontainerregistry"
IMAGE_NAME="facility-api"
TAG="${1:-latest}"
RESOURCE_GROUP="rg-cif-datanav"
CONTAINER_APP_NAME="cif-container-app"

# VIKTIGT: Ange din Azure subscription ID här
# Hitta den med: az account list --query "[].{name:name, id:id}" -o table
SUBSCRIPTION_ID=""

# =============================================================================
# VALIDERING
# =============================================================================
if [ -z "$SUBSCRIPTION_ID" ]; then
  echo "❌ Fel: SUBSCRIPTION_ID är inte angiven i skriptet!"
  echo ""
  echo "Kör följande kommando för att hitta din subscription ID:"
  echo "  az account list --query \"[].{name:name, id:id}\" -o table"
  echo ""
  echo "Uppdatera sedan SUBSCRIPTION_ID-variabeln i detta skript."
  exit 1
fi

# =============================================================================
# AZURE-INLOGGNING OCH SUBSCRIPTION
# =============================================================================
echo "🔐 Loggar in till Azure..."
az account show > /dev/null 2>&1 || az login

echo "📋 Sätter subscription..."
az account set --subscription "$SUBSCRIPTION_ID"

echo "✅ Använder subscription: $(az account show --query name -o tsv)"
echo "   Subscription ID: $SUBSCRIPTION_ID"
echo ""

# =============================================================================
# CONTAINER REGISTRY
# =============================================================================
echo "🔐 Loggar in till Container Registry..."
az acr login --name "$ACR_NAME" --subscription "$SUBSCRIPTION_ID"

# =============================================================================
# BYGG OCH PUSH
# =============================================================================
echo "🔨 Bygger Docker-image..."
docker build -t "$ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG" .

echo "📤 Pushar till Azure Container Registry..."
docker push "$ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG"

# =============================================================================
# DEPLOY TILL CONTAINER APP
# =============================================================================
echo "🚀 Uppdaterar Container App..."
az containerapp update \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG" \
  --subscription "$SUBSCRIPTION_ID"

# =============================================================================
# KLAR
# =============================================================================
echo ""
echo "✅ Deploy klar!"
echo ""
echo "📍 Container App URL:"
az containerapp show \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv
