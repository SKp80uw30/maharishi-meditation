import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LaunchScreen from '../LaunchScreen';

describe('LaunchScreen', () => {
  it('shows the title, story hook, and both CTAs', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    expect(screen.getByText('A meditation for World Peace')).toBeTruthy();
    expect(screen.getByText('One Field')).toBeTruthy();
    expect(
      screen.getByText(
        'In 1973, something unexpected happened in Washington DC. A group of 400 meditators gathered with a single intention: to meditate for peace — then the crime rate fell 16%.'
      )
    ).toBeTruthy();
    expect(
      screen.getByText(
        'This app is designed as an extension of that experiment — continuing it, and expanding on its results.'
      )
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tell me more' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Skip story and get started' })).toBeTruthy();
  });

  it('dispatches BEGIN when "Skip story and get started" is tapped, with no story shown', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    expect(screen.queryByTestId('story-onboarding')).toBeNull();

    await fireEvent.press(screen.getByRole('link', { name: 'Skip story and get started' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'BEGIN' });
    expect(screen.queryByTestId('story-onboarding')).toBeNull();
  });

  it('opens the full story onboarding when "Tell me more" is tapped', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Tell me more' }));

    await waitFor(() => expect(screen.getByTestId('story-onboarding')).toBeTruthy());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches BEGIN when the story onboarding closes, so finishing it reaches Intention', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Tell me more' }));
    await waitFor(() => expect(screen.getByTestId('story-onboarding')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'Skip story' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'BEGIN' });
    expect(screen.queryByTestId('story-onboarding')).toBeNull();
  });

  it('dispatches OPEN_ABOUT when the info affordance is tapped', async () => {
    const dispatch = jest.fn();
    await render(<LaunchScreen dispatch={dispatch} />);

    await fireEvent.press(screen.getByRole('button', { name: 'About' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_ABOUT' });
  });
});
