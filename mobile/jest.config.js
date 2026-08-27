module.exports = {
  ...require('jest-expo/jest-preset'),
  // Setup de react-native-reanimated/worklets (issue #85). Detalle en
  // ./jest-setup.js.
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
