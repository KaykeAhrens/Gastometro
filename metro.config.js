// https://github.com/firebase/firebase-js-sdk/issues/8988
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.unstable_enablePackageExports = false;
module.exports = defaultConfig;
