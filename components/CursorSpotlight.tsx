'use client';

import { useEffect, useRef } from 'react';

/**
 * Site-wide cursor spotlight: a fixed, click-through layer with a crimson
 * glow that follows the pointer and reveals the page grid around it.
 * Position is written to CSS variables from a window pointermove listener,
 * so the mouse never triggers React re-renders. Without a pointer (touch
 * devices) it rests at a fixed spot on the right.
 */
export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add('is-active');
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => el.classList.remove('is-active');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-spot" />;
}
