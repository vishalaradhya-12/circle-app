#!/bin/bash

# CIRCLE Mobile Testing - Stop Script
# This script stops all running servers

echo "🛑 Stopping CIRCLE Mobile Testing..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Stop backend
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Stopping backend server (port 3000)..."
    kill $(lsof -t -i:3000) 2>/dev/null
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo "Backend is not running"
fi

# Stop metro bundler
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "Stopping Metro bundler (port 8081)..."
    kill $(lsof -t -i:8081) 2>/dev/null
    echo -e "${GREEN}✓ Metro bundler stopped${NC}"
else
    echo "Metro bundler is not running"
fi

# Clean up PID file
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    rm "$SCRIPT_DIR/.backend.pid"
fi

echo ""
echo -e "${GREEN}All servers stopped successfully!${NC}"
