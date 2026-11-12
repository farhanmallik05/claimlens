'use client';

import React from 'react';
import { X, Keyboard, Play, ArrowRight, ArrowLeft, Space, CornerDownLeft } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'J', description: 'Start / Stop 90-Second Judge Tour' },
    { key: 'Space', description: 'Pause / Resume Active Tour' },
    { key: '→ or N', description: 'Advance to Next Tour Scene' },
    { key: '← or P', description: 'Return to Previous Tour Scene' },
    { key: '1 – 8', description: 'Jump Directly to Scene 1 through 8' },
    { key: 'Esc', description: 'Exit Tour or Close Active Overlay' },
    { key: '?', description: 'Toggle this Keyboard Shortcuts Dialog' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-paper border border-ink/20 rounded-xl shadow-2xl p-6 text-ink relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-ink/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent" />
            <h3 id="shortcuts-title" className="font-serif text-lg font-bold">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-ink/5 text-ink-2 hover:text-ink transition-colors"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-ink/5 text-sm"
            >
              <span className="text-ink-2 text-xs">{sc.description}</span>
              <kbd className="px-2 py-1 font-mono text-xs font-semibold bg-paper-2 border border-ink/20 rounded shadow-xs text-ink">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between text-xs text-ink-3">
          <span>Press <kbd className="font-mono px-1 py-0.5 bg-paper-2 border border-ink/15 rounded">Esc</kbd> to dismiss</span>
          <span className="font-mono text-[11px] text-accent">ClaimLens v1.0</span>
        </div>
      </div>
    </div>
  );
}
