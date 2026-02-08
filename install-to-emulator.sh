#!/bin/bash

echo "========================================="
echo "  Cài Đặt Sports TV Lên WebOS Emulator  "
echo "========================================="
echo ""

# Kiểm tra file IPK
if [ ! -f "com.smarttv.sports_1.0.0_all.ipk" ]; then
    echo "❌ Không tìm thấy file IPK!"
    exit 1
fi

echo "📦 File IPK: com.smarttv.sports_1.0.0_all.ipk"
echo ""

# Gỡ app cũ (nếu có)
echo "🗑️  Đang gỡ app cũ..."
ares-install --device emulator --remove com.smarttv.sports 2>/dev/null
echo ""

# Cài app mới
echo "📲 Đang cài app mới..."
ares-install --device emulator com.smarttv.sports_1.0.0_all.ipk

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Cài đặt thành công!"
    echo ""
    echo "🚀 Đang khởi chạy app..."
    ares-launch --device emulator com.smarttv.sports
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ App đã chạy trên emulator!"
    else
        echo ""
        echo "⚠️  Không thể tự động chạy app. Vui lòng mở app thủ công trên emulator."
    fi
else
    echo ""
    echo "❌ Cài đặt thất bại!"
    echo "💡 Kiểm tra xem emulator đã chạy chưa?"
    echo ""
    echo "Thử các bước sau:"
    echo "1. Đảm bảo WebOS emulator đang chạy"
    echo "2. Kiểm tra kết nối: ares-setup-device --list"
    echo "3. Thử cài thủ công: ares-install --device emulator com.smarttv.sports_1.0.0_all.ipk"
fi

echo ""
echo "========================================="
