'use client';

import CodeWall from './CodeWall';
import { motion } from 'framer-motion';

const SKILLS_CODE = [
  'import { useQuery } from \'@tanstack/react-query\';',
  'const { data } = useQuery({ queryKey: [\'lessons\'], queryFn: fetchLessons });',
  '',
  'Route::middleware(\'auth:api\')->get(\'/quizzes\', [QuizController::class, \'index\']);',
  '$users = User::with(\'roles\')->where(\'active\', true)->paginate(20);',
  '',
  'SELECT id, title FROM lessons WHERE published = true ORDER BY created_at DESC;',
  '',
  'export const useCart = create<CartState>((set) => ({',
  '  items: [],',
  '  add: (item) => set((s) => ({ items: [...s.items, item] })),',
  '}));',
  '',
  'const socket = io(process.env.NEXT_PUBLIC_WS_URL);',
  'socket.on(\'grade:update\', (grade) => setGrade(grade));',
  '',
  'await s3.putObject({ Bucket, Key: `lessons/${id}.mp4`, Body: file });',
  '',
  'export default async function Page({ params }) {',
  '  const course = await getCourse(params.slug);',
  '  return <CoursePlayer course={course} />;',
  '}',
  '',
  'php artisan queue:work --tries=3 --backoff=10',
  'npm run build && vercel --prod',
];

export default function Skills() {
  const skillCategories = [
    { title: 'Frontend', skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'React Query'] },
    { title: 'Backend', skills: ['Node.js', 'Laravel', 'PHP', 'WordPress', 'RESTful API'] },
    { title: 'Database', skills: ['MySQL', 'PostgreSQL'] },
    { title: 'Other', skills: ['Python', 'Git', 'Claude Code', 'Agile/Scrum', 'OpenAI API'] },
  ];

  return (
    <section id="skills" className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--card-glass)' }}>
      <CodeWall lines={SKILLS_CODE} side="left" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>My Skills</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">What I Know</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border border-primary/20 p-6 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
              <h3 className="text-xl font-bold mb-4 border-b border-primary/20 pb-2" style={{ color: 'var(--foreground)' }}>{category.title}</h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, j) => (
                  <span key={j} className="relative px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 cursor-default overflow-hidden group">
                    <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">{skill}</span>
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
