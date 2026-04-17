# GuardRail AI Extension Icon Setup

## Current Status
✅ SVG icon created at `icon.svg`
⚠️  PNG icon needed for VS Code extension

## Quick Setup (Choose One Method)

### Method 1: Online Converter (Easiest - No Installation)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg` from this directory
3. Set output size to 128x128 pixels
4. Download and save as `icon.png` in this directory
5. Done! The extension will use the icon automatically

### Method 2: Using ImageMagick (If Installed)
```bash
brew install imagemagick
convert -background none -density 300 icon.svg -resize 128x128 icon.png
```

### Method 3: Using Inkscape (If Installed)
```bash
brew install inkscape
inkscape icon.svg --export-type=png --export-filename=icon.png -w 128 -h 128
```

### Method 4: Using Node.js Sharp Package
```bash
npm install sharp
npx sharp-cli --input icon.svg --output icon.png --resize 128
```

## Icon Design
The icon features:
- 🛡️ Blue shield representing security
- 🤖 AI circuit pattern inside (nodes and connections)
- 🔒 Lock symbol at the bottom
- Modern gradient colors (blue to teal)

## After Creating icon.png
1. Rebuild the extension: `npm run compile`
2. Package the extension: `npm run package`
3. Install: `code --install-extension guardrail-ai-1.0.0.vsix`

The icon will appear in:
- VS Code Extensions marketplace
- Extension sidebar
- Command palette
- Status bar items
