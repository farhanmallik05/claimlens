'use client';

import React, { useEffect, useState } from 'react';
import { ENGINE_VERSION } from '@claimlens/engine';
import { cn } from '@/lib/utils';

export function ProgressRule() {
  const [activeScene, setActiveScene] = useState<string>('scene-1');

  useEffect(() => {
    const handleScroll = () => {
      const sceneIds = [
        'scene-1',
        'scene-2',
        'scene-3',
        'scene-4',
        'scene-5',
        'scene-6',
        'scene-7',
        'scene-8',
      ];
      const scrollPosition = window.scrollY + 200;

      for (const id of sceneIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveScene(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'scene-1', label: '01 / Receipt', short: '01' },
    { id: 'scene-2', label: '02 / Gap', short: '02' },
    { id: 'scene-3', label: '03 / Ripple', short: '03' },
    { id: 'scene-4', label: '04 / Waterfall', short: '04' },
    { id: 'scene-5', label: '05 / How & Clauses', short: '05' },
    { id: 'scene-6', label: '06 / Advisor', short: '06' },
    { id: 'scene-7', label: '07 / Appeal', short: '07' },
    { id: 'scene-8', label: '08 / Summary', short: '08' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-rule py-3 px-4 sm:px-8 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <a href="#scene-1" className="flex items-center gap-2 text-ink hover:text-ink-2 font-bold tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-green" />
            <span>ClaimLens</span>
          </a>
          <span className="text-ink-2/40 hidden sm:inline">|</span>
          <span className="text-ink-2 hidden sm:inline">
            Engine v{ENGINE_VERSION} · CodeQuest 2026
          </span>
        </div>

        {/* Scene Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-1">
          {navLinks.map((link) => {
            const isActive = activeScene === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={cn(
                  'px-2 py-1 rounded transition-colors text-[11px] sm:text-xs select-none whitespace-nowrap min-h-[36px] sm:min-h-[28px] flex items-center',
                  isActive
                    ? 'bg-ink text-paper font-semibold shadow-xs'
                    : 'text-ink-2 hover:text-ink hover:bg-paper-2'
                )}
              >
                <span className="hidden md:inline">{link.label}</span>
                <span className="md:hidden">{link.short}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
