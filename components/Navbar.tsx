'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ['Home', 'About', 'Services', 'Experience', 'Skills', 'Projects', 'Contact'];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 border-b" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <style jsx>{`
        [data-theme="light"] nav {
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
        }
        [data-theme="light"] .mobile-menu {
          background-color: rgba(255, 255, 255, 0.95) !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="#" className="text-xl md:text-2xl font-bold tracking-tighter">
              <span className="text-primary">MF</span> <span style={{ color: 'var(--foreground)' }}>DEVELOPER.</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-baseline space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wider opacity-80 hover:opacity-100"
                  style={{ color: 'var(--foreground)' }}
                >
                  {item}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/10 transition-colors"
              style={{ color: 'var(--foreground)' }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden mobile-menu transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(26, 26, 26, 0.95)' }}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={handleNavClick}
              className="block px-4 py-3 rounded-md text-base font-medium uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
