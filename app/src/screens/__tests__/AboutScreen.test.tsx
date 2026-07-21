import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AboutScreen from '../AboutScreen';

describe('AboutScreen', () => {
  it('shows the privacy promise, the practice explanation, and the version footer', async () => {
    const dispatch = jest.fn();
    await render(<AboutScreen dispatch={dispatch} />);

    expect(screen.getByText('Privacy, simply')).toBeTruthy();
    expect(screen.getByText('No accounts. No location. No personal data, ever.')).toBeTruthy();
    expect(screen.getByText('About the practice')).toBeTruthy();
    expect(screen.getByText('v1.0 · made for a shared field of practice')).toBeTruthy();
  });

  it('dispatches BACK when the back arrow is tapped', async () => {
    const dispatch = jest.fn();
    await render(<AboutScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'BACK' });
  });
});
