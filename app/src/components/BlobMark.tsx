import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { blobPath } from '../theme/blobPath';
import { gradientSunrise } from '../theme/colors';
import { shadow } from '../theme/effects';

type Props = {
  size?: number;
  /** Set false to drop the coral glow shadow (e.g. the small 64px mark on Stats,
   * per the design spec which only applies shadow-glow-coral to the 120px Launch
   * mark). */
  glow?: boolean;
};

/** The hero "blob" mark: an organic asymmetric shape filled with the sunrise
 * gradient. Used on Launch (120px, glowing) and Stats (64px, no glow). */
export default function BlobMark({ size = 120, glow = true }: Props) {
  const path = blobPath(size);
  const boxStyle = { width: size, height: size, backgroundColor: 'transparent' as const };
  return (
    <View style={glow ? { ...boxStyle, boxShadow: shadow.glowCoral } : boxStyle} testID="blob-mark">
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
    </View>
  );
}
