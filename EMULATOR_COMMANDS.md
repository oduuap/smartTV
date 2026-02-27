# 🖥️ EMULATOR INSTALLATION COMMANDS

## Quick Commands

### 1. Check Emulator Status
```bash
ares-setup-device --list | grep emulator
nc -zv 127.0.0.1 6622  # Test connection
```

### 2. Install App
```bash
cd /Users/mac/Documents/SmartTV
ares-install -d emulator com.smarttv.sports_1.1.0_all.ipk
```

### 3. Launch App
```bash
ares-launch -d emulator com.smarttv.sports
```

### 4. View Logs (Debug)
```bash
ares-inspect -d emulator com.smarttv.sports
```

### 5. Remove App (if needed)
```bash
ares-install -d emulator --remove com.smarttv.sports
```

---

## Emulator Control Keys

### Keyboard Mappings (Emulator)
- **Arrow Keys** → D-pad (UP/DOWN/LEFT/RIGHT)
- **Enter** → OK button
- **Backspace** → BACK button
- **ESC** → EXIT simulation
- **Mouse** → Magic Remote pointer

### Test Workflow
1. Mouse hover → Check pointer highlight
2. Arrow keys → Navigate grid
3. Enter → Select item
4. Backspace → Go back

---

## Common Issues

### Issue: "Connection refused 127.0.0.1:6622"
**Solution**: Emulator not running
```bash
# Start emulator first
# Open webOS TV Emulator Manager app
# Click Launch
# Wait 30 seconds
```

### Issue: "Device not found"
**Solution**: Setup emulator device
```bash
ares-setup-device --add emulator \
  -i "host=127.0.0.1" \
  -i "port=6622" \
  -i "username=developer"
```

### Issue: App won't launch
**Solution**: Check installation
```bash
# List installed apps
ares-install -d emulator --list

# Should see: com.smarttv.sports
```

---

## Test Checklist (Emulator)

### Quick Test (5 min)
- [ ] App installs without errors
- [ ] App launches
- [ ] Mouse pointer works
- [ ] Arrow keys navigate
- [ ] Can click matches
- [ ] Video loads (may fail if no internet)
- [ ] Backspace goes back

### Full Test
See TEST_CHECKLIST.md for complete test plan

---

## Debugging

### View Real-time Logs
```bash
# Method 1: ares-inspect (opens DevTools)
ares-inspect -d emulator com.smarttv.sports

# Method 2: ares-log (terminal logs)
ares-log -d emulator -f com.smarttv.sports
```

### Check localStorage
```bash
# In DevTools Console
localStorage.getItem('smarttv_app_state')
localStorage.getItem('video_position_<matchId>')
```

### Clear App Data
```bash
# In DevTools Console
localStorage.clear();
location.reload();
```

---

## Performance Notes

### Emulator Limitations
- ⚠️ Slower than real TV
- ⚠️ Video playback may lag
- ⚠️ Network speed depends on host
- ⚠️ webOS APIs may differ slightly
- ✅ Good for UI/UX testing
- ✅ Good for remote control testing

### Recommended Testing
- **Emulator**: UI, navigation, basic functionality
- **Real TV**: Performance, video quality, full features

---

## Next Steps

After emulator testing passes:
1. ✅ Test on real LG TV (recommended)
2. ✅ Test video quality on TV
3. ✅ Test actual reboot recovery on TV
4. ✅ Test HOME/EXIT keys on real remote
5. ✅ Performance testing on TV

---

## Quick Reference

| Task | Command |
|------|---------|
| List devices | `ares-setup-device --list` |
| Install | `ares-install -d emulator <ipk>` |
| Launch | `ares-launch -d emulator com.smarttv.sports` |
| Close | `ares-launch -d emulator --close com.smarttv.sports` |
| Debug | `ares-inspect -d emulator com.smarttv.sports` |
| Logs | `ares-log -d emulator -f com.smarttv.sports` |
| Remove | `ares-install -d emulator --remove com.smarttv.sports` |
