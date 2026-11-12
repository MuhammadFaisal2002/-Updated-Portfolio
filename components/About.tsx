'use client';

import CodeWall from './CodeWall';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useCallback, useRef, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/lib/useTheme';

// Three.js, the physics engine and the badge only load on desktop, once About is near the viewport.
const Lanyard = dynamic(() => import('./3d/Lanyard'), { ssr: false, loading: () => null });

const PROFILE_SRC = '/profile.png';
/** Small pre-sized copy for the 3D badge, served as a plain static file. */
const BADGE_PHOTO_SRC = '/profile-badge.jpg';

/** If WebGL or the physics engine fails, fall back to the plain photo. */
class LanyardBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const ABOUT_CODE = [
  'const developer = {',
  '  name: \'M Faisal Abshar\',',
  '  role: \'Full Stack Developer\',',
  '  location: \'Karachi, PK\',',
  '  experience: \'2+ years\',',
  '  stack: [\'Next.js\', \'Node.js\', \'Laravel\', \'TypeScript\', \'MySQL\'],',
  '  focus: [\'EdTech\', \'Healthcare\', \'AI platforms\'],',
  '  openTo: [\'freelance\', \'remote roles\'],',
  '};',
  '',
  'export async function build(project) {',
  '  const api = await laravel.boot(project.requirements);',
  '  const ui = await next.render(project.design);',
  '  const tests = await run(\'php artisan test && npm run lint\');',
  '  return ship({ api, ui, tests, loadTime: \'-40%\' });',
  '}',
  '',
  'class Engineer extends Developer {',
  '  learn(topic) { return this.curiosity.push(topic); }',
  '  deliver() { return this.projects.filter((p) => p.shipped); }',
  '}',
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const nearViewport = useInView(sectionRef, { once: true, margin: '300px' });
  const onScreen = useInView(sectionRef, { margin: '100px' });
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const reducedMotion = useReducedMotion();
  const [badgeReady, setBadgeReady] = useState(false);
  const [badgeFailed, setBadgeFailed] = useState(false);

  const showBadge = nearViewport && isDesktop && !reducedMotion && !badgeFailed;
  const hidePhoto = showBadge && badgeReady;
  const handleBadgeReady = useCallback(() => setBadgeReady(true), []);
  const handleBadgeError = useCallback(() => setBadgeFailed(true), []);

  return (
    <section ref={sectionRef} id="about" className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--card-glass)' }}>
      <CodeWall lines={ABOUT_CODE} side="right" />
      {showBadge && (
        <LanyardBoundary onError={handleBadgeError}>
          <Lanyard sectionRef={sectionRef} slotRef={slotRef} visible={onScreen} photoSrc={BADGE_PHOTO_SRC} onReady={handleBadgeReady} />
        </LanyardBoundary>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>About Me</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Who I Am</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-5/12">
            {/* On desktop the 3D badge hangs in front of this box and the photo fades out
                once it is ready; on phones and as a fallback the photo stays. */}
            <div
              ref={slotRef}
              className="relative rounded-2xl overflow-hidden aspect-[4/5] border-2 border-primary/20 group select-none"
              style={{ opacity: hidePhoto ? 0 : 1, transition: 'opacity 0.5s ease' }}
              aria-hidden={hidePhoto}
            >
              <Image
                src={PROFILE_SRC}
                alt="M Faisal Abshar"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-7/12">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>I&apos;m M Faisal Abshar and I&apos;m a <span className="text-primary">Full Stack Developer</span></h3>
            <div className="space-y-4 text-lg leading-relaxed opacity-80" style={{ color: 'var(--foreground)' }}>
              <p>With over 2 years of hands-on experience, I deliver production-grade web applications across EdTech and AI platforms. I specialize in Next.js, React, TypeScript, Node.js, and Laravel.</p>
              <p>My track record includes building complex systems such as a custom video learning engine, real-time grading pipelines, and AI-integrated conversational platforms.</p>
              <p>Currently pursuing a BS in Software Engineering at Sindh Madressatul Islam University, while working full-time.</p>
            </div>
            <button className="relative mt-6 px-8 py-3 bg-primary text-white rounded-lg font-medium transition-all transform hover:-translate-y-1 overflow-hidden group">
              <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="relative z-10">MF Developer</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
