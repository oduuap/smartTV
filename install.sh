#!/bin/bash

# Script cài đặt ứng dụng lên LG Smart TV
# Sử dụng: ./install.sh

echo "=================================="
echo "CÀI ĐẶT ỨNG DỤNG LÊN LG SMART TV"
echo "=================================="
echo ""

# Kiểm tra webOS CLI đã được cài chưa
if ! command -v ares-package &> /dev/null
then
    echo "⚠️  webOS CLI chưa được cài đặt!"
    echo ""
    echo "Vui lòng cài đặt bằng lệnh:"
    echo "npm install -g @webos-tools/cli"
    echo ""
    exit 1
fi

echo "✅ webOS CLI đã được cài đặt"
echo ""

# Hỏi IP của TV
read -p "Nhập IP của TV LG (ví dụ: 192.168.1.100): " TV_IP

if [ -z "$TV_IP" ]; then
    echo "❌ Bạn phải nhập IP của TV!"
    exit 1
fi

# Hỏi tên thiết bị
read -p "Đặt tên cho TV (mặc định: mytv): " TV_NAME
TV_NAME=${TV_NAME:-mytv}

echo ""
echo "📱 Đang thiết lập kết nối với TV..."
echo ""

# Tạo file cấu hình thiết bị
ares-setup-device --add "$TV_NAME" -i "username=prisoner" -i "host=$TV_IP" -i "port=9922"

if [ $? -ne 0 ]; then
    echo "❌ Không thể kết nối với TV. Vui lòng kiểm tra:"
    echo "   - TV đã bật Developer Mode chưa?"
    echo "   - TV và Mac cùng mạng WiFi chưa?"
    echo "   - IP có đúng không?"
    exit 1
fi

echo "✅ Đã kết nối với TV thành công!"
echo ""

# Tạo thư mục build nếu chưa có
mkdir -p build

echo "📦 Đang đóng gói ứng dụng..."
ares-package . --outdir ./build

if [ $? -ne 0 ]; then
    echo "❌ Đóng gói thất bại!"
    exit 1
fi

echo "✅ Đóng gói thành công!"
echo ""

echo "📲 Đang cài đặt lên TV..."
ares-install --device "$TV_NAME" build/com.smarttv.sports_1.0.0_all.ipk

if [ $? -ne 0 ]; then
    echo "❌ Cài đặt thất bại!"
    exit 1
fi

echo "✅ Cài đặt thành công!"
echo ""

# Hỏi có muốn chạy app ngay không
read -p "Bạn có muốn chạy ứng dụng ngay bây giờ? (y/n): " RUN_NOW

if [[ "$RUN_NOW" == "y" || "$RUN_NOW" == "Y" ]]; then
    echo ""
    echo "🚀 Đang khởi chạy ứng dụng..."
    ares-launch --device "$TV_NAME" com.smarttv.sports

    if [ $? -eq 0 ]; then
        echo "✅ Ứng dụng đã được khởi chạy trên TV!"
    else
        echo "⚠️  Không thể tự động khởi chạy. Vui lòng mở app thủ công trên TV."
    fi
fi

echo ""
echo "=================================="
echo "✅ HOÀN TẤT!"
echo "=================================="
echo ""
echo "Bạn có thể tìm app 'Sports TV' trong:"
echo "Home → My Apps → Sports TV"
echo ""
echo "Các lệnh hữu ích:"
echo "  - Xem log: ares-log --device $TV_NAME --follow com.smarttv.sports"
echo "  - Gỡ app: ares-install --device $TV_NAME --remove com.smarttv.sports"
echo "  - Chạy app: ares-launch --device $TV_NAME com.smarttv.sports"
echo ""
