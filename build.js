require('dotenv').config();
const apiKey = process.env.API_KEY;

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