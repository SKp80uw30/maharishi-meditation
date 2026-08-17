import { AccessibilityInfo } from 'react-native';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useReducedMotion } from '../useReducedMotion';

describe('useReducedMotion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts as null (unknown) so consumers do not animate prematurely', async () => {
    let initialValue: boolean | null | undefined;
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = await renderHook(() => {
      const value = useReducedMotion();
      if (initialValue === undefined) initialValue = value;
      return value;
    });
    expect(initialValue).toBeNull();
    expect(result.current).toBeNull();
  });

  it('resolves to false when the system reports motion is fine', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const { result } = await renderHook(() => useReducedMotion());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('resolves to true when the system reports reduce motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { result } = await renderHook(() => useReducedMotion());
    await waitFor(() => expect(result.current).toBe(true));
  });
});
