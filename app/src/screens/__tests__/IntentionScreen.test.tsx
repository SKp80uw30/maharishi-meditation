import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IntentionScreen from '../IntentionScreen';
import * as worldPeaceModule from '../../api/worldPeace';

jest.mock('../../api/worldPeace');

describe('IntentionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
