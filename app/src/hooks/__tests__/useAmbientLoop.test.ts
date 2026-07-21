import { renderHook } from '@testing-library/react-native';
import { mockAudioPlayer, resetMockAudioPlayer } from '../../../__mocks__/expo-audio';
import { useAmbientLoop } from '../useAmbientLoop';

describe('useAmbientLoop', () => {
  beforeEach(() => {
    resetMockAudioPlayer();
  });

  it('enables looping and plays when active', async () => {
    await renderHook(() => useAmbientLoop(true));
    expect(mockAudioPlayer.loop).toBe(true);
    expect(mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockAudioPlayer.pause).not.toHaveBeenCalled();
  });

  it('does not play (pauses instead) when inactive from the start', async () => {
    await renderHook(() => useAmbientLoop(false));
    expect(mockAudioPlayer.pause).toHaveBeenCalledTimes(1);
    expect(mockAudioPlayer.play).not.toHaveBeenCalled();
  });

  it('pauses when `active` flips from true to false (e.g. the sound toggle turning off)', async () => {
    const { rerender } = await renderHook(({ active }: { active: boolean }) => useAmbientLoop(active), {
      initialProps: { active: true },
    });
    expect(mockAudioPlayer.play).toHaveBeenCalledTimes(1);

    await rerender({ active: false });
    expect(mockAudioPlayer.pause).toHaveBeenCalledTimes(1);
  });
});
