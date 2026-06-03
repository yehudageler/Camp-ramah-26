import { useRef } from 'react';

/**
 * useSwipe – detects horizontal touch swipe gestures
 *
 * @param {object} options
 * @param {function} options.onSwipeLeft  – called when user swipes left  (RTL: older photo)
 * @param {function} options.onSwipeRight – called when user swipes right (RTL: newer photo)
 * @param {number}   options.threshold   – minimum px to count as a swipe (default 50)
 *
 * @returns Touch event handlers to spread onto a container element
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) >= threshold) {
      if (distance > 0) {
        // Swiped left
        onSwipeLeft?.();
      } else {
        // Swiped right
        onSwipeRight?.();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
