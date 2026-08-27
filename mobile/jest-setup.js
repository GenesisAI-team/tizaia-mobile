/* global jest */
// Setup global de Jest para el proyecto (issue #85).
//
// react-native-reanimated no dispone de runtime nativo en Jest. Según la
// documentación oficial de Reanimated (testing-with-jest) y de
// react-native-worklets, se debe:
//   1. Configurar el entorno de pruebas de Reanimated con setUpTests().
//   2. Sustituir react-native-worklets por su mock oficial (el import de
//      WorkletsModule/NativeWorklets.native.ts falla sin runtime nativo).
require('react-native-reanimated').setUpTests();

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);
