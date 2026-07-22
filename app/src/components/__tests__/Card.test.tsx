import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import Card from '../Card';

describe('Card', () => {
  it('renders its children', async () => {
    await render(
      <Card>
        <Text>World Peace & Non-violence</Text>
      </Card>
    );
    expect(screen.getByText('World Peace & Non-violence')).toBeTruthy();
  });
});
