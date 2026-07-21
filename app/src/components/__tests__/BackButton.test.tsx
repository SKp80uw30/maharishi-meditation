import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import BackButton from '../BackButton';

describe('BackButton', () => {
  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<BackButton onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
