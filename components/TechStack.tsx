'use client';
import { motion } from 'framer-motion';
import { 
  SiReact, 
  SiNextdotjs, 
  SiTypescript, 
  SiJavascript, 
  SiTailwindcss, 
  SiNodedotjs, 
  SiLaravel, 
  SiPhp, 
  SiMysql, 
  SiPostgresql, 
  SiPython,
  SiGit,
  SiWordpress,
  SiClaude,
  SiDocker
} from 'react-icons/si';
import { TbBrandReactNative } from 'react-icons/tb';

export default function TechStack() {
  const technologies = [
    { name: 'React', icon: SiReact, color: '#61DAFB' },
    { name: 'React Native', icon: TbBrandReactNative, color: '#00B4D8' },
    { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
    { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
    { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
    { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
    { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
    { name: 'Laravel', icon: SiLaravel, color: '#FF2D20' },
    { name: 'PHP', icon: SiPhp, color: '#777BB4' },
    { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
    { name: 'Python', icon: SiPython, color: '#3776AB' },
    { name: 'Git', icon: SiGit, color: '#F05032' },
    { name: 'Docker', icon: SiDocker, color: '#2496ED' },
    { name: 'WordPress', icon: SiWordpress, color: '#21759B' },
    { name: 'Claude Code', icon: SiClaude, color: '#D97757' },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--card-glass)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Technologies I Work With
          </h3>
          <p className="opacity-70" style={{ color: 'var(--foreground)' }}>
            Modern tools and frameworks I use daily
          </p>
        </motion.div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-6">
          {technologies.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col items-center gap-3 p-2 sm:p-4 rounded-xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <tech.icon 
                size={48} 
                style={{ color: tech.color }}
                className="group-hover:drop-shadow-[0_0_10px_rgba(220,20,60,0.5)] transition-all duration-300"
              />
              <span className="text-xs text-center font-medium opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground)' }}>
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
