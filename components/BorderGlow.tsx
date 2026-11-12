'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  /**
   * How far in from the edge the glow starts, as a fraction of the distance
   * from the centre to the edge. 0.4 means the outer 40% of the card.
   */
  edgeSensitivity?: number;
}

/**
 * Wraps a card so its border glows toward the cursor. An arc of the border
 * lights up in the direction of the pointer and gets brighter the closer the
 * pointer is to an edge; near the centre there is no glow at all.
 *
 * The pointer's angle, edge proximity and position are written to CSS
 * variables (see `.border-glow` in globals.css), so moving the mouse never
 * re-renders React.
 */
export default function BorderGlow({ children, className = '', edgeSensitivity = 0.4 }: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = pointerX - (rect.left + rect.width / 2);
      const dy = pointerY - (rect.top + rect.height / 2);
      // conic-gradient angles start at 12 o'clock, atan2 at 3 o'clock
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      // 0 at the centre, 1 on any edge
      const reach = Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2));
      const edge = Math.min(1, Math.max(0, (reach - (1 - edgeSensitivity)) / edgeSensitivity));
      el.style.setProperty('--glow-angle', `${angle.toFixed(1)}deg`);
      el.style.setProperty('--glow-edge', edge.toFixed(3));
      el.style.setProperty('--glow-x', `${(pointerX - rect.left).toFixed(0)}px`);
      el.style.setProperty('--glow-y', `${(pointerY - rect.top).toFixed(0)}px`);
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.setProperty('--glow-edge', '0');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [edgeSensitivity]);

  return (
    <div ref={ref} className={`border-glow ${className}`}>
      <span className="border-glow-halo" aria-hidden="true" />
      {children}
      <span className="border-glow-bleed" aria-hidden="true" />
      <span className="border-glow-ring" aria-hidden="true" />
    </div>
  );
}
