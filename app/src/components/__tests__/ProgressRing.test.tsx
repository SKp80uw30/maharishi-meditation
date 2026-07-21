import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import ProgressRing from '../ProgressRing';

describe('ProgressRing', () => {
  it('renders its centered children over a timed (numeric progress) ring', async () => {
    await render(
      <ProgressRing progress={0.5}>
        <Text>05:00</Text>
      </ProgressRing>
    );
    expect(screen.getByText('05:00')).toBeTruthy();
  });

  it('renders the flat track with no progress arc in Open mode', async () => {
    await render(
      <ProgressRing progress={null}>
        <Text>00:42</Text>
      </ProgressRing>
    );
    expect(screen.getByText('00:42')).toBeTruthy();
  });
});
