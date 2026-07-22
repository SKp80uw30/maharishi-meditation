import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import SessionScreen from '../SessionScreen';
import { initialState } from '../../state/appReducer';
import { mockAudioPlayer, resetMockAudioPlayer } from '../../../__mocks__/expo-audio';

async function advanceSeconds(n: number) {
  for (let i = 0; i < n; i++) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  }
}

describe('SessionScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetMockAudioPlayer();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows a counting-down clock and "World Peace" caption in timed mode, "End early" CTA', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 1 }} dispatch={dispatch} />
    );

    expect(screen.getByText('01:00')).toBeTruthy();
    expect(screen.getByText('World Peace')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'End early' })).toBeTruthy();

    await advanceSeconds(1);
    expect(screen.getByText('00:59')).toBeTruthy();
  });

  it('auto-dispatches FINISH_SESSION when a timed session reaches 0:00', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 1 }} dispatch={dispatch} />
    );

    await advanceSeconds(60);
    expect(screen.getByText('00:00')).toBeTruthy();
    expect(dispatch).toHaveBeenCalledWith({ type: 'FINISH_SESSION' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('shows a counting-up clock and "Open session" caption, "End session" CTA, and never auto-finishes', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 'open' }} dispatch={dispatch} />
    );

    expect(screen.getByText('00:00')).toBeTruthy();
    expect(screen.getByText('Open session')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'End session' })).toBeTruthy();

    await advanceSeconds(90);
    expect(screen.getByText('01:30')).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches END_SESSION_EARLY when the end button is tapped', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 5 }} dispatch={dispatch} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'End early' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'END_SESSION_EARLY' });
  });

  it('dispatches TOGGLE_SOUND and reflects sound state in the supporting copy', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 5, soundOn: true }} dispatch={dispatch} />
    );

    expect(screen.getByText(/A gentle ambient tone plays as you go\./)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Sound on' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_SOUND' });
  });

  it('omits the ambient-tone line when sound is off', async () => {
    const dispatch = jest.fn();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 5, soundOn: false }} dispatch={dispatch} />
    );

    expect(screen.queryByText(/A gentle ambient tone plays as you go\./)).toBeNull();
    expect(screen.getByRole('button', { name: 'Sound off' })).toBeTruthy();
  });

  it('actually plays the ambient loop when soundOn is true, and pauses (not plays) when false', async () => {
    const dispatch = jest.fn();
    const { unmount } = await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 5, soundOn: true }} dispatch={dispatch} />
    );
    expect(mockAudioPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockAudioPlayer.pause).not.toHaveBeenCalled();
    await unmount();

    resetMockAudioPlayer();
    await render(
      <SessionScreen state={{ ...initialState, screen: 'session', duration: 5, soundOn: false }} dispatch={dispatch} />
    );
    expect(mockAudioPlayer.pause).toHaveBeenCalledTimes(1);
    expect(mockAudioPlayer.play).not.toHaveBeenCalled();
  });
});
