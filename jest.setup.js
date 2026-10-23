/* eslint-env jest */
const {
  createJSReanimatedModule,
} = require('react-native-reanimated/lib/module/ReanimatedModule/js-reanimated/JSReanimated');
const proto = createJSReanimatedModule().constructor.prototype;
proto.setCSSEventHandler = () => {};
proto.registerCSSKeyframes = () => {};
proto.unregisterCSSKeyframes = () => {};
proto.applyCSSAnimations = () => {};
proto.unregisterCSSAnimations = () => {};

require('react-native-gesture-handler/jestSetup');
require('react-native-reanimated').setUpTests();

// Mock async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest')
);
