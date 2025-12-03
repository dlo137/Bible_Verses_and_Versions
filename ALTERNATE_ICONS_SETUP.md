# App Store Product Page Optimization - Alternate Icons Setup

This guide explains how to set up alternate app icons for **App Store Connect Product Page Optimization (PPO)** testing.

## Overview

Your app is now configured to include **3 alternate icons** in the iOS binary that Apple can use for A/B testing in the App Store. The icons are:

- **Main Icon** (default): `icon.png`
- **Alternate Icon 1**: `icon_alt1.png`
- **Alternate Icon 2**: `icon_alt2.png`
- **Alternate Icon 3**: `icon_alt3.png`

## Folder Structure

```
bible/
├── app.config.js                    # Main Expo configuration (replaces app.json)
├── app.json.backup                  # Your original app.json (backed up)
├── plugins/
│   └── withAlternateIcons.js       # Config plugin for iOS alternate icons
└── assets/
    └── images/
        ├── icon.png                 # Main app icon (1024x1024)
        └── icons/
            ├── icon_alt1.png        # Alternate icon 1 (1024x1024) - YOU NEED TO CREATE
            ├── icon_alt2.png        # Alternate icon 2 (1024x1024) - YOU NEED TO CREATE
            └── icon_alt3.png        # Alternate icon 3 (1024x1024) - YOU NEED TO CREATE
```

## Step 1: Create Your Alternate Icons

