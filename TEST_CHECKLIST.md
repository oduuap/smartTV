# 📋 TEST CHECKLIST - Sports TV v1.1.0

## Version Info
- **Version**: 1.1.0
- **Build Date**: 2024
- **Target**: LG webOS 3.0+
- **Resolution**: 1920x1080

---

## ✅ PRE-TEST SETUP

### LG TV Setup
- [ ] TV connected to WiFi
- [ ] Developer Mode app installed
- [ ] Developer Mode enabled (ON)
- [ ] Device IP address noted: `__________________`
- [ ] TV and PC on same network

### Build & Install
- [ ] Run `./build-and-install.sh`
- [ ] IPK built successfully
- [ ] App installed on TV
- [ ] App launches without errors

---

## 🎮 1. REMOTE CONTROL TESTS

### 1.1 Magic Remote Pointer (CRITICAL)
**Test**: Move Magic Remote pointer over UI elements

- [ ] **Menu Screen**: Pointer highlights menu items (1,2,3,4)
- [ ] **Menu Screen**: Hover effect shows cyan glow
- [ ] **Sports Screen**: Pointer highlights match cards
- [ ] **Sports Screen**: Scroll works with pointer
- [ ] **Player Screen**: BACK button highlights on hover
- [ ] **Pointer Click**: OK button clicks focused item
- [ ] **Cursor Visible**: Cursor shows on screen

**Expected**: ✅ Pointer smoothly tracks movement, highlights follow pointer

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 1.2 D-pad Navigation
**Test**: Use arrow keys on remote

#### Menu Screen (4 columns)
- [ ] **LEFT**: Move focus left (stop at edge)
- [ ] **RIGHT**: Move focus right (stop at edge)
- [ ] **UP/DOWN**: Stay in place (only 1 row)
- [ ] **Focus Visual**: Cyan glow + scale
- [ ] **No Wrap**: Focus stops at boundaries

#### Sports Screen (3 columns grid)
- [ ] **LEFT**: Move focus left within row
- [ ] **RIGHT**: Move focus right within row
- [ ] **UP**: Move focus up 1 row (3 items)
- [ ] **DOWN**: Move focus down 1 row (3 items)
- [ ] **Grid Navigation**: Correct 3-column layout
- [ ] **Edge Behavior**: Stop at top/bottom

**Expected**: ✅ Smooth navigation, correct grid layout

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 1.3 BACK Key (CRITICAL)
**Test**: Press BACK button (key 461)

- [ ] **Player → Sports**: Stops video, goes to sports list
- [ ] **Sports → Menu**: Goes back to menu
- [ ] **Menu → Exit**: Closes app (or tries to)
- [ ] **Video Cleanup**: Video stops properly
- [ ] **No Errors**: Console shows no errors

**Expected**: ✅ Proper back navigation flow

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 1.4 HOME Key (CRITICAL)
**Test**: Press HOME button on remote

- [ ] **From Menu**: Minimizes app, shows Launcher Bar
- [ ] **From Sports**: Minimizes app, shows Launcher Bar
- [ ] **From Player**: Stops video, minimizes app
- [ ] **Video Cleanup**: Video stops when HOME pressed
- [ ] **Return to App**: Can relaunch from Launcher

**Expected**: ✅ App minimizes, Launcher Bar appears

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 1.5 EXIT Key (CRITICAL)
**Test**: Press EXIT button on remote

- [ ] **From Any Screen**: Exits to Live TV
- [ ] **Video Cleanup**: Video stops when EXIT pressed
- [ ] **Clean Exit**: No errors on exit

**Expected**: ✅ App closes, Live TV shows

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 1.6 BACK Button UI (CRITICAL)
**Test**: Visual BACK buttons

- [ ] **Sports Screen**: BACK button visible (top-left)
- [ ] **Player Screen**: BACK button visible (top-left)
- [ ] **Button Style**: Black bg, white text, border
- [ ] **Hover Effect**: Cyan glow on hover
- [ ] **Focusable**: Can focus with D-pad
- [ ] **Clickable**: Click works (pointer or OK button)

