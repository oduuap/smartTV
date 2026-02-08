# Sports TV - LUONG SON

Ứng dụng xem thể thao trực tiếp cho Smart TV (LG webOS & Android TV) với giao diện tiếng Việt.

## Tính năng chính

- ✅ Tích hợp API thực tế để lấy danh sách trận đấu trực tiếp
- ✅ Hiển thị 59+ trận đấu bóng đá trực tiếp
- ✅ Giao diện 3 cột grid layout tối ưu cho TV
- ✅ Điều hướng bằng remote control (4 hướng + OK + Back)
- ✅ Tự động phát video HLS streaming khi chọn trận đấu
- ✅ Hiển thị thông tin BLV (Bình luận viên) tự động ẩn sau 10 giây
- ✅ Logo và màn hình loading đẹp mắt
- ✅ Shadow mạnh cho items nổi bật
- ✅ Menu số đổi màu đỏ khi highlight
- ✅ Live badge và view count
- ✅ Hỗ trợ LG webOS và Android TV
- ✅ Responsive design cho màn hình 1920x1080

## Cấu trúc ứng dụng

### Màn hình 0: Loading Screen
- Hiển thị logo.png với hiệu ứng glow
- Text "SPORTS TV LUONG SON" màu vàng gold
- Tự động chuyển sang menu sau 2 giây

### Màn hình 1: Menu chính
- 4 danh mục: Thể Thao 🔴, Phim, Tin Tức, Âm Nhạc
- Số màu xanh (mặc định), đỏ (khi highlight)
- Background images cho từng category
- Remote navigation: 4 cột ngang

### Màn hình 2: Danh sách trận đấu
- Load data từ API: `https://api-ls.cdnokvip.com/api/get-livestream-group`
- Hiển thị grid 3 cột
- Mỗi card hiển thị:
  - Tên giải đấu
  - Logo 2 đội
  - Tỷ số (nếu đang thi đấu)
  - Phút thi đấu
  - Live badge
  - View count
  - Thông tin BLV
- Shadow mạnh để items nổi bật
- Auto-focus vào item đầu tiên

### Màn hình 3: Video Player
- Tự động phát video HLS
- POST API để lấy link video: `https://api-ls.cdnokvip.com/api/match-detail?matchId={matchId}`
- Fallback API: `https://api-ls.cdnokvip.com/api/get-link-register?domain=LinkVideo`
- Hiển thị thông tin BLV trong 10 giây đầu, sau đó tự động ẩn
- Nút Back để quay lại danh sách

## Cấu trúc thư mục

```
SmartTVAndroid/
├── config.xml                # Cấu hình Cordova cho Android TV
├── package.json              # Dependencies
├── platforms/
│   └── android/             # Android platform files
├── www/                      # Web app source
│   ├── index.html           # HTML chính
│   ├── css/
│   │   └── style.css       # Toàn bộ CSS
│   ├── js/
│   │   └── app.js          # Logic ứng dụng + API integration
│   └── images/
│       ├── logo.png        # Logo hiển thị trong loading
│       ├── bg.jpg          # Background cho loading screen
│       ├── 1.webp          # Background menu Thể Thao
│       ├── 2.webp          # Background menu Phim
│       ├── 3.webp          # Background menu Tin Tức
│       └── 4.webp          # Background menu Âm Nhạc
└── SportsTV-AndroidTV-v1.0.0.apk  # APK file build sẵn
```

## API Integration

### 1. Load danh sách trận đấu
```
GET https://api-ls.cdnokvip.com/api/get-livestream-group

Response:
{
  "value": {
    "datas": [
      {
        "matchId": "123",
        "homeName": "Manchester United",
        "awayName": "Liverpool",
        "homeLogo": "url",
        "awayLogo": "url",
        "homeScore": 2,
        "awayScore": 1,
        "leagueName": "Premier League",
        "leagueShortName": "EPL",
        "commentator": "Tên BLV",
        "avatar": "url",
        "isLiveHomePage": true,
        "viewNumber": 42000,
        "status": 1,
        "halfStartTime": 1234567890
      }
    ]
  }
}
```

### 2. Lấy link video
```
POST https://api-ls.cdnokvip.com/api/match-detail?matchId={matchId}

Response:
{
  "value": {
    "datas": {
      "linkLive": "https://hls-stream-url.m3u8",
      "listCommentators": [
        {
          "commentator": "Tên BLV",
          "avatar": "url"
        }
      ]
    }
  }
}
```

### 3. Fallback link video
```
GET https://api-ls.cdnokvip.com/api/get-link-register?domain=LinkVideo

Response:
{
  "value": {
    "data": [
      {
        "domain": "LinkVideo",
        "link": "https://fallback-stream-url.m3u8"
      }
    ]
  }
}
```

## Điều khiển bằng Remote

