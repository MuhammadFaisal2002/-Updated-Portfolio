'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl md:text-2xl text-gray-400 mb-4 tracking-wide">
            Hello, my name is
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-4">
            M Faisal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Abshar</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-gray-300 mb-8">
            I'm a <span className="text-primary">Full Stack Developer</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="#contact" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(220,20,60,0.4)] flex items-center gap-2">
            Hire Me <ArrowRight size={20} />
          </Link>
          <a href="#" className="px-8 py-4 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 rounded-lg font-medium transition-all flex items-center gap-2">
            Download CV <Download size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
