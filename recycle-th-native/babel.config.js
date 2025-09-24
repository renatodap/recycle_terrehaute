module.exports = function (api) {
  api.cache(true);

  const isTest = api.env('test');

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Only include reanimated plugin when not testing
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};