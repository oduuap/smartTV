#!/bin/bash

# ============================================
# Script cài đặt nhanh ứng dụng lên TV LG
# Dùng file .ipk có sẵn, không cần build
# ============================================

echo "=========================================="
echo "🚀 Cài đặt SmartTV App lên TV LG"
echo "=========================================="

# Màu sắc cho terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kiểm tra Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ ! -z "$NODE_VERSION" ] && [ "$NODE_VERSION" -ge 21 ]; then
    echo -e "${RED}⚠️  CẢNH BÁO: Node.js v$NODE_VERSION không được hỗ trợ!${NC}"
    echo ""
    echo "webOS CLI tools chỉ hỗ trợ Node.js v18-v20 LTS"
    echo ""
    echo "Vui lòng:"
    echo "  1. Cài nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  2. Cài Node v20: nvm install 20"
    echo "  3. Dùng Node v20: nvm use 20"
    echo ""
    echo "Hoặc xem file FIX-NODE-VERSION.md để biết chi tiết"
    echo ""
    read -p "Bạn có muốn tiếp tục? (không khuyến nghị) (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

# Kiểm tra ares-cli đã cài đặt chưa
if ! command -v ares-install &> /dev/null
then
    echo -e "${RED}❌ webOS CLI tools chưa được cài đặt!${NC}"
    echo ""
    echo "Vui lòng cài đặt bằng lệnh:"
    echo "npm install -g @webos-tools/cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ webOS CLI tools đã cài đặt${NC}"
echo -e "${BLUE}Node.js: $(node --version 2>/dev/null || echo 'N/A')${NC}"
echo -e "${BLUE}ares CLI: $(ares --version 2>/dev/null || echo 'N/A')${NC}"
echo ""

# Lấy thư mục chứa script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "${BLUE}📂 Thư mục script: $SCRIPT_DIR${NC}"
echo ""

# Tìm file .ipk trong thư mục script
cd "$SCRIPT_DIR"
IPK_FILE=$(ls -t *.ipk 2>/dev/null | head -1)

if [ -z "$IPK_FILE" ]; then
    echo -e "${RED}❌ Không tìm thấy file .ipk trong thư mục này!${NC}"
    echo ""
    echo "Thư mục hiện tại: $SCRIPT_DIR"
    echo ""
    echo "Vui lòng đảm bảo file .ipk nằm cùng thư mục với script này."
    exit 1
fi

# Sử dụng đường dẫn tuyệt đối
IPK_FILE="$SCRIPT_DIR/$IPK_FILE"

echo -e "${GREEN}✅ Tìm thấy file: $(basename $IPK_FILE)${NC}"
echo -e "${BLUE}📍 Đường dẫn đầy đủ: $IPK_FILE${NC}"
echo ""

# Lấy thông tin TV
echo -e "${BLUE}📺 Nhập thông tin TV LG của bạn${NC}"
echo ""
read -p "Nhập IP của TV (ví dụ: 192.168.1.100): " TV_IP

if [ -z "$TV_IP" ]; then
    echo -e "${RED}❌ IP không được để trống!${NC}"
    exit 1
fi

read -p "Nhập Port (Enter để dùng mặc định 9922): " TV_PORT
TV_PORT=${TV_PORT:-9922}

read -p "Đặt tên cho TV này (Enter để dùng myTV): " TV_NAME
TV_NAME=${TV_NAME:-myTV}

echo ""
echo -e "${YELLOW}Thông tin kết nối:${NC}"
echo "  📱 IP: $TV_IP"
echo "  🔌 Port: $TV_PORT"
echo "  📝 Tên: $TV_NAME"
echo ""

# Thêm TV vào danh sách thiết bị
echo -e "${BLUE}📝 Đang thêm TV...${NC}"
ares-setup-device --add $TV_NAME -i "host=$TV_IP" -i "port=$TV_PORT"

# Đặt làm thiết bị mặc định
ares-setup-device --default $TV_NAME

echo ""
echo -e "${BLUE}🔑 Đang xác thực với TV...${NC}"
echo ""
echo -e "${YELLOW}⚠️  Quan trọng: Trên TV sẽ hiện thông báo xác nhận kết nối${NC}"
echo -e "${YELLOW}    Vui lòng nhấn OK/Accept trên TV!${NC}"
echo ""
sleep 2

ares-novacom --device $TV_NAME --getkey

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Không thể xác thực với TV${NC}"
    echo ""
    echo "Vui lòng kiểm tra:"
    echo "  - TV và máy tính cùng mạng WiFi"
    echo "  - IP address đúng"
    echo "  - Developer Mode đã bật trên TV"
    echo "  - Đã nhấn Accept trên TV"
    exit 1
fi

# Cài đặt ứng dụng
echo ""
echo -e "${BLUE}📲 Đang cài đặt ứng dụng lên TV...${NC}"
ares-install --device $TV_NAME $IPK_FILE

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Cài đặt thất bại!${NC}"
    exit 1
fi

# Lấy app ID từ appinfo.json
APP_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' appinfo.json | cut -d'"' -f4)

if [ -z "$APP_ID" ]; then
    APP_ID="com.smarttv.sports"
fi

echo ""
echo -e "${GREEN}✅ Cài đặt thành công!${NC}"
echo ""
echo -e "${YELLOW}ID ứng dụng: $APP_ID${NC}"
echo ""

# Hỏi có muốn chạy ngay không
read -p "Bạn có muốn mở ứng dụng trên TV ngay bây giờ? (y/n): " RUN_NOW

if [ "$RUN_NOW" = "y" ] || [ "$RUN_NOW" = "Y" ]; then
    echo ""
    echo -e "${BLUE}🎬 Đang mở ứng dụng...${NC}"
    ares-launch --device $TV_NAME $APP_ID

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Ứng dụng đang chạy trên TV!${NC}"
    fi
fi

echo ""
echo "=========================================="
echo "🎉 Hoàn tất!"
echo "=========================================="
echo ""
echo -e "${YELLOW}📝 Lưu lại thông tin này:${NC}"
echo "  Tên TV: $TV_NAME"
echo "  IP: $TV_IP"
echo "  App ID: $APP_ID"
echo ""
echo -e "${YELLOW}💡 Các lệnh hữu ích:${NC}"
echo "  • Chạy lại ứng dụng:"
echo "    ares-launch --device $TV_NAME $APP_ID"
echo ""
echo "  • Xem log debug:"
echo "    ares-inspect --device $TV_NAME $APP_ID"
echo ""
echo "  • Đóng ứng dụng:"
echo "    ares-launch --device $TV_NAME --close $APP_ID"
echo ""
echo "  • Gỡ cài đặt:"
echo "    ares-install --device $TV_NAME --remove $APP_ID"
echo ""
