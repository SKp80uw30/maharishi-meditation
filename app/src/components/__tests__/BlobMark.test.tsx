import React from 'react';
import { render, screen } from '@testing-library/react-native';
import BlobMark from '../BlobMark';

describe('BlobMark', () => {
  it('renders without throwing at the default (glowing, 120px) size', async () => {
    await render(<BlobMark />);
    expect(screen.getByTestId('blob-mark')).toBeTruthy();
  });

  it('renders without throwing at a custom size with glow disabled', async () => {
    await render(<BlobMark size={64} glow={false} />);
    expect(screen.getByTestId('blob-mark')).toBeTruthy();
  });
});
