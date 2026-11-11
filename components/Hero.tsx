'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

export default function Hero() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typedRef.current) {
      const typed = new Typed(typedRef.current, {
        strings: [
          'Full Stack Developer',
          'Creative Coder',
          'Frontend Engineer',
          'Backend Architect',
          'MERN Stack Developer',
          'Next.js Developer',
          'API Builder',
          'Freelancer'
        ],
        typeSpeed: 50,
        backSpeed: 50,
        loop: true,
      });

      return () => {
        typed.destroy();
      };
    }
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl md:text-2xl mb-4 tracking-wide opacity-70" style={{ color: 'var(--foreground)' }}>
            Hello, my name is
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--foreground)' }}>
            M Faisal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Abshar</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-8 flex items-center justify-center gap-3 opacity-80" style={{ color: 'var(--foreground)' }}>
            I&apos;m a <span ref={typedRef} className="text-primary"></span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="#contact" className="relative px-8 py-4 bg-primary text-white rounded-lg font-medium transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(220,20,60,0.4)] flex items-center gap-2 overflow-hidden group">
            <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="relative z-10">Hire Me</span>
            <ArrowRight size={20} className="relative z-10" />
          </Link>
          <a 
            href="/MuhammadFaisalAbshar_Resume.pdf" 
            download="MuhammadFaisalAbshar_Resume.pdf"
            className="relative px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-lg font-medium transition-all flex items-center gap-2 overflow-hidden group"
          >
            <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Download CV</span>
            <Download size={20} className="relative z-10 group-hover:text-white transition-colors duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
