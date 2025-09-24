const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add CSV file support
config.resolver.assetExts.push('csv');

module.exports = withNativeWind(config, { input: './global.css' });