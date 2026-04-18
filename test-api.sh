#!/bin/bash
# Quick API Test Script

echo "🧪 Testing GuardRail AI API..."
echo ""

# Test 1: Health check
echo "1️⃣  Health Check:"
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""
echo ""

# Test 2: Scan with hardcoded secret
echo "2️⃣  Scanning vulnerable code:"
curl -s -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const apiKey = \"sk-test123\";\nconsole.log(apiKey);",
    "language": "javascript",
    "filename": "test.js"
  }' | python3 -m json.tool
echo ""
echo ""

echo "✅ API test complete!"
echo ""
echo "Next steps:"
echo "  1. Open Kiro IDE"
echo "  2. Open test-vulnerable.js"
echo "  3. Press Cmd+Shift+G to scan"
echo "  4. Look for red squiggly lines"
echo "  5. Click the lightbulb → Apply Fix"
