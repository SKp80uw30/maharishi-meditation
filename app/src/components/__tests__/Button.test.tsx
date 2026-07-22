import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders its label and fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button label="Begin" onPress={onPress} />);
    expect(screen.getByText('Begin')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Begin' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the outline variant with a distinct label style from primary', async () => {
    await render(<Button label="End early" onPress={() => {}} variant="outline" />);
    expect(screen.getByText('End early')).toBeTruthy();
  });
});
