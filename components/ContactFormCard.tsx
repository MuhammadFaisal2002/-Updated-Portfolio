'use client';

import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { AlertCircle, ArrowRight, Mail, MessageSquare, Tag, User, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';

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

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: 'easeOut' } },
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
 * Contact form presented as a frosted glass card with two cut corners.
 * - Intro: the card opens empty with the logo tile, then the fields stagger in.
 * - Submit: the card morphs (animated height + content swap) into a sending
 *   state and then a success state, and back to the form afterwards.
 * Presentation only: all form state and submission logic stay in Contact.
 */
export default function ContactFormCard({ formData, status, errorMessage, onChange, onSubmit, onReset }: ContactFormCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  const [revealed, setRevealed] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  // Hold on the logo for a beat once the card scrolls into view, then reveal the form.
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setRevealed(true), reduced ? 0 : 1100);
    return () => clearTimeout(timer);
  }, [inView, reduced]);

  // Track the content's natural height so the card can morph between views.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const view = status === 'loading' ? 'sending' : status === 'success' ? 'success' : 'form';

  return (
    <motion.div
      ref={wrapRef}
      className={`glass-wrap w-full md:w-1/2${revealed ? ' is-revealed' : ''}`}
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0 : 0.55, ease: 'easeOut' }}
    >
      <span className="glass-corner glass-corner-tl" aria-hidden="true" />
      <span className="glass-corner glass-corner-br" aria-hidden="true" />

      <motion.div
        className="glass-card"
        initial={false}
        animate={{ height }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 30 }}
      >
        <span className="glass-edge glass-edge-tl" aria-hidden="true" />
        <span className="glass-edge glass-edge-br" aria-hidden="true" />
        <span className="glass-shine" aria-hidden="true" />

        <AnimatePresence>
          {!revealed && (
            <motion.div
              key="logo"
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              exit={{ opacity: 0, scale: 1.35, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div className="glass-logo">MF</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={contentRef} className="relative p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'form' && (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                inert={!revealed}
                variants={list}
                initial="hidden"
                animate={revealed ? 'show' : 'hidden'}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                className="space-y-5"
              >
                <motion.div variants={item}>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
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
                  <Field label="Name *" icon={User}>
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
                  <Field label="Email *" icon={Mail}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      placeholder="name@example.com"
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

                <Field label="Message *" icon={MessageSquare}>
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={onChange}
                    placeholder="What are you building?"
                    required
                    className="glass-field resize-none"
                  />
                </Field>

                <motion.button
                  variants={item}
                  type="submit"
                  className="relative w-full bg-primary text-white font-medium py-3.5 rounded-lg flex justify-center items-center gap-2 overflow-hidden group transition-shadow hover:shadow-[0_0_24px_rgba(220,20,60,0.45)]"
                >
                  <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10">Send Message</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </motion.form>
            )}

            {view === 'sending' && (
              <motion.div
                key="sending"
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center text-center py-8"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
              >
                <span className="glass-spinner" aria-hidden="true" />
                <p className="mt-5 font-mono text-sm opacity-80" style={{ color: 'var(--foreground)' }}>
                  Sending your message…
                </p>
              </motion.div>
            )}

            {view === 'success' && (
              <motion.div
                key="success"
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center text-center py-6"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
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
                    transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
                  />
                  <motion.path
                    d="M21 35l9 9 17-19"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.4, ease: 'easeOut' }}
                  />
                </svg>
                <h3 className="text-2xl font-bold mt-5" style={{ color: 'var(--foreground)' }}>
                  Message <span className="text-primary">Sent</span>
                </h3>
                <p className="text-sm opacity-70 mt-2 max-w-xs" style={{ color: 'var(--foreground)' }}>
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={onReset}
                  className="mt-6 text-sm text-primary underline-offset-4 hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
