const { DefinePlugin } = require('webpack');
const { version } = require('./package.json');

module.exports = {
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
  ],
};
