/* Assert that the built bundles start with the `"use client"` directive.
 *
 * The build relies on scripts/add-use-client.js to prepend the directive to the
 * emitted bundles. This guard fails the build/test if the directive is missing
 * (e.g. the post-build step was removed, or a bundler upgrade changed the dist
 * output), which would otherwise silently break Next.js App Router consumers
 * with a "needs to be a Client Component" error. */

const fs = require('fs');
const path = require('path');
const DIRECTIVE = require('./use-client-directive');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const FILES = ['index.js', 'index.modern.js'];

const errors = [];

FILES.forEach((file) => {
  const filePath = path.join(DIST_DIR, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`dist/${file} does not exist (was the build run?)`);
    return;
  }

  const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0].trim();
  if (firstLine !== DIRECTIVE) {
    errors.push(`dist/${file} is missing the "use client" directive (found: ${JSON.stringify(firstLine)})`);
  }
});

if (errors.length) {
  // eslint-disable-next-line no-console
  console.error(`"use client" check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('"use client" directive present in all dist bundles');
