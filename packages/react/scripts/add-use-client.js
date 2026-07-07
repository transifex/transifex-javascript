/* Prepend the React Server Components `"use client"` directive to the built
 * bundles.
 *
 * Every export in this package (components and hooks) relies on client-only
 * React features (useState, useEffect, useContext, createContext), so the whole
 * package is a Client Component boundary. The bundler (microbundle/rollup)
 * strips module-level directives from the source, so we re-add the banner to the
 * emitted bundles here. Without it, importing this package from a Next.js App
 * Router Server Component throws a "needs to be a Client Component" error. */

const fs = require('fs');
const path = require('path');

const DIRECTIVE = '\'use client\';';
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const FILES = ['index.js', 'index.modern.js'];

FILES.forEach((file) => {
  const filePath = path.join(DIST_DIR, file);
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  if (contents.startsWith(DIRECTIVE)) return;

  fs.writeFileSync(filePath, `${DIRECTIVE}\n${contents}`);
  // eslint-disable-next-line no-console
  console.log(`Prepended "use client" to dist/${file}`);
});
