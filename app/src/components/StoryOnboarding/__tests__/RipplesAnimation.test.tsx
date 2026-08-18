import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import RipplesAnimation from '../RipplesAnimation';

describe('RipplesAnimation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders every source and its ripples', async () => {
    await render(<RipplesAnimation />);

    for (let source = 0; source < 3; source += 1) {
      expect(screen.getByTestId(`source-${source}`)).toBeTruthy();
      expect(screen.getByTestId(`ripple-${source}-0`)).toBeTruthy();
      expect(screen.getByTestId(`ripple-${source}-1`)).toBeTruthy();
    }
  });

  it('runs the ripple timeline and a pulse per source when reduce motion is off', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loopSpy = jest.spyOn(Animated, 'loop');
    const timingSpy = jest.spyOn(Animated, 'timing');

    await render(<RipplesAnimation />);

    // One looped pulse per source; the ripple timeline restarts itself instead.
    await waitFor(() => expect(loopSpy).toHaveBeenCalledTimes(3));
    expect(
      timingSpy.mock.calls.some(([, config]) => config.duration === 9000),
    ).toBe(true);
  });

  it('holds a still image instead of animating when the system reports reduce motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const loopSpy = jest.spyOn(Animated, 'loop');

    await render(<RipplesAnimation />);

    await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
    expect(loopSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('ripple-0-0')).toBeTruthy();
  });
});
