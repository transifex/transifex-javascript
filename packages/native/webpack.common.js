const { DefinePlugin } = require('webpack');

const { version } = require('./package.json');

const commonConfig = {
  plugins: [
    new DefinePlugin({
      VERSION: JSON.stringify(version),
    }),
  ],
};

module.exports = {
  mergeCommon: (webpackConfig) => {
    const mergeConfig = {
      ...commonConfig,
      ...webpackConfig,
    };
    return mergeConfig;
  },
};
