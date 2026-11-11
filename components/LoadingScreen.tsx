'use client';

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Phase = 'draw' | 'fly' | 'open' | 'done';

/** Logo draws in at the centre and holds. */
const DRAW_MS = 1350;
/** Logo shrinks and travels to the navbar logo's position. */
const FLY_MS = 520;
/** Circular reveal grows from the logo until it clears the viewport. */
const OPEN_MS = 800;
/** How much larger the logo is at the centre than in the navbar. */
const CENTER_SCALE = 2.6;

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * Splash screen. The logo draws in at the centre of a dark cover, flies to
 * where the navbar logo sits (`[data-splash-target]`), and the cover then
 * opens as a growing circle from that point, revealing the page underneath.
 * The splash logo uses the navbar logo's exact classes, so it lands on top of
 * the real one at scale 1 and the hand-off is seamless.
 */
export default function LoadingScreen() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('draw');
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const radius = useMotionValue(0);
  const edge = useTransform(radius, (v) => v + 1.5);
  const ringStart = useTransform(radius, (v) => Math.max(0, v - 22));
  const mask = useMotionTemplate`radial-gradient(circle at ${cx}px ${cy}px, transparent ${radius}px, #000 ${edge}px)`;
  const ring = useMotionTemplate`radial-gradient(circle at ${cx}px ${cy}px, transparent ${ringStart}px, rgba(255, 70, 105, 0.6) ${radius}px, transparent ${edge}px)`;

  const openControls = useRef<ReturnType<typeof animate> | null>(null);

  // Each step starts when the previous one has finished rather than on its own
  // timer, so the order holds even when the browser throttles timers.
  useEffect(() => {
    if (reduced) {
      const timer = setTimeout(() => setPhase('done'), 300);
      return () => clearTimeout(timer);
    }

    const flyTimer = setTimeout(() => {
      const viewW = document.documentElement.clientWidth;
      const viewH = window.innerHeight;
      const rect = document.querySelector('[data-splash-target]')?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : viewW / 2;
      const y = rect ? rect.top + rect.height / 2 : viewH / 2;
      cx.set(x);
      cy.set(y);
      setOffset({ x: x - viewW / 2, y: y - viewH / 2 });
      setPhase('fly');
    }, DRAW_MS);

    // Never leave the page covered if an animation is stalled or interrupted.
    const safetyTimer = setTimeout(() => setPhase('done'), DRAW_MS + FLY_MS + OPEN_MS + 2000);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(safetyTimer);
      openControls.current?.stop();
    };
  }, [reduced, cx, cy]);

  // The logo has landed on the navbar logo: open the cover from that point.
  const handleLogoLanded = () => {
    if (phase !== 'fly') return;
    const x = cx.get();
    const y = cy.get();
    const farthestCorner = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setPhase('open');
    openControls.current = animate(radius, farthestCorner + 40, {
      duration: OPEN_MS / 1000,
      ease: EASE,
      onComplete: () => setPhase('done'),
    });
  };

  if (phase === 'done') return null;

  const opening = phase === 'open';
  const centred = phase === 'draw';

  return (
    <div className="fixed inset-0 z-[9999]" aria-hidden="true" style={{ pointerEvents: opening ? 'none' : 'auto' }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.22), transparent 42%), var(--background)',
          ...(opening ? { maskImage: mask, WebkitMaskImage: mask } : null),
        }}
      >
        <motion.div
          className="text-xl md:text-2xl font-bold tracking-tighter"
          style={{ whiteSpace: 'nowrap' }}
          initial={{ scale: CENTER_SCALE, x: 0, y: 0 }}
          animate={centred ? { scale: CENTER_SCALE, x: 0, y: 0 } : { scale: 1, x: offset.x, y: offset.y }}
          transition={{ duration: FLY_MS / 1000, ease: EASE }}
          onAnimationComplete={handleLogoLanded}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
            animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            <span className="text-primary">MF</span> <span style={{ color: 'var(--foreground)' }}>DEVELOPER.</span>
          </motion.span>
        </motion.div>

        <motion.p
          className="absolute left-0 right-0 text-center font-mono text-xs uppercase"
          style={{ top: 'calc(50% + 3.4rem)', letterSpacing: '0.3em', color: 'var(--foreground)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={centred ? { opacity: 0.6, y: 0 } : { opacity: 0, y: 0 }}
          transition={centred ? { duration: 0.35, delay: 0.4 } : { duration: 0.2 }}
        >
          Full Stack Developer
        </motion.p>
      </motion.div>

      {/* Bright rim on the edge of the opening circle */}
      {opening && <motion.div className="absolute inset-0" style={{ backgroundImage: ring, pointerEvents: 'none' }} />}
    </div>
  );
}
