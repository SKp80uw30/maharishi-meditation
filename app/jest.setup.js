// react-native-safe-area-context's native provider never delivers insets under
// Jest, so a real <SafeAreaProvider> renders null (hiding the whole tree) and
// useSafeAreaInsets() throws without one. The library ships an official mock
// (zero insets, plain Views) for exactly this — apply it globally.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

// AsyncStorage's native module doesn't exist under Jest, so every call rejects.
// The library ships an in-memory mock for this; it starts empty in each suite,
// which is exactly the "first ever launch" state the story onboarding keys off.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
