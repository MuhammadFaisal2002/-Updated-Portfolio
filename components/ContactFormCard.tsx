'use client';

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { AlertCircle, ArrowRight, Mail, MessageSquare, Tag, User, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormCardProps {
  formData: ContactFormData;
  status: ContactStatus;
  errorMessage: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onReset: () => void;
}

type View = 'form' | 'sending' | 'success';
type Pt = readonly [x: number, y: number, radius: number];

/** How long the centre logo holds before the form first reveals. */
const INTRO_HOLD_MS = 1300;
/** Keep the sending state up long enough for the pieces to meet and pulse. */
const MIN_SENDING_MS = 1600;
/** Corner pieces are this much shorter than the cut, leaving a gap along the diagonal. */
const PIECE_GAP = 14;
/** Offset between the two pieces when they meet, which leaves the logo's diagonal slit. */
const SLIT = 4;

/** Cut size scales with the card, like the reference: roughly a sixth of its width. */
const cutFor = (width: number) => Math.round(Math.min(84, Math.max(58, width * 0.17)));

/** Closed SVG path through the points with each corner rounded by its own radius. */
function roundedPath(pts: readonly Pt[]): string {
  const n = pts.length;
  let d = '';
  pts.forEach(([x, y, r], i) => {
    const [px, py] = pts[(i - 1 + n) % n] as Pt;
    const [nx, ny] = pts[(i + 1) % n] as Pt;
    const inLen = Math.hypot(x - px, y - py) || 1;
    const outLen = Math.hypot(nx - x, ny - y) || 1;
    const rr = Math.min(r, inLen / 2, outLen / 2);
    const ax = x + ((px - x) / inLen) * rr;
    const ay = y + ((py - y) / inLen) * rr;
    const bx = x + ((nx - x) / outLen) * rr;
    const by = y + ((ny - y) / outLen) * rr;
    d += `${i === 0 ? 'M' : 'L'}${ax.toFixed(2)} ${ay.toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`;
  });
  return `${d}Z`;
}

/** Card outline: rounded top-right and bottom-left, diagonal cuts top-left and bottom-right. */
function cardPath(w: number, h: number): string {
  if (w <= 0 || h <= 0) return 'M0 0Z';
  const c = Math.min(cutFor(w), h / 2);
  const o = 0.5;
  return roundedPath([
    [c, o, 12],
    [w - o, o, 22],
    [w - o, h - c, 12],
    [w - c, h - o, 12],
    [o, h - o, 22],
    [o, c, 12],
  ]);
}

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
};

function Field({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <motion.label variants={item} className="block">
      <span className="glass-label">{label}</span>
      <span className="glass-field-wrap relative block">
        <Icon size={16} className="glass-field-icon" aria-hidden="true" />
        {children}
      </span>
    </motion.label>
  );
}

/**
 * Contact form as a frosted glass card with two cut corners.
 *
 * Two triangular glass pieces sit in the cut-away corners. Whenever the card
 * is empty (first reveal, or while a message is being sent) the content clears,
 * the pieces fly to the centre and lock together into the logo, and a glow
 * pulses behind them. They fly back to the corners as the next content reveals,
 * and the card's outline morphs to the new height.
 *
 * Presentation only: form state and submission logic stay in Contact.
 */
