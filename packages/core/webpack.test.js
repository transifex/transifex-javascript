const path = require('path');
const glob = require('glob');

module.exports = {
  mode: 'development',
  entry: glob.sync(path.join(__dirname, 'tests/*.test.js')),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.core.js',
  },
  target: 'node',
  devtool: 'source-map',
}
