const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'browser.core.js',
    library: 'Transifex',
    libraryTarget: 'umd',
  },
  target: 'web',
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
}
