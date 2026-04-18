#!/bin/bash
# GuardRail AI - Backend Server
# Run this in Terminal 1

cd "$(dirname "$0")/api"

echo "🚀 Starting GuardRail AI Backend..."
echo "📍 API will run on http://localhost:3001"
echo ""

# Kill any existing server on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start server
node server.js
