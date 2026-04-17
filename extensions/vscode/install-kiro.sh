#!/bin/bash

# GuardRail AI - Kiro IDE Installation Script

set -e

echo "🛡️  GuardRail AI Extension for Kiro IDE"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript
echo ""
echo "🔨 Compiling TypeScript..."
npm run compile

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo ""
    echo "📦 Installing vsce (VS Code Extension Manager)..."
    npm install -g @vscode/vsce
fi

# Package extension
echo ""
echo "📦 Packaging extension..."
npm run package

# Find the .vsix file
VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ Failed to create .vsix file"
    exit 1
fi

echo ""
echo "✅ Extension packaged successfully: $VSIX_FILE"
echo ""

# Check if Kiro CLI is available
if command -v kiro &> /dev/null; then
    echo "✅ Kiro CLI found"
    echo ""
    read -p "Do you want to install the extension in Kiro now? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Installing extension in Kiro..."
        kiro --install-extension "$VSIX_FILE"
        echo ""
        echo "✅ Extension installed successfully in Kiro!"
        echo ""
        echo "🚀 Next steps:"
        echo "   1. Start the GuardRail AI backend:"
        echo "      cd ../../api && npm start"
        echo ""
        echo "   2. Open Kiro IDE"
        echo ""
        echo "   3. Press Ctrl+Shift+G (Cmd+Shift+G on Mac) to scan a file"
        echo ""
        echo "   4. Or save a file to auto-scan (if enabled in settings)"
        echo ""
        echo "📚 Documentation: extensions/vscode/README.md"
    else
        echo ""
        echo "📦 Extension package created: $VSIX_FILE"
        echo ""
        echo "To install manually in Kiro:"
        echo "   kiro --install-extension $VSIX_FILE"
        echo ""
        echo "Or install via GUI:"
        echo "   1. Open Kiro"
        echo "   2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
        echo "   3. Type 'Install from VSIX'"
        echo "   4. Select: $VSIX_FILE"
    fi
else
    echo "⚠️  Kiro CLI not found in PATH"
    echo ""
    echo "📦 Extension package created: $VSIX_FILE"
    echo ""
    echo "To install in Kiro:"
    echo ""
    echo "Method 1: Command Line (if Kiro CLI is available)"
    echo "   kiro --install-extension $VSIX_FILE"
    echo ""
    echo "Method 2: GUI (Recommended)"
    echo "   1. Open Kiro IDE"
    echo "   2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
    echo "   3. Type 'Extensions: Install from VSIX'"
    echo "   4. Select: $(pwd)/$VSIX_FILE"
    echo ""
    echo "Method 3: Drag and Drop"
    echo "   1. Open Kiro IDE"
    echo "   2. Open Extensions panel (Ctrl+Shift+X)"
    echo "   3. Drag and drop $VSIX_FILE into the Extensions panel"
fi

echo ""
echo "📖 Configuration:"
echo "   Open Kiro settings (Ctrl+,) and search for 'GuardRail AI'"
echo "   Set API URL: http://localhost:3001"
echo ""
echo "🎯 Usage:"
echo "   • Press Ctrl+Shift+G to scan current file"
echo "   • Save file to auto-scan (if enabled)"
echo "   • Click lightbulb 💡 to apply fixes"
echo ""
echo "Happy secure coding! 🎉"
