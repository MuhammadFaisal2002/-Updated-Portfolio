import type { ReactNode } from 'react';

const KEYWORD = /\b(const|let|await|async|return|import|from|export|function|class|new|extends|public|protected|SELECT|FROM|WHERE|ORDER BY|DESC|true|false)\b/g;

function highlight(line: string, key: number): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(KEYWORD)) {
    const start = m.index ?? 0;
    if (start > last) parts.push(line.slice(last, start));
    parts.push(<span key={`${key}-${start}`} className="kw">{m[0]}</span>);
    last = start + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

interface CodeWallProps {
  lines: string[];
  side?: 'left' | 'right';
}

/**
 * Faint, slowly scrolling wall of code behind a section. Purely decorative:
 * hidden from assistive tech, non-selectable, and static when the visitor
 * prefers reduced motion. The list is rendered twice for a seamless loop.
 */
export default function CodeWall({ lines, side = 'right' }: CodeWallProps) {
  const block = [...lines, '', ...lines, ''];
  return (
    <div aria-hidden="true" className={`code-wall code-wall-${side} hidden md:block`}>
      <pre>
        {block.map((line, i) => (
          <div key={i}>{highlight(line, i)}</div>
        ))}
      </pre>
    </div>
  );
}
