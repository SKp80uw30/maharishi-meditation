# Ambient audio — placeholder

`ambient-loop.mp3` is a **placeholder**, synthesized locally with ffmpeg rather
than sourced from a third party, specifically to avoid any licensing ambiguity.
Same treatment the design handoff already gives the Nunito font and Phosphor
icons: usable now, swap for real brand audio before shipping.

Regenerate it with:

```bash
ffmpeg -y \
  -f lavfi -i "sine=frequency=110:duration=30" \
  -f lavfi -i "sine=frequency=165:duration=30" \
  -f lavfi -i "sine=frequency=220:duration=30" \
  -filter_complex "[0:a]volume=0.5[a0];[1:a]volume=0.28[a1];[2:a]volume=0.16[a2];[a0][a1][a2]amix=inputs=3:duration=longest:dropout_transition=0[mixed];[mixed]tremolo=f=0.1:d=0.25,lowpass=f=900,volume=0.5[out]" \
  -map "[out]" -ar 44100 -ac 2 -b:a 128k ambient-loop.mp3
```

A soft drone (A2 110Hz + a just-intonation fifth at 165Hz + octave at 220Hz),
low-pass filtered and given a slow tremolo. All three tone frequencies and the
tremolo rate are exact integer multiples of `1 / 30s`, so the waveform is
perfectly periodic over the file's 30-second length — it loops via
`player.loop = true` (see `app/src/hooks/useAmbientLoop.ts`) with no audible
click or restart artifact at the seam.

To swap in real brand audio: replace this file (keep the same filename, or
update the `require()` path in `useAmbientLoop.ts`) with any seamless loop.
