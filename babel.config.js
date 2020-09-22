'use strict';

module.exports = function (api) {
  const babelConfig = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: ['@babel/plugin-proposal-async-generator-functions'],
  };

  if (api.env('production')) {
    babelConfig.plugins.push('react-native-paper/babel');
  }

  return babelConfig;
};