export default function ContactFormCard({ formData, status, errorMessage, onChange, onSubmit, onReset }: ContactFormCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const gradientId = useId();

  const [revealed, setRevealed] = useState(false);
  const [view, setView] = useState<View>('form');
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const viewRef = useRef<View>('form');
  const sendStart = useRef(0);
  const measured = useRef(false);

  const width = useMotionValue(0);
  const targetHeight = useMotionValue(0);
  const height = useSpring(targetHeight, { stiffness: 220, damping: 28 });
  const outline = useTransform([width, height], ([w, h]: number[]) => cardPath(w ?? 0, h ?? 0));
  const clipPath = useMotionTemplate`path("${outline}")`;

  // Hold on the centre logo once the card scrolls into view, then reveal the form.
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setRevealed(true), reduced ? 0 : INTRO_HOLD_MS);
    return () => clearTimeout(timer);
  }, [inView, reduced]);

  // Follow the submit status, but never leave the sending state before its animation has played.
  useEffect(() => {
    const next: View = status === 'loading' ? 'sending' : status === 'success' ? 'success' : 'form';
    if (status === 'loading') sendStart.current = performance.now();
    const wait = status === 'loading' || reduced ? 0 : Math.max(0, MIN_SENDING_MS - (performance.now() - sendStart.current));
    const timer = setTimeout(() => {
      viewRef.current = next;
      setView(next);
    }, wait);
    return () => clearTimeout(timer);
  }, [status, reduced]);

  // Track the content's natural size. While sending, the card keeps the height it had.
  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const measure = () => {
      const w = wrap.offsetWidth;
      const h = viewRef.current === 'sending' && measured.current ? targetHeight.get() : content.offsetHeight;
      width.set(w);
      if (!measured.current || reduced) height.jump(h);
      measured.current = true;
      targetHeight.set(h);
      setBox((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [width, height, targetHeight, reduced]);

  const merged = !revealed || view === 'sending';
  const cut = box ? Math.min(cutFor(box.w), box.h / 2) : 72;
  const leg = Math.max(cut - PIECE_GAP, 24);
  const toCentreX = box ? box.w / 2 - (leg + SLIT) / 2 : 0;
  const toCentreY = box ? box.h / 2 - (leg + SLIT) / 2 : 0;
  const pieceTransition = reduced ? { duration: 0 } : ({ type: 'spring', stiffness: 150, damping: 20 } as const);

  return (
    <motion.div
      ref={wrapRef}
      className={`glass-wrap self-start w-full md:w-1/2${merged ? ' is-merged' : ''}${inView ? ' is-live' : ''}`}
      style={{ height: box ? height : undefined }}
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0 : 0.55, ease: 'easeOut' }}
    >
      {/* Glass fill, clipped to the card outline */}
      <motion.div className="glass-blur" style={{ clipPath }} aria-hidden="true" />

      {/* Outline with rounded joints, redrawn as the height springs */}
      <svg className="glass-outline" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={box?.w ?? 1} y2={box?.h ?? 1}>
            <stop offset="0" style={{ stopColor: 'var(--glass-edge-accent)' }} />
            <stop offset="0.28" style={{ stopColor: 'var(--glass-edge)' }} />
            <stop offset="0.72" style={{ stopColor: 'var(--glass-edge)' }} />
            <stop offset="1" style={{ stopColor: 'var(--glass-edge-accent)' }} />
          </linearGradient>
        </defs>
        <motion.path d={outline} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
      </svg>

      <span className="glass-glow" aria-hidden="true" />

      <div ref={contentRef} className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'form' && (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              inert={!revealed}
              variants={list}
              initial="hidden"
              animate={revealed ? 'show' : 'hidden'}
              exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.25 } }}
              className="space-y-5"
            >
              <motion.div variants={item} className="pl-11 sm:pl-12">
                <h3 className="text-2xl sm:text-[1.7rem] font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
                  Send a <span className="text-primary">Message</span>
                </h3>
                <p className="text-sm opacity-70 mt-1" style={{ color: 'var(--foreground)' }}>
                  Tell me about your project and I&apos;ll reply within a day.
                </p>
              </motion.div>

              {status === 'error' && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" icon={User}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="glass-field"
                  />
                </Field>
                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="name@domain.com"
                    autoComplete="email"
                    required
                    className="glass-field"
                  />
                </Field>
              </div>

              <Field label="Subject" icon={Tag}>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={onChange}
                  placeholder="Project inquiry"
                  className="glass-field"
                />
              </Field>

              <Field label="Message" icon={MessageSquare}>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={onChange}
                  placeholder="What are you building?"
                  required
                  className="glass-field resize-none"
                />
              </Field>

              <motion.button variants={item} type="submit" className="glass-submit group">
                <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10">Send Message</span>
                <ArrowRight size={18} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              <motion.p variants={item} className="text-center text-xs opacity-60 pt-1" style={{ color: 'var(--foreground)' }}>
                Prefer email? <a href="mailto:faisalabshar2002@gmail.com" className="text-primary hover:underline">Write to me directly</a>
              </motion.p>
            </motion.form>
          )}

          {view === 'sending' && (
            <motion.div
              key="sending"
              role="status"
              aria-live="polite"
              className="absolute inset-0 flex items-end justify-center pb-[18%] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.45, duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-70" style={{ color: 'var(--foreground)' }}>
                Sending your message
              </p>
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div
              key="success"
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center text-center py-10"
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.2, duration: 0.45 } }}
              exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.25 } }}
            >
              <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="text-primary" aria-hidden="true">
                <motion.circle
                  cx="34"
                  cy="34"
                  r="31"
                  stroke="currentColor"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.25, ease: 'easeOut' }}
                />
                <motion.path
                  d="M21 35l9 9 17-19"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.65, ease: 'easeOut' }}
                />
              </svg>
              <h3 className="text-2xl font-bold mt-5" style={{ color: 'var(--foreground)' }}>
                Message <span className="text-primary">Sent</span>
              </h3>
              <p className="text-sm opacity-70 mt-2 max-w-xs" style={{ color: 'var(--foreground)' }}>
                Thanks for reaching out. I&apos;ll get back to you soon.
              </p>
              <button type="button" onClick={onReset} className="mt-6 text-sm text-primary underline-offset-4 hover:underline">
                Send another message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner pieces: rest in the cut-away corners, meet in the centre as the logo */}
      {box && (
        <>
          <motion.svg
            className="glass-piece"
            style={{ left: 0, top: 0 }}
            width={leg}
            height={leg}
            aria-hidden="true"
            initial={false}
            animate={{ x: merged ? toCentreX : 0, y: merged ? toCentreY : 0 }}
            transition={pieceTransition}
          >
            <path d={roundedPath([[1, 1, 10], [leg - 1, 1, 7], [1, leg - 1, 7]])} />
          </motion.svg>
          <motion.svg
            className="glass-piece"
            style={{ right: 0, bottom: 0 }}
            width={leg}
            height={leg}
            aria-hidden="true"
            initial={false}
            animate={{ x: merged ? -toCentreX : 0, y: merged ? -toCentreY : 0 }}
            transition={pieceTransition}
          >
            <path d={roundedPath([[leg - 1, 1, 7], [leg - 1, leg - 1, 10], [1, leg - 1, 7]])} />
          </motion.svg>
        </>
      )}
    </motion.div>
  );
}
