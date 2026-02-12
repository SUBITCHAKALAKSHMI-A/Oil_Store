const sharp = require('sharp');

const inPath = process.argv[2];
const outPath = process.argv[3] || inPath.replace(/\.png$/i, '.jpg');

if (!inPath) {
  console.error('Usage: node convert-image.cjs <input.png> [output.jpg]');
  process.exit(1);
}

sharp(inPath)
  .jpeg({ quality: 90 })
  .toFile(outPath)
  .then(() => console.log('Converted', outPath))
  .catch(err => {
    console.error('Conversion failed:', err.message);
    process.exit(1);
  });
