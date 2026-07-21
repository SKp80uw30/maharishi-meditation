import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import DurationScreen from '../DurationScreen';
import { initialState } from '../../state/appReducer';

describe('DurationScreen', () => {
  it('shows all five options and dispatches SELECT_DURATION for a fixed duration', async () => {
    const dispatch = jest.fn();
    await render(<DurationScreen state={{ ...initialState, screen: 'duration' }} dispatch={dispatch} />);

    for (const label of ['3', '5', '10', '20', 'Open']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }

    await fireEvent.press(screen.getByRole('button', { name: '10' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SELECT_DURATION', duration: 10 });
  });

  it('dispatches SELECT_DURATION with "open" for the Open tile', async () => {
    const dispatch = jest.fn();
    await render(<DurationScreen state={{ ...initialState, screen: 'duration' }} dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Open' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SELECT_DURATION', duration: 'open' });
  });

  it('marks the currently chosen duration as selected', async () => {
    const dispatch = jest.fn();
    await render(<DurationScreen state={{ ...initialState, screen: 'duration', duration: 5 }} dispatch={dispatch} />);

    expect(screen.getByRole('button', { name: '5' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('button', { name: '10' }).props.accessibilityState.selected).toBe(false);
  });

  it('dispatches START_SESSION on "Begin meditation" and BACK on the back arrow', async () => {
    const dispatch = jest.fn();
    await render(<DurationScreen state={{ ...initialState, screen: 'duration', duration: 20 }} dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Begin meditation' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'START_SESSION' });

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'BACK' });
  });
});
