import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSeenStory, markStorySeen } from '../storyProgress';

describe('storyProgress', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  it('reports the story unseen on a first ever launch', async () => {
    await expect(hasSeenStory()).resolves.toBe(false);
  });

  it('remembers the story once it has been marked seen', async () => {
    await markStorySeen();

    await expect(hasSeenStory()).resolves.toBe(true);
  });

  it('reports seen when storage cannot be read at all', async () => {
    // Safari in private browsing refuses localStorage, which is the web build
    // this app is tested through. Failing closed keeps the story from reopening
    // over the intention screen on every launch; Launch's "Tell me more" still
    // reaches it.
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValue(new Error('denied'));

    await expect(hasSeenStory()).resolves.toBe(true);
  });

  it('stays quiet when storage cannot be written', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValue(new Error('denied'));

    await expect(markStorySeen()).resolves.toBeUndefined();
  });
});
