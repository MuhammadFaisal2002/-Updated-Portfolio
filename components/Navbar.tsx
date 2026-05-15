'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 border-b" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <style jsx>{`
        [data-theme="light"] nav {
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="#" className="text-2xl font-bold tracking-tighter">
              <span className="text-primary">MF</span> <span style={{ color: 'var(--foreground)' }}>DEVELOPER.</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              {['Home', 'About', 'Services', 'Experience', 'Skills', 'Projects', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wider opacity-80"
                  style={{ color: 'var(--foreground)' }}
                >
                  {item}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
