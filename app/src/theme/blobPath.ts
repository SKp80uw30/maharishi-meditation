/**
 * Traces the design system's `--radius-blob` value
 * (`42% 58% 55% 45% / 48% 42% 58% 52%`) as an SVG path using elliptical arcs —
 * one arc per corner, radii taken straight from the CSS percentages. Each edge's
 * two adjacent corner radii happen to sum to exactly 100% (42+58, 42+58, 55+45,
 * 45+55... actually top:42+58=100, right:42+58=100, bottom:55+45=100,
 * left:52+48=100), so this is an exact reproduction of the CSS shape, not an
 * approximation — no CSS radius-overlap scaling needed.
 */
export function blobPath(size: number): string {
  const tl = { rx: 0.42 * size, ry: 0.48 * size };
  const tr = { rx: 0.58 * size, ry: 0.42 * size };
  const br = { rx: 0.55 * size, ry: 0.58 * size };
  const bl = { rx: 0.45 * size, ry: 0.52 * size };

  return [
    `M ${tl.rx},0`,
    `L ${size - tr.rx},0`,
    `A ${tr.rx} ${tr.ry} 0 0 1 ${size},${tr.ry}`,
    `L ${size},${size - br.ry}`,
    `A ${br.rx} ${br.ry} 0 0 1 ${size - br.rx},${size}`,
    `L ${bl.rx},${size}`,
    `A ${bl.rx} ${bl.ry} 0 0 1 0,${size - bl.ry}`,
    `L 0,${tl.ry}`,
    `A ${tl.rx} ${tl.ry} 0 0 1 ${tl.rx},0`,
    'Z',
  ].join(' ');
}
