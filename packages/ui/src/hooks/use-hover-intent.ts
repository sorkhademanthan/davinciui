import * as React from "react";

export interface UseHoverIntentOptions {
  /** Hover must last this long before it counts as intent. Default 120ms. */
  delay?: number;
}

export function useHoverIntent({ delay = 120 }: UseHoverIntentOptions = {}) {
  const [active, setActive] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setActive(true);
    }, delay);
  }, [clearTimer, delay]);

  const cancel = React.useCallback(() => {
    clearTimer();
    setActive(false);
  }, [clearTimer]);

  React.useEffect(() => clearTimer, [clearTimer]);

  return { active, start, cancel };
}
