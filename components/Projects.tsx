'use client';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function Projects() {
  const projects = [
    {
      title: 'LearnBright',
      subtitle: 'EdTech Platform',
      description: 'Interactive Teacher/Student dashboards with custom video engine and in-video quiz system.',
      tech: ['Next.js', 'TypeScript', 'Laravel', 'MySQL'],
      link: 'https://dev.learnbright.org',
      image: '/projects/learnbright.jpg',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'HomaCare',
      subtitle: 'Healthcare Platform',
      description: 'Responsive multilingual healthcare web application with clean UX.',
      tech: ['Next.js', 'Tailwind CSS'],
      link: 'https://dev.homacare.co',
      image: '/projects/homacare.jpg',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'SochAI',
      subtitle: 'AI Group Platform',
      description: 'Conversational AI web UI with group chat and enhanced performance.',
      tech: ['Next.js', 'AI Integration'],
      link: 'https://sochai.360xpertsolutions.com',
      image: '/projects/sochai.jpg',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Conclavity',
      subtitle: 'Business Platform',
      description: 'Production-grade web application with modern UI/UX.',
      tech: ['Next.js', 'Tailwind CSS'],
      link: 'https://conclavity.com',
      image: '/projects/conclavity.jpg',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="projects" className="py-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>My Projects</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">What I've Built</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-xl overflow-hidden border border-primary/20 hover:border-primary/50 transition-all duration-300"
              style={{ backgroundColor: 'var(--card)' }}
            >
              {/* Project Image/Gradient */}
              <div className={`h-48 bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-bold text-white z-10">{project.title}</h3>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <p className="text-primary font-medium text-sm mb-2">{project.subtitle}</p>
                <p className="opacity-80 mb-4 leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-all overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></span>
                    <ExternalLink size={16} className="relative z-10" />
                    <span className="relative z-10">Visit Site</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
