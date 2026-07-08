#!/usr/bin/env sh
set -euo pipefail

echo "=== Building AI-Company for Production ==="

# Validate environment
if [ ! -f .env ]; then
  echo "Error: .env file not found. Run 'scripts/setup/init.sh' first."
  exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf apps/dashboard/dist apps/server/dist packages/*/dist

# Install production dependencies
echo "Installing dependencies..."
npm ci --omit=dev
npm ci

# Build all workspaces
echo "Building packages and apps..."
npm run build

# Verify builds
echo "Verifying builds..."
if [ ! -d "apps/dashboard/dist" ]; then
  echo "Error: Dashboard build not found"
  exit 1
fi

if [ ! -d "apps/server/dist" ]; then
  echo "Error: Server build not found"
  exit 1
fi

# Print build summary
echo ""
echo "=== Build complete ==="
echo "Dashboard: apps/dashboard/dist/"
echo "Server: apps/server/dist/"
echo ""
echo "Run 'npm start' to start the production server"
