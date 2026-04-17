#!/bin/bash

# GuardRail AI VS Code Extension - Installation Script

set -e

echo "🛡️  GuardRail AI VS Code Extension Installer"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
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

# Ask if user wants to install
read -p "Do you want to install the extension now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        echo "📥 Installing extension..."
        code --install-extension "$VSIX_FILE"
        echo ""
        echo "✅ Extension installed successfully!"
        echo ""
        echo "🚀 Next steps:"
        echo "   1. Start the GuardRail AI backend: cd ../../api && npm start"
        echo "   2. Open VS Code"
        echo "   3. Press Ctrl+Shift+G (Cmd+Shift+G on Mac) to scan a file"
    else
        echo "❌ VS Code CLI not found. Please install the extension manually:"
        echo "   1. Open VS Code"
        echo "   2. Go to Extensions (Ctrl+Shift+X)"
        echo "   3. Click '...' menu → 'Install from VSIX'"
        echo "   4. Select: $VSIX_FILE"
    fi
else
    echo ""
    echo "📦 Extension package created: $VSIX_FILE"
    echo ""
    echo "To install manually:"
    echo "   1. Open VS Code"
    echo "   2. Go to Extensions (Ctrl+Shift+X)"
    echo "   3. Click '...' menu → 'Install from VSIX'"
    echo "   4. Select: $VSIX_FILE"
fi

echo ""
echo "📚 Documentation: extensions/vscode/README.md"
echo "🔧 Development: extensions/vscode/DEVELOPMENT.md"
echo ""
echo "Happy coding! 🎉"
