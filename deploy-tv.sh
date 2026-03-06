#!/bin/bash

# ============================================
# Build & Deploy to LG TV - One Command
# Build IPK và tự động cài lên TV
# ============================================
#
# CONFIGURATION:
# - Update TV_PASSPHRASE below if it changes on your TV
# - Find passphrase in TV's Developer Mode app
#
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║   Sports TV - Build & Deploy to TV        ║"
echo "║   Build + Install + Launch                ║"
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

# ============================================
# STEP 1: Build IPK
# ============================================
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 STEP 1: Building IPK...${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create temp build directory
TEMP_DIR="/tmp/smarttv_build_clean_$$"
mkdir -p "$TEMP_DIR"

# Copy essential files
echo -e "${CYAN}   Copying files...${NC}"
cp appinfo.json "$TEMP_DIR/"
cp index.html "$TEMP_DIR/"
cp icon.png "$TEMP_DIR/"
cp largeIcon.png "$TEMP_DIR/"
cp -r css "$TEMP_DIR/"
cp -r js "$TEMP_DIR/"

if [ -d "images" ]; then
    cp -r images "$TEMP_DIR/"
fi

if [ -f "privacy-policy.html" ]; then
    cp privacy-policy.html "$TEMP_DIR/"
fi

echo ""
echo -e "${BLUE}📊 Package size:${NC}"
du -sh "$TEMP_DIR"
find "$TEMP_DIR" -type f | wc -l | xargs echo "   Total files:"
echo ""

# Build IPK
echo -e "${BLUE}🔨 Building IPK package...${NC}"
ares-package "$TEMP_DIR"

# Move IPK to current directory
IPK_FILE="${APP_ID}_${VERSION}_all.ipk"
if [ -f "$IPK_FILE" ]; then
    mv "$IPK_FILE" . 2>/dev/null || true
    FILE_SIZE=$(ls -lh "$IPK_FILE" | awk '{print $5}')
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo -e "   File: $IPK_FILE"
    echo -e "   Size: $FILE_SIZE"
    echo ""
else
    echo -e "${RED}❌ Build failed!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

# ============================================
# STEP 2: Install to TV
# ============================================
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📺 STEP 2: Installing to TV...${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# TV device configuration
TV_DEVICE="MyTV"
TV_PORT="9922"
TV_USERNAME="prisoner"
TV_PASSPHRASE="4A0338"  # Passphrase from TV Developer Mode app

# Function to setup TV device
setup_tv_device() {
    local tv_ip=$1
    echo -e "${CYAN}Setting up TV device...${NC}"

    # Remove old device if exists
    ares-setup-device --remove "$TV_DEVICE" 2>/dev/null || true

    # Add new device
    ares-setup-device --add "$TV_DEVICE" -i "host=$tv_ip" -i "port=$TV_PORT" -i "username=$TV_USERNAME"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Device setup successful!${NC}"
        return 0
    else
        echo -e "${RED}❌ Device setup failed!${NC}"
        return 1
    fi
}

# Function to get key from TV
get_tv_key() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔑 Getting key from TV...${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please follow these steps on your TV:${NC}"
    echo "  1. Open 'Developer Mode' app on TV"
    echo "  2. Turn ON 'Dev Mode Status'"
    echo "  3. Turn ON 'Key Server'"
    echo "  4. Note the 6-digit passphrase displayed"
    echo ""

    # Check if passphrase is configured
    if [ ! -z "$TV_PASSPHRASE" ]; then
        echo -e "${CYAN}Using configured passphrase: $TV_PASSPHRASE${NC}"
        echo -e "${BLUE}Getting key from TV...${NC}"
        echo ""

        # Check if expect is available
        if command -v expect &> /dev/null; then
            # Use expect to auto-input passphrase
            expect -c "
                spawn ares-novacom --device $TV_DEVICE --getkey
                expect \"passphrase:\"
                send \"$TV_PASSPHRASE\r\"
                expect eof
            " > /tmp/getkey_output.log 2>&1

            # Check if key file was created
            if [ -f "$HOME/.ssh/${TV_DEVICE}_webos" ]; then
                echo -e "${GREEN}✅ Key retrieved successfully!${NC}"
                return 0
            else
                echo -e "${RED}❌ Failed to get key!${NC}"
                cat /tmp/getkey_output.log
                return 1
            fi
        else
            # Fallback: try simple echo pipe
            echo "$TV_PASSPHRASE" | ares-novacom --device "$TV_DEVICE" --getkey

            if [ -f "$HOME/.ssh/${TV_DEVICE}_webos" ]; then
                echo ""
                echo -e "${GREEN}✅ Key retrieved successfully!${NC}"
                return 0
            else
                echo ""
                echo -e "${RED}❌ Failed! Please install 'expect':${NC}"
                echo "  brew install expect"
                return 1
            fi
        fi
    else
        echo -e "${CYAN}Now getting key from TV...${NC}"
        echo -e "${YELLOW}You will be prompted to enter the passphrase from TV${NC}"
        echo ""

        # Manual input
        ares-novacom --device "$TV_DEVICE" --getkey

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Key retrieved successfully!${NC}"
            return 0
        else
            return 1
        fi
    fi

    echo ""
    echo -e "${RED}❌ Failed to get key from TV!${NC}"
    echo "Please check:"
    echo "  - Developer Mode app is open on TV"
    echo "  - Key Server is ON"
    echo "  - Passphrase is correct (current: $TV_PASSPHRASE)"
    echo ""
    echo -e "${YELLOW}If passphrase changed, update TV_PASSPHRASE in this script${NC}"
    return 1
}

# Function to test TV connection
test_tv_connection() {
    echo -e "${CYAN}Testing connection to TV...${NC}"
    ares-device-info --device "$TV_DEVICE" &>/dev/null
    return $?
}

# Function to check if SSH key exists for device
check_ssh_key_exists() {
    if [ -f "$HOME/.ssh/${TV_DEVICE}_webos" ]; then
        return 0
    else
        return 1
    fi
}

# Check if TV device exists
if ! ares-setup-device --list | grep -q "$TV_DEVICE"; then
    echo -e "${YELLOW}⚠️  TV device '$TV_DEVICE' not found!${NC}"
    echo ""
    echo -e "${CYAN}Let's set up your TV...${NC}"
    read -p "Enter your TV IP address: " TV_IP

    if [ -z "$TV_IP" ]; then
        echo -e "${RED}❌ IP address cannot be empty!${NC}"
        exit 1
    fi

    setup_tv_device "$TV_IP"
    if [ $? -ne 0 ]; then
        exit 1
    fi

    # Get key from TV after setup
    get_tv_key
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Cannot continue without TV key!${NC}"
        exit 1
    fi
else
    # Device exists, test connection
    if ! test_tv_connection; then
        echo -e "${YELLOW}⚠️  Cannot connect to TV (might be off or network issue)${NC}"

        # Check if SSH key already exists
        if check_ssh_key_exists; then
            echo -e "${CYAN}SSH key found, will try to install anyway...${NC}"
            echo -e "${BLUE}(Install will fail if TV is off or unreachable)${NC}"
            echo ""
        else
            echo -e "${YELLOW}No SSH key found. Need to get key from TV.${NC}"
            echo ""

            # Get current IP
            CURRENT_IP=$(ares-setup-device --list | grep "$TV_DEVICE" -A 5 | grep "prisoner@" | cut -d'@' -f2 | cut -d':' -f1)
            echo -e "${BLUE}Current IP: $CURRENT_IP${NC}"
            echo ""

            # Get key from TV
            echo -e "${YELLOW}Make sure TV is ON and Developer Mode app is running${NC}"
            get_tv_key
            if [ $? -ne 0 ]; then
                echo ""
                echo -e "${RED}❌ Failed to get key!${NC}"
                echo ""
                echo -e "${YELLOW}Troubleshooting options:${NC}"
                echo "  1. Make sure TV is ON"
                echo "  2. Open Developer Mode app on TV"
                echo "  3. Turn ON 'Dev Mode Status' and 'Key Server'"
                echo "  4. Check if IP changed (current: $CURRENT_IP)"
                echo ""
                echo "You can manually run: ares-novacom --device MyTV --getkey"
                exit 1
            fi
        fi
    else
        echo -e "${GREEN}✅ Connected to TV!${NC}"
    fi
fi

echo -e "${CYAN}Installing to $TV_DEVICE...${NC}"
INSTALL_OUTPUT=$(ares-install --device "$TV_DEVICE" "$IPK_FILE" 2>&1)
INSTALL_EXIT_CODE=$?

if [ $INSTALL_EXIT_CODE -eq 0 ]; then
    echo "$INSTALL_OUTPUT"
    echo ""
    echo -e "${GREEN}✅ Installation successful!${NC}"
    echo ""
else
    echo "$INSTALL_OUTPUT"
    echo ""
    echo -e "${RED}❌ Installation failed!${NC}"
    echo ""

    # Check if it's an authentication error
    if echo "$INSTALL_OUTPUT" | grep -q "authentication.*failed\|ssh.*failure"; then
        echo -e "${YELLOW}⚠️  SSH Authentication failed!${NC}"
        echo -e "${CYAN}Attempting to get new key from TV...${NC}"
        echo ""

        # Remove old key
        rm -f "$HOME/.ssh/${TV_DEVICE}_webos" "$HOME/.ssh/${TV_DEVICE}_webos.pub"

        # Try to get new key
        get_tv_key

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${CYAN}Retrying installation...${NC}"
            ares-install --device "$TV_DEVICE" "$IPK_FILE"

            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✅ Installation successful!${NC}"
                echo ""
            else
                echo ""
                echo -e "${RED}❌ Installation still failed!${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Could not get key from TV!${NC}"
            exit 1
        fi
    else
        # Not an auth error, show troubleshooting
        CURRENT_IP=$(ares-setup-device --list | grep "$TV_DEVICE" -A 5 | grep "prisoner@" | cut -d'@' -f2 | cut -d':' -f1)

        echo -e "${YELLOW}Troubleshooting tips:${NC}"
        echo "  1. Make sure TV is ON"
        echo "  2. Check TV is on same network"
        echo "  3. Verify Developer Mode is enabled on TV"
        echo "  4. Check if IP changed (current config: $CURRENT_IP)"
        echo ""
        echo -e "${BLUE}To fix:${NC}"
        echo "  - If TV is off: Turn it on and run script again"
        echo "  - If IP changed: Remove device and run script again:"
        echo "    ares-setup-device --remove MyTV"
        echo ""
        echo -e "${CYAN}Quick commands:${NC}"
        echo "  Check devices: ares-setup-device --list"
        echo "  Test connection: ares-device -i --device MyTV"
        echo ""

        exit 1
    fi
fi

# ============================================
# STEP 3: Launch App
# ============================================
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🚀 STEP 3: Launching App...${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Launching $APP_ID on $TV_DEVICE...${NC}"
ares-launch --device "$TV_DEVICE" "$APP_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ App launched successfully!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Launch failed!${NC}"
    exit 1
fi

# ============================================
# DONE
# ============================================
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ DEPLOY COMPLETE!${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}App is now running on your TV!${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:   ares-inspect --device $TV_DEVICE --app $APP_ID --open"
echo "  Close app:   ares-launch --device $TV_DEVICE --close $APP_ID"
echo "  Uninstall:   ares-install --device $TV_DEVICE --remove $APP_ID"
echo ""
