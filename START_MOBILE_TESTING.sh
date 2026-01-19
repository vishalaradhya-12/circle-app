#!/bin/bash

# CIRCLE Mobile Testing - Quick Start Script
# This script prepares and starts the app for mobile device testing

echo "🚀 CIRCLE Mobile Testing Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
MOBILE_DIR="$SCRIPT_DIR/mobile-app"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get local IP
get_local_ip() {
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
}

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"
echo ""

# Step 2: Get local IP
echo -e "${BLUE}Step 2: Detecting local network IP...${NC}"
LOCAL_IP=$(get_local_ip)

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}❌ Could not detect local IP address${NC}"
    echo "Please check your network connection"
    exit 1
fi

echo -e "${GREEN}✓ Local IP: $LOCAL_IP${NC}"
echo ""

# Step 3: Display mobile setup instructions
echo -e "${YELLOW}📱 Mobile Device Setup Instructions:${NC}"
echo ""
echo "1. Install Expo Go on your phone:"
echo "   - iOS: https://apps.apple.com/app/expo-go/id982107779"
echo "   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo ""
echo "2. Connect your phone to the SAME WiFi network as this computer"
echo ""
echo "3. Make sure both devices can communicate:"
echo "   - Your computer IP: $LOCAL_IP"
echo "   - Firewall should allow ports 3000 and 8081"
echo ""

# Step 4: Check if backend dependencies are installed
echo -e "${BLUE}Step 3: Checking backend dependencies...${NC}"
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Backend dependencies ready${NC}"
echo ""

# Step 5: Check if mobile dependencies are installed
echo -e "${BLUE}Step 4: Checking mobile app dependencies...${NC}"
if [ ! -d "$MOBILE_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing mobile app dependencies...${NC}"
    cd "$MOBILE_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install mobile app dependencies${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Mobile app dependencies ready${NC}"
echo ""

# Step 6: Start backend server
echo -e "${BLUE}Step 5: Starting backend server...${NC}"
cd "$BACKEND_DIR"

# Check if backend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠ Backend is already running on port 3000${NC}"
    echo "Stopping existing backend..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 2
fi

# Start backend in background
npm run dev > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$SCRIPT_DIR/.backend.pid"

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  Logs: $SCRIPT_DIR/backend.log"
echo ""

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check logs: tail -f $SCRIPT_DIR/backend.log"
    exit 1
fi

echo -e "${GREEN}✓ Backend is running on http://$LOCAL_IP:3000${NC}"
echo ""

# Step 7: Start mobile app
echo -e "${BLUE}Step 6: Starting mobile app...${NC}"
cd "$MOBILE_DIR"

# Check if metro is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠ Metro bundler is already running on port 8081${NC}"
    echo "Stopping existing metro..."
    kill $(lsof -t -i:8081) 2>/dev/null
    sleep 2
fi

# Start mobile app
echo ""
echo -e "${GREEN}✓ Starting Expo...${NC}"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  SCAN THE QR CODE WITH YOUR PHONE TO TEST THE APP${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Backend API: http://$LOCAL_IP:3000"
echo "Mobile App: exp://$LOCAL_IP:8081"
echo ""
echo -e "${BLUE}iOS:${NC} Open Camera app and scan the QR code"
echo -e "${BLUE}Android:${NC} Open Expo Go app and tap 'Scan QR Code'"
echo ""
echo -e "${YELLOW}To stop all servers, run: ./STOP_MOBILE_TESTING.sh${NC}"
echo ""

# Start expo (this will run in foreground)
npm start

# Cleanup on exit
echo ""
echo "Cleaning up..."
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    kill $BACKEND_PID 2>/dev/null
    rm "$SCRIPT_DIR/.backend.pid"
fi
