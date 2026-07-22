import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { gradientDuskGlow, gradientGlow } from '../theme/colors';

type Kind = 'glow' | 'duskGlow';

const CONFIG: Record<Kind, typeof gradientGlow> = {
  glow: gradientGlow,
  duskGlow: gradientDuskGlow,
};

/** Full-bleed absolute-positioned radial wash, matching CSS `--gradient-glow`
 * (light screens) / `--gradient-dusk-glow` (session screen only). Render as the
 * first child of a `position: relative` container. */
export default function GradientWash({ kind }: { kind: Kind }) {
  const config = CONFIG[kind];
  const id = `radial-${kind}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx={config.cx} cy={config.cy} r={config.r}>
          {config.stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
