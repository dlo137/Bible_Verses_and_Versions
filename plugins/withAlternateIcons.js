const { withInfoPlist } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add alternate app icons for App Store Product Page Optimization
 *
 * This plugin adds CFBundleAlternateIcons to Info.plist, allowing Apple to use
 * different icons in App Store Connect Product Page Optimization tests.
 *
 * The icons will be included in the .ipa bundle even if not programmatically switchable.
 */
const withAlternateIcons = (config, alternateIcons = []) => {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Create the CFBundleIcons structure if it doesn't exist
    if (!infoPlist.CFBundleIcons) {
      infoPlist.CFBundleIcons = {};
    }

    // Set up the primary app icon
    if (!infoPlist.CFBundleIcons.CFBundlePrimaryIcon) {
      infoPlist.CFBundleIcons.CFBundlePrimaryIcon = {
        CFBundleIconFiles: [
          'AppIcon60x60',
          'AppIcon76x76',
          'AppIcon83.5x83.5',
        ],
        CFBundleIconName: 'AppIcon',
      };
    }

    // Add alternate icons for Product Page Optimization
    if (alternateIcons.length > 0) {
      infoPlist.CFBundleIcons.CFBundleAlternateIcons = {};

      alternateIcons.forEach((iconName) => {
        infoPlist.CFBundleIcons.CFBundleAlternateIcons[iconName] = {
          CFBundleIconFiles: [
            `${iconName}60x60`,
            `${iconName}76x76`,
            `${iconName}83.5x83.5`,
          ],
          UIPrerenderedIcon: false,
        };
      });
    }

    return config;
  });
};

module.exports = withAlternateIcons;
