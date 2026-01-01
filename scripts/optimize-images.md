# Image Optimization Guide

## Critical Issue: Massive Image Files

Your current images are **extremely large** and causing major performance issues:

| File | Current Size | Recommended Max |
|------|-------------|-----------------|
| walpaper4.png | 13 MB | < 500 KB |
| walpaper2.jpg | 12 MB | < 500 KB |
| extra2.jpg | 11.8 MB | < 500 KB |
| walpaper3.jpg | 8.8 MB | < 500 KB |
| walpaper1.jpg | 7.2 MB | < 500 KB |
| highres.png | 6.1 MB | < 500 KB |

**Total current size: ~60 MB** → Should be **< 3 MB**

## Quick Fix Options

### Option 1: Use Online Tools (Easiest)
1. Go to https://squoosh.app/ or https://tinypng.com/
2. Upload each image
3. Choose WebP format (best compression)
4. Set quality to 80-85%
5. Resize to max 1920px width for backgrounds
6. Replace the original files

### Option 2: Use Sharp (NPM Package)
```bash
npm install sharp --save-dev
```

Create a script `scripts/optimize.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mediaDir = './public/media';
const outputDir = './public/media/optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(mediaDir).filter(f => 
  /\.(jpg|jpeg|png)$/i.test(f)
);

files.forEach(file => {
  const inputPath = path.join(mediaDir, file);
  const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const outputPath = path.join(outputDir, outputName);
  
  sharp(inputPath)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => console.log(`✓ ${file} → ${outputName}`))
    .catch(err => console.error(`✗ ${file}:`, err));
});
```

Run with: `node scripts/optimize.js`

### Option 3: Use ImageMagick (CLI)
```bash
# Install ImageMagick first, then:
magick convert input.jpg -resize 1920x -quality 80 output.webp
```

## After Optimization

Update your component imports to use `.webp` files:
```jsx
// Before
<img src="/media/walpaper1.jpg" />

// After  
<img src="/media/walpaper1.webp" />
```

Or use picture elements for fallback:
```jsx
<picture>
  <source srcset="/media/walpaper1.webp" type="image/webp" />
  <img src="/media/walpaper1.jpg" alt="..." />
</picture>
```

## Expected Performance Improvement

- **Before**: ~60 MB total images, 10-30s load time on 3G
- **After**: ~2-3 MB total images, 1-3s load time on 3G
- **Improvement**: ~95% reduction in load time
