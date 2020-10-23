const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'node.native.js',
    library: 'transifex',
    libraryTarget: 'umd',
  },
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              cache: true,
              configFile: '.eslintrc.json',
              formatter: 'eslint-formatter-pretty',
              emitWarning: true,
              failOnError: true,
            },
            loader: 'eslint-loader',
          },
        ],
      },
    ],
  },
});
