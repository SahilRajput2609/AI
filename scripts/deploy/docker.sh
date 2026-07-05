#!/usr/bin/env sh
set -euo pipefail

echo "=== AI-Company Docker Deploy ==="

# Configuration
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-ai-company}"
TAG="${TAG:-latest}"
SERVER_IMAGE="$REGISTRY/$IMAGE_NAME/server:$TAG"
DASHBOARD_IMAGE="$REGISTRY/$IMAGE_NAME/dashboard:$TAG"

# Build
echo "Building Docker images..."
docker build \
  --platform linux/amd64 \
  --cache-from "$SERVER_IMAGE" \
  -t "$SERVER_IMAGE" \
  -f apps/server/Dockerfile .

docker build \
  --platform linux/amd64 \
  --cache-from "$DASHBOARD_IMAGE" \
  -t "$DASHBOARD_IMAGE" \
  -f apps/dashboard/Dockerfile .

# Push (if authenticated)
if [ -n "${DOCKER_TOKEN:-}" ] || [ -n "${GH_TOKEN:-}" ]; then
  echo "Pushing images to $REGISTRY..."
  docker push "$SERVER_IMAGE"
  docker push "$DASHBOARD_IMAGE"
else
  echo "No registry credentials found — skipping push"
fi

echo ""
echo "=== Docker build complete ==="
echo "Server: $SERVER_IMAGE"
echo "Dashboard: $DASHBOARD_IMAGE"
