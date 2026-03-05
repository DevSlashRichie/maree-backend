#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$TERRAFORM_DIR")"

cd "$PROJECT_DIR"

echo "=== Building Docker image ==="
docker build -t maree:latest .

echo "=== Tagging image for Azure Container Registry ==="
ACR_NAME=$(cd "$TERRAFORM_DIR" && terraform output -raw container_registry_url 2>/dev/null || echo "mareeregistryprod")
docker tag maree:latest "${ACR_NAME}/maree:latest"

echo "=== Logging into Azure Container Registry ==="
az acr login --name "$ACR_NAME"

echo "=== Pushing image to Azure Container Registry ==="
docker push "${ACR_NAME}/maree:latest"

echo "=== Deployment complete ==="
echo "Image pushed to: ${ACR_NAME}/maree:latest"
echo "Run 'cd infra/terraform && terraform apply' to deploy"
