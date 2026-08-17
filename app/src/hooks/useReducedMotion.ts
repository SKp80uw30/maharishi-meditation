import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** The OS-level "reduce motion" accessibility setting: `null` until the async
 * system check resolves, then live-updated. Decorative animations (breathing
 * marks, stat pulses, scale-ins) must only run when this is exactly `false` —
 * treating "unknown" as "don't animate yet" avoids flashing motion at the very
 * users who asked for none, at the cost of a few unanimated milliseconds. */
export function useReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
