import React from 'react';
import { ENGINE_VERSION } from '@claimlens/engine';
import { ShieldAlert, BookOpen, GitFork } from 'lucide-react';

export function HonestyStrip() {
  return (
    <footer className="border-t border-rule mt-24 py-10 px-4 sm:px-8 bg-paper-2 text-xs font-mono text-ink-2">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-ink font-semibold">
            <ShieldAlert className="w-4 h-4 text-ink-2" />
            <span>Honesty & Regulatory Disclosure</span>
          </div>
          <p className="text-[11px] text-ink-2/80">
            Cites sources, not legal advice. All scenarios use synthetic policy documents and anonymized bills.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
          <span className="text-ink font-medium">
            Rules Engine v{ENGINE_VERSION} (Deterministic)
          </span>
          <span>·</span>
          <span className="text-ink-2">
            CodeQuest 2026 Showcase
          </span>
          <span>·</span>
          <span className="text-green font-medium">
            FR-7 Conservation Law: 100% Verified
          </span>
        </div>
      </div>
    </footer>
  );
}
