'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeToggle } from '@/lib/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeToggle();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:scale-110"
      style={{ backgroundColor: 'var(--card)' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-primary" />
      ) : (
        <Moon size={20} className="text-primary" />
      )}
    </button>
  );
}
