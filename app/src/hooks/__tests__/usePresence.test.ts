import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  HEARTBEAT_INTERVAL_SECONDS,
  holdSecondsFor,
  OPEN_HOLD_SECONDS,
  TIMED_GRACE_SECONDS,
  usePresence,
} from '../usePresence';
import type { WorldPeaceApiClient } from '../../api/worldPeace';

function fakeClient(others = 0): WorldPeaceApiClient {
  return {
    increment: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockResolvedValue({ total_today: 0, total_all_time: 0 }),
    startPresence: jest.fn().mockResolvedValue(others),
    endPresence: jest.fn().mockResolvedValue(0),
  };
}

describe('holdSecondsFor', () => {
  it('covers a timed session\'s full declared length plus grace', () => {
    // The whole point of deriving the hold from the duration: a 20-minute
    // session is claimed for 20 minutes, so it needs no heartbeat at all.
    expect(holdSecondsFor(20)).toBe(20 * 60 + TIMED_GRACE_SECONDS);
    expect(holdSecondsFor(3)).toBe(3 * 60 + TIMED_GRACE_SECONDS);
  });

  it('falls back to a short hold for open-ended sessions, which do heartbeat', () => {
    expect(holdSecondsFor('open')).toBe(OPEN_HOLD_SECONDS);
    expect(holdSecondsFor(null)).toBe(OPEN_HOLD_SECONDS);
  });

  it('keeps the open-ended hold longer than the heartbeat interval', () => {
    // Otherwise a single dropped ping would evict someone who is still sitting.
    expect(OPEN_HOLD_SECONDS).toBeGreaterThan(HEARTBEAT_INTERVAL_SECONDS);
  });
});

describe('usePresence', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('announces the session on mount and reports the others count', async () => {
    const client = fakeClient(4);
    const { result } = await renderHook(() => usePresence(10, client));

    await waitFor(() => expect(result.current).toBe(4));
    expect(client.startPresence).toHaveBeenCalledWith(expect.any(String), 10 * 60 + TIMED_GRACE_SECONDS);
  });

  it('ends presence when the session screen unmounts', async () => {
    const client = fakeClient();
    const { unmount } = await renderHook(() => usePresence(10, client));

    await waitFor(() => expect(client.startPresence).toHaveBeenCalled());
    const sessionId = (client.startPresence as jest.Mock).mock.calls[0][0];

    await act(async () => {
      unmount();
    });

    expect(client.endPresence).toHaveBeenCalledWith(sessionId);
  });

  it('does not heartbeat a timed session — its hold already covers the whole sit', async () => {
    jest.useFakeTimers();
    const client = fakeClient();

    await renderHook(() => usePresence(20, client));
    await act(async () => {
      jest.advanceTimersByTime(HEARTBEAT_INTERVAL_SECONDS * 3 * 1000);
    });

    expect(client.startPresence).toHaveBeenCalledTimes(1);
  });

  it('heartbeats an open-ended session, since its end time is unknowable', async () => {
    jest.useFakeTimers();
    const client = fakeClient();

    await renderHook(() => usePresence('open', client));
    await act(async () => {
      jest.advanceTimersByTime(HEARTBEAT_INTERVAL_SECONDS * 2 * 1000);
    });

    expect((client.startPresence as jest.Mock).mock.calls.length).toBeGreaterThan(1);
  });

  it('keeps the same session id across heartbeats', async () => {
    jest.useFakeTimers();
    const client = fakeClient();

    await renderHook(() => usePresence('open', client));
    await act(async () => {
      jest.advanceTimersByTime(HEARTBEAT_INTERVAL_SECONDS * 1000);
    });

    const ids = (client.startPresence as jest.Mock).mock.calls.map((c) => c[0]);
    expect(new Set(ids).size).toBe(1);
  });

  it('leaves the count unknown (null) rather than breaking the sit when the network fails', async () => {
    const client = fakeClient();
    (client.startPresence as jest.Mock).mockRejectedValue(new Error('offline'));

    const { result } = await renderHook(() => usePresence(10, client));

    await waitFor(() => expect(client.startPresence).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('survives an end request that rejects', async () => {
    const client = fakeClient();
    (client.endPresence as jest.Mock).mockRejectedValue(new Error('offline'));

    const { unmount } = await renderHook(() => usePresence(10, client));
    await waitFor(() => expect(client.startPresence).toHaveBeenCalled());

    await expect(
      act(async () => {
        unmount();
      })
    ).resolves.not.toThrow();
  });
});
