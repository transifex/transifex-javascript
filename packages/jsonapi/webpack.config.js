const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'node.jsonapi.js',
      library: 'jsonapi',
      libraryTarget: 'umd',
    },
    target: 'node',
    devtool: 'source-map',
  },
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'browser.jsonapi.js',
      library: 'jsonapi',
      libraryTarget: 'umd',
    },
    target: 'web',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
  },
];
