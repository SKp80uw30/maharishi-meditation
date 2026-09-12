import AsyncStorage from '@react-native-async-storage/async-storage';

/** The only key this app persists, and it holds one boolean's worth of meaning:
 * has the story been shown yet? Deliberately not a user id, a profile, a
 * session, or a history — see CLAUDE.md's state model for why this is the sole
 * exception to "nothing is persisted". */
const STORY_SEEN_KEY = 'maharishi.story.seen';

/** True once the story onboarding has been shown and dismissed, by any route.
 *
 * A storage failure resolves `true`, not `false`. Reading can genuinely fail —
 * Safari in private browsing refuses localStorage, which is exactly the web
 * build this gets tested through — and the two failure modes are not equal:
 * wrongly returning `true` costs a first-timer an automatic story they can
 * still open from Launch's "Tell me more", while wrongly returning `false`
 * re-opens the story over the intention screen on every single launch,
 * forever. */
export async function hasSeenStory(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORY_SEEN_KEY)) != null;
  } catch {
    return true;
  }
}

/** Records that the story has been shown. Silent on failure: the worst case is
 * that it opens again next launch, which is not worth interrupting anyone over. */
export async function markStorySeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORY_SEEN_KEY, '1');
  } catch {
    // Nothing useful to do, and nothing the person needs to hear about.
  }
}
