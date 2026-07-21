import { act, renderHook } from '@testing-library/react-native';
import { useSessionTimer, formatClock } from '../useSessionTimer';

/** Advances fake timers one second at a time (rather than one big jump), each
 * wrapped in its own act() — mirrors how real, separately-scheduled
 * setInterval ticks actually commit in production, one render/effect cycle
 * per second. */
async function advanceSeconds(n: number) {
  for (let i = 0; i < n; i++) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  }
}

describe('useSessionTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a timed session at duration*60 with progress 0', async () => {
    const { result } = await renderHook(() => useSessionTimer({ duration: 1, onFinish: jest.fn() }));
    expect(result.current.seconds).toBe(60);
    expect(result.current.progress).toBe(0);
  });

  it('counts a timed session down one tick per second and updates progress', async () => {
    const { result } = await renderHook(() => useSessionTimer({ duration: 1, onFinish: jest.fn() }));

    await advanceSeconds(1);
    expect(result.current.seconds).toBe(59);

    await advanceSeconds(29);
    expect(result.current.seconds).toBe(30);
    expect(result.current.progress).toBeCloseTo(0.5);
  });

  it('reaches 0:00 and fires onFinish exactly once, never again on further ticks', async () => {
    const onFinish = jest.fn();
    const { result } = await renderHook(() => useSessionTimer({ duration: 1, onFinish }));

    await advanceSeconds(60);
    expect(result.current.seconds).toBe(0);
    expect(result.current.progress).toBe(1);
    expect(onFinish).toHaveBeenCalledTimes(1);

    await advanceSeconds(5);
    expect(result.current.seconds).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('counts an Open session up indefinitely with no progress total and never fires onFinish', async () => {
    const onFinish = jest.fn();
    const { result } = await renderHook(() => useSessionTimer({ duration: 'open', onFinish }));

    expect(result.current.seconds).toBe(0);
    expect(result.current.progress).toBeNull();

    await advanceSeconds(42);
    expect(result.current.seconds).toBe(42);
    expect(result.current.progress).toBeNull();
    expect(onFinish).not.toHaveBeenCalled();
  });
});

describe('formatClock', () => {
  it('formats seconds as zero-padded MM:SS', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(600)).toBe('10:00');
  });
});
