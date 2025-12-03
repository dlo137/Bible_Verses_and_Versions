# Alternate App Icons for Product Page Optimization

This folder contains alternate app icons that will be included in your iOS build for **App Store Connect Product Page Optimization**.

## Required Files

Place the following 3 icon files in this directory:

### 1. icon_alt1.png
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (no transparency)
- **Purpose**: First alternate icon for A/B testing

### 2. icon_alt2.png
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (no transparency)
- **Purpose**: Second alternate icon for A/B testing

### 3. icon_alt3.png
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (no transparency)
- **Purpose**: Third alternate icon for A/B testing

## Quick Start

### Option 1: Copy Your Current Icon (for testing)
```bash
cp ../icon.png icon_alt1.png
cp ../icon.png icon_alt2.png
cp ../icon.png icon_alt3.png
```

### Option 2: Create Your Own Designs
1. Design 3 different versions of your app icon
2. Export each as 1024x1024 PNG
3. Save them here with the exact filenames above

## Icon Guidelines

- Must follow [Apple's App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- No transparency/alpha channel
- No text about pricing or "NEW"
- Square aspect ratio (1024x1024)
- High quality, sharp graphics

## How They're Used

1. **During Build**: Expo automatically includes these icons in the iOS binary
2. **In App Store**: Apple uses them for Product Page Optimization A/B tests
3. **For Users**: Apple shows different icons to different users to test which performs better

## What Happens After You Add Icons

1. Run `npx expo prebuild --platform ios --clean`
2. Build your app with `eas build --platform ios`
3. Upload to App Store Connect
4. Create a Product Page Optimization test
5. Select which alternate icons to test
6. Apple handles the rest

## Important Notes

- These icons are **NOT** user-selectable from within the app
- They're only used by Apple for App Store testing
- Your main icon (`../icon.png`) remains the default
- You can test up to 3 alternates at once

For complete setup instructions, see: `../../ALTERNATE_ICONS_SETUP.md`
