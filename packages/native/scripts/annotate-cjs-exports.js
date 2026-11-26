/**
 * Adds a CommonJS export-names hint to the top of dist/node.native.js:
 *
 *   0 && (module.exports = { tx, t, createNativeInstance, ... });
 *
 * The line never runs (`0 && ...`). Node.js reads it statically (cjs-module-lexer) when the
 * package is loaded with `import`, so named imports such as
 * `import { createNativeInstance } from '@transifex/native'` work in Node ESM and in Vitest,
 * instead of failing with "Named export not found".
 *
 * There is still a single file, so `require` and `import` share one `tx` instance, and every
 * bundler and test runner resolves exactly the same file as before.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../dist/node.native.js');
const mapPath = `${bundlePath}.map`;
const MARKER = '0 && (module.exports = {';

const bundle = fs.readFileSync(bundlePath, 'utf8');
if (bundle.startsWith(MARKER)) {
  throw new Error('dist/node.native.js is already annotated; run the webpack build first.');
}

// eslint-disable-next-line import/no-dynamic-require
const exportNames = Object.keys(require(bundlePath))
  .filter((name) => name !== '__esModule' && name !== 'default')
  .sort();

fs.writeFileSync(bundlePath, `${MARKER} ${exportNames.join(', ')} });\n${bundle}`);

// The hint adds one line at the top, so shift the source map by one generated line.
if (fs.existsSync(mapPath)) {
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  map.mappings = `;${map.mappings}`;
  fs.writeFileSync(mapPath, JSON.stringify(map));
}

// eslint-disable-next-line no-console
console.log(`node.native.js: annotated ${exportNames.length} named exports`);
