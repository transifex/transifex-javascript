const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: glob.sync(path.join(__dirname, 'tests/*.test.js')),
  output: {
    path: path.resolve(__dirname, 'test_dist'),
    filename: 'core.js',
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin()
  ],
}