**Expected**: ✅ BACK buttons visible and functional

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

## 🎥 2. MULTIMEDIA TESTS

### 2.1 Video Playback
**Test**: Play a live match

- [ ] **API Call**: Match detail loads
- [ ] **HLS Load**: Video URL received
- [ ] **Player Init**: HLS.js loads manifest
- [ ] **Playback Start**: Video plays automatically
- [ ] **No Buffering**: Smooth playback (or minimal)
- [ ] **Audio**: Sound works
- [ ] **Full Screen**: Video fills screen properly

**Expected**: ✅ Video plays smoothly

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 2.2 Playback Controls
**Test**: Remote control buttons

- [ ] **PLAY/PAUSE**: Toggle play/pause
- [ ] **STOP**: Returns to sports list
- [ ] **FF (417)**: Skip +10 seconds
- [ ] **REWIND (412)**: Skip -10 seconds
- [ ] **Position Update**: Time updates correctly

**Expected**: ✅ All playback controls work

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

### 2.3 Video Info Overlay
**Test**: Info overlay behavior

- [ ] **Initial Display**: Shows for 10 seconds
- [ ] **Auto Hide**: Fades out after 10s
- [ ] **Re-show on Move**: Appears when remote moved
- [ ] **Commentator Info**: Shows avatar + name
- [ ] **Match Title**: Shows team names

**Expected**: ✅ Info appears and auto-hides

**Actual Result**: ______________________________

**Status**: ☐ PASS  ☐ FAIL

---

## 🔄 3. STATE PERSISTENCE TESTS (NEW)

### 3.1 Reboot Recovery - Video Playback
**Test**: Recovery after TV reboot

**Steps**:
1. Play a video
2. Let it play for 2-3 minutes
3. Note current timestamp: `__:__`
4. Turn OFF TV (power button)
5. Wait 10 seconds
6. Turn ON TV
7. Launch app

**Check**:
- [ ] **Loading Screen**: Shows for 1 second
- [ ] **Auto Restore**: Video starts automatically
- [ ] **Position Resume**: Jumps to saved timestamp (~2-3 min)
- [ ] **Resume Notification**: Shows "⏩ Tiếp tục từ X:XX"
- [ ] **Playback Continues**: Video plays normally
- [ ] **No Errors**: Console clean

**Expected**: ✅ Video resumes from saved position

**Actual Timestamp**: __:__
**Resume Timestamp**: __:__
**Difference**: ______ seconds (should be < 10s)

**Status**: ☐ PASS  ☐ FAIL

---

### 3.2 Reboot Recovery - Sports Screen
**Test**: Recovery when browsing

