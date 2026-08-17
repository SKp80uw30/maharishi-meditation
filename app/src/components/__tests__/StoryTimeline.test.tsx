import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StoryTimeline from '../StoryTimeline';
import type { ExperimentEntry } from '../../content/story';

describe('StoryTimeline', () => {
  const mockEntries: ExperimentEntry[] = [
    {
      year: 1973,
      location: 'Washington, DC',
      headline: 'Test Experiment 1',
      description: 'A test description for the first experiment.',
    },
    {
      year: 1983,
      location: 'Israel',
      headline: 'Test Experiment 2',
      description: 'A test description for the second experiment.',
    },
  ];

  it('renders all timeline entries', async () => {
    await render(<StoryTimeline entries={mockEntries} />);

    expect(screen.getByText('Test Experiment 1')).toBeTruthy();
    expect(screen.getByText('Test Experiment 2')).toBeTruthy();
    expect(screen.getByText('Washington, DC')).toBeTruthy();
    expect(screen.getByText('Israel')).toBeTruthy();
    expect(screen.getByText('A test description for the first experiment.')).toBeTruthy();
  });

  it('renders year markers', async () => {
    await render(<StoryTimeline entries={mockEntries} />);

    expect(screen.getByText('1973')).toBeTruthy();
    expect(screen.getByText('1983')).toBeTruthy();
  });

  it('renders with testID when provided', async () => {
    const { getByTestId } = await render(<StoryTimeline entries={mockEntries} testID="timeline" />);

    expect(getByTestId('timeline')).toBeTruthy();
  });

  it('handles empty entries gracefully', async () => {
    const { getByTestId } = await render(<StoryTimeline entries={[]} testID="empty-timeline" />);

    expect(getByTestId('empty-timeline')).toBeTruthy();
  });
});
