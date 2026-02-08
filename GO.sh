#!/bin/bash

echo "======================================"
echo "  📺 SPORTS TV - QUICK ACCESS"
echo "======================================"
echo ""
echo "Bạn đang ở: /Users/mac/Documents/SmartTV"
echo ""
echo "📁 Files hiện có:"
ls -lh *.ipk *.apk 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "🔧 Lệnh nhanh:"
echo "   1. Build WebOS IPK:       cd .. && ares-package SmartTV"
echo "   2. Cài WebOS:             ./install-to-emulator.sh"
echo "   3. Build Android APK:     cd ../SmartTVAndroid && cordova build android"
echo "   4. Xem hướng dẫn:         cat COMMANDS.md"
echo ""
echo "======================================"
