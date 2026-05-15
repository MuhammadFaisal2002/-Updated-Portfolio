'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

export default function Stats() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { value: 2, suffix: '+', label: 'Years Experience', description: 'Building Production Apps' },
    { value: 40, suffix: '%', label: 'Load Time Reduced', description: 'Performance Optimization' },
    { value: 25, suffix: '%', label: 'Bounce Rate Improved', description: 'Enhanced UI/UX' },
    { value: 10, suffix: '+', label: 'Projects Delivered', description: 'For Happy Clients' },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl border border-primary/20 hover:border-primary/50 transition-all"
              style={{ backgroundColor: 'var(--card)' }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {inView && (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {stat.label}
              </div>
              <div className="text-sm opacity-70" style={{ color: 'var(--foreground)' }}>
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
