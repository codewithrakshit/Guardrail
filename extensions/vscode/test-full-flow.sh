#!/bin/bash

echo "🧪 GuardRail AI Extension - Full Flow Test"
echo "=========================================="
echo ""

# Check if backend is running
echo "1️⃣  Checking backend API..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on http://localhost:3001"
else
    echo "   ❌ Backend is NOT running!"
    echo "   Please start the backend first:"
    echo "   cd api && npm start"
    exit 1
fi

echo ""
echo "2️⃣  Testing scan endpoint..."

# Create test file content
TEST_CODE='const apiKey = "sk-1234567890abcdef";
console.log(apiKey);'

# Test scan
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$TEST_CODE\",\"language\":\"javascript\",\"filename\":\"test.js\"}")

echo "   Response: $SCAN_RESPONSE"

# Extract sessionId
SESSION_ID=$(echo $SCAN_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    echo "   ❌ Failed to get session ID"
    exit 1
fi

echo "   ✅ Scan initiated, Session ID: $SESSION_ID"

echo ""
echo "3️⃣  Waiting for scan to complete (15 seconds)..."
sleep 15

echo ""
echo "4️⃣  Fetching results..."
RESULT=$(curl -s http://localhost:3001/api/result/$SESSION_ID)

echo "   Full Response:"
echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"

# Check for vulnerabilities
VULN_COUNT=$(echo $RESULT | grep -o '"vulnerabilities":\[' | wc -l)

if [ $VULN_COUNT -gt 0 ]; then
    echo ""
    echo "   ✅ Vulnerabilities detected in response!"
    echo ""
    echo "5️⃣  Vulnerability Details:"
    echo "$RESULT" | jq '.vulnerabilities' 2>/dev/null || echo "   (Install jq for formatted output)"
else
    echo "   ⚠️  No vulnerabilities array found in response"
fi

echo ""
echo "=========================================="
echo "✅ Backend test complete!"
echo ""
echo "📝 Next steps for IDE testing:"
echo "   1. Run: ./reinstall-kiro.sh"
echo "   2. Reload Kiro IDE (Cmd+R)"
echo "   3. Open test.js file"
echo "   4. Press Cmd+Shift+G to scan"
echo "   5. Look for red squiggly lines"
echo "   6. Click lightbulb icon to apply fix"
echo ""