### Icon Requirements
- **Size**: 1024x1024 pixels
- **Format**: PNG (no transparency/alpha channel)
- **Quality**: High resolution, sharp graphics
- **Guidelines**: Must follow [Apple's App Icon Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

### Icon Naming
Place these files in `assets/images/icons/`:
1. `icon_alt1.png` - Your first alternate icon
2. `icon_alt2.png` - Your second alternate icon
3. `icon_alt3.png` - Your third alternate icon

### How to Create Icons

**Option 1: Design Tools**
- Use Figma, Sketch, Photoshop, or Illustrator
- Export at 1024x1024 PNG
- Ensure no transparency

**Option 2: Icon Generators**
- [AppIcon.co](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- Upload your 1024x1024 design and it generates all sizes

**Option 3: Copy Your Current Icon**
```bash
# Create test versions (you'll replace these with real designs)
cp assets/images/icon.png assets/images/icons/icon_alt1.png
cp assets/images/icon.png assets/images/icons/icon_alt2.png
cp assets/images/icon.png assets/images/icons/icon_alt3.png
```

## Step 2: Configure iOS Assets in Xcode (Automatic via EAS)

The `withAlternateIcons.js` plugin automatically configures your iOS `Info.plist` with:

```xml
<key>CFBundleIcons</key>
<dict>
    <key>CFBundlePrimaryIcon</key>
    <dict>
        <key>CFBundleIconFiles</key>
        <array>
            <string>AppIcon60x60</string>
            <string>AppIcon76x76</string>
            <string>AppIcon83.5x83.5</string>
        </array>
        <key>CFBundleIconName</key>
        <string>AppIcon</string>
    </dict>
    <key>CFBundleAlternateIcons</key>
    <dict>
        <key>AppIconAlt1</key>
        <dict>
            <key>CFBundleIconFiles</key>
            <array>
                <string>AppIconAlt160x60</string>
                <string>AppIconAlt176x76</string>
                <string>AppIconAlt183.5x83.5</string>
            </array>
            <key>UIPrerenderedIcon</key>
            <false/>
        </dict>
        <!-- Similar entries for AppIconAlt2 and AppIconAlt3 -->
    </dict>
</dict>
```

## Step 3: Add Icons to Xcode Assets (For EAS Build)

When you run an EAS build, you need to ensure the alternate icons are included in the Xcode project's Assets.xcassets.

### Manual Method (if building locally):
1. Open your iOS project in Xcode
2. Navigate to `Images.xcassets` or `Assets.xcassets`
3. Create new App Icon sets:
   - Right-click → New iOS App Icon
   - Name: `AppIconAlt1`, `AppIconAlt2`, `AppIconAlt3`
4. Drag your 1024x1024 icons into each set

### Automated Method (EAS Build):

Create an EAS build hook to automatically add icons. Create `eas-hooks/eas-build-post-install.sh`:

```bash
#!/bin/bash

# This script runs after npm install during EAS build
# It copies alternate icons to the iOS project

echo "📱 Adding alternate icons to iOS project..."

# Path to your iOS assets
ASSETS_PATH="ios/bible/Images.xcassets"

# Create alternate icon sets
mkdir -p "$ASSETS_PATH/AppIconAlt1.appiconset"
mkdir -p "$ASSETS_PATH/AppIconAlt2.appiconset"
mkdir -p "$ASSETS_PATH/AppIconAlt3.appiconset"

# Copy icons (Xcode will auto-generate other sizes from 1024x1024)
cp assets/images/icons/icon_alt1.png "$ASSETS_PATH/AppIconAlt1.appiconset/"
cp assets/images/icons/icon_alt2.png "$ASSETS_PATH/AppIconAlt2.appiconset/"
cp assets/images/icons/icon_alt3.png "$ASSETS_PATH/AppIconAlt3.appiconset/"

echo "✅ Alternate icons added successfully"
```

**Important**: For Expo managed workflow with EAS, the icons should be automatically included. If not, you may need to prebuild and manually add them to the Xcode project.

## Step 4: Build Your App with EAS

```bash
# Install dependencies
npm install

# Prebuild to generate iOS project
npx expo prebuild --platform ios --clean

# Build with EAS
eas build --platform ios
```

## Step 5: Verify Icons in .ipa

After building, verify the alternate icons are included:

1. Download your `.ipa` file from EAS
2. Rename `.ipa` to `.zip` and extract
3. Navigate to `Payload/YourApp.app/`
4. Check for icon files:
   - `AppIcon60x60@2x.png`
   - `AppIconAlt160x60@2x.png`
   - `AppIconAlt260x60@2x.png`
   - `AppIconAlt360x60@2x.png`

## Step 6: Upload to App Store Connect

1. Upload your `.ipa` to App Store Connect via Transporter or Xcode
2. Wait for processing to complete
3. Go to **App Store Connect** → **Your App** → **Product Page Optimization**
4. Click **Create Test**
5. Select **App Icon** as the element to test
6. You should see your alternate icons available for selection

## What Apple Expects

For Product Page Optimization, Apple expects:

1. **Icons in the Binary**: All alternate icons must be bundled in the `.ipa` file
2. **Proper plist Configuration**: `CFBundleAlternateIcons` must be correctly configured
3. **Correct Naming**: Icon names must match what's in the plist
4. **All Required Sizes**: Each icon must have all iOS required sizes (60x60@2x, 60x60@3x, etc.)

## Configuration Files Explained

### `app.config.js`

This is your main Expo configuration file (replaces `app.json`). Key sections:

```javascript
plugins: [
  // ... other plugins
  [
    withAlternateIcons,
    ['AppIconAlt1', 'AppIconAlt2', 'AppIconAlt3'], // Icon names
  ],
],
```

### `plugins/withAlternateIcons.js`

This Expo config plugin injects the `CFBundleAlternateIcons` structure into your iOS `Info.plist` during build time.

## Troubleshooting

### Icons Don't Appear in App Store Connect
- Verify icons are in the `.ipa` (see Step 5)
- Check that `Info.plist` has `CFBundleAlternateIcons` entry
- Ensure icon names match exactly (case-sensitive)
- Wait 24-48 hours after upload for processing

### Build Fails
- Run `npx expo prebuild --clean` to regenerate iOS project
- Verify all icon files exist in `assets/images/icons/`
- Check that icon files are exactly 1024x1024 PNG

### Icons Not Included in .ipa
- For managed workflow, you may need to use `expo-asset` plugin
- Add icons to `expo.extra.assetBundlePatterns` in app.config.js:
  ```javascript
  assetBundlePatterns: [
    'assets/**/*',
    'assets/images/icons/*',
  ],
  ```

## Testing Locally

You **cannot** test PPO icons locally. These icons are only used by Apple in the App Store. However, you can verify the build includes them by:

1. Running a development build
2. Checking the Xcode project assets
3. Inspecting the built `.app` bundle

## Important Notes

- **Icons are NOT user-selectable**: These icons are only for Apple's A/B testing in the App Store. Users cannot change them from within your app.
- **No code changes needed**: You don't need to write any code to switch icons. Apple handles this server-side.
- **Main icon stays default**: Your main `icon.png` remains the default icon users see unless Apple's test shows them an alternate.
- **Limit of 3 alternates**: Apple allows up to 3 alternate icons for PPO testing.

## Next Steps

1. ✅ Create your 3 alternate icon designs (1024x1024 PNG each)
2. ✅ Place them in `assets/images/icons/`
3. ✅ Run `npx expo prebuild --platform ios --clean`
4. ✅ Build with `eas build --platform ios`
5. ✅ Upload to App Store Connect
6. ✅ Create PPO test in App Store Connect
7. ✅ Monitor test results and choose winning icon

## Additional Resources

- [Apple Product Page Optimization Guide](https://developer.apple.com/app-store/product-page-optimization/)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
