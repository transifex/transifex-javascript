const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/transifexApi.js',
  output: {
    filename: 'transifexApi.js',
    path: path.resolve(__dirname, 'bundle'),
    library: {
      name: 'transifexApi',
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
