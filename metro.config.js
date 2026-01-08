// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom resolver configuration
config.resolver.extraNodeModules = {
    crypto: require.resolve('expo-crypto'),
    stream: require.resolve('readable-stream'),
};
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
