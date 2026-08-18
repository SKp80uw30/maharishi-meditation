import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IntentionScreen from '../IntentionScreen';
import * as worldPeaceModule from '../../api/worldPeace';
import { hasSeenStory, markStorySeen } from '../../storage/storyProgress';

jest.mock('../../api/worldPeace');

const renderScreen = (dispatch = jest.fn()) =>
  render(
    <SafeAreaProvider>
      <IntentionScreen dispatch={dispatch} />
    </SafeAreaProvider>
  );

describe('IntentionScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    // These cases are about the intention card itself, so they run as a
    // returning visitor. Without this the story opens over the screen on mount
    // and its own copy (Beat 1 mentions "400 meditators") collides with the
    // assertions below.
    await markStorySeen();
    (worldPeaceModule.worldPeaceApi.getStats as jest.Mock).mockResolvedValue({
      total_today: 100,
      total_all_time: 5000,
      current_active_estimate: 3,
    });
  });

  it('shows the fixed World Peace intention with active meditator count', async () => {
    const dispatch = jest.fn();
    await render(
      <SafeAreaProvider>
        <IntentionScreen dispatch={dispatch} />
      </SafeAreaProvider>
    );

    expect(screen.getByText("Today's intention")).toBeTruthy();
    expect(screen.getByText('World Peace & Non-violence')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('meditators')).toBeTruthy();
    });
  });

  it('hides the meditator count entirely when the API gives no active estimate', async () => {
    (worldPeaceModule.worldPeaceApi.getStats as jest.Mock).mockResolvedValue({
      total_today: 100,
      total_all_time: 5000,
      // current_active_estimate deliberately absent — it's optional in the
      // contract, and a literal "0 meditators" would undercut the premise.
    });
    const dispatch = jest.fn();
    await render(
      <SafeAreaProvider>
        <IntentionScreen dispatch={dispatch} />
      </SafeAreaProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/meditators?/)).toBeNull();
    });
  });

  it('hides the meditator count when the estimate is a real zero', async () => {
    (worldPeaceModule.worldPeaceApi.getStats as jest.Mock).mockResolvedValue({
      total_today: 100,
      total_all_time: 5000,
      // A routine reading — the backend's active-session set drains after 30
      // minutes — but "0 meditators" would contradict the copy beside it.
      current_active_estimate: 0,
    });
    const dispatch = jest.fn();
    await render(
      <SafeAreaProvider>
        <IntentionScreen dispatch={dispatch} />
      </SafeAreaProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/meditators?/)).toBeNull();
    });
  });

  it('dispatches CONTINUE on the CTA', async () => {
    const dispatch = jest.fn();
    await render(
      <SafeAreaProvider>
        <IntentionScreen dispatch={dispatch} />
      </SafeAreaProvider>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Begin your session' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'CONTINUE' });
  });

  it('dispatches BACK when the back arrow is tapped', async () => {
    const dispatch = jest.fn();
    await render(
      <SafeAreaProvider>
        <IntentionScreen dispatch={dispatch} />
      </SafeAreaProvider>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'BACK' });
  });
});

describe('IntentionScreen story onboarding', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (worldPeaceModule.worldPeaceApi.getStats as jest.Mock).mockResolvedValue({
      total_today: 100,
      total_all_time: 5000,
      current_active_estimate: 3,
    });
  });

  it('opens the story by itself on a first ever visit', async () => {
    await renderScreen();

    await waitFor(() => expect(screen.getByTestId('story-onboarding')).toBeTruthy());
  });

  it('leaves the story closed for someone who has already been shown it', async () => {
    await markStorySeen();

    await renderScreen();

    // Give the storage check the same chance to resolve as the opening case.
    await waitFor(() => expect(hasSeenStory()).resolves.toBe(true));
    expect(screen.queryByTestId('story-onboarding')).toBeNull();
  });

  it('records the story as shown once dismissed, including by skipping', async () => {
    await renderScreen();
    await waitFor(() => expect(screen.getByTestId('story-onboarding')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'Skip story' }));

    expect(screen.queryByTestId('story-onboarding')).toBeNull();
    await waitFor(() => expect(hasSeenStory()).resolves.toBe(true));
  });

  it('still opens the story from "Go deeper" after it has been seen', async () => {
    await markStorySeen();
    await renderScreen();
    expect(screen.queryByTestId('story-onboarding')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Read the full story'));

    expect(screen.getByTestId('story-onboarding')).toBeTruthy();
  });
});
