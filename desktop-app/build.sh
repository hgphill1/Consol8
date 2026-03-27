#!/bin/bash

# TASCAM-8X Desktop App Build Script
# This script builds the macOS desktop application

set -e

echo "🎹 TASCAM-8X Desktop App Builder"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Step 1: Installing frontend dependencies...${NC}"
cd "$ROOT_DIR/frontend"
yarn install

echo -e "${YELLOW}Step 2: Building React frontend...${NC}"
yarn build

echo -e "${YELLOW}Step 3: Installing desktop app dependencies...${NC}"
cd "$SCRIPT_DIR"
npm install

echo -e "${YELLOW}Step 4: Copying React build to desktop app...${NC}"
rm -rf build
cp -r "$ROOT_DIR/frontend/build" .

echo -e "${YELLOW}Step 5: Building macOS DMG...${NC}"
npm run build:mac

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "The DMG installer is located in: $SCRIPT_DIR/dist/"
echo ""
ls -la dist/*.dmg 2>/dev/null || echo "DMG file not found - check for build errors above"
