import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import ScreenContainer from '../ScreenContainer';

describe('ScreenContainer', () => {
  it('renders its children in the light (default) variant', async () => {
    await render(
      <ScreenContainer>
        <Text>content</Text>
      </ScreenContainer>
    );
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('renders in the dark variant with a duskGlow wash without throwing', async () => {
    await render(
      <ScreenContainer variant="dark" wash="duskGlow">
        <Text>session</Text>
      </ScreenContainer>
    );
    expect(screen.getByText('session')).toBeTruthy();
  });
});
