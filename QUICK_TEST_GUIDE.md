# 🚀 QUICK TEST GUIDE - Sports TV v1.1.0

## 📦 BUILD COMPLETE!

**Package**: `com.smarttv.sports_1.1.0_all.ipk`
**Size**: 43 MB
**Location**: `/Users/mac/Documents/SmartTV/`

---

## ⚡ QUICK INSTALL & TEST (3 Steps)

### Step 1: Setup LG TV (One-time)

**Enable Developer Mode on TV:**
1. Install "Developer Mode" app from LG Content Store
2. Launch Developer Mode app
3. Turn ON Developer Mode
4. Restart TV
5. Note TV IP address (shown in Developer Mode app)

**Setup Device on Mac:**
```bash
cd /Users/mac/Documents/SmartTV/smartTV

# Replace <TV_IP> with your TV's IP address
ares-setup-device --add lg_tv -i "host=<TV_IP>" -i "port=9922"

# Verify connection
ares-setup-device --list
```

---

### Step 2: Install App

**Option A: Use Script (Recommended)**
```bash
cd /Users/mac/Documents/SmartTV/smartTV
./build-and-install.sh
```

**Option B: Manual Commands**
```bash
cd /Users/mac/Documents/SmartTV

# Install
ares-install -d lg_tv com.smarttv.sports_1.1.0_all.ipk

# Launch
ares-launch -d lg_tv com.smarttv.sports

# View logs (optional)
ares-inspect -d lg_tv com.smarttv.sports
```

---

### Step 3: Run Priority Tests (10 minutes)

#### 🎮 Test 1: Magic Remote Pointer (2 min)
**Action**: Move Magic Remote pointer over UI
- Menu items should highlight
- Match cards should highlight
- Cyan glow appears on hover

**Result**: ☐ PASS  ☐ FAIL

---

#### 🕹️ Test 2: D-pad Navigation (2 min)
**Action**: Use arrow keys on remote
- LEFT/RIGHT on menu → Navigate items
- UP/DOWN on sports → Navigate grid

**Result**: ☐ PASS  ☐ FAIL

---

#### ⬅️ Test 3: BACK Button (1 min)
**Action**: Press BACK on remote
- Player → Sports → Menu → Exit
- BACK button visible on screen

**Result**: ☐ PASS  ☐ FAIL

---

#### 🏠 Test 4: HOME Key (1 min)
**Action**: Press HOME on remote
- App minimizes
- Launcher Bar appears
- Can relaunch app

**Result**: ☐ PASS  ☐ FAIL

---

#### 📺 Test 5: Video Playback (2 min)
**Action**: Play a match
- Video loads
- Plays smoothly
- Audio works

**Result**: ☐ PASS  ☐ FAIL

---

#### 🔄 Test 6: Reboot Recovery (2 min)
**Action**:
1. Play video for 30 seconds
2. Turn OFF TV
3. Turn ON TV
4. Launch app

**Expected**: Video resumes from ~30 seconds

**Result**: ☐ PASS  ☐ FAIL

---

## ✅ QUICK PASS CRITERIA

**Minimum to PASS:**
- ✅ Magic Remote pointer works
- ✅ D-pad navigation works
- ✅ BACK button visible and works
- ✅ Video plays
- ✅ Reboot recovery works

**If all 6 tests PASS → Ready for full testing**

---

## 🐛 IF TESTS FAIL

### Common Issues:

**1. App won't install**
- Check: TV Developer Mode enabled?
- Check: TV and Mac on same WiFi?
- Try: `ares-setup-device --list` to verify connection

**2. Magic Remote pointer not working**
- Check: Is Magic Remote in pointer mode? (shake remote)
- Check: Console errors? (`ares-inspect`)

**3. Video won't play**
- Check: Internet connection on TV?
- Check: API accessible? (try browser)
- Check: Console errors in logs

**4. Reboot recovery not working**
- Check: localStorage enabled?
- Check: Console shows "Restoring state..."?
- Check: Time since last use < 1 hour?

**5. HOME/EXIT keys not working**
- Expected: Browser fallback (go to menu)
- Note: Full webOS API only on real TV

---

## 📋 FULL TEST CHECKLIST

For comprehensive testing, see:
- **TEST_CHECKLIST.md** - Complete test plan (50+ tests)

---

## 🔍 DEBUGGING

### View Live Logs
```bash
ares-inspect -d lg_tv com.smarttv.sports
```

### View localStorage
1. Open inspector
2. Go to Application tab
3. Local Storage → check keys:
   - `smarttv_app_state`
   - `video_position_<matchId>`

### Check Network
1. Inspector → Network tab
2. Play video
3. Check HLS requests (.m3u8)

---

## 📊 NEXT STEPS

### If Priority Tests PASS:
1. ✅ Run full test checklist (TEST_CHECKLIST.md)
2. ✅ Performance testing (30+ min session)
3. ✅ Edge case testing
4. ✅ Ready for production

### If Tests FAIL:
1. ❌ Document bugs in TEST_CHECKLIST.md
2. ❌ Fix issues
3. ❌ Rebuild: `ares-package smartTV`
4. ❌ Reinstall and retest

---

## 📞 SUPPORT

**Check logs:**
```bash
ares-inspect -d lg_tv com.smarttv.sports
```

**Reinstall clean:**
```bash
# Remove old version
ares-install -d lg_tv --remove com.smarttv.sports

# Install new version
ares-install -d lg_tv com.smarttv.sports_1.1.0_all.ipk
```

**Reset localStorage:**
```javascript
// In inspector console
localStorage.clear();
location.reload();
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] IPK built successfully
- [ ] Installed on TV
- [ ] App launches
- [ ] All 6 priority tests PASS
- [ ] Ready for full testing

**Tester**: _______________
**Date**: _______________
**Time**: _______________

---

Good luck! 🚀
