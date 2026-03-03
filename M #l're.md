# 📱 LG STORE SUBMISSION GUIDE

## ✅ CHECKLIST ĐÃ HOÀN THÀNH

### 1. App Files (Đã có)
- [x] `appinfo.json` - Cập nhật đầy đủ thông tin
- [x] `icon.png` (80x80px)
- [x] `largeIcon.png` (130x130px)
- [x] `index.html` - Main HTML
- [x] All JS, CSS, Images files
- [x] Version 1.1.0

### 2. Required Information (Đã thêm)
- [x] App Description
- [x] Privacy Policy URL (placeholder)
- [x] Vendor Email
- [x] Vendor URL

---

## 🔴 CẦN LÀM TRƯỚC KHI SUBMIT

### BƯỚC 1: Host Privacy Policy

File `privacy-policy.html` đã được tạo sẵn. Bạn cần host nó online:

#### **Option A: GitHub Pages (KHUYẾN NGHỊ - MIỄN PHÍ)**

```bash
# 1. Tạo repo mới trên GitHub tên "smarttv-privacy"
# 2. Push privacy policy lên:

cd /Users/mac/Documents/SmartTV/smartTV
git init privacy-repo
cd privacy-repo
cp ../privacy-policy.html .
git add privacy-policy.html
git commit -m "Add privacy policy"
git remote add origin https://github.com/YOUR_USERNAME/smarttv-privacy.git
git push -u origin main

# 3. Enable GitHub Pages:
# - Vào Settings → Pages
# - Source: Deploy from branch "main"
# - Folder: / (root)
# - Save

# 4. URL sẽ là:
# https://YOUR_USERNAME.github.io/smarttv-privacy/privacy-policy.html
```

#### **Option B: Host trên web server riêng**
Upload `privacy-policy.html` lên hosting/domain của bạn.

#### **Option C: Dùng dịch vụ miễn phí**
- **Netlify Drop**: Drop file vào https://app.netlify.com/drop
- **Vercel**: Deploy qua https://vercel.com
- **Firebase Hosting**: https://firebase.google.com/docs/hosting

---

### BƯỚC 2: Cập nhật Privacy Policy URL

Sau khi host xong, sửa URL trong `appinfo.json`:

```json
{
  "privacyPolicy": "https://YOUR_ACTUAL_URL/privacy-policy.html"
}
```

**Ví dụ:**
```json
{
  "privacyPolicy": "https://oduuapp.github.io/smarttv-privacy/privacy-policy.html"
}
```

---

### BƯỚC 3: Cập nhật Email & URL

Sửa trong `appinfo.json`:

```json
{
  "vendorEmail": "your-real-email@gmail.com",
  "vendorUrl": "https://github.com/yourusername/smartTV"
}
```

---

### BƯỚC 4: Chuẩn bị Screenshots (4-5 ảnh)

LG Store yêu cầu **4-5 screenshots** (1920x1080 PNG/JPG):

**Cách capture:**

1. **Chạy app trên TV hoặc emulator**
2. **Capture các màn hình:**
   - Screenshot 1: Loading Screen
   - Screenshot 2: Main Menu (4 categories)
   - Screenshot 3: Sports List (grid view)
   - Screenshot 4: Video Player
   - Screenshot 5: Match Details (optional)

**Trên TV thật:**
```bash
# Capture màn hình qua ares-cli
ares-inspect --device mytv --app com.smarttv.sports --open

# Hoặc dùng Remote Debugger trong Chrome
# Sau đó dùng Chrome DevTools → Screenshot
```

**Trên Emulator:**
```bash
# Launch emulator
VirtualBox emulator

# Chạy app
ares-launch --device emulator com.smarttv.sports

# Capture: Devices → Insert Guest Additions CD
# Hoặc dùng screenshot tool của VirtualBox
```

**Lưu screenshots vào:**
```
/Users/mac/Documents/SmartTV/smartTV/screenshots/
  - screenshot-1-loading.png
  - screenshot-2-menu.png
  - screenshot-3-sports-list.png
  - screenshot-4-video-player.png
  - screenshot-5-match-details.png (optional)
```

---

### BƯỚC 5: Build IPK cuối cùng

```bash
cd /Users/mac/Documents/SmartTV/smartTV

# Clean build
rm -f *.ipk

# Package IPK
ares-package .

# Verify package
ares-package-info com.smarttv.sports_1.1.0_all.ipk

# Test trên TV/emulator
ares-install --device mytv com.smarttv.sports_1.1.0_all.ipk
ares-launch --device mytv com.smarttv.sports
```

---

## 📝 LG SELLER LOUNGE SUBMISSION

### 1. Đăng nhập LG Seller Lounge
- URL: https://seller.lgappstv.com
- Dùng tài khoản LG Developer đã tạo

