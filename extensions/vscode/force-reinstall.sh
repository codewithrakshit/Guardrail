#!/bin/bash

echo "🔥 FORCE Reinstall GuardRail AI Extension"
echo "=========================================="
echo ""

# Get Kiro extensions directory
KIRO_EXT_DIR="$HOME/.kiro/extensions"

echo "1️⃣  Stopping any running Kiro processes..."
pkill -f "kiro" 2>/dev/null || true
sleep 2

echo ""
echo "2️⃣  Removing old extension completely..."

# Uninstall via CLI
kiro --uninstall-extension guardrail-ai 2>/dev/null || true

# Manually remove extension directory if it exists
if [ -d "$KIRO_EXT_DIR" ]; then
    echo "   Searching for old extension files..."
    find "$KIRO_EXT_DIR" -name "*guardrail*" -type d -exec rm -rf {} + 2>/dev/null || true
    echo "   ✅ Old files removed"
else
    echo "   ℹ️  Extensions directory not found (this is OK)"
fi

sleep 2

echo ""
echo "3️⃣  Installing NEW extension..."
kiro --install-extension guardrail-ai-1.0.0.vsix

echo ""
echo "4️⃣  Verifying installation..."
if kiro --list-extensions 2>/dev/null | grep -q "guardrail-ai"; then
    echo "   ✅ Extension installed successfully!"
else
    echo "   ⚠️  Extension may not be installed. Check manually."
fi

echo ""
echo "=========================================="
echo "✅ DONE!"
echo ""
echo "⚠️  CRITICAL: You MUST do these steps NOW:"
echo ""
echo "   1. COMPLETELY RESTART Kiro IDE"
echo "      (Don't just reload - fully quit and reopen)"
echo ""
echo "   2. After restart, verify extension is loaded:"
echo "      • Open Command Palette (Cmd+Shift+P)"
echo "      • Type 'GuardRail AI'"
echo "      • You should see all 6 commands"
echo ""
echo "   3. Test with test.js:"
echo "      • Open test.js"
echo "      • Press Cmd+Shift+G"
echo "      • Click red line → lightbulb → Apply Fix"
echo ""
echo "=========================================="
echo ""
