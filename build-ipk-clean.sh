#!/bin/bash

# ============================================
# Build CLEAN IPK - Only essential files
# Tạo IPK sạch, chỉ chứa code cần thiết
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║   Sports TV - Clean Build Script          ║"
echo "║   Chỉ pack code cần thiết                 ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check ares-package
if ! command -v ares-package &> /dev/null; then
    echo -e "${RED}❌ ERROR: ares-package not found!${NC}"
    echo "Install: npm install -g @webos-tools/cli"
    exit 1
fi

echo -e "${GREEN}✅ webOS SDK found${NC}"
echo ""

# Read version from appinfo.json
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' appinfo.json | cut -d'"' -f4)
APP_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' appinfo.json | cut -d'"' -f4)

echo -e "${BLUE}📋 App Info:${NC}"
echo "   ID: $APP_ID"
echo "   Version: $VERSION"
echo ""

# Create temp build directory
TEMP_DIR="/tmp/smarttv_build_clean_$$"
echo -e "${BLUE}📦 Creating clean build...${NC}"
mkdir -p "$TEMP_DIR"

# Copy ONLY essential files
echo -e "${CYAN}   Copying files...${NC}"

# Root files
cp appinfo.json "$TEMP_DIR/"
cp index.html "$TEMP_DIR/"
cp icon.png "$TEMP_DIR/"
cp largeIcon.png "$TEMP_DIR/"

# CSS folder
cp -r css "$TEMP_DIR/"

# JS folder
cp -r js "$TEMP_DIR/"

# Images folder (if exists)
if [ -d "images" ]; then
    cp -r images "$TEMP_DIR/"
fi

# Optional: privacy-policy.html (if required by store)
if [ -f "privacy-policy.html" ]; then
    cp privacy-policy.html "$TEMP_DIR/"
fi

echo ""
echo -e "${BLUE}📊 Package size check:${NC}"
du -sh "$TEMP_DIR"
echo ""
find "$TEMP_DIR" -type f | wc -l | xargs echo "   Total files:"
echo ""

# Build IPK from temp directory
echo -e "${BLUE}🔨 Building IPK package...${NC}"
ares-package "$TEMP_DIR"

# Move IPK to current directory
IPK_FILE="${APP_ID}_${VERSION}_all.ipk"
if [ -f "$IPK_FILE" ]; then
    mv "$IPK_FILE" .
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""

    # Show file size
    FILE_SIZE=$(ls -lh "$IPK_FILE" | awk '{print $5}')
    echo -e "${GREEN}📦 Package created:${NC}"
    echo "   File: $IPK_FILE"
    echo "   Size: $FILE_SIZE"
    echo ""

    # Compare with old version
    OLD_IPK=$(ls -t *.ipk 2>/dev/null | grep -v "$IPK_FILE" | head -1)
    if [ ! -z "$OLD_IPK" ]; then
        OLD_SIZE=$(ls -lh "$OLD_IPK" | awk '{print $5}')
        echo -e "${YELLOW}📊 Comparison:${NC}"
        echo "   Old: $OLD_IPK ($OLD_SIZE)"
        echo "   New: $IPK_FILE ($FILE_SIZE)"
        echo ""
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    echo "IPK file not found: $IPK_FILE"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ CLEAN BUILD COMPLETE!${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""
echo "Ready to submit to LG Store!"
echo ""
echo "File location:"
echo "  $(pwd)/$IPK_FILE"
echo ""
