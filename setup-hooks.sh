#!/bin/bash
# Setup GuardRail AI Pre-Commit Hook

echo "🛡️  Setting up GuardRail AI pre-commit hook..."

# Configure git to use custom hooks directory
git config core.hooksPath .githooks

echo "✅ Pre-commit hook installed!"
echo ""
echo "Now every commit will be scanned for security vulnerabilities."
echo "To bypass (not recommended): git commit --no-verify"
