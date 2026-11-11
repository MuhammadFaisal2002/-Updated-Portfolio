'use client';
import { motion } from 'framer-motion';
import { Code2, Palette, Server, Zap, Database, Smartphone } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: Code2,
      title: 'Full Stack Development',
      description: 'End-to-end web application development using modern technologies like Next.js, React, Laravel, and Node.js.',
      features: ['Custom Web Apps', 'Responsive Design', 'Database Integration', 'API Development']
    },
    {
      icon: Palette,
      title: 'Frontend Development',
      description: 'Beautiful, responsive user interfaces with React, Next.js, TypeScript, and Tailwind CSS.',
      features: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Responsive UI']
    },
    {
      icon: Server,
      title: 'Backend Development',
      description: 'Robust server-side applications with Laravel, Node.js, and RESTful API architecture.',
      features: ['Laravel/PHP', 'Node.js', 'RESTful APIs', 'Database Design']
    },
    {
      icon: Database,
      title: 'Database Management',
      description: 'Efficient database design and optimization with MySQL and PostgreSQL.',
      features: ['MySQL', 'PostgreSQL', 'Query Optimization', 'Data Modeling']
    },
    {
      icon: Zap,
      title: 'Website Optimization',
      description: 'Performance optimization to reduce load times and improve user experience.',
      features: ['Speed Optimization', 'SEO', 'Code Splitting', 'Caching']
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Mobile-first design approach ensuring perfect experience across all devices.',
      features: ['Mobile First', 'Cross-browser', 'Touch Optimized', 'PWA Ready']
    }
  ];

  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            My Services
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">What I Offer</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300"
              style={{ backgroundColor: 'var(--card)' }}
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                  <service.icon 
                    size={32} 
                    className="text-primary group-hover:text-white transition-colors duration-300" 
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{ color: 'var(--foreground)' }}>
                {service.title}
              </h3>

              {/* Description */}
              <p className="opacity-80 mb-4 leading-relaxed" style={{ color: 'var(--foreground)' }}>
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm opacity-70" style={{ color: 'var(--foreground)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg mb-6 opacity-80" style={{ color: 'var(--foreground)' }}>
            Ready to start your project?
          </p>
          <a
            href="#contact"
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-medium transition-all overflow-hidden group"
          >
            <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="relative z-10">Get in Touch</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
