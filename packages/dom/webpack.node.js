const path = require('path');
const { DefinePlugin } = require('webpack');
const { version } = require('./package.json');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'node.dom.js',
    library: 'transifexDOM',
    libraryTarget: 'umd',
  },
  target: 'node',
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
