'use client';
import { motion } from 'framer-motion';

export default function Skills() {
  const skillCategories = [
    { title: 'Frontend', skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'React Query'] },
    { title: 'Backend', skills: ['Node.js', 'Laravel', 'PHP', 'RESTful API'] },
    { title: 'Database', skills: ['MySQL', 'PostgreSQL'] },
    { title: 'Other', skills: ['Python', 'Git', 'Agile/Scrum', 'OpenAI API'] },
  ];

  return (
    <section id="skills" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-2">My Skills</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">What I Know</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-background border border-primary/20 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-primary/20 pb-2">{category.title}</h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, j) => (
                  <span key={j} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 hover:bg-primary hover:text-white transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
