const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'jsonapi.js',
    path: path.resolve(__dirname, 'bundle'),
    library: {
      name: 'jsonapi',
      type: 'umd',
    },
    globalObject: 'this',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: 'babel-loader',
      },
    ],
  },
  devtool: 'source-map',
};
