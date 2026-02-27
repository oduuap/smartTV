@echo off
chcp 65001 >nul
REM ============================================
REM Script cài đặt APK lên Android TV/Box
REM Sử dụng ADB (Android Debug Bridge)
REM ============================================

echo ==========================================
echo 📱 Cài đặt SportsTV lên Android TV
echo ==========================================
echo.

REM Tìm file APK
set APK_FILE=SportsTV-Android-v1.0.0.apk

if not exist "%APK_FILE%" (
    echo ❌ Không tìm thấy file: %APK_FILE%
    echo.
    echo Vui lòng đảm bảo file APK nằm cùng thư mục với script này.
    pause
    exit /b 1
)

echo ✅ Tìm thấy: %APK_FILE%
echo.

REM Kiểm tra ADB
where adb >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ADB chưa được cài đặt!
    echo.
    echo 📥 Cách cài ADB:
    echo.
    echo Windows:
    echo   Download từ: https://developer.android.com/tools/releases/platform-tools
    echo   Giải nén và thêm vào PATH
    echo.
    pause
    exit /b 1
)

echo ✅ ADB đã cài đặt
adb version | findstr /r "Android"
echo.

REM Hướng dẫn
echo 📺 Chuẩn bị Android TV:
echo.
echo 1. Vào Settings ^> About
echo 2. Nhấn 7 lần vào Build Number để bật Developer Mode
echo 3. Vào Settings ^> Developer Options
echo 4. Bật USB Debugging
echo 5. Bật Install via USB
echo.
echo Hoặc sử dụng ADB over Network (WiFi):
echo 1. Bật ADB Debugging (Network)
echo 2. Xem IP của TV trong Network Settings
echo.

pause
echo.

REM Tìm thiết bị
echo 🔍 Tìm kiếm thiết bị Android...
adb devices
echo.

REM Đếm thiết bị
for /f %%i in ('adb devices ^| find /c "device"') do set DEVICE_COUNT=%%i
set /a DEVICE_COUNT=%DEVICE_COUNT%-1

if %DEVICE_COUNT% leq 0 (
    echo ⚠️  Không tìm thấy thiết bị qua USB
    echo.
    echo Thử kết nối qua WiFi:
    set /p TV_IP="Nhập IP của Android TV: "

    if "!TV_IP!"=="" (
        echo ❌ IP không được để trống!
        pause
        exit /b 1
    )

    echo.
    echo 📡 Đang kết nối tới !TV_IP!:5555...
    adb connect !TV_IP!:5555

    timeout /t 2 >nul

    REM Kiểm tra lại
    for /f %%i in ('adb devices ^| find /c "device"') do set DEVICE_COUNT=%%i
    set /a DEVICE_COUNT=!DEVICE_COUNT!-1

    if !DEVICE_COUNT! leq 0 (
        echo ❌ Không thể kết nối với TV!
        echo.
        echo Vui lòng kiểm tra:
        echo   - TV và máy tính cùng mạng WiFi
        echo   - ADB Debugging đã bật
        echo   - Đã chấp nhận kết nối trên TV
        pause
        exit /b 1
    )
)

echo ✅ Đã kết nối với thiết bị
echo.

REM Gỡ app cũ
echo 🗑️  Kiểm tra app cũ...
adb shell pm list packages | find "com.smarttv.sports" >nul
if %errorlevel% equ 0 (
    echo Tìm thấy app cũ, đang gỡ cài đặt...
    adb uninstall com.smarttv.sports
    echo.
)

REM Cài đặt
echo 📲 Đang cài đặt APK...
echo.

adb install "%APK_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Cài đặt thành công!
    echo.

    set /p OPEN_APP="Bạn có muốn mở app ngay? (y/n): "

    if /i "!OPEN_APP!"=="y" (
        echo.
        echo 🚀 Đang mở app...
        adb shell monkey -p com.smarttv.sports -c android.intent.category.LAUNCHER 1
        echo.
        echo ✅ App đang chạy trên TV!
    )
) else (
    echo.
    echo ❌ Cài đặt thất bại!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 Hoàn tất!
echo ==========================================
echo.
echo 💡 Các lệnh hữu ích:
echo.
echo Mở app:
echo   adb shell monkey -p com.smarttv.sports -c android.intent.category.LAUNCHER 1
echo.
echo Gỡ app:
echo   adb uninstall com.smarttv.sports
echo.
echo Ngắt kết nối:
echo   adb disconnect
echo.
pause
