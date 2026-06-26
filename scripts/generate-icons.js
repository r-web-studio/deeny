/**
 * generate-icons.js
 *
 * Generates all required PWA icon sizes from a single source icon.
 *
 * SETUP:
 *   1. Place your source icon at public/icon-source.png
 *      - The icon should be square and at least 512x512px for best results.
 *   2. Install dependencies:
 *        npm install sharp
 *   3. Run the script:
 *        node scripts/generate-icons.js
 *
 * The script will:
 *   - Create public/icons/ if it doesn't exist
 *   - Resize the source icon into every required size (72, 96, 128, 144, 152, 192, 384, 512)
 *   - Output them as public/icons/icon-{size}x{size}.png
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_PATH = path.join(__dirname, '..', 'public', 'icon-source.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(
      `ERROR: Source icon not found at ${SOURCE_PATH}\n` +
      'Please place your source icon (square, at least 512x512px) at public/icon-source.png before running this script.'
    );
    process.exit(1);
  }

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Generating icons...');

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(SOURCE_PATH)
      .resize(size, size, {
        fit: 'cover',
        position: 'centre',
      })
      .png()
      .toFile(outputPath);

    console.log(`  ✓ Created icon-${size}x${size}.png`);
  }

  console.log(`\nDone! ${ICON_SIZES.length} icons generated in ${OUTPUT_DIR}`);
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
