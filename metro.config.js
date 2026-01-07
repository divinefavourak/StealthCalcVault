const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        extraNodeModules: {
            crypto: require.resolve('expo-crypto'),
            stream: require.resolve('readable-stream'),
        },
        resolverMainFields: ['react-native', 'browser', 'main'],
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
