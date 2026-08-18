import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** The whole visual is laid out inside this square, in px. Kept under the
 * narrowest phone's content width so nothing has to be clipped. */
const FIELD = 280;

/** Full radius of a grown ripple. Every side of the source triangle below is
 * shorter than 2 × this, so a grown ring always reaches into its neighbours' —
 * the overlap is a property of the layout, not a lucky coincidence of timing. */
const MAX_RADIUS = 80;

/** Each source pulses on its own period, deliberately not a common multiple:
 * people start when they start, they aren't on one synced clock. */
const SOURCES = [
  { x: 84, y: 104, dot: 7, pulseMs: 2400 },
  { x: 196, y: 104, dot: 6, pulseMs: 2900 },
  { x: 140, y: 192, dot: 8, pulseMs: 3400 },
];

/** Centroid of the triangle: the one point every grown ring covers, so it's
 * where the shared field is drawn. */
const FIELD_CENTER = { x: 140, y: 133 };
const GLOW_RADIUS = 110;

/** One pass of the master timeline: apart → growing → overlapping → rest. */
const CYCLE_MS = 9000;

/** Radius a ripple is born at, as a fraction of MAX_RADIUS. Rings are rendered
 * at full size and scaled down, so growth stays on the native driver. */
const SEED_SCALE = 0.15;

/** Each source emits two ripples per cycle, the second while the first is still
 * travelling, so the field visibly fills rather than blinking once. Times are
 * fractions of the cycle: born at `birth`, full radius at `full`, gone by `end`. */
const RIPPLES = [
  { birth: 0.05, full: 0.58, end: 0.8, opacity: 0.5 },
  { birth: 0.28, full: 0.76, end: 0.9, opacity: 0.34 },
];

/** Sources don't begin together — the field assembles out of separate starts.
 * Keeps every derived input range inside [0, 1] (max end 0.9 + 0.09). */
const SOURCE_OFFSET = [0, 0.045, 0.09];

export default function RipplesAnimation() {
  const wave = useRef(new Animated.Value(0)).current;
  const pulses = useRef(SOURCES.map(() => new Animated.Value(0))).current;
  const reducedMotion = useReducedMotion();
  const animate = reducedMotion === false;

  useEffect(() => {
    if (!animate) return;

    let running = true;

    // Self-restarting rather than Animated.loop: a looped timing that ends on a
    // value other than the one it started from never rewinds here — the timeline
    // reaches 1 and every later pass animates 1→1, freezing the ripples after a
    // single cycle. Rewinding by hand is the same pattern <BlobMark> uses, and
    // the jump is invisible because everything has already faded out at 1.
    const runWave = () => {
      if (!running) return;
      wave.setValue(0);
      Animated.timing(wave, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) runWave();
      });
    };
    const pulseLoops = pulses.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: SOURCES[index].pulseMs / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: SOURCES[index].pulseMs / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    runWave();
    pulseLoops.forEach((loop) => loop.start());

    return () => {
      running = false;
      wave.stopAnimation();
      pulseLoops.forEach((loop) => loop.stop());
      wave.setValue(0);
      pulses.forEach((value) => value.setValue(0));
    };
  }, [animate, wave, pulses]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Three points of light pulsing separately, their ripples spreading until they overlap into one shared glow"
    >
      <View style={styles.field}>
        {/* The shared field, blooming only once the ripples have met. Drawn
         * first so the ripples and their sources sit on top of it. */}
        <Animated.View
          style={[
            styles.glow,
            animate
              ? {
                  opacity: wave.interpolate({
                    inputRange: [0, 0.5, 0.72, 0.92, 1],
                    outputRange: [0, 0, 1, 0, 0],
                  }),
                  transform: [
                    {
                      scale: wave.interpolate({
                        inputRange: [0, 0.5, 0.72, 0.92, 1],
                        outputRange: [0.7, 0.7, 1.05, 1.1, 0.7],
                      }),
                    },
                  ],
                }
              : styles.glowAtRest,
          ]}
          pointerEvents="none"
        >
          <Svg width={GLOW_RADIUS * 2} height={GLOW_RADIUS * 2}>
            <Defs>
              <RadialGradient id="ripple-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.brandPrimary} stopOpacity={0.45} />
                <Stop offset="55%" stopColor={colors.brandSecondary} stopOpacity={0.18} />
                <Stop offset="100%" stopColor={colors.brandPrimary} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW_RADIUS} cy={GLOW_RADIUS} r={GLOW_RADIUS} fill="url(#ripple-glow)" />
          </Svg>
        </Animated.View>

        {SOURCES.map((source, index) =>
          RIPPLES.map((ripple, ringIndex) => {
            const offset = SOURCE_OFFSET[index];
            const birth = ripple.birth + offset;
            const full = ripple.full + offset;
            const end = ripple.end + offset;

            return (
              <Animated.View
                key={`ripple-${index}-${ringIndex}`}
                testID={`ripple-${index}-${ringIndex}`}
                style={[
                  styles.ripple,
                  { left: source.x - MAX_RADIUS, top: source.y - MAX_RADIUS },
                  animate
                    ? {
                        // Fades to nothing before the cycle wraps, so the snap
                        // back to seed size is never on screen.
                        opacity: wave.interpolate({
                          inputRange: [0, birth, birth + 0.1, full, end, 1],
                          outputRange: [0, 0, ripple.opacity, ripple.opacity * 0.75, 0, 0],
                        }),
                        transform: [
                          {
                            scale: wave.interpolate({
                              inputRange: [0, birth, full, 1],
                              outputRange: [SEED_SCALE, SEED_SCALE, 1, 1],
                            }),
                          },
                        ],
                      }
                    : // Reduce motion: hold the end of the story as a still —
                      // grown, concentric, overlapping — rather than nothing.
                      {
                        opacity: ripple.opacity * 0.75,
                        transform: [{ scale: ringIndex === 0 ? 1 : 0.58 }],
                      },
                ]}
                pointerEvents="none"
              />
            );
          }),
        )}

        {SOURCES.map((source, index) => (
          <Animated.View
            key={`source-${index}`}
            testID={`source-${index}`}
            style={[
              styles.source,
              {
                left: source.x - source.dot,
                top: source.y - source.dot,
                width: source.dot * 2,
                height: source.dot * 2,
                borderRadius: source.dot,
              },
              animate
                ? {
                    opacity: pulses[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                    transform: [
                      {
                        scale: pulses[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.22],
                        }),
                      },
                    ],
                  }
                : styles.sourceAtRest,
            ]}
            pointerEvents="none"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  field: {
    width: FIELD,
    height: FIELD,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    left: FIELD_CENTER.x - GLOW_RADIUS,
    top: FIELD_CENTER.y - GLOW_RADIUS,
  },
  glowAtRest: {
    opacity: 0.6,
  },
  ripple: {
    position: 'absolute',
    width: MAX_RADIUS * 2,
    height: MAX_RADIUS * 2,
    borderRadius: MAX_RADIUS,
    borderWidth: 3,
    borderColor: colors.brandPrimary,
  },
  source: {
    position: 'absolute',
    backgroundColor: colors.brandPrimary,
  },
  sourceAtRest: {
    opacity: 0.9,
  },
});
