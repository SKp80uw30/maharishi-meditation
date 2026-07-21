import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { palette } from '../theme/colors';

type Props = {
  size?: number;
  strokeWidth?: number;
  /** 0–1 elapsed fraction, or `null` for Open-mode's flat track with no progress
   * (there's no total to measure against). */
  progress: number | null;
  children?: React.ReactNode;
};

/** Session screen's 220px ring. The design mocks this as a conic-gradient behind
 * a smaller solid inner circle (a "pie" clipped to a ring by an overlay); RN/SVG
 * has no conic-gradient, so this uses the standard stroke-dasharray ring
 * technique instead — same visual result (a coral arc over a translucent-white
 * track, proportional to elapsed time, starting at 12 o'clock, clockwise). */
export default function ProgressRing({ size = 220, strokeWidth = 16, progress, children }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = progress == null ? 0 : Math.min(1, Math.max(0, progress));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {progress != null && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.coral400}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - pct)}
            strokeLinecap="butt"
            // start at 12 o'clock instead of SVG's default 3 o'clock, go clockwise
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
