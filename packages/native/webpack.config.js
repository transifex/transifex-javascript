const nodeConfig = require('./webpack.node');
const browserConfig = require('./webpack.browser');
const reactNativeConfig = require('./webpack.react-native');

module.exports = [
  nodeConfig,
  browserConfig,
  reactNativeConfig,
];
