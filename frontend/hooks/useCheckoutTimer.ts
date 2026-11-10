
import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';

export const CHECKOUT_DURATION_MINUTES = 5;

export const CHECKOUT_DURATION_SECONDS = CHECKOUT_DURATION_MINUTES * 60;

export const CHECKOUT_DURATION_MS = CHECKOUT_DURATION_MINUTES * 60 * 1000;

export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface UseCheckoutTimerOptions {
  onTimeout: () => void | Promise<void>;
  enabled: boolean;
}

interface UseCheckoutTimerReturn {
  secondsLeft: number;
  timerDisplay: string;
  isUrgent: boolean;
}

export function useCheckoutTimer({
  onTimeout,
  enabled,
}: UseCheckoutTimerOptions): UseCheckoutTimerReturn {
  const checkoutExpiresAt = useCartStore((s) => s.checkoutExpiresAt);

  const [secondsLeft, setSecondsLeft] = useState<number>(CHECKOUT_DURATION_SECONDS);

  const stableOnTimeout = useCallback(() => { onTimeout(); }, [onTimeout]);

  useEffect(() => {
    if (!enabled || !checkoutExpiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((checkoutExpiresAt - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        stableOnTimeout();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [enabled, checkoutExpiresAt, stableOnTimeout]);

  return {
    secondsLeft,
    timerDisplay: formatTimer(secondsLeft),
    isUrgent: secondsLeft <= 60,
  };
}
