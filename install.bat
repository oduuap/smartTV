@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================
REM Script cài đặt nhanh ứng dụng lên TV LG
REM Dùng file .ipk có sẵn, không cần build
REM ============================================

echo ==========================================
echo 🚀 Cài đặt SmartTV App lên TV LG
echo ==========================================
echo.

REM Kiểm tra Node.js version
for /f "tokens=1 delims=." %%a in ('node --version 2^>nul') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if defined NODE_MAJOR (
    if !NODE_MAJOR! GEQ 21 (
        echo ⚠️  CẢNH BÁO: Node.js v!NODE_MAJOR! không được hỗ trợ!
        echo.
        echo webOS CLI tools chỉ hỗ trợ Node.js v18-v20 LTS
        echo.
        echo Vui lòng tải Node.js v20 LTS từ: https://nodejs.org/
        echo Hoặc xem file FIX-NODE-VERSION.md để biết chi tiết
        echo.
        pause
        exit /b 1
    )
)

REM Kiểm tra ares-cli đã cài đặt chưa
where ares-install >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ webOS CLI tools chưa được cài đặt!
    echo.
    echo Vui lòng cài đặt bằng lệnh:
    echo npm install -g @webos-tools/cli
    echo.
    pause
    exit /b 1
)

echo ✅ webOS CLI tools đã cài đặt
node --version 2>nul
ares --version 2>nul
echo.

REM Lấy thư mục chứa script
set SCRIPT_DIR=%~dp0
echo 📂 Thư mục script: %SCRIPT_DIR%
echo.

REM Chuyển đến thư mục script
cd /d "%SCRIPT_DIR%"

REM Tìm file .ipk trong thư mục script
set IPK_FILE=
for /f "delims=" %%i in ('dir /b /od *.ipk 2^>nul') do set IPK_FILE=%%i

if not defined IPK_FILE (
    echo ❌ Không tìm thấy file .ipk trong thư mục này!
    echo.
    echo Thư mục hiện tại: %SCRIPT_DIR%
    echo.
    echo Vui lòng đảm bảo file .ipk nằm cùng thư mục với script này.
    echo.
    pause
    exit /b 1
)

REM Sử dụng đường dẫn tuyệt đối
set IPK_FILE=%SCRIPT_DIR%%IPK_FILE%

echo ✅ Tìm thấy file: %IPK_FILE%
echo 📍 Đường dẫn đầy đủ: %IPK_FILE%
echo.

REM Lấy thông tin TV
echo 📺 Nhập thông tin TV LG của bạn
echo.
set /p TV_IP="Nhập IP của TV (ví dụ: 192.168.1.100): "

if "%TV_IP%"=="" (
    echo ❌ IP không được để trống!
    pause
    exit /b 1
)

set /p TV_PORT="Nhập Port (Enter để dùng mặc định 9922): "
if "%TV_PORT%"=="" set TV_PORT=9922

set /p TV_NAME="Đặt tên cho TV này (Enter để dùng myTV): "
if "%TV_NAME%"=="" set TV_NAME=myTV

echo.
echo Thông tin kết nối:
echo   📱 IP: %TV_IP%
echo   🔌 Port: %TV_PORT%
echo   📝 Tên: %TV_NAME%
echo.

REM Thêm TV vào danh sách thiết bị
echo 📝 Đang thêm TV...
call ares-setup-device --add %TV_NAME% -i "host=%TV_IP%" -i "port=%TV_PORT%"

REM Đặt làm thiết bị mặc định
call ares-setup-device --default %TV_NAME%

echo.
echo 🔑 Đang xác thực với TV...
echo.
echo ⚠️  Quan trọng: Trên TV sẽ hiện thông báo xác nhận kết nối
echo     Vui lòng nhấn OK/Accept trên TV!
echo.
timeout /t 2 >nul

call ares-novacom --device %TV_NAME% --getkey

if %errorlevel% neq 0 (
    echo.
    echo ❌ Không thể xác thực với TV
    echo.
    echo Vui lòng kiểm tra:
    echo   - TV và máy tính cùng mạng WiFi
    echo   - IP address đúng
    echo   - Developer Mode đã bật trên TV
    echo   - Đã nhấn Accept trên TV
    echo.
    pause
    exit /b 1
)

REM Cài đặt ứng dụng
echo.
echo 📲 Đang cài đặt ứng dụng lên TV...
call ares-install --device %TV_NAME% %IPK_FILE%

if %errorlevel% neq 0 (
    echo.
    echo ❌ Cài đặt thất bại!
    pause
    exit /b 1
)

REM Lấy app ID từ appinfo.json
set APP_ID=
for /f "tokens=2 delims=:," %%a in ('findstr "\"id\"" appinfo.json 2^>nul') do (
    set APP_ID=%%a
    set APP_ID=!APP_ID: =!
    set APP_ID=!APP_ID:"=!
)

if "%APP_ID%"=="" set APP_ID=com.smarttv.sports

echo.
echo ✅ Cài đặt thành công!
echo.
echo ID ứng dụng: %APP_ID%
echo.

REM Hỏi có muốn chạy ngay không
set /p RUN_NOW="Bạn có muốn mở ứng dụng trên TV ngay bây giờ? (y/n): "

if /i "%RUN_NOW%"=="y" (
    echo.
    echo 🎬 Đang mở ứng dụng...
    call ares-launch --device %TV_NAME% %APP_ID%

    if !errorlevel! equ 0 (
        echo.
        echo ✅ Ứng dụng đang chạy trên TV!
    )
)

echo.
echo ==========================================
echo 🎉 Hoàn tất!
echo ==========================================
echo.
echo 📝 Lưu lại thông tin này:
echo   Tên TV: %TV_NAME%
echo   IP: %TV_IP%
echo   App ID: %APP_ID%
echo.
echo 💡 Các lệnh hữu ích:
echo   • Chạy lại ứng dụng:
echo     ares-launch --device %TV_NAME% %APP_ID%
echo.
echo   • Xem log debug:
echo     ares-inspect --device %TV_NAME% %APP_ID%
echo.
echo   • Đóng ứng dụng:
echo     ares-launch --device %TV_NAME% --close %APP_ID%
echo.
echo   • Gỡ cài đặt:
echo     ares-install --device %TV_NAME% --remove %APP_ID%
echo.
pause
