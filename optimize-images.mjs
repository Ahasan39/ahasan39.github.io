#!/usr/bin/env node

/**
 * Image Optimization Script
 * Compresses and converts images to WebP format for better performance
 * 
 * Usage: node optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSETS_DIR = join(__dirname, 'src', 'assets');
const QUALITY = {
  jpg: 80,
  png: 80,
  webp: 85
};

async function getImageFiles(dir) {
  const files = [];
  const items = await readdir(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      files.push(...await getImageFiles(fullPath));
    } else {
      const ext = extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const baseName = basename(filePath, ext);
  const dirName = dirname(filePath);
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    console.log(`\nOptimizing: ${basename(filePath)}`);
    console.log(`  Original size: ${metadata.width}x${metadata.height}`);
    
    // Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: QUALITY.jpg, progressive: true, mozjpeg: true })
        .toFile(join(dirName, `${baseName}-optimized.jpg`));
      console.log(`  ✓ Created optimized JPG`);
    } else if (ext === '.png') {
      await image
        .png({ quality: QUALITY.png, compressionLevel: 9 })
        .toFile(join(dirName, `${baseName}-optimized.png`));
      console.log(`  ✓ Created optimized PNG`);
    }
    
    // Create WebP version
    await sharp(filePath)
      .webp({ quality: QUALITY.webp })
      .toFile(join(dirName, `${baseName}.webp`));
    console.log(`  ✓ Created WebP version`);
    
    // Create responsive sizes for large images
    if (metadata.width > 800) {
      await sharp(filePath)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY.webp })
        .toFile(join(dirName, `${baseName}-800w.webp`));
      console.log(`  ✓ Created 800w WebP`);
    }
    
    if (metadata.width > 400) {
      await sharp(filePath)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY.webp })
        .toFile(join(dirName, `${baseName}-400w.webp`));
      console.log(`  ✓ Created 400w WebP`);
    }
    
  } catch (error) {
    console.error(`  ✗ Error optimizing ${basename(filePath)}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('================================\n');
  
  try {
    const imageFiles = await getImageFiles(ASSETS_DIR);
    console.log(`Found ${imageFiles.length} images to optimize\n`);
    
    for (const file of imageFiles) {
      // Skip already optimized files
      if (file.includes('-optimized') || file.includes('-800w') || file.includes('-400w')) {
        continue;
      }
      await optimizeImage(file);
    }
    
    console.log('\n✅ Image optimization complete!');
    console.log('\nNext steps:');
    console.log('1. Review the optimized images');
    console.log('2. Replace original images with optimized versions if satisfied');
    console.log('3. Update image imports to use WebP with fallbacks');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
