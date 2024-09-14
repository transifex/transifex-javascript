const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: './src/wordsmithApi.js',
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'node.wordsmithApi.js',
      library: 'wordsmithApi',
      libraryTarget: 'umd',
    },
    target: 'node',
    devtool: 'source-map',
  },
  {
    mode: 'production',
    entry: './src/wordsmithApi.js',
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'browser.wordsmithApi.js',
      library: 'wordsmithApi',
      libraryTarget: 'umd',
    },
    target: 'web',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|dist)/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
  },
];
