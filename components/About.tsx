'use client';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-2">About Me</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Who I Am</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-5/12">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border-2 border-primary/20 group">
              <img src="/my_profile.jpg" alt="M Faisal Abshar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-7/12">
            <h3 className="text-2xl font-bold text-white mb-4">I'm M Faisal Abshar and I'm a <span className="text-primary">Full Stack Developer</span></h3>
            <div className="text-gray-400 space-y-4 text-lg leading-relaxed">
              <p>With over 2 years of hands-on experience, I deliver production-grade web applications across EdTech and AI platforms. I specialize in Next.js, React, TypeScript, Laravel, and Node.js.</p>
              <p>My track record includes building complex systems such as a custom video learning engine, real-time grading pipelines, and AI-integrated conversational platforms.</p>
              <p>Currently pursuing a BS in Software Engineering at Sindh Madressatul Islam University, while working full-time.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
