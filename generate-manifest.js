const fs = require('fs');
const path = require('path');

const folder = process.argv[2]; // e.g. "public/assets/SIMPBRICKS"

if (!folder) {
  console.error('Usage: node generate-manifest.js <folder path>');
  process.exit(1);
}

const allowedExtensions = ['.png'];

fs.readdir(folder, (err, files) => {
  if (err) {
    console.error('Failed to read folder:', err);
    process.exit(1);
  }

  const textures = files
    .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
    .map(file => path.basename(file, '.png')) // strip extension

  const manifest = {
    folder: path.basename(folder), // e.g. SIMPBRICKS
    textures
  };

  const outputPath = path.join(folder, 'manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest written to ${outputPath} with ${textures.length} textures.`);
});