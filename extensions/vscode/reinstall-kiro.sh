#!/bin/bash

echo "🔄 Reinstalling GuardRail AI Extension for Kiro IDE"
echo "=================================================="

# Uninstall existing extension
echo "🗑️  Uninstalling old version..."
kiro --uninstall-extension guardrail-ai 2>/dev/null || true

# Small delay
sleep 1

# Install new version
echo "📦 Installing new version..."
kiro --install-extension guardrail-ai-1.0.0.vsix

echo ""
echo "✅ Extension reinstalled successfully!"
echo ""
echo "⚠️  IMPORTANT: You MUST reload Kiro IDE now!"
echo ""
echo "📝 To reload:"
echo "   • Press Cmd+R (Mac) or Ctrl+R (Windows/Linux)"
echo "   • Or restart Kiro IDE completely"
echo ""
echo "📝 After reload:"
echo "   1. Open test.js file"
echo "   2. Press Cmd+Shift+G to scan"
echo "   3. Click on the red squiggly line"
echo "   4. Click the lightbulb icon 💡"
echo "   5. Select 'Apply GuardRail AI Fix'"
echo ""
