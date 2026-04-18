#!/bin/bash
# GuardRail AI - Frontend Web App
# Run this in Terminal 2

cd "$(dirname "$0")/web"

echo "🌐 Starting GuardRail AI Frontend..."
echo "📍 Web app will run on http://localhost:3000"
echo ""

# Kill any existing server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start Next.js dev server
npm run dev
