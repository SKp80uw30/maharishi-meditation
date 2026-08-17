import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sheet from '../Sheet';
import { Text } from 'react-native';

describe('Sheet', () => {
  it('renders content when isOpen is true', async () => {
    const onClose = jest.fn();
    await render(
      <SafeAreaProvider>
        <Sheet isOpen onClose={onClose} title="Test Sheet">
          <Text>Sheet content</Text>
        </Sheet>
      </SafeAreaProvider>
    );

    expect(screen.getByText('Test Sheet')).toBeTruthy();
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <SafeAreaProvider>
        <Sheet isOpen onClose={onClose} title="Test Sheet">
          <Text>Sheet content</Text>
        </Sheet>
      </SafeAreaProvider>
    );

    const closeButton = screen.getByLabelText('Close');
    await fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is pressed', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <SafeAreaProvider>
        <Sheet isOpen onClose={onClose} testID="sheet" title="Test Sheet">
          <Text>Sheet content</Text>
        </Sheet>
      </SafeAreaProvider>
    );

    const backdrop = getByTestId('sheet');
    // Note: backdrop is the Modal, so press on it
    await fireEvent.press(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', async () => {
    const onClose = jest.fn();
    const { queryByText } = await render(
      <SafeAreaProvider>
        <Sheet isOpen={false} onClose={onClose} title="Test Sheet">
          <Text>Sheet content</Text>
        </Sheet>
      </SafeAreaProvider>
    );

    expect(queryByText('Sheet content')).toBeFalsy();
  });
});
