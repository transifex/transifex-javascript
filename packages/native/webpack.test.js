const path = require('path');
const glob = require('glob');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  entry: glob.sync(path.join(__dirname, 'tests/*.test.js')),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.native.js',
  },
  target: 'node',
  devtool: 'source-map',
});
