import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import StatsScreen from '../StatsScreen';
import { initialState } from '../../state/appReducer';
import { createMockWorldPeaceApi, WorldPeaceApiClient } from '../../api/worldPeace';

describe('StatsScreen', () => {
  it('increments once on arrival, then renders the resulting totals', async () => {
    const client = createMockWorldPeaceApi({ total_today: 10, total_all_time: 100 });
    const incrementSpy = jest.spyOn(client, 'increment');
    const dispatch = jest.fn();

    await render(
      <StatsScreen state={{ ...initialState, screen: 'stats', duration: 10 }} dispatch={dispatch} apiClient={client} />
    );

    expect(incrementSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('11')).toBeTruthy());
    expect(screen.getByText('101')).toBeTruthy();
  });

  it('shows the timed thank-you copy with the chosen duration', async () => {
    const client = createMockWorldPeaceApi();
    const dispatch = jest.fn();
    await render(
      <StatsScreen state={{ ...initialState, screen: 'stats', duration: 20 }} dispatch={dispatch} apiClient={client} />
    );
    expect(screen.getByText(/Thank you for your 20 minutes\./)).toBeTruthy();
  });

  it('shows the Open-mode thank-you copy when duration is "open"', async () => {
    const client = createMockWorldPeaceApi();
    const dispatch = jest.fn();
    await render(
      <StatsScreen state={{ ...initialState, screen: 'stats', duration: 'open' }} dispatch={dispatch} apiClient={client} />
    );
    expect(screen.getByText(/Thank you for your session\./)).toBeTruthy();
  });

  it('dispatches RESTART when "Meditate again" is tapped', async () => {
    const client = createMockWorldPeaceApi();
    const dispatch = jest.fn();
    await render(
      <StatsScreen state={{ ...initialState, screen: 'stats', duration: 10 }} dispatch={dispatch} apiClient={client} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Meditate again' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART' });
  });

  it('degrades gracefully (placeholder dashes, no crash) if the API client fails', async () => {
    const failingClient: WorldPeaceApiClient = {
      increment: jest.fn().mockRejectedValue(new Error('network down')),
      getStats: jest.fn(),
    };
    const dispatch = jest.fn();

    await render(
      <StatsScreen
        state={{ ...initialState, screen: 'stats', duration: 10 }}
        dispatch={dispatch}
        apiClient={failingClient}
      />
    );

    await waitFor(() => expect(failingClient.increment).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('—').length).toBe(2);
    // still usable — the ritual isn't blocked by a stats fetch failure
    expect(screen.getByRole('button', { name: 'Meditate again' })).toBeTruthy();
  });
});
