const fs = require('fs');
const path = require('path');

// A minimal valid 1x1 PNG in base64 (blue pixel)
// This will be used as a placeholder - replace with actual icons later
const bluePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const whitePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const blackPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=';

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const icons = [
  { name: 'icon.png', base64: bluePngBase64 },
  { name: 'android-icon-foreground.png', base64: bluePngBase64 },
  { name: 'android-icon-background.png', base64: whitePngBase64 },
  { name: 'android-icon-monochrome.png', base64: blackPngBase64 },
  { name: 'favicon.png', base64: bluePngBase64 },
  { name: 'splash-icon.png', base64: bluePngBase64 },
];

console.log('Creating placeholder icon files...\n');

icons.forEach(({ name, base64 }) => {
  const buffer = Buffer.from(base64, 'base64');
  const filePath = path.join(assetsDir, name);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Created ${name}`);
});

console.log('\n⚠️  Note: Minimal 1x1 PNG placeholders created.');
console.log('   For production, replace these with proper app icons.');
console.log('   Recommended tools:');
console.log('   - https://icon.kitchen/');
console.log('   - https://www.appicon.co/');
console.log('   - https://expo.dev/tools\n');
