#!/bin/bash
# Simple script to create a basic PNG icon using ImageMagick or online tools

echo "🎨 GuardRail AI Icon Generator"
echo "================================"
echo ""

if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found! Converting SVG to PNG..."
    convert -background none -density 300 icon.svg -resize 128x128 icon.png
    echo "✅ Icon created: icon.png"
elif command -v inkscape &> /dev/null; then
    echo "✅ Inkscape found! Converting SVG to PNG..."
    inkscape icon.svg --export-type=png --export-filename=icon.png -w 128 -h 128
    echo "✅ Icon created: icon.png"
else
    echo "⚠️  No image converter found."
    echo ""
    echo "Please install one of:"
    echo "  • ImageMagick: brew install imagemagick"
    echo "  • Inkscape: brew install inkscape"
    echo ""
    echo "Or use an online converter:"
    echo "  1. Go to https://cloudconvert.com/svg-to-png"
    echo "  2. Upload icon.svg"
    echo "  3. Download as icon.png (128x128)"
fi
