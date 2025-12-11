#!/bin/bash
# Deploy script för Azure Container Apps
# Skapad: 2024-12-11
set -e

# Konfiguration
ACR_NAME="cifcontainerregistry"
IMAGE_NAME="facility-api"
TAG="${1:-latest}"
RESOURCE_GROUP="facility-registry-rg"
CONTAINER_APP_NAME="facility-api"

echo "🔐 Loggar in till Azure..."
az account show > /dev/null 2>&1 || az login

echo "🔐 Loggar in till Container Registry..."
az acr login --name $ACR_NAME

echo "🔨 Bygger Docker-image..."
docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG .

echo "📤 Pushar till Azure Container Registry..."
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG

echo "🚀 Uppdaterar Container App..."
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG

echo "✅ Deploy klar!"