### Menu Screen (4 cột ngang)
- **←/→**: Di chuyển ngang giữa 4 menu items
- **OK/Enter**: Chọn menu item
- **Back**: Thoát app

### Sports List Screen (3 cột)
- **←/→**: Di chuyển ngang (3 cột)
- **↑/↓**: Di chuyển dọc (các hàng)
- **OK/Enter**: Xem trận đấu
- **Back**: Quay lại menu

### Video Player Screen
- **Back**: Quay lại danh sách trận đấu
- **Play/Pause**: Phát/Tạm dừng video
- **Di chuyển chuột/phím bất kỳ**: Hiện lại thông tin BLV

## Cài đặt và Build

### 1. Chạy trên Browser (Test)

```bash
cd /Users/mac/Documents/SmartTV
python3 -m http.server 8080
```

Mở browser: `http://localhost:8080`

### 2. Build APK cho Android TV

```bash
cd /Users/mac/Documents/SmartTVAndroid

# Copy source code mới nhất
rm -rf www/*
cp -r /Users/mac/Documents/SmartTV/* www/

# Build APK
cordova build android

# APK output:
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

APK đã build: `SportsTV-AndroidTV-v1.0.0.apk` (16MB)

### 3. Cài đặt APK trên Android TV

**Qua USB:**
```bash
# Copy APK vào USB
cp SportsTV-AndroidTV-v1.0.0.apk /Volumes/USB/

# Cắm USB vào Android TV
# Dùng File Manager trên TV để cài đặt
```

**Qua ADB:**
```bash
# Connect qua ADB
adb connect [IP_CUA_ANDROID_TV]:5555

# Cài đặt APK
adb install SportsTV-AndroidTV-v1.0.0.apk

# Gỡ cài đặt (nếu cần)
adb uninstall com.smarttv.sports
```

### 4. Cài đặt trên LG webOS TV

```bash
cd /Users/mac/Documents/SmartTV

# Đóng gói IPK
ares-package .

# Cài đặt lên TV
ares-install --device [tên-thiết-bị] com.smarttv.sports_1.0.0_all.ipk

# Chạy app
ares-launch --device [tên-thiết-bị] com.smarttv.sports
```

## Tùy chỉnh giao diện

### Thay đổi màu shadow cho match items

File: `css/style.css`

```css
.match-card {
    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.8),  /* Shadow đen */
        0 5px 15px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.match-item.focused .match-card {
    box-shadow:
        0 0 40px rgba(0, 212, 255, 0.8),  /* Glow xanh */
        0 0 80px rgba(0, 212, 255, 0.4),
        0 15px 40px rgba(0, 0, 0, 0.9);
}
```

### Thay đổi màu số menu khi highlight

File: `css/style.css`

```css
.menu-number {
    color: #00d4ff;  /* Màu xanh mặc định */
}

.menu-item.focused .menu-number {
    color: #ff0000;  /* Màu đỏ khi highlight */
}
```

### Thay đổi logo

Thay file `images/logo.png` (khuyến nghị: 300x300px, PNG với background transparent)

### Thay đổi text loading

File: `index.html`

```html
<h1 class="loading-text">SPORTS TV LUONG SON</h1>
```

## Grid Layout

### Menu: 4 cột ngang
```css
.menu-container {
    display: flex;
    gap: 0;
    width: 100%;
}
```

### Sports List: 3 cột
```css
.sports-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 25px;
    padding: 20px 40px 40px 40px;
}
```

## Công nghệ sử dụng

- **HTML5**: Structure
- **CSS3**: Styling với animations, shadows, gradients
- **Vanilla JavaScript**: Logic, API calls, navigation
- **HLS.js**: HLS video streaming
- **Apache Cordova**: Build Android APK
- **LG webOS SDK**: Build IPK cho LG TV

## Yêu cầu hệ thống

### Development:
- Node.js v14+
- Cordova CLI v13+
- Android SDK (cho build APK)
- LG webOS SDK (cho build IPK)
- Java JDK 11+

### Target devices:
- LG Smart TV webOS 3.0+
- Android TV 5.0+ (API 21+)
- Screen resolution: 1920x1080 (Full HD)

## Khắc phục sự cố

### Items không highlight khi vào sports screen
- Check: `updateFocusableElements()` và `setFocus(0)` đã được gọi sau khi render items
- File: `js/app.js` line ~342

### Video không phát
- Kiểm tra API response có trả về `linkLive`
- Check console log để xem lỗi HLS
- Thử fallback API

### Số không đổi màu đỏ khi highlight menu
- Check CSS: `.menu-item.focused .menu-number`
- Verify class `focused` được add vào element

### APK build failed
- Kiểm tra Android SDK đã cài đúng
- Kiểm tra Java JDK version
- Run: `cordova requirements android`

## License

Copyright © 2026 Sports TV Luong Son. All rights reserved.
