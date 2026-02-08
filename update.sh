#!/bin/bash

# Script cập nhật ứng dụng lên TV
# Sử dụng: ./update.sh

echo "=================================="
echo "CẬP NHẬT ỨNG DỤNG LÊN TV"
echo "=================================="
echo ""

# Kiểm tra webOS CLI
if ! command -v ares-package &> /dev/null
then
    echo "❌ webOS CLI chưa được cài đặt!"
    exit 1
fi

# Hỏi tên thiết bị
read -p "Tên thiết bị TV (mặc định: mytv): " TV_NAME
TV_NAME=${TV_NAME:-mytv}

# Kiểm tra thiết bị có tồn tại không
if ! ares-setup-device --list | grep -q "$TV_NAME"; then
    echo "❌ Không tìm thấy thiết bị '$TV_NAME'!"
    echo "Vui lòng chạy ./install.sh trước."
    exit 1
fi

echo "📦 Đang đóng gói lại ứng dụng..."
mkdir -p build
ares-package . --outdir ./build

if [ $? -ne 0 ]; then
    echo "❌ Đóng gói thất bại!"
    exit 1
fi

echo "✅ Đóng gói thành công!"
echo ""

echo "📲 Đang cài đặt bản cập nhật..."
ares-install --device "$TV_NAME" build/com.smarttv.sports_1.0.0_all.ipk

if [ $? -ne 0 ]; then
    echo "❌ Cài đặt thất bại!"
    exit 1
fi

echo "✅ Cập nhật thành công!"
echo ""

echo "🚀 Đang khởi động lại ứng dụng..."
ares-launch --device "$TV_NAME" com.smarttv.sports

echo ""
echo "✅ HOÀN TẤT!"
echo ""
