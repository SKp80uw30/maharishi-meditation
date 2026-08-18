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

  it('loops the ripple and pulse animations when reduce motion is off', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loopSpy = jest.spyOn(Animated, 'loop');

    await render(<RipplesAnimation />);

    // One master timeline for the ripples, plus a pulse per source.
    await waitFor(() => expect(loopSpy).toHaveBeenCalledTimes(4));
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
