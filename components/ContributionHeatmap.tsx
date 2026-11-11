'use client';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

interface ContributionDay { date: string; count: number }
export interface ContributionPeriod { key: string; label: string; caption: string; total: number; weeks: ContributionDay[][] }
interface Props { periods: ContributionPeriod[] }

const SCALE = {
  dark:  ['#2b2b2b', '#4a1220', '#8a1a2e', '#b01030', '#dc143c'],
  light: ['#e9ebee', '#f6c2cd', '#ea8aa0', '#dc143c', '#a30f2c'],
} as const;

function cellColor(count: number, scale: readonly string[]): string {
  if (count === 0) return scale[0]!;
  if (count <= 2) return scale[1]!;
  if (count <= 5) return scale[2]!;
  if (count <= 9) return scale[3]!;
  return scale[4]!;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONO = 'var(--font-geist-mono), monospace';

// ── Mobile: one month at a time as a calendar grid ────────────────────────────
function CalendarGrid({ weeks, monthKey, scale }: { weeks: ContributionDay[][]; monthKey: string; scale: readonly string[] }) {
  const dayMap = useMemo(() => {
    const m = new Map<string, number>();
    weeks.forEach((w) => w.forEach((d) => m.set(d.date, d.count)));
    return m;
  }, [weeks]);

  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const daysInMonth = new Date(year, month, 0).getDate();
  const rawFirst = new Date(year, month - 1, 1).getDay();
  const offset = rawFirst === 0 ? 6 : rawFirst - 1;

  const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-[9px] opacity-50" style={{ fontFamily: MONO, color: 'var(--foreground)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="aspect-square" />;
          const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = dayMap.get(date) ?? 0;
          return (
            <div
              key={i}
              title={`${count} contribution${count === 1 ? '' : 's'} on ${date}`}
              className="aspect-square rounded-md flex items-center justify-center text-[9px] font-semibold select-none"
              style={{
                fontFamily: MONO,
                backgroundColor: cellColor(count, scale),
                color: count >= 5 ? '#ffffff' : 'var(--foreground)',
                opacity: count === 0 ? 0.7 : 1,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Desktop: classic week-column heatmap ──────────────────────────────────────
function DesktopHeatmap({ weeks, scale }: { weeks: ContributionDay[][]; scale: readonly string[] }) {
  const CELL = 11;
  const GAP = 3;
  const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let last = -1;
    weeks.forEach((week, col) => {
      const first = week[0];
      if (!first) return;
      const m = new Date(`${first.date}T00:00:00`).getMonth();
      if (m !== last) { labels.push({ label: MONTHS[m] ?? '', col }); last = m; }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="relative" style={{ paddingTop: 20, paddingLeft: 32 }}>
      <div className="absolute" style={{ top: 0, left: 32 }}>
        {monthLabels.map(({ label, col }) => (
          <span
            key={`${label}-${col}`}
            className="absolute text-[10px] opacity-50 whitespace-nowrap"
            style={{ left: col * (CELL + GAP), fontFamily: MONO, color: 'var(--foreground)' }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="absolute flex flex-col" style={{ left: 0, top: 20, gap: GAP }}>
        {DAYS.map((d, i) => (
          <div key={i} className="text-[9px] opacity-50 flex items-center" style={{ height: CELL, fontFamily: MONO, color: 'var(--foreground)' }}>{d}</div>
        ))}
      </div>
      <div className="flex" style={{ gap: GAP }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                className="rounded-[2px] hover:opacity-70 transition-opacity"
                style={{ width: CELL, height: CELL, backgroundColor: cellColor(day.count, scale) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ContributionHeatmap({ periods }: Props) {
  const theme = useTheme();
  const scale = SCALE[theme];

  const [periodKey, setPeriodKey] = useState(periods[0]?.key ?? 'last');
  const period = periods.find((p) => p.key === periodKey) ?? periods[0];
  const weeks = useMemo(() => period?.weeks ?? [], [period]);

  const months = useMemo(() => {
    const seen = new Set<string>();
    const list: { key: string; label: string }[] = [];
    weeks.forEach((w) => w.forEach((d) => {
      const dt = new Date(`${d.date}T00:00:00`);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) { seen.add(key); list.push({ key, label: `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}` }); }
    }));
    return list;
  }, [weeks]);

  // Large initial value clamps to the latest month; switching periods resets it the same way.
  const [monthIdx, setMonthIdx] = useState(999);
  const idx = Math.max(0, Math.min(monthIdx, months.length - 1));
  const current = months[idx];

  if (!period) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
          <span className="text-primary font-bold text-lg">{period.total.toLocaleString()}</span>
          <span className="opacity-70"> contributions {period.caption}</span>
        </p>
        {periods.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border border-primary/20 p-1" role="tablist" aria-label="Contribution period">
            {periods.map((p) => {
              const active = p.key === period.key;
              return (
                <button
                  key={p.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setPeriodKey(p.key); setMonthIdx(999); }}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-widest transition-colors ${active ? 'bg-primary text-white' : 'opacity-60 hover:opacity-100 hover:bg-primary/10'}`}
                  style={active ? undefined : { color: 'var(--foreground)' }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        {current && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonthIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="p-1 rounded disabled:opacity-30 hover:bg-primary/10" aria-label="Previous month" style={{ color: 'var(--foreground)' }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>{current.label}</span>
              <button onClick={() => setMonthIdx(Math.min(months.length - 1, idx + 1))} disabled={idx >= months.length - 1} className="p-1 rounded disabled:opacity-30 hover:bg-primary/10" aria-label="Next month" style={{ color: 'var(--foreground)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <CalendarGrid weeks={weeks} monthKey={current.key} scale={scale} />
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto pb-1">
        <DesktopHeatmap weeks={weeks} scale={scale} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end text-[10px] opacity-60" style={{ fontFamily: MONO, color: 'var(--foreground)' }}>
        <span>Less</span>
        {scale.map((c) => <span key={c} className="inline-block rounded-[2px]" style={{ width: 11, height: 11, backgroundColor: c }} />)}
        <span>More</span>
      </div>
    </div>
  );
}
