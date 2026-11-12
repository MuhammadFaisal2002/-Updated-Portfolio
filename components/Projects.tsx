'use client';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import BorderGlow from './BorderGlow';

export default function Projects() {
  const projects = [
    {
      title: 'LearnBright',
      subtitle: 'EdTech Platform',
      description: 'Interactive Teacher/Student dashboards with custom video engine and in-video quiz system.',
      tech: ['Next.js', 'TypeScript', 'Laravel', 'MySQL'],
      link: 'https://dev.learnbright.org',
      image: '/projects/learnbright.jpg',
      imageAlt: 'LearnBright dashboards on two laptops in a classroom',
      focus: '50% 62%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'HomaCare',
      subtitle: 'Healthcare Platform',
      description: 'Responsive multilingual healthcare web application with clean UX.',
      tech: ['Next.js', 'Tailwind CSS'],
      link: 'https://dev.homacare.co',
      image: '/projects/homacare.jpg',
      imageAlt: 'HomaCare consultation and lab test screens on two laptops in a hospital',
      focus: '50% 50%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'SochAI',
      subtitle: 'AI Group Platform',
      description: 'Conversational AI web UI with group chat and enhanced performance.',
      tech: ['Next.js', 'AI Integration'],
      link: 'https://sochai.360xpertsolutions.com',
      image: '/projects/sochai.jpg',
      imageAlt: 'SochAI community feed and chat screens on two laptops at a meetup',
      focus: '50% 55%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Conclavity',
      subtitle: 'Business Platform',
      description: 'Production-grade web application with modern UI/UX.',
      tech: ['Next.js', 'Tailwind CSS'],
      link: 'https://conclavity.com',
      image: '/projects/conclavity.jpg',
      imageAlt: 'Conclavity chat and call screens on two laptops in a team room',
      focus: '50% 50%',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="projects" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>My Projects</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">What I&apos;ve Built</span>
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
              className="h-full"
            >
              {/* The glow wrapper sits outside the card's overflow clip so its halo can spill past the border */}
              <BorderGlow className="h-full rounded-xl">
              <div
                className="group relative h-full rounded-xl overflow-hidden border border-primary/20 transition-colors duration-300"
                style={{ backgroundColor: 'var(--card)' }}
              >
              {/* Project image (3:2, matching the artwork) or a gradient until one is added */}
              <div className={`aspect-[3/2] bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                {project.image ? (
                  <>
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ objectPosition: project.focus }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent pointer-events-none"></div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/90 z-10">{project.title}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{project.title}</h3>
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
              </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
