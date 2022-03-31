const path = require('path');
const glob = require('glob');
const { DefinePlugin, IgnorePlugin } = require('webpack');
const { version } = require('./package.json');

module.exports = {
  mode: 'development',
  entry: glob.sync(path.join(__dirname, 'tests/*.test.js')),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.dom.js',
  },
  target: 'node',
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(version),
      __PLATFORM__: JSON.stringify('test'),
    }),
    new IgnorePlugin(/canvas/, /commonjs$/),
  ],
};
