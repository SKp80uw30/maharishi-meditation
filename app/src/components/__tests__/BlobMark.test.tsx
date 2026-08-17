import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import BlobMark from '../BlobMark';

describe('BlobMark', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without throwing at the default (glowing, 120px) size', async () => {
    await render(<BlobMark />);
    expect(screen.getByTestId('blob-mark')).toBeTruthy();
  });

  it('renders without throwing at a custom size with glow disabled', async () => {
    await render(<BlobMark size={64} glow={false} />);
    expect(screen.getByTestId('blob-mark')).toBeTruthy();
  });

  it('runs the breathing animation when breathing is on and reduce motion is off', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const sequenceSpy = jest.spyOn(Animated, 'sequence');

    await render(<BlobMark breathing />);

    await waitFor(() => expect(sequenceSpy).toHaveBeenCalled());
  });

  it('skips the breathing animation entirely when the system reports reduce motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const sequenceSpy = jest.spyOn(Animated, 'sequence');

    await render(<BlobMark breathing />);

    // Give the async reduce-motion check time to resolve and the effect to re-run.
    await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
    expect(sequenceSpy).not.toHaveBeenCalled();
  });
});
