#!/bin/bash

# Azure Container Apps Deployment Script
# Run this after setting up Azure resources

set -e

# Configuration - UPDATE THESE VALUES
RESOURCE_GROUP="facility-registry-rg"
ACR_NAME="facilityregistryacr"
CONTAINER_APP_ENV="facility-env"
CONTAINER_APP_NAME="facility-api"
LOCATION="swedencentral"

# Database Configuration - UPDATE THESE VALUES
DB_HOST="your-server.postgres.database.azure.com"
DB_NAME="facility_registry"
DB_USER="your_admin_user"
DB_PASSWORD="your_password"

# Generate JWT secret if not set
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"

echo "=== Building and Deploying Facility API to Azure ==="

# Login to Azure (if not already logged in)
echo "Checking Azure login..."
az account show > /dev/null 2>&1 || az login

# Login to ACR
echo "Logging in to Azure Container Registry..."
az acr login --name $ACR_NAME

# Build and push Docker image
echo "Building Docker image..."
cd azure/api
docker build -t $ACR_NAME.azurecr.io/facility-api:latest .

echo "Pushing to Azure Container Registry..."
docker push $ACR_NAME.azurecr.io/facility-api:latest

# Create Container Apps Environment if it doesn't exist
echo "Checking Container Apps Environment..."
if ! az containerapp env show --name $CONTAINER_APP_ENV --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
  echo "Creating Container Apps Environment..."
  az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION
fi

# Deploy or update Container App
echo "Deploying Container App..."
if az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
  # Update existing app
  az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_NAME.azurecr.io/facility-api:latest
else
  # Create new app
  az containerapp create \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_NAME.azurecr.io/facility-api:latest \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 0.5 \
    --memory 1Gi \
    --registry-server $ACR_NAME.azurecr.io \
    --secrets \
      db-host="$DB_HOST" \
      db-name="$DB_NAME" \
      db-user="$DB_USER" \
      db-password="$DB_PASSWORD" \
      jwt-secret="$JWT_SECRET" \
    --env-vars \
      DB_HOST=secretref:db-host \
      DB_NAME=secretref:db-name \
      DB_USER=secretref:db-user \
      DB_PASSWORD=secretref:db-password \
      DB_SSL=true \
      DB_PORT=5432 \
      JWT_SECRET=secretref:jwt-secret \
      PORT=3000 \
      CORS_ORIGIN="*"
fi

# Get the URL
echo ""
echo "=== Deployment Complete ==="
API_URL=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "API URL: https://$API_URL"
echo ""
echo "Test endpoints:"
echo "  Health: https://$API_URL/health"
echo "  Municipalities: https://$API_URL/api/public/municipalities"
echo "  Facilities: https://$API_URL/api/public/facilities"
