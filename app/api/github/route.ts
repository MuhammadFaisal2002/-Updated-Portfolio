import { NextResponse } from 'next/server';

/**
 * Aggregates public GitHub data for the portfolio's GitHub Activity section.
 * Set GITHUB_TOKEN (classic token with `read:user`) to raise rate limits and
 * include private contributions in the heatmap via GraphQL. Without it the
 * heatmap falls back to a public contributions mirror.
 */

const USERNAME = process.env.GITHUB_USERNAME || 'MuhammadFaisal2002';
const TOKEN = process.env.GITHUB_TOKEN;
const REVALIDATE = 3600; // one hour

export const revalidate = 3600;

interface Day { date: string; count: number }

interface RestUser { login: string; name: string | null; public_repos: number; followers: number; html_url: string; avatar_url: string }
interface RestRepo { name: string; description: string | null; language: string | null; stargazers_count: number; html_url: string; pushed_at: string; fork: boolean }
interface RestEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: { message: string }[];
    pull_request?: { title: string };
    ref?: string | null;
    ref_type?: string;
    action?: string;
    issue?: { title: string };
    release?: { name: string | null; tag_name: string };
  };
}

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'faisal-portfolio',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function eventMessage(e: RestEvent): string {
  const p = e.payload ?? {};
  switch (e.type) {
    case 'PushEvent': return p.commits?.[0]?.message?.split('\n')[0] ?? 'Pushed commits';
    case 'PullRequestEvent': return `${p.action ?? 'opened'}: ${p.pull_request?.title ?? 'pull request'}`;
    case 'CreateEvent': return `Created ${p.ref_type ?? 'repository'}${p.ref ? ` ${p.ref}` : ''}`;
    case 'IssuesEvent': return `${p.action ?? 'opened'}: ${p.issue?.title ?? 'issue'}`;
    case 'ReleaseEvent': return p.release?.name || p.release?.tag_name || 'Published release';
    case 'WatchEvent': return 'Starred repository';
    case 'ForkEvent': return 'Forked repository';
    default: return e.type.replace('Event', '');
  }
}

// Split a flat, sorted day list into Monday-first weeks (drops the leading partial week)
function toWeeks(days: Day[]): Day[][] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstMonday = sorted.findIndex((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 1);
  const trimmed = firstMonday > 0 ? sorted.slice(firstMonday) : sorted;
  const weeks: Day[][] = [];
  for (let i = 0; i < trimmed.length; i += 7) weeks.push(trimmed.slice(i, i + 7));
  return weeks;
}

interface Contributions { totalThisYear: number; weeks: Day[][] }

// `year` undefined = rolling last 12 months (GitHub's default); a number = that calendar year.
async function contributionsViaGraphQL(year?: number): Promise<Contributions | null> {
  if (!TOKEN) return null;
  const query = `query($login: String!, $from: DateTime, $to: DateTime) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }`;
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          login: USERNAME,
          from: year ? `${year}-01-01T00:00:00Z` : undefined,
          to: year ? `${year}-12-31T23:59:59Z` : undefined,
        },
      }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number }[] }[] } } } };
    };
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;
    const days = calendar.weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
    return { totalThisYear: calendar.totalContributions, weeks: toWeeks(days) };
  } catch {
    return null;
  }
}

async function contributionsViaMirror(year?: number): Promise<Contributions | null> {
  try {
    const y = year ? String(year) : 'last';
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${y}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    const json = (await res.json()) as { total?: Record<string, number>; contributions?: { date: string; count: number }[] };
    if (!json.contributions?.length) return null;
    const days = json.contributions.map((d) => ({ date: d.date, count: d.count }));
    const total = json.total?.[year ? y : 'lastYear'] ?? days.reduce((sum, d) => sum + d.count, 0);
    return { totalThisYear: total, weeks: toWeeks(days) };
  } catch {
    return null;
  }
}

async function contributions(year?: number): Promise<Contributions | null> {
  return (await contributionsViaGraphQL(year)) ?? contributionsViaMirror(year);
}

export async function GET() {
  // Heatmap tabs: rolling last year plus the current and previous calendar years.
  const thisYear = new Date().getUTCFullYear();
  const YEARS = [thisYear, thisYear - 1];

  const [user, repos, events, lastYear, ...byYear] = await Promise.all([
    gh<RestUser>(`/users/${USERNAME}`),
    gh<RestRepo[]>(`/users/${USERNAME}/repos?sort=pushed&per_page=100`),
    gh<RestEvent[]>(`/users/${USERNAME}/events/public?per_page=30`),
    contributions(),
    ...YEARS.map((y) => contributions(y).then((c) => (c ? { year: y, ...c } : null))),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'GitHub data is temporarily unavailable.' }, { status: 502 });
  }

  const ownRepos = (repos ?? []).filter((r) => !r.fork);

  const languageCounts = new Map<string, number>();
  ownRepos.forEach((r) => { if (r.language) languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1); });
  const languageTotal = Array.from(languageCounts.values()).reduce((a, b) => a + b, 0) || 1;
  const languages = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, percent: Math.round((count / languageTotal) * 100) }));

  return NextResponse.json({
    profile: {
      login: user.login,
      name: user.name,
      url: user.html_url,
      avatar: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
    },
    repos: ownRepos.slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      updatedAt: r.pushed_at,
    })),
    recentActivity: (events ?? []).slice(0, 8).map((e) => ({
      type: e.type,
      repo: e.repo.name,
      message: eventMessage(e),
      createdAt: e.created_at,
    })),
    languages,
    contributions: lastYear,
    contributionYears: byYear.filter((c): c is Contributions & { year: number } => c !== null),
  });
}
