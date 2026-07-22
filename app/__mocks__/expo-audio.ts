// Manual mock for expo-audio, wired in via jest's moduleNameMapper
// (package.json). expo-audio's real module registers a native turbo module at
// import time, which doesn't exist in the Jest/Node environment — every test
// that renders anything importing useAmbientLoop (SessionScreen, and
// transitively App) needs this, not just the hook's own unit test.

export const mockAudioPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  loop: false,
};

/** Call between tests so call counts and `loop` don't leak across cases. */
export function resetMockAudioPlayer() {
  mockAudioPlayer.play.mockClear();
  mockAudioPlayer.pause.mockClear();
  mockAudioPlayer.loop = false;
}

export const useAudioPlayer = jest.fn(() => mockAudioPlayer);
