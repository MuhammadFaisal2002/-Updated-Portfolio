'use client';
import { motion } from 'framer-motion';

export default function Experience() {
  const experiences = [
    {
      role: 'Full Stack Developer',
      company: '97 Solutions',
      date: 'Feb 2026 – Present',
      points: [
        'Architected responsive Teacher and Student dashboards for a production EdTech platform using Next.js, TypeScript, and Tailwind CSS.',
        'Engineered a custom interactive video player that syncs with backend timestamps to pause playback and trigger in-video quizzes.',
        'Managed complex global state using React Query and Zustand.',
        'Designed and built comprehensive RESTful APIs in Laravel to manage users and multimedia content at scale.'
      ]
    },
    {
      role: 'Front End Developer',
      company: '360 Xpert Solution',
      date: 'Feb 2025 – Jan 2026',
      points: [
        'Delivered production-ready web applications using Next.js and Tailwind CSS with a focus on performance.',
        'Built AI-powered group chat platforms with real-time messaging, integrating LLM APIs.',
        'Created employee monitoring dashboards with live data visualization.',
        'Collaborated directly with clients to translate requirements into functional interfaces.'
      ]
    }
  ];

  return (
    <section id="experience" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-2">Experience</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">My Journey</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>
        
        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-primary/10 p-8 rounded-xl hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
                  <p className="text-primary font-medium text-lg">{exp.company}</p>
                </div>
                <div className="text-gray-400 font-medium">
                  {exp.date}
                </div>
              </div>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {exp.points.map((point, j) => (
                  <li key={j} className="leading-relaxed">{point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
