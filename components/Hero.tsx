'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Component, type ReactNode, useEffect, useRef } from 'react';
import Typed from 'typed.js';

// Load the Three.js scene on the client only; the grid motif shows underneath meanwhile.
const HeroScene = dynamic(() => import('./3d/HeroScene'), { ssr: false, loading: () => null });

// If WebGL fails (old GPU, blocked context) the hero silently falls back to the grid.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const NAME_WORDS = ['M', 'Faisal', 'Abshar'];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function Hero() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: [
        'Full Stack Developer',
        'Creative Coder',
        'Frontend Engineer',
        'Backend Architect',
        'MERN Stack Developer',
        'Next.js Developer',
        'API Builder',
        'Freelancer',
      ],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-20">
      {/* Dense grid motif on top of the site-wide grid */}
      <div className="absolute inset-0 grid-motif pointer-events-none" />

      {/* 3D architecture graph — tablet and up; hidden on phones for performance */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <SceneBoundary>
          <HeroScene />
        </SceneBoundary>
      </div>


      {/* pointer-events-none here so hover reaches the graph nodes; buttons re-enable it */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <motion.p
            {...fadeUp(0.1)}
            className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6"
          >
            <span className="opacity-70">{"// "}</span>SYSTEM.INIT — Full Stack Developer
          </motion.p>

          <motion.p
            {...fadeUp(0.2)}
            className="text-xl md:text-2xl mb-3 tracking-wide opacity-70"
            style={{ color: 'var(--foreground)' }}
          >
            Hello, my name is
          </motion.p>

          {/* Word-by-word headline reveal */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 leading-[0.95]"
            style={{ color: 'var(--foreground)' }}
          >
            {NAME_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className={`inline-block mr-[0.25em] last:mr-0 ${
                  i === NAME_WORDS.length - 1
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400'
                    : ''
                }`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.h2
            {...fadeUp(0.6)}
            className="text-2xl md:text-4xl font-bold mb-8 flex items-center justify-center md:justify-start gap-3 opacity-80"
            style={{ color: 'var(--foreground)' }}
          >
            I&apos;m a <span ref={typedRef} className="text-primary"></span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.75)}
            className="font-mono text-sm md:text-base opacity-70 max-w-xl mb-10 border-l-[3px] border-primary pl-5 leading-relaxed text-left mx-auto md:mx-0"
            style={{ color: 'var(--foreground)' }}
          >
            Next.js and Laravel developer building production EdTech, healthcare, and AI platforms.
            Custom video engines, real-time grading, RESTful APIs, and interfaces people enjoy using.
          </motion.p>

          <motion.div
            {...fadeUp(0.9)}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
          >
            <Link
              href="#contact"
              className="pointer-events-auto relative px-8 py-4 bg-primary text-white rounded-lg font-medium transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(220,20,60,0.4)] flex items-center gap-2 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="relative z-10">Hire Me</span>
              <ArrowRight size={20} className="relative z-10" />
            </Link>
            <a
              href="/MuhammadFaisalAbshar_Resume.pdf"
              download="MuhammadFaisalAbshar_Resume.pdf"
              className="pointer-events-auto relative px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-lg font-medium transition-all flex items-center gap-2 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Download CV</span>
              <Download size={20} className="relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          </motion.div>

          {/* Status chips */}
          <motion.div
            {...fadeUp(1.1)}
            className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3"
          >
            <a
              href="#contact"
              className="pointer-events-auto flex items-center gap-2.5 border border-primary/20 hover:border-primary/50 rounded-lg px-4 py-2 transition-colors group"
              style={{ backgroundColor: 'var(--card-glass)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80" style={{ color: 'var(--foreground)' }}>
                Open to freelance &amp; remote roles
              </span>
              <span className="font-mono text-[10px] text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <span
              className="pointer-events-auto flex items-center gap-2 border border-primary/20 rounded-lg px-4 py-2"
              style={{ backgroundColor: 'var(--card-glass)' }}
            >
              <MapPin size={12} className="text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80" style={{ color: 'var(--foreground)' }}>
                Karachi, PK · UTC+5
              </span>
            </span>
          </motion.div>
        </div>

      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-4 sm:left-6 lg:left-8 z-10 hidden md:block font-mono text-[10px] uppercase tracking-[0.2em] text-primary"
      >
        <span className="opacity-70">{"// "}</span>Scroll to explore
      </motion.p>
    </section>
  );
}
