const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'assets', 'profile-photo.jpg');
const outputPath = path.join(__dirname, 'src', 'assets', 'profile-photo-optimized.jpg');

console.log('Optimizing profile photo...');
console.log('Input:', inputPath);

// Get original file size
const originalSize = fs.statSync(inputPath).size;
console.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);

sharp(inputPath)
  .resize(512, 512, {
    fit: 'cover',
    position: 'top'
  })
  .jpeg({
    quality: 80,
    progressive: true,
    mozjpeg: true
  })
  .toFile(outputPath)
  .then(info => {
    const newSize = fs.statSync(outputPath).size;
    console.log(`Optimized size: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`Savings: ${((originalSize - newSize) / 1024).toFixed(2)} KB (${((1 - newSize/originalSize) * 100).toFixed(1)}%)`);
    console.log('\nOptimized image saved as: profile-photo-optimized.jpg');
    console.log('\nNow replacing the original file...');
    
    // Backup original
    fs.copyFileSync(inputPath, inputPath.replace('.jpg', '-backup.jpg'));
    console.log('Original backed up as: profile-photo-backup.jpg');
    
    // Replace original with optimized
    fs.copyFileSync(outputPath, inputPath);
    console.log('Original file replaced with optimized version!');
    
    // Clean up
    fs.unlinkSync(outputPath);
    console.log('\n✅ Done! Profile photo optimized successfully!');
  })
  .catch(err => {
    console.error('Error optimizing image:', err);
  });
