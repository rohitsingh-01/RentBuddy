#!/bin/bash

# ────────────────────────────────────────────────────────
#  RentBuddy — Local Setup Script
#  Usage: bash setup.sh
# ────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "🏠  RentBuddy Setup"
echo "────────────────────────────────"

# 1. Check Node.js
echo -n "Checking Node.js... "
if ! command -v node &> /dev/null; then
  echo -e "${RED}NOT FOUND${NC}"
  echo "  → Install Node.js 18+ from https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node --version | cut -c2- | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}v$(node --version) — needs 18+${NC}"
  echo "  → Update Node.js at https://nodejs.org"
  exit 1
fi
echo -e "${GREEN}$(node --version) ✓${NC}"

# 2. Create .env.local if missing
if [ ! -f ".env.local" ]; then
  echo -n "Creating .env.local... "
  cp .env.example .env.local
  echo -e "${GREEN}done ✓${NC}"
  echo ""
  echo -e "${YELLOW}  ⚠  You need to set MONGODB_URI in .env.local${NC}"
  echo "     Get a free MongoDB Atlas cluster at cloud.mongodb.com"
  echo "     Then paste your connection string as MONGODB_URI=..."
  echo ""
else
  echo -e "Using existing .env.local ${GREEN}✓${NC}"
fi

# 3. Check MONGODB_URI
if grep -q "^MONGODB_URI=$" .env.local 2>/dev/null; then
  echo ""
  echo -e "${RED}  ✗ MONGODB_URI is empty in .env.local${NC}"
  echo "    1. Go to cloud.mongodb.com → create free M0 cluster"
  echo "    2. Click Connect → Drivers → copy connection string"
  echo "    3. Paste it as MONGODB_URI=mongodb+srv://... in .env.local"
  echo ""
  echo "    Press Enter after you've done this to continue, or Ctrl+C to exit."
  read -r
fi

# 4. Install dependencies
echo -n "Installing dependencies... "
npm install --silent
echo -e "${GREEN}done ✓${NC}"

# 5. Seed demo data
echo -n "Seeding demo data... "
if npm run seed --silent 2>/dev/null; then
  echo -e "${GREEN}done ✓${NC}"
else
  echo -e "${YELLOW}skipped (check MONGODB_URI if needed)${NC}"
fi

# 6. Done
echo ""
echo -e "${GREEN}────────────────────────────────${NC}"
echo -e "${GREEN}  ✓ Setup complete!${NC}"
echo ""
echo "  Start the app:    npm run dev"
echo "  Open in browser:  http://localhost:3000"
echo ""
echo "  Demo login:       demo@iitb.ac.in"
echo "  Sign-in page:     http://localhost:3000/auth/signin"
echo ""
