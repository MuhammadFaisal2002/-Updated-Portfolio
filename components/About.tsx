'use client';

import CodeWall from './CodeWall';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ABOUT_CODE = [
  'const developer = {',
  '  name: \'M Faisal Abshar\',',
  '  role: \'Full Stack Developer\',',
  '  location: \'Karachi, PK\',',
  '  experience: \'2+ years\',',
  '  stack: [\'Next.js\', \'Laravel\', \'TypeScript\', \'MySQL\'],',
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
  return (
    <section id="about" className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--card-glass)' }}>
      <CodeWall lines={ABOUT_CODE} side="right" />
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
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border-2 border-primary/20 group">
              <Image
                src="/profile.png"
                alt="M Faisal Abshar"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-7/12">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>I&apos;m M Faisal Abshar and I&apos;m a <span className="text-primary">Full Stack Developer</span></h3>
            <div className="space-y-4 text-lg leading-relaxed opacity-80" style={{ color: 'var(--foreground)' }}>
              <p>With over 2 years of hands-on experience, I deliver production-grade web applications across EdTech and AI platforms. I specialize in Next.js, React, TypeScript, Laravel, and Node.js.</p>
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
