'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor-following crimson spotlight that reveals a tight grid around the
 * pointer. Pure CSS variables updated from a pointermove listener on the
 * parent section, so no React re-renders while the mouse moves.
 * Without a pointer (touch devices) it rests at a fixed spot on the right.
 */
export default function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.classList.add('is-active');
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => el.classList.remove('is-active');

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hero-spot absolute inset-0 pointer-events-none" />;
}
