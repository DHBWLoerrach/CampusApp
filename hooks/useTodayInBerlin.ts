import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  msUntilBerlinMidnight,
  todayInBerlin,
  type YmdDate,
} from '@/lib/berlinDate';

/**
 * The current Berlin calendar day, kept up to date while the screen stays open.
 *
 * A block plan screen can sit in the foreground across midnight, and phone
 * timers do not fire reliably while the app is backgrounded — so the day is
 * refreshed both on a scheduled tick and whenever the app becomes active.
 */
export function useTodayInBerlin(): YmdDate {
  const [today, setToday] = useState<YmdDate>(todayInBerlin);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const scheduleNextTick = () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setToday(todayInBerlin());
        scheduleNextTick();
      }, msUntilBerlinMidnight());
    };

    scheduleNextTick();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || cancelled) return;
      // Timers are unreliable in the background, so resync on every resume.
      setToday(todayInBerlin());
      scheduleNextTick();
    });

    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      subscription.remove();
    };
  }, []);

  return today;
}
