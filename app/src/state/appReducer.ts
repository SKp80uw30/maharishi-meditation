// Pure state machine for the app's single linear screen stack. See
// CLAUDE.md "State model" and design_handoff_world_peace_mvp/README.md
// "Interactions & behavior" for the source spec this mirrors.

export type Screen = 'launch' | 'intention' | 'duration' | 'session' | 'stats' | 'about';

export interface AppState {
  screen: Screen;
  /** null = not yet chosen. Set on Duration, consumed by Session and Stats,
   * reset to null on RESTART so each session is chosen fresh. */
  duration: number | 'open' | null;
  /** Countdown, timed mode only. */
  secondsLeft: number;
  /** Count-up, Open mode only. */
  secondsElapsed: number;
  /** Defaults true; session-scoped only, never persisted. */
  soundOn: boolean;
}

export const initialState: AppState = {
  screen: 'launch',
  duration: null,
  secondsLeft: 0,
  secondsElapsed: 0,
  soundOn: true,
};

export type AppAction =
  | { type: 'BEGIN' } // Launch -> Intention
  | { type: 'CONTINUE' } // Intention -> Duration
  | { type: 'BACK' } // contextual: Intention/Duration/About -> previous screen
  | { type: 'SELECT_DURATION'; duration: number | 'open' }
  | { type: 'START_SESSION' } // Duration -> Session
  | { type: 'TICK' } // one second of session elapsed
  | { type: 'FINISH_SESSION' } // timed mode auto-reaches 0:00 -> Stats
  | { type: 'END_SESSION_EARLY' } // "End early" / "End session" -> Stats
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESTART' } // Stats "Meditate again" -> Duration
  | { type: 'OPEN_ABOUT' }; // Launch's info affordance -> About

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BEGIN':
      return state.screen === 'launch' ? { ...state, screen: 'intention' } : state;

    case 'CONTINUE':
      return state.screen === 'intention' ? { ...state, screen: 'duration' } : state;

    case 'BACK':
      switch (state.screen) {
        case 'intention':
          return { ...state, screen: 'launch' };
        case 'duration':
          return { ...state, screen: 'intention' };
        case 'about':
          return { ...state, screen: 'launch' };
        default:
          // No back arrow on Launch, Session (uses End early/End session
          // instead), or Stats — per the design README.
          return state;
      }

    case 'SELECT_DURATION':
      return state.screen === 'duration' ? { ...state, duration: action.duration } : state;

    case 'START_SESSION': {
      if (state.screen !== 'duration' || state.duration == null) return state;
      return {
        ...state,
        screen: 'session',
        secondsLeft: state.duration === 'open' ? 0 : state.duration * 60,
        secondsElapsed: 0,
      };
    }

    case 'TICK': {
      if (state.screen !== 'session') return state;
      if (state.duration === 'open') {
        return { ...state, secondsElapsed: state.secondsElapsed + 1 };
      }
      return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
    }

    case 'FINISH_SESSION':
    case 'END_SESSION_EARLY':
      return state.screen === 'session' ? { ...state, screen: 'stats' } : state;

    case 'TOGGLE_SOUND':
      return { ...state, soundOn: !state.soundOn };

    case 'RESTART':
      return state.screen === 'stats'
        ? { ...state, screen: 'duration', duration: null, secondsLeft: 0, secondsElapsed: 0 }
        : state;

    case 'OPEN_ABOUT':
      return state.screen === 'launch' ? { ...state, screen: 'about' } : state;

    default:
      return state;
  }
}