**Steps**:
1. Go to Sports screen
2. Browse matches (don't play)
3. Turn OFF TV
4. Turn ON TV
5. Launch app

**Check**:
- [ ] **Loading Screen**: Shows for 1 second
- [ ] **Sports Restored**: Sports screen appears
- [ ] **Matches Loaded**: Match list visible
- [ ] **Focus Set**: First item focused

**Expected**: ✅ Returns to sports screen

**Status**: ☐ PASS  ☐ FAIL

---

### 3.3 Resume Play - Same Video
**Test**: Resume when replaying same match

**Steps**:
1. Play match "ABC"
2. Watch for 1 minute
3. Press BACK (return to sports)
4. Immediately play same match "ABC"

**Check**:
- [ ] **Video Loads**: Starts playing
- [ ] **Position Check**: localStorage has saved position
- [ ] **Resume Wait**: Waits 3 seconds
- [ ] **Jump to Position**: Seeks to saved time (~1:00)
- [ ] **Notification**: Shows resume message
- [ ] **Playback Continues**: Plays from saved position

**Expected**: ✅ Resumes from 1:00 mark

**Status**: ☐ PASS  ☐ FAIL

---

### 3.4 Auto-Save During Playback
**Test**: Verify position saves every 5 seconds

**Steps**:
1. Open Chrome browser
2. Go to TV IP address (if remote debugging enabled)
3. Or check TV logs
4. Play a video
5. Watch console logs

**Check**:
- [ ] **First Save**: Position saved after 5s
- [ ] **Continuous Save**: Updates every 5s
- [ ] **localStorage**: `video_position_<matchId>` exists
- [ ] **App State**: `smarttv_app_state` updates
- [ ] **Timestamp**: Increases each save

**Expected**: ✅ Auto-save works every 5 seconds

**Status**: ☐ PASS  ☐ FAIL

---

### 3.5 State Expiry
**Test**: Old state is ignored

**Setup**: Requires waiting 1+ hour (or modify STATE_EXPIRY_TIME in code for testing)

**Steps**:
1. Play a video
2. Turn OFF TV
3. Wait 1+ hour (or use modified expiry)
4. Turn ON TV
5. Launch app

**Check**:
- [ ] **State Expired**: Timestamp > 1 hour
- [ ] **Default Behavior**: Goes to menu
- [ ] **No Restore**: Video not played
- [ ] **localStorage Clean**: Old state removed

**Expected**: ✅ Goes to menu (default)

**Status**: ☐ PASS  ☐ FAIL

---

### 3.6 Position Cleared on Video End
**Test**: Position cleared when video ends

**Steps**:
1. Use short test video (or skip to near end)
2. Let video play until end
3. Check localStorage

**Check**:
- [ ] **Video Ends**: 'ended' event fires
- [ ] **Position Cleared**: `video_position_<matchId>` removed
- [ ] **Replay Fresh**: Playing again starts from 0:00

**Expected**: ✅ Position cleared on video end

**Status**: ☐ PASS  ☐ FAIL

---

## 🎨 4. UI/UX TESTS

### 4.1 Display & Layout
**Test**: Visual appearance

- [ ] **Resolution**: 1920x1080 clear
- [ ] **Overscan Safe**: 60px padding, no cut-off
- [ ] **Text Readable**: All text visible
- [ ] **Logos Clear**: Team logos load properly
- [ ] **Colors Good**: Cyan, red, gold colors correct
- [ ] **No Flicker**: Smooth transitions
- [ ] **Background**: Background image loads

**Expected**: ✅ Professional, polished look

**Status**: ☐ PASS  ☐ FAIL

---

### 4.2 Loading & Transitions
**Test**: Screen transitions

- [ ] **Loading Screen**: Shows "SPORTS TV LUONG SON"
- [ ] **Load Duration**: ~1 second
- [ ] **Fade In**: Smooth fade-in animation
- [ ] **Screen Switch**: No flicker when switching
- [ ] **Spinner**: Loading spinner on sports screen

**Expected**: ✅ Smooth, professional transitions

**Status**: ☐ PASS  ☐ FAIL

---

### 4.3 Sports List
**Test**: Match cards display

- [ ] **Grid Layout**: 3 columns
- [ ] **Card Design**: Blue gradient cards
- [ ] **Team Logos**: 90x90px, circular
- [ ] **Team Names**: 2-line clamp, ellipsis
- [ ] **Live Badge**: Red "Live" badge pulses
- [ ] **Score Display**: Shows correct scores
- [ ] **Commentator**: Avatar + name at bottom
- [ ] **League Name**: Shows at top

**Expected**: ✅ All match info visible and styled

**Status**: ☐ PASS  ☐ FAIL

---

## 🐛 5. ERROR HANDLING TESTS

### 5.1 Network Error
**Test**: No internet connection

- [ ] **Disconnect WiFi**: Turn off router
- [ ] **Load Sports**: Try to load matches
- [ ] **Fallback Data**: Shows fallback message
- [ ] **No Crash**: App doesn't crash
- [ ] **Reconnect**: Works when WiFi back

**Expected**: ✅ Graceful error handling

**Status**: ☐ PASS  ☐ FAIL

---

### 5.2 Video Load Failure
**Test**: Invalid video URL

- [ ] **Bad API**: API returns no video URL
- [ ] **Alert Shown**: Error message displayed
- [ ] **Stay on Screen**: Remains on sports screen
- [ ] **Try Another**: Can play other matches
- [ ] **No Crash**: App continues working

**Expected**: ✅ Error message, no crash

**Status**: ☐ PASS  ☐ FAIL

---

## ⚡ 6. PERFORMANCE TESTS

### 6.1 Load Times
**Test**: Measure load times

- [ ] **App Launch**: < 3 seconds
- [ ] **Sports Load**: < 5 seconds
- [ ] **Video Start**: < 10 seconds
- [ ] **Screen Switch**: < 1 second
- [ ] **Navigation Response**: < 100ms

**Expected**: ✅ Fast, responsive

**Actual Load Times**:
- App Launch: _______ seconds
- Sports Load: _______ seconds
- Video Start: _______ seconds

**Status**: ☐ PASS  ☐ FAIL

---

### 6.2 Memory Usage
**Test**: Check for memory leaks

- [ ] **Initial RAM**: Note usage
- [ ] **Play 5 Videos**: Switch between videos
- [ ] **RAM After**: Check again
- [ ] **No Leak**: RAM increase < 50MB
- [ ] **No Lag**: UI remains responsive

**Expected**: ✅ Stable memory usage

**Status**: ☐ PASS  ☐ FAIL

---

### 6.3 Long Session Test
**Test**: App stability over time

**Steps**:
1. Use app for 30+ minutes
2. Navigate all screens multiple times
3. Play several videos
4. Test all features

**Check**:
- [ ] **No Crash**: App doesn't crash
- [ ] **No Slowdown**: Performance stays good
- [ ] **No Memory Leak**: RAM stable
- [ ] **Video Quality**: Stays good
- [ ] **Navigation**: Still responsive

**Expected**: ✅ Stable over 30+ minutes

**Status**: ☐ PASS  ☐ FAIL

---

## 📊 TEST SUMMARY

### Critical Tests (Must Pass)
- [ ] Magic Remote Pointer (1.1)
- [ ] D-pad Navigation (1.2)
- [ ] BACK Key (1.3)
- [ ] HOME Key (1.4)
- [ ] EXIT Key (1.5)
- [ ] BACK Button UI (1.6)
- [ ] Video Playback (2.1)
- [ ] Reboot Recovery - Video (3.1)

### Important Tests (Should Pass)
- [ ] Playback Controls (2.2)
- [ ] Reboot Recovery - Sports (3.2)
- [ ] Resume Play (3.3)
- [ ] Auto-Save (3.4)
- [ ] Display & Layout (4.1)

### Optional Tests (Nice to Have)
- [ ] State Expiry (3.5)
- [ ] Position Clear on End (3.6)
- [ ] Error Handling (5.1, 5.2)
- [ ] Performance (6.1, 6.2, 6.3)

---

## 🏁 FINAL RESULT

**Total Tests**: ___ / ___
**Critical Pass**: ___ / 8
**Important Pass**: ___ / 5
**Optional Pass**: ___ / 7

**Overall Status**: ☐ PASS  ☐ FAIL

**Notes**:
```
____________________________________________
____________________________________________
____________________________________________
```

**Tested By**: _______________
**Date**: _______________
**TV Model**: _______________
**webOS Version**: _______________

---

## 🐛 BUGS FOUND

### Bug #1
**Title**: ______________________________
**Severity**: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
**Description**: ______________________________
**Steps to Reproduce**: ______________________________
**Expected**: ______________________________
**Actual**: ______________________________

### Bug #2
**Title**: ______________________________
**Severity**: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
**Description**: ______________________________

*(Add more as needed)*

---

## ✅ SIGN OFF

**QA Engineer**: _______________
**Signature**: _______________
**Date**: _______________

**Approved for**: ☐ Production  ☐ Beta Testing  ☐ Internal Use  ☐ Needs Fixes
