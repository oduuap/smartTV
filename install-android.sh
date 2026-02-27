#!/bin/bash

# ============================================
# Script cài đặt APK lên Android TV/Box
# Sử dụng ADB (Android Debug Bridge)
# ============================================

echo "=========================================="
echo "📱 Cài đặt SportsTV lên Android TV"
echo "=========================================="
echo ""

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Tìm file APK
APK_FILE="SportsTV-Android-v1.0.0.apk"

if [ ! -f "$APK_FILE" ]; then
    echo -e "${RED}❌ Không tìm thấy file: $APK_FILE${NC}"
    echo ""
    echo "Vui lòng đảm bảo file APK nằm cùng thư mục với script này."
    exit 1
fi

echo -e "${GREEN}✅ Tìm thấy: $APK_FILE ($(du -h "$APK_FILE" | cut -f1))${NC}"
echo ""

# Kiểm tra ADB đã cài chưa
if ! command -v adb &> /dev/null; then
    echo -e "${RED}❌ ADB chưa được cài đặt!${NC}"
    echo ""
    echo -e "${YELLOW}📥 Cách cài ADB:${NC}"
    echo ""
    echo "Mac:"
    echo "  brew install android-platform-tools"
    echo ""
    echo "Windows:"
    echo "  Download từ: https://developer.android.com/tools/releases/platform-tools"
    echo ""
    echo "Linux:"
    echo "  sudo apt install adb"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ ADB đã cài đặt${NC}"
adb version | head -1
echo ""

# Hướng dẫn bật USB Debugging
echo -e "${BLUE}📺 Chuẩn bị Android TV:${NC}"
echo ""
echo "1. Vào Settings > About"
echo "2. Nhấn 7 lần vào Build Number để bật Developer Mode"
echo "3. Vào Settings > Developer Options"
echo "4. Bật USB Debugging"
echo "5. Bật Install via USB"
echo ""
echo -e "${YELLOW}Hoặc sử dụng ADB over Network (WiFi):${NC}"
echo "1. Bật ADB Debugging (Network)"
echo "2. Xem IP của TV trong Network Settings"
echo ""

read -p "Nhấn Enter khi đã bật USB Debugging trên TV..."
echo ""

# Kiểm tra kết nối
echo -e "${BLUE}🔍 Tìm kiếm thiết bị Android...${NC}"
adb devices
echo ""

# Đếm số thiết bị
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l | xargs)

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Không tìm thấy thiết bị qua USB${NC}"
    echo ""
    echo -e "${BLUE}Thử kết nối qua WiFi:${NC}"
    read -p "Nhập IP của Android TV: " TV_IP

    if [ -z "$TV_IP" ]; then
        echo -e "${RED}❌ IP không được để trống!${NC}"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}📡 Đang kết nối tới $TV_IP:5555...${NC}"
    adb connect $TV_IP:5555

    sleep 2

    # Kiểm tra lại sau khi connect
    DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l | xargs)

    if [ "$DEVICE_COUNT" -eq 0 ]; then
        echo -e "${RED}❌ Không thể kết nối với TV!${NC}"
        echo ""
        echo "Vui lòng kiểm tra:"
        echo "  - TV và máy tính cùng mạng WiFi"
        echo "  - ADB Debugging đã bật"
        echo "  - Đã chấp nhận kết nối trên TV"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Đã kết nối với $DEVICE_COUNT thiết bị${NC}"
echo ""

# Gỡ cài đặt app cũ (nếu có)
echo -e "${BLUE}🗑️  Kiểm tra app cũ...${NC}"
OLD_APP=$(adb shell pm list packages | grep "com.smarttv.sports" || echo "")

if [ ! -z "$OLD_APP" ]; then
    echo -e "${YELLOW}Tìm thấy app cũ, đang gỡ cài đặt...${NC}"
    adb uninstall com.smarttv.sports
    echo ""
fi

# Cài đặt APK
echo -e "${BLUE}📲 Đang cài đặt APK...${NC}"
echo ""

adb install "$APK_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Cài đặt thành công!${NC}"
    echo ""

    # Hỏi có muốn mở app không
    read -p "Bạn có muốn mở app ngay? (y/n): " OPEN_APP

    if [ "$OPEN_APP" = "y" ] || [ "$OPEN_APP" = "Y" ]; then
        echo ""
        echo -e "${BLUE}🚀 Đang mở app...${NC}"
        adb shell monkey -p com.smarttv.sports -c android.intent.category.LAUNCHER 1
        echo ""
        echo -e "${GREEN}✅ App đang chạy trên TV!${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ Cài đặt thất bại!${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 Hoàn tất!"
echo "=========================================="
echo ""
echo -e "${YELLOW}💡 Các lệnh hữu ích:${NC}"
echo ""
echo "Mở app:"
echo "  adb shell monkey -p com.smarttv.sports -c android.intent.category.LAUNCHER 1"
echo ""
echo "Gỡ app:"
echo "  adb uninstall com.smarttv.sports"
echo ""
echo "Xem log:"
echo "  adb logcat | grep SportsTV"
echo ""
echo "Ngắt kết nối:"
echo "  adb disconnect"
echo ""
