import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import IntentionScreen from '../IntentionScreen';

describe('IntentionScreen', () => {
  it('shows the fixed World Peace intention and dispatches CONTINUE on the CTA', async () => {
    const dispatch = jest.fn();
    await render(<IntentionScreen dispatch={dispatch} />);

    expect(screen.getByText("Today's intention")).toBeTruthy();
    expect(screen.getByText('World Peace & Non-violence')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Begin your session' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'CONTINUE' });
  });

  it('dispatches BACK when the back arrow is tapped', async () => {
    const dispatch = jest.fn();
    await render(<IntentionScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'BACK' });
  });
});
