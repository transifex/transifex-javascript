// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        failSpecWithNoExpectations: true,
      },
      clearContext: true, // Suppresses "full page reload" false positive in Chrome 128+
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/tx-native-angular-sdk'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    reportSlowerThan: 250,
    customLaunchers: {
      AutomatedChrome: {
        base: 'Chrome',
        flags: ['--enable-automation'],
      },
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless=old'],
      },
    },
    singleRun: true,
    restartOnFileChange: false,
    browserDisconnectTolerance: 2,
  });
};