### 2. Tạo App Listing Mới
- Click **"Upload App"** hoặc **"Register New App"**
- Chọn **webOS TV**

### 3. Điền thông tin App

#### **Basic Information:**
- **App Name:** Sports TV
- **App ID:** com.smarttv.sports
- **Version:** 1.1.0
- **Category:** Entertainment / Sports
- **Age Rating:** General Audiences (All Ages)

#### **Description:**
```
Sports TV - Live Sports Streaming

Watch live football matches with HD streaming quality. Features include:
- Live sports streaming with HLS support
- Real-time match scores and league information
- Commentator details and match statistics
- Easy remote control navigation
- Vietnamese interface
- Multiple sports categories

Perfect for sports fans who want to watch live matches on their LG Smart TV.
```

**Vietnamese Description:**
```
Sports TV - Xem Thể Thao Trực Tiếp

Xem các trận bóng đá trực tiếp với chất lượng HD. Tính năng:
- Phát trực tiếp thể thao với công nghệ HLS
- Tỷ số trận đấu và thông tin giải đấu theo thời gian thực
- Thông tin bình luận viên và thống kê trận đấu
- Điều khiển dễ dàng bằng remote
- Giao diện tiếng Việt
- Nhiều danh mục thể thao

Hoàn hảo cho người hâm mộ thể thao muốn xem trực tiếp trên LG Smart TV.
```

#### **URLs:**
- **Privacy Policy:** https://YOUR_URL/privacy-policy.html
- **Website:** https://github.com/yourusername/smartTV
- **Support Email:** support@smarttv-sports.com

#### **Screenshots:**
Upload 4-5 PNG/JPG files (1920x1080)

#### **Icons:**
- **80x80:** icon.png
- **130x130:** largeIcon.png

#### **IPK File:**
Upload `com.smarttv.sports_1.1.0_all.ipk`

#### **Supported Devices:**
- [x] webOS 3.0+
- [x] webOS 4.0+
- [x] webOS 5.0+
- [x] webOS 6.0+

#### **Supported Countries:**
- [x] Vietnam
- [ ] Other countries (optional)

---

### 4. Submit for Review

1. Review all information
2. Check **"I agree to Terms & Conditions"**
3. Click **"Submit for Review"**

---

## ⏱️ REVIEW PROCESS

**Timeline:** 5-10 business days

**LG sẽ kiểm tra:**
- ✅ App functionality
- ✅ Privacy Policy compliance
- ✅ Content appropriateness
- ✅ UI/UX quality
- ✅ Performance
- ✅ Copyright compliance

**Possible Outcomes:**
1. **Approved** → App published to LG Store
2. **Rejected** → Email with reasons, fix and resubmit
3. **Needs Changes** → Minor fixes required

---

## 🐛 COMMON REJECTION REASONS

### 1. Privacy Policy Issues
- ❌ URL không hoạt động
- ❌ Nội dung không đầy đủ
- ✅ **Fix:** Host privacy policy, update URL

### 2. Content Violations
- ❌ Vi phạm bản quyền
- ❌ Nội dung không phù hợp
- ✅ **Fix:** Đảm bảo có quyền stream content

### 3. App Crashes
- ❌ App crash khi test
- ❌ Video không phát
- ✅ **Fix:** Test kỹ trên TV thật

### 4. Poor UI/UX
- ❌ Text bị cắt
- ❌ Navigation không hoạt động
- ✅ **Fix:** Test với Magic Remote

### 5. Missing Information
- ❌ Thiếu screenshots
- ❌ Thiếu description
- ✅ **Fix:** Hoàn thiện tất cả thông tin

---

## 📊 FINAL CHECKLIST

### Before Submit:
- [ ] Privacy Policy hosted và URL hoạt động
- [ ] Email & Website URL updated
- [ ] 4-5 screenshots prepared (1920x1080)
- [ ] IPK built và tested trên TV thật
- [ ] App không crash, navigation OK
- [ ] Video streaming hoạt động tốt
- [ ] All text readable, no cut-off
- [ ] Tested with Magic Remote
- [ ] Tested BACK, HOME, EXIT keys
- [ ] No copyright violations

### After Submit:
- [ ] Check email for LG review updates
- [ ] Respond to any questions from LG
- [ ] Fix issues if rejected
- [ ] Celebrate when approved! 🎉

---

## 📧 SUPPORT

**LG Developer Support:**
- Email: developer@lge.com
- Forum: https://webostv.developer.lge.com/community

**Questions?**
- Check LG Developer Guide: https://webostv.developer.lge.com/develop/app-test/
- Review webOS App Submission Guide

---

**Last Updated:** February 27, 2026
**Version:** 1.1.0
**Status:** Ready for Submission (after hosting Privacy Policy)
