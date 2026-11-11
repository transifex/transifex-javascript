const path = require('path');
const { builtinModules } = require('module');
const { DefinePlugin } = require('webpack');
const { version } = require('./package.json');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
    filename: 'node.native.js',
    library: 'transifex',
    libraryTarget: 'umd',
  },
  target: 'node',
  // Keep Node built-ins external, as target 'node' does, except punycode:
  // cross-fetch -> node-fetch@2 -> tr46 requires it, and Node 21+ warns
  // (DEP0040) when the deprecated core module loads. Bundling the userland
  // punycode package, the same library, avoids the warning.
  externalsPresets: { node: false },
  externals: [
    ({ request }, callback) => {
      const name = request.replace(/^node:/, '');
      if (name === 'punycode') return callback();
      if (request.startsWith('node:') || builtinModules.includes(name)) {
        return callback(null, `node-commonjs ${request}`);
      }
      return callback();
    },
  ],
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(version),
      __PLATFORM__: JSON.stringify('node'),
    }),
  ],
  module: {
    rules: [],
  },
};
