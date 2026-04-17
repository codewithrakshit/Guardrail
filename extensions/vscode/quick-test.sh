#!/bin/bash

# Quick Test Script for GuardRail AI Extension

echo "🛡️  GuardRail AI - Quick Verification Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "   Start backend: cd ../../api && npm start"
    exit 1
fi

# Test 2: Scan API
echo ""
echo "Test 2: Scan API Test"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{"code":"const key = '\''secret123'\'';","language":"javascript","filename":"test.js"}')

if echo "$RESPONSE" | grep -q "sessionId"; then
    echo -e "${GREEN}✅ Scan API working${NC}"
    SESSION_ID=$(echo "$RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
    echo "   Session ID: $SESSION_ID"
else
    echo -e "${RED}❌ Scan API failed${NC}"
    exit 1
fi

# Test 3: Result API
echo ""
echo "Test 3: Result API Test"
sleep 5  # Wait for processing
RESULT=$(curl -s "http://localhost:3001/api/result/$SESSION_ID")

if echo "$RESULT" | grep -q "status"; then
    echo -e "${GREEN}✅ Result API working${NC}"
    STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "   Status: $STATUS"
else
    echo -e "${RED}❌ Result API failed${NC}"
    exit 1
fi

# Test 4: Extension Package
echo ""
echo "Test 4: Extension Package"
if [ -f "guardrail-ai-1.0.0.vsix" ]; then
    echo -e "${GREEN}✅ Extension package exists${NC}"
    SIZE=$(ls -lh guardrail-ai-1.0.0.vsix | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo -e "${RED}❌ Extension package not found${NC}"
    echo "   Run: npm run package"
    exit 1
fi

# Test 5: Extension Files
echo ""
echo "Test 5: Extension Files"
if [ -d "out" ] && [ -f "out/extension.js" ]; then
    echo -e "${GREEN}✅ Extension compiled${NC}"
else
    echo -e "${RED}❌ Extension not compiled${NC}"
    echo "   Run: npm run compile"
    exit 1
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ All Quick Tests Passed!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Install extension in Kiro:"
echo "   - Press Cmd+Shift+P"
echo "   - Type: Extensions: Install from VSIX"
echo "   - Select: guardrail-ai-1.0.0.vsix"
echo ""
echo "2. Test in Kiro:"
echo "   - Create test.js with: const key = 'secret123';"
echo "   - Press Cmd+Shift+G to scan"
echo "   - Check for red squiggly lines"
echo "   - Click lightbulb 💡 to apply fix"
echo ""
echo "3. Full verification:"
echo "   - See VERIFICATION-CHECKLIST.md"
echo ""
