#!/bin/bash

# ============================================
# Build and Install Script for LG webOS
# Sports TV v1.1.0
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║   Sports TV - Build & Install Script      ║"
echo "║   Version 1.1.0                           ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if ares-package is installed
if ! command -v ares-package &> /dev/null; then
    echo -e "${RED}❌ ERROR: ares-package not found!${NC}"
    echo -e "${YELLOW}Please install LG webOS SDK first.${NC}"
    echo ""
    echo "Installation:"
    echo "  npm install -g @webos-tools/cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ webOS SDK found${NC}"
echo ""

# Step 1: Clean old build
echo -e "${BLUE}📦 Step 1: Cleaning old build...${NC}"
if [ -f "../com.smarttv.sports_1.0.0_all.ipk" ]; then
    rm -f ../com.smarttv.sports_1.0.0_all.ipk
    echo -e "${GREEN}   ✓ Removed old v1.0.0 package${NC}"
fi

if [ -f "../com.smarttv.sports_1.1.0_all.ipk" ]; then
    rm -f ../com.smarttv.sports_1.1.0_all.ipk
    echo -e "${GREEN}   ✓ Removed old v1.1.0 package${NC}"
fi

echo ""

# Step 2: Show what's included
echo -e "${BLUE}📋 Step 2: Package contents:${NC}"
echo "   - index.html"
echo "   - appinfo.json (v1.1.0)"
echo "   - css/style.css"
echo "   - js/*.js (8 files)"
echo "   - images/*.{jpg,webp,png}"
echo ""

# Step 3: Build IPK
echo -e "${BLUE}🔨 Step 3: Building IPK package...${NC}"
cd ..
ares-package smartTV

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Check if IPK was created
IPK_FILE="com.smarttv.sports_1.1.0_all.ipk"
if [ -f "$IPK_FILE" ]; then
    FILE_SIZE=$(du -h "$IPK_FILE" | cut -f1)
    echo -e "${GREEN}   ✓ Package created: ${IPK_FILE} (${FILE_SIZE})${NC}"
else
    echo -e "${RED}   ✗ Package file not found!${NC}"
    exit 1
fi

echo ""

# Step 4: List connected devices
echo -e "${BLUE}📱 Step 4: Checking connected devices...${NC}"
ares-setup-device --list

echo ""
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ BUILD COMPLETE!${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📦 Package: ${NC}com.smarttv.sports_1.1.0_all.ipk"
echo -e "${CYAN}📍 Location: ${NC}$(pwd)/com.smarttv.sports_1.1.0_all.ipk"
echo ""

# Ask if user wants to install
echo -e "${YELLOW}Do you want to install on TV now? (y/n)${NC}"
read -r INSTALL_NOW

if [[ $INSTALL_NOW =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 Step 5: Installing to TV...${NC}"
    echo ""

    # List devices
    echo "Available devices:"
    ares-setup-device --list
    echo ""

    # Ask for device name or IP
    echo -e "${YELLOW}Enter device name (or IP address):${NC}"
    read -r DEVICE_INPUT

    if [ -z "$DEVICE_INPUT" ]; then
        echo -e "${RED}❌ No device specified!${NC}"
        exit 1
    fi

    # Check if input is IP address (contains dots)
    if [[ $DEVICE_INPUT =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # It's an IP address, setup new device
        echo -e "${BLUE}Setting up new device...${NC}"
        DEVICE_NAME="lg_tv_temp"

        ares-setup-device --add $DEVICE_NAME -i "host=$DEVICE_INPUT" -i "port=9922"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}   ✓ Device added${NC}"
        else
            echo -e "${RED}   ✗ Failed to add device${NC}"
            exit 1
        fi
    else
        # Use existing device name
        DEVICE_NAME=$DEVICE_INPUT
    fi

    echo ""
    echo -e "${BLUE}Installing to $DEVICE_NAME...${NC}"

    # Install
    ares-install -d $DEVICE_NAME $IPK_FILE

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Installation successful!${NC}"
        echo ""

        # Ask if want to launch
        echo -e "${YELLOW}Launch app now? (y/n)${NC}"
        read -r LAUNCH_NOW

        if [[ $LAUNCH_NOW =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${BLUE}🚀 Launching app...${NC}"
            ares-launch -d $DEVICE_NAME com.smarttv.sports

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ App launched!${NC}"
                echo ""
                echo -e "${CYAN}═══════════════════════════════════════${NC}"
                echo -e "${GREEN}   🎉 ALL DONE! 🎉${NC}"
                echo -e "${CYAN}═══════════════════════════════════════${NC}"
                echo ""
                echo "Next steps:"
                echo "  1. Test Magic Remote pointer"
                echo "  2. Test D-pad navigation"
                echo "  3. Test BACK/HOME/EXIT keys"
                echo "  4. Test video playback"
                echo "  5. Test reboot recovery"
                echo ""
                echo "See TEST_CHECKLIST.md for full test plan"
            else
                echo -e "${RED}❌ Failed to launch app${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Installation failed!${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}   BUILD COMPLETE!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo "To install manually:"
    echo ""
    echo "  1. Setup device:"
    echo "     ares-setup-device --add lg_tv -i \"host=<TV_IP>\" -i \"port=9922\""
    echo ""
    echo "  2. Install package:"
    echo "     ares-install -d lg_tv com.smarttv.sports_1.1.0_all.ipk"
    echo ""
    echo "  3. Launch app:"
    echo "     ares-launch -d lg_tv com.smarttv.sports"
    echo ""
fi
