// require('dotenv').config();
// const apiKey = process.env.API_KEY;

// require('esbuild').build({
//   entryPoints: ['background.js'],
//   bundle: true,
//   outfile: 'dist/background.bundle.js',
//   platform: 'browser',
//   format: 'esm',
//   loader: { '.wasm': 'file' },
//   external: ['chrome'],
//   define: {
//     'API_KEY': JSON.stringify(apiKey)
//   }
// });


require('dotenv').config();
const apiKey = process.env.API_KEY;
const fs = require('fs');
const path = require('path');

// 1. Compile the JavaScript code bundle with esbuild
require('esbuild').build({
  entryPoints: ['background.js'],
  bundle: true,
  outfile: 'dist/background.bundle.js',
  platform: 'browser',
  format: 'esm',
  loader: { '.wasm': 'file' },
  external: ['chrome'],
  define: {
    'API_KEY': JSON.stringify(apiKey)
  }
}).then(() => {
  console.log('esbuild packaging complete!');
  
  // haandle copying tokenizer assets right after esbuild finishes
  try {
    const srcDir = path.join(__dirname, 'models', 'gemma');
    const destDir = path.join(__dirname, 'dist', 'models', 'gemma');

    // Create the destination directory recursively if it doesn't exist
    fs.mkdirSync(destDir, { recursive: true });

    // Files that MUST exist in your source directory
    const filesToCopy = ['tokenizer.json', 'tokenizer_config.json'];

    filesToCopy.forEach(file => {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);

      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Asset copied successfully: dist/models/gemma/${file}`);
      } else {
        console.warn(`Warning: Source file missing at ${srcFile}. Did you download it yet?`);
      }
    });

  } catch (err) {
    console.error('Failed to copy tokenizer configurations:', err);
  }
}).catch(() => process.exit(1));
