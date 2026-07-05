#!/usr/bin/env sh
set -euo pipefail

echo "=== AI-Company Project Initialization ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required"; exit 1; }

NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Error: Node.js >=18 required (found: $(node -v))"
  exit 1
fi

echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm ci

# Create .env if missing
if [ ! -f .env ]; then
  echo ""
  echo "Creating .env file..."
  cat > .env << 'EOF'
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./data/ai-company.db

# JWT
JWT_SECRET=dev-secret-change-in-production

# OpenAI
OPENAI_API_KEY=
EOF
  echo ".env created — please review and update variables"
else
  echo ".env already exists, skipping"
fi

# Create data directory
mkdir -p data

echo ""
echo "=== Setup complete ==="
echo "Run 'npm run dev' to start the development environment"
