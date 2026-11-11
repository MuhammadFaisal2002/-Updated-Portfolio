'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCommit } from 'lucide-react';
import { SiGithub as Github } from 'react-icons/si';
import ContributionHeatmap, { type ContributionPeriod } from './ContributionHeatmap';

interface Activity { type: string; repo: string; message: string; createdAt: string }
interface Contributions { totalThisYear: number; weeks: { date: string; count: number }[][] }
interface GitHubData {
  profile: { login: string; name: string | null; url: string; avatar: string; publicRepos: number; followers: number };
  recentActivity: Activity[];
  languages: { name: string; percent: number }[];
  contributions: Contributions | null;
  contributionYears?: (Contributions & { year: number })[];
}

const PROFILE_URL = 'https://github.com/MuhammadFaisal2002';

function relativeDate(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    PushEvent: 'PUSH', PullRequestEvent: 'PR', CreateEvent: 'CREATE', IssuesEvent: 'ISSUE',
    ForkEvent: 'FORK', WatchEvent: 'STAR', ReleaseEvent: 'RELEASE',
  };
  return map[type] ?? type.replace('Event', '').toUpperCase();
}

// Build the heatmap tabs: "Last year" first, then each calendar year newest-first.
function toPeriods(data: GitHubData): ContributionPeriod[] {
  const periods: ContributionPeriod[] = [];
  if (data.contributions) {
    periods.push({ key: 'last', label: 'Last year', caption: 'in the last year', total: data.contributions.totalThisYear, weeks: data.contributions.weeks });
  }
  (data.contributionYears ?? [])
    .slice()
    .sort((a, b) => b.year - a.year)
    .forEach((y) => periods.push({ key: String(y.year), label: String(y.year), caption: `in ${y.year}`, total: y.totalThisYear, weeks: y.weeks }));
  return periods;
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-primary/20 p-6 ${className}`} style={{ backgroundColor: 'var(--card)' }}>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-primary/10" />)}
      </div>
      <div className="h-48 rounded-xl bg-primary/10" />
      <div className="h-40 rounded-xl bg-primary/10" />
    </div>
  );
}

export default function GitHubSection() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/github')
      .then((r) => (r.ok ? (r.json() as Promise<GitHubData>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const periods = data ? toPeriods(data) : [];

  return (
    <section id="github" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>GitHub Activity</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Open Source &amp; Commits</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        {failed && (
          <Card className="text-center">
            <p className="opacity-70 mb-4" style={{ color: 'var(--foreground)' }}>GitHub data is taking a break. You can still browse the profile directly.</p>
            <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
              <Github size={16} /> View GitHub
            </a>
          </Card>
        )}

        {!failed && !data && <Skeleton />}

        {data && (
          <div className="space-y-8">
            {/* Stats */}
            <motion.div {...reveal} className="grid grid-cols-3 gap-4">
              {[
                { label: 'Repositories', value: data.profile.publicRepos },
                { label: 'Followers', value: data.profile.followers },
                { label: 'Contributions / yr', value: data.contributions?.totalThisYear ?? 0 },
              ].map((s) => (
                <Card key={s.label} className="text-center !p-5">
                  <p className="text-3xl font-bold text-primary">{s.value.toLocaleString()}</p>
                  <p className="text-xs font-mono uppercase tracking-widest opacity-60 mt-1" style={{ color: 'var(--foreground)' }}>{s.label}</p>
                </Card>
              ))}
            </motion.div>

            {/* Languages */}
            {data.languages.length > 0 && (
              <motion.div {...reveal} className="flex flex-wrap gap-2 justify-center">
                {data.languages.map((l) => (
                  <span key={l.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-primary/20 bg-primary/10" style={{ color: 'var(--foreground)' }}>
                    {l.name} <span className="text-primary">{l.percent}%</span>
                  </span>
                ))}
              </motion.div>
            )}

            {/* Heatmap */}
            {periods.length > 0 && (
              <motion.div {...reveal}>
                <Card>
                  <ContributionHeatmap periods={periods} />
                </Card>
              </motion.div>
            )}

            {/* Recent activity */}
            {data.recentActivity.length > 0 && (
              <motion.div {...reveal}>
                <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4"><span className="opacity-70">{"// "}</span>Recent Activity</p>
                <Card className="!p-4">
                  {data.recentActivity.map((a, i) => (
                    <div key={`${a.type}-${a.createdAt}-${i}`} className="flex items-start gap-3 py-3 border-b border-primary/10 last:border-0">
                      <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 shrink-0 mt-0.5">{eventLabel(a.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs truncate" style={{ color: 'var(--foreground)' }}>{a.repo.split('/')[1] ?? a.repo}</p>
                        <p className="text-xs opacity-60 truncate flex items-center gap-1" style={{ color: 'var(--foreground)' }}><GitCommit size={11} /> {a.message}</p>
                      </div>
                      <span className="font-mono text-[10px] opacity-50 shrink-0" style={{ color: 'var(--foreground)' }}>{relativeDate(a.createdAt)}</span>
                    </div>
                  ))}
                </Card>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div {...reveal} className="text-center">
              <a
                href={data.profile.url || PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-medium transition-all overflow-hidden group"
              >
                <span className="absolute inset-0 bg-primary-hover transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <Github size={18} className="relative z-10" />
                <span className="relative z-10">View Full Profile</span>
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
