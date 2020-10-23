const nodeConfig = require('./webpack.node.js');
const browserConfig = require('./webpack.browser.js');

module.exports = [
  nodeConfig,
  browserConfig,
];
