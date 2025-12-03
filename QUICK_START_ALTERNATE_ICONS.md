# Quick Start: Alternate Icons for App Store PPO

## What Was Done

Your project is now configured to include **3 alternate app icons** in the iOS build for **App Store Product Page Optimization** testing.

### Files Created/Modified

✅ **app.config.js** - Replaces app.json, includes alternate icons config
✅ **plugins/withAlternateIcons.js** - Config plugin to inject iOS plist entries
✅ **assets/images/icons/** - Folder for your alternate icon files
✅ **app.json.backup** - Backup of your original configuration

## Your Next Steps (5 Minutes)

### Step 1: Create Your Alternate Icons

You need 3 PNG files at **1024x1024 pixels** each:

```bash
assets/images/icons/icon_alt1.png
assets/images/icons/icon_alt2.png
assets/images/icons/icon_alt3.png
```

**Quick Test Method** (use your current icon):
```bash
cp assets/images/icon.png assets/images/icons/icon_alt1.png
cp assets/images/icon.png assets/images/icons/icon_alt2.png
cp assets/images/icon.png assets/images/icons/icon_alt3.png
```

**Production Method**: Design 3 unique icon variations and export as 1024x1024 PNG

### Step 2: Prebuild Your iOS Project

```bash
npx expo prebuild --platform ios --clean
```

This generates the Xcode project with alternate icons configured.

### Step 3: Build with EAS

```bash
eas build --platform ios
```

### Step 4: Upload to App Store Connect

- Upload your `.ipa` to App Store Connect
- Wait for processing
- Go to **Product Page Optimization** → **Create Test**
- Select **App Icon** to test
- Choose your alternate icons

## How It Works

### Configuration Structure

**app.config.js**:
```javascript
plugins: [
  // ... other plugins
  [
    withAlternateIcons,
    ['AppIconAlt1', 'AppIconAlt2', 'AppIconAlt3'], // Names in iOS plist
  ],
],
```

**iOS Info.plist** (auto-generated):
```xml
<key>CFBundleAlternateIcons</key>
<dict>
    <key>AppIconAlt1</key>
    <dict>
        <key>CFBundleIconFiles</key>
        <array>
            <string>AppIconAlt160x60</string>
            <string>AppIconAlt176x76</string>
            <!-- ... other sizes -->
        </array>
    </dict>
    <!-- AppIconAlt2 and AppIconAlt3 ... -->
</dict>
```

### File Mapping

| Your File | iOS Asset Name | Purpose |
|-----------|---------------|---------|
| `icon.png` | `AppIcon` | Default app icon (main) |
| `icon_alt1.png` | `AppIconAlt1` | First alternate for testing |
| `icon_alt2.png` | `AppIconAlt2` | Second alternate for testing |
| `icon_alt3.png` | `AppIconAlt3` | Third alternate for testing |

## Verification Checklist

After building, verify your setup:

### ✅ Pre-Build Checks
- [ ] All 3 icon files exist in `assets/images/icons/`
- [ ] Each icon is exactly 1024x1024 PNG
- [ ] No transparency/alpha channel in icons
- [ ] `app.config.js` exists and exports config correctly

### ✅ Post-Build Checks
- [ ] Download `.ipa` from EAS
- [ ] Rename to `.zip` and extract
- [ ] Navigate to `Payload/YourApp.app/`
- [ ] Verify icon files exist:
  - `AppIconAlt160x60@2x.png`
  - `AppIconAlt260x60@2x.png`
  - `AppIconAlt360x60@2x.png`

### ✅ App Store Connect Checks
- [ ] Upload to App Store Connect completes successfully
- [ ] App processes without errors
- [ ] Go to Product Page Optimization
- [ ] Alternate icons appear as selectable options

## Common Issues & Fixes

### Issue: Icons don't appear in App Store Connect

**Fix**:
1. Verify icons are in the `.ipa` (see verification above)
2. Check `Info.plist` has `CFBundleAlternateIcons`
3. Wait 24-48 hours for App Store processing
4. Ensure icon names match exactly (case-sensitive)

### Issue: Build fails during prebuild

**Fix**:
```bash
# Clean everything and start fresh
npx expo prebuild --platform ios --clean
rm -rf node_modules
npm install
npx expo prebuild --platform ios --clean
```

### Issue: Icons not included in .ipa

**Fix**: Add to `app.config.js`:
```javascript
assetBundlePatterns: [
  'assets/**/*',
  'assets/images/icons/*',
],
```

## Important Notes

🔔 **Icons are NOT user-switchable**: These icons are only for Apple's A/B testing in the App Store. Users cannot change them from within your app.

🔔 **No code changes needed**: You don't need to write code to switch icons. Apple handles this server-side during PPO tests.

🔔 **Main icon stays default**: Your `icon.png` remains the default icon unless Apple's test shows a user an alternate.

🔔 **Testing limitation**: You cannot test PPO icons locally. They only work in App Store Connect.

## Expected Result in App Store Connect

When you create a Product Page Optimization test:

1. Click **"Create Test"**
2. Select **"App Icon"** as the test element
3. You'll see:
   - **Original (Control)**: Your main icon
   - **Treatment 1**: AppIconAlt1 (from `icon_alt1.png`)
   - **Treatment 2**: AppIconAlt2 (from `icon_alt2.png`)
   - **Treatment 3**: AppIconAlt3 (from `icon_alt3.png`)
4. Set traffic allocation (e.g., 25% each)
5. Launch test
6. Apple shows different icons to different users
7. View metrics to see which icon performs best

## Need More Details?

See the complete documentation: **`ALTERNATE_ICONS_SETUP.md`**

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Create test icons (replace with real designs later)
cp assets/images/icon.png assets/images/icons/icon_alt1.png
cp assets/images/icon.png assets/images/icons/icon_alt2.png
cp assets/images/icon.png assets/images/icons/icon_alt3.png

# Prebuild iOS project
npx expo prebuild --platform ios --clean

# Build for App Store
eas build --platform ios

# Verify config
cat app.config.js | grep -A 5 "withAlternateIcons"
```

---

**Ready to go?** Create your 3 alternate icons, prebuild, and build with EAS!
