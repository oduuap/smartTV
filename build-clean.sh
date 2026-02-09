#!/bin/bash
# Build clean IPK (chỉ code, không có file thừa)

echo "🧹 Building clean IPK..."

# Create temp directory
TEMP_DIR="/tmp/smarttv_build_$$"
mkdir -p "$TEMP_DIR"

# Copy only necessary files
echo "📦 Copying essential files..."
cp appinfo.json "$TEMP_DIR/"
cp index.html "$TEMP_DIR/"
cp icon.png "$TEMP_DIR/"
cp largeIcon.png "$TEMP_DIR/"
cp -r css "$TEMP_DIR/"
cp -r js "$TEMP_DIR/"
cp -r images "$TEMP_DIR/"

# Show size
echo "📊 Package size:"
du -sh "$TEMP_DIR"

# Build IPK
echo "🔨 Packaging..."
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
ares-package "$TEMP_DIR" --outdir .

# Cleanup
rm -rf "$TEMP_DIR"

# Show result
if [ -f "com.smarttv.sports_1.0.0_all.ipk" ]; then
    echo "✅ Build successful!"
    ls -lh com.smarttv.sports_1.0.0_all.ipk
else
    echo "❌ Build failed!"
    exit 1
fi
