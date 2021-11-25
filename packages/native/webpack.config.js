const nodeConfig = require('./webpack.node');
const browserConfig = require('./webpack.browser');

module.exports = [
  nodeConfig,
  browserConfig,
];
