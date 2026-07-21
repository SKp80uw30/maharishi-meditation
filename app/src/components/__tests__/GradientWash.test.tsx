import React from 'react';
import { render } from '@testing-library/react-native';
import GradientWash from '../GradientWash';

describe('GradientWash', () => {
  it('renders the glow variant without throwing', async () => {
    await expect(render(<GradientWash kind="glow" />)).resolves.not.toThrow();
  });

  it('renders the duskGlow variant without throwing', async () => {
    await expect(render(<GradientWash kind="duskGlow" />)).resolves.not.toThrow();
  });
});
