import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import LaunchScreen from '../LaunchScreen';

describe('LaunchScreen', () => {
  it('shows the title, subtitle, and Begin CTA, and dispatches BEGIN when tapped', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    expect(screen.getByText('Maharishi Meditation')).toBeTruthy();
    expect(screen.getByText('A shared meditation for World Peace.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Begin' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'BEGIN' });
  });

  it('dispatches OPEN_ABOUT when the info affordance is tapped', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'About' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_ABOUT' });
  });
});
