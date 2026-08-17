// react-native-safe-area-context's native provider never delivers insets under
// Jest, so a real <SafeAreaProvider> renders null (hiding the whole tree) and
// useSafeAreaInsets() throws without one. The library ships an official mock
// (zero insets, plain Views) for exactly this — apply it globally.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);
