import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

/**
 * Visual representation of ripples emanating from multiple points, converging to center.
 * Visualizes: many individual practices → one coherent field.
 * Static visual showing the metaphor; animation can be added via Reanimated.
 */
export default function RipplesAnimation() {

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 400 400" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="ripple-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.brandPrimary} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={colors.brandPrimary} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Left ripples */}
        <Circle cx="80" cy="160" r="8" fill={colors.brandPrimary} opacity={0.8} />
        <Circle cx="80" cy="160" r="20" fill="none" stroke={colors.brandPrimary} strokeWidth={1.5} opacity={0.4} />
        <Circle cx="80" cy="160" r="50" fill="none" stroke={colors.brandPrimary} strokeWidth={1} opacity={0.2} />

        {/* Center ripples */}
        <Circle cx="200" cy="200" r="12" fill={colors.brandPrimary} opacity={0.9} />
        <Circle cx="200" cy="200" r="25" fill="none" stroke={colors.brandPrimary} strokeWidth={1.5} opacity={0.5} />
        <Circle cx="200" cy="200" r="60" fill="none" stroke={colors.brandPrimary} strokeWidth={1} opacity={0.2} />

        {/* Right ripples */}
        <Circle cx="320" cy="240" r="10" fill={colors.brandPrimary} opacity={0.7} />
        <Circle cx="320" cy="240" r="22" fill="none" stroke={colors.brandPrimary} strokeWidth={1.5} opacity={0.4} />
        <Circle cx="320" cy="240" r="55" fill="none" stroke={colors.brandPrimary} strokeWidth={1} opacity={0.2} />

        {/* Convergence glow at center */}
        <Circle cx="200" cy="200" r="80" fill="url(#ripple-glow)" opacity={0.3} />
      </Svg>
    </View>
  );
}
