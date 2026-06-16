require('dotenv').config();
const apiKey = process.env.API_KEY;
console.log("API_KEY from .env:", apiKey);

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
});

// require('dotenv').config();
// console.log("API_KEY from .env:", process.env.API_KEY); // should print your key
// require('esbuild').build({
//   entryPoints: ['background.js'],
//   bundle: true,
//   outfile: 'dist/background.bundle.js',
//   platform: 'browser',
//   format: 'esm',
//   loader: { '.wasm': 'file' },
//   external: ['chrome'],
//   define: {
//     'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
//   }
// });