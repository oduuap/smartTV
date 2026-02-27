#!/bin/bash

# ============================================
# Install to webOS Emulator
# Sports TV v1.1.0
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
echo "║   Install to webOS Emulator               ║"
echo "║   Sports TV v1.1.0                        ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if IPK exists
IPK_FILE="../com.smarttv.sports_1.1.0_all.ipk"
if [ ! -f "$IPK_FILE" ]; then
    echo -e "${RED}❌ IPK file not found!${NC}"
    echo -e "${YELLOW}Please build first: ares-package smartTV${NC}"
    exit 1
fi

echo -e "${GREEN}✅ IPK found: com.smarttv.sports_1.1.0_all.ipk${NC}"
echo ""

# Check emulator
echo -e "${BLUE}🔍 Checking emulator status...${NC}"
EMULATOR_STATUS=$(ares-setup-device --list | grep emulator || echo "not_found")

if [[ $EMULATOR_STATUS == "not_found" ]]; then
    echo -e "${RED}❌ Emulator not configured!${NC}"
    echo ""
    echo "To setup emulator:"
    echo "  ares-setup-device --add emulator -i \"host=127.0.0.1\" -i \"port=6622\" -i \"username=developer\""
    exit 1
fi

echo -e "${GREEN}✅ Emulator configured${NC}"
echo ""

# Try to connect
echo -e "${BLUE}🔌 Testing connection...${NC}"
if ! nc -zv 127.0.0.1 6622 2>&1 | grep -q "succeeded"; then
    echo -e "${RED}❌ Cannot connect to emulator!${NC}"
    echo ""
    echo -e "${YELLOW}Emulator is not running. Please start it:${NC}"
    echo ""
    echo "  1. Open webOS TV Emulator app"
    echo "  2. Select webOS TV version"
    echo "  3. Click 'Launch' button"
    echo "  4. Wait for emulator to boot (~30 seconds)"
    echo "  5. Run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Emulator is running${NC}"
echo ""

# Install
echo -e "${BLUE}📦 Installing app to emulator...${NC}"
cd ..
ares-install -d emulator com.smarttv.sports_1.1.0_all.ipk

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Installation successful!${NC}"
    echo ""

    # Ask to launch
    echo -e "${YELLOW}Launch app now? (y/n)${NC}"
    read -r LAUNCH_NOW

    if [[ $LAUNCH_NOW =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}🚀 Launching app...${NC}"
        ares-launch -d emulator com.smarttv.sports

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ App launched on emulator!${NC}"
            echo ""
            echo -e "${CYAN}═══════════════════════════════════════${NC}"
            echo -e "${GREEN}   🎉 READY TO TEST! 🎉${NC}"
            echo -e "${CYAN}═══════════════════════════════════════${NC}"
            echo ""
            echo "Test with:"
            echo "  - Mouse (Magic Remote simulation)"
            echo "  - Arrow keys (D-pad)"
            echo "  - Backspace (BACK key)"
            echo "  - ESC (EXIT simulation)"
            echo ""
            echo "To view logs:"
            echo "  ares-inspect -d emulator com.smarttv.sports"
        else
            echo -e "${RED}❌ Failed to launch app${NC}"
        fi
    else
        echo ""
        echo "To launch later:"
        echo "  ares-launch -d emulator com.smarttv.sports"
    fi
else
    echo ""
    echo -e "${RED}❌ Installation failed!${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Quick Test Checklist:${NC}"
echo "  1. ☐ Mouse moves pointer (Magic Remote)"
echo "  2. ☐ Arrow keys navigate (D-pad)"
echo "  3. ☐ Can click on matches"
echo "  4. ☐ Video plays"
echo "  5. ☐ Backspace goes back"
echo ""
