import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { blobPath } from '../theme/blobPath';
import { gradientSunrise } from '../theme/colors';
import { shadow } from '../theme/effects';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  size?: number;
  /** Set false to drop the coral glow shadow (e.g. the small 64px mark on Stats,
   * per the design spec which only applies shadow-glow-coral to the 120px Launch
   * mark). */
  glow?: boolean;
  /** Optional breathing animation: subtle 4-second pulse (opacity 0.8→1→0.8).
   * Gated behind reduce-motion preference for accessibility. */
  breathing?: boolean;
};

/** The hero "blob" mark: an organic asymmetric shape filled with the sunrise
 * gradient. Used on Launch (120px, glowing, with optional breathing animation)
 * and Stats (64px, no glow). The breathing animation signals aliveness and presence. */
export default function BlobMark({ size = 120, glow = true, breathing = false }: Props) {
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!breathing || reducedMotion !== false) return;

    let isMounted = true;

    // 4-second breathing cycle: 0.8 → 1 → 0.8 (exhale, inhale, exhale)
    // Split into: 0.8→1 over 2s, then 1→0.8 over 2s, repeat
    const animate = () => {
      if (!isMounted) return;

      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted) animate();
      });
    };

    animate();

    return () => {
      isMounted = false;
      opacityAnim.setValue(1);
    };
  }, [breathing, reducedMotion, opacityAnim]);

  const path = blobPath(size);
  const boxStyle = {
    width: size,
    height: size,
    backgroundColor: 'transparent' as const,
  };

  // The glow is a boxShadow, which follows the container's contour, not the
  // svg path — round the container so the halo reads as an organic glow
  // around the blob instead of a square plate behind it.
  const containerStyle = glow
    ? { ...boxStyle, borderRadius: size / 2, boxShadow: shadow.glowCoral }
    : boxStyle;

  const animatedStyle = breathing && reducedMotion === false ? { opacity: opacityAnim } : {};

  return (
    <Animated.View style={[containerStyle, animatedStyle]} testID="blob-mark">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ backgroundColor: 'transparent' }}>
        <Defs>
          <LinearGradient
            id="sunrise"
            x1={gradientSunrise.start.x}
            y1={gradientSunrise.start.y}
            x2={gradientSunrise.end.x}
            y2={gradientSunrise.end.y}
          >
            {gradientSunrise.colors.map((color, i) => (
              <Stop key={color} offset={gradientSunrise.locations[i]} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Path d={path} fill="url(#sunrise)" />
      </Svg>
    </Animated.View>
  );
}
