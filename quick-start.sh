#!/bin/bash

# CIRCLE App - Quick Start Script
# This script helps you start testing the app quickly

echo "🚀 CIRCLE App - Quick Start"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓${NC} Redis is running"
    else
        echo -e "${YELLOW}⚠${NC} Redis installed but not running. Starting..."
        brew services start redis
    fi
else
    echo -e "${RED}✗${NC} Redis not found. Run: brew install redis"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL installed: $(psql --version | head -1)"
else
    echo -e "${RED}✗${NC} PostgreSQL not found. Please install PostgreSQL 14+"
    exit 1
fi

echo ""

# Step 2: Check environment files
echo "📝 Step 2: Checking environment configuration..."

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env exists"
    
    # Check for Agora credentials
    if grep -q "your-agora-app-id-here" backend/.env; then
        echo -e "${YELLOW}⚠${NC} WARNING: Agora credentials not configured in backend/.env"
        echo "   Please add your Agora App ID and Certificate"
        echo "   Get them from: https://console.agora.io"
    else
        echo -e "${GREEN}✓${NC} Agora credentials configured"
    fi
else
    echo -e "${RED}✗${NC} backend/.env not found"
    exit 1
fi

if [ -f "mobile-app/.env" ]; then
    echo -e "${GREEN}✓${NC} Mobile app .env exists"
    
    # Check for Agora credentials
    if grep -q "your-agora-app-id-here" mobile-app/.env; then
        echo -e "${YELLOW}⚠${NC} WARNING: Agora App ID not configured in mobile-app/.env"
        echo "   Please add your Agora App ID"
    else
        echo -e "${GREEN}✓${NC} Agora App ID configured"
    fi
else
    echo -e "${RED}✗${NC} mobile-app/.env not found"
    exit 1
fi

echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
fi

if [ ! -d "mobile-app/node_modules" ]; then
    echo "Installing mobile app dependencies..."
    cd mobile-app && npm install && cd ..
else
    echo -e "${GREEN}✓${NC} Mobile app dependencies installed"
fi

echo ""

# Step 4: Check if native build exists
echo "🏗️ Step 4: Checking native build..."

if [ ! -d "mobile-app/ios" ] && [ ! -d "mobile-app/android" ]; then
    echo -e "${YELLOW}⚠${NC} Native build not found. You need to run:"
    echo "   cd mobile-app && npx expo prebuild --clean"
    echo ""
    echo "This is REQUIRED for voice calls (Agora doesn't work with Expo Go)"
    echo ""
    read -p "Would you like to build now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd mobile-app
        npx expo prebuild --clean
        cd ..
    else
        echo "Skipping build. You can run it later."
    fi
else
    echo -e "${GREEN}✓${NC} Native build exists (ios/android folders found)"
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Configure Agora credentials (if not done):"
echo "   - Get App ID from: https://console.agora.io"
echo "   - Update backend/.env and mobile-app/.env"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. In a new terminal, run the mobile app:"
echo "   cd mobile-app && npx expo run:ios"
echo "   (or: npx expo run:android)"
echo ""
echo "📖 For detailed instructions, see: FULL_TEST_GUIDE.md"
echo ""
