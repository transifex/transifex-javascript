const path = require('path');

module.exports = [
  {
    mode: 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'node.jsonapi.js',
      library: 'jsonapi',
      libraryTarget: 'umd',
    },
    target: 'node',
    devtool: 'source-map',
  },
  {
    mode: 'development',
    entry: './src/index.js',
    output: {
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
            options: {
              presets: ['@babel/preset-env'],
              plugins: [['@babel/transform-runtime']],
            },
          },
        },
      ],
    },
  },
];
