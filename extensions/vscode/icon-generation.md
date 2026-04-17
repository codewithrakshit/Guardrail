# Icon Generation Instructions

The extension now has an SVG icon at `icon.svg`. To generate a PNG version for the extension:

## Option 1: Using ImageMagick (if installed)
```bash
convert -background none -density 300 icon.svg -resize 128x128 icon.png
```

## Option 2: Using Node.js (sharp library)
```bash
npm install sharp
node -e "const sharp = require('sharp'); sharp('icon.svg').resize(128, 128).png().toFile('icon.png');"
```

## Option 3: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set dimensions to 128x128
4. Download as `icon.png`

## Option 4: Using Inkscape
```bash
inkscape icon.svg --export-type=png --export-filename=icon.png -w 128 -h 128
```

After generating the PNG, the extension will automatically use it.
