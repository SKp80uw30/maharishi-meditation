import { appReducer, initialState, AppState } from '../appReducer';

describe('appReducer', () => {
  it('starts on launch with sound on and no duration chosen', () => {
    expect(initialState).toEqual<AppState>({
      screen: 'launch',
      duration: null,
      secondsLeft: 0,
      secondsElapsed: 0,
      soundOn: true,
    });
  });

  it('walks the full linear flow: Launch -> Intention -> Duration -> Session -> Stats', () => {
    let state = initialState;
    state = appReducer(state, { type: 'BEGIN' });
    expect(state.screen).toBe('intention');

    state = appReducer(state, { type: 'CONTINUE' });
    expect(state.screen).toBe('duration');

    state = appReducer(state, { type: 'SELECT_DURATION', duration: 10 });
    expect(state.duration).toBe(10);

    state = appReducer(state, { type: 'START_SESSION' });
    expect(state.screen).toBe('session');
    expect(state.secondsLeft).toBe(600);
    expect(state.secondsElapsed).toBe(0);

    state = appReducer(state, { type: 'FINISH_SESSION' });
    expect(state.screen).toBe('stats');
  });

  it('supports back navigation: Intention -> Launch, Duration -> Intention', () => {
    let state = appReducer(initialState, { type: 'BEGIN' }); // intention
    state = appReducer(state, { type: 'CONTINUE' }); // duration
    state = appReducer(state, { type: 'BACK' });
    expect(state.screen).toBe('intention');

    state = appReducer(state, { type: 'BACK' });
    expect(state.screen).toBe('launch');
  });

  it('has no back arrow on launch, session, or stats (BACK is a no-op there)', () => {
    expect(appReducer(initialState, { type: 'BACK' }).screen).toBe('launch');

    const sessionState: AppState = { ...initialState, screen: 'session', duration: 5, secondsLeft: 100 };
    expect(appReducer(sessionState, { type: 'BACK' })).toEqual(sessionState);

    const statsState: AppState = { ...initialState, screen: 'stats' };
    expect(appReducer(statsState, { type: 'BACK' })).toEqual(statsState);
  });

  it('reaches About only from Launch, and BACK from About returns to Launch', () => {
    let state = appReducer(initialState, { type: 'OPEN_ABOUT' });
    expect(state.screen).toBe('about');

    state = appReducer(state, { type: 'BACK' });
    expect(state.screen).toBe('launch');
  });

  it('initializes a timed session with secondsLeft = duration * 60 and an open session with secondsElapsed = 0', () => {
    const atDuration: AppState = { ...initialState, screen: 'duration' };

    const timed = appReducer(
      appReducer(atDuration, { type: 'SELECT_DURATION', duration: 3 }),
      { type: 'START_SESSION' }
    );
    expect(timed).toMatchObject({ screen: 'session', secondsLeft: 180, secondsElapsed: 0 });

    const open = appReducer(
      appReducer(atDuration, { type: 'SELECT_DURATION', duration: 'open' }),
      { type: 'START_SESSION' }
    );
    expect(open).toMatchObject({ screen: 'session', secondsLeft: 0, secondsElapsed: 0 });
  });

  it('refuses to start a session before a duration is selected', () => {
    const atDuration: AppState = { ...initialState, screen: 'duration', duration: null };
    expect(appReducer(atDuration, { type: 'START_SESSION' })).toEqual(atDuration);
  });

  it('TICK counts a timed session down and an open session up', () => {
    const timed: AppState = { ...initialState, screen: 'session', duration: 3, secondsLeft: 180 };
    expect(appReducer(timed, { type: 'TICK' }).secondsLeft).toBe(179);

    const open: AppState = { ...initialState, screen: 'session', duration: 'open', secondsElapsed: 41 };
    expect(appReducer(open, { type: 'TICK' }).secondsElapsed).toBe(42);
  });

  it('TICK never takes secondsLeft below zero', () => {
    const atZero: AppState = { ...initialState, screen: 'session', duration: 3, secondsLeft: 0 };
    expect(appReducer(atZero, { type: 'TICK' }).secondsLeft).toBe(0);
  });

  it('both FINISH_SESSION (timeout) and END_SESSION_EARLY route to Stats', () => {
    const inSession: AppState = { ...initialState, screen: 'session', duration: 5, secondsLeft: 0 };
    expect(appReducer(inSession, { type: 'FINISH_SESSION' }).screen).toBe('stats');

    const inOpenSession: AppState = { ...initialState, screen: 'session', duration: 'open', secondsElapsed: 12 };
    expect(appReducer(inOpenSession, { type: 'END_SESSION_EARLY' }).screen).toBe('stats');
  });

  it('"Meditate again" (RESTART) loops Stats back to Duration and clears the prior duration/timer', () => {
    const atStats: AppState = { ...initialState, screen: 'stats', duration: 10, secondsLeft: 0, secondsElapsed: 0 };
    const restarted = appReducer(atStats, { type: 'RESTART' });
    expect(restarted).toMatchObject({
      screen: 'duration',
      duration: null,
      secondsLeft: 0,
      secondsElapsed: 0,
    });
  });

  it('TOGGLE_SOUND flips soundOn from its default of true', () => {
    const once = appReducer(initialState, { type: 'TOGGLE_SOUND' });
    expect(once.soundOn).toBe(false);
    const twice = appReducer(once, { type: 'TOGGLE_SOUND' });
    expect(twice.soundOn).toBe(true);
  });
});
