'use client';

import React, { useEffect } from 'react';
import { initSmoothScroll } from '@/lib/motion';
import { ProgressRule } from '@/components/shared/ProgressRule';
import { TourPill } from '@/components/shared/TourPill';
import { HonestyStrip } from '@/components/shared/HonestyStrip';
import { Scene1Receipt } from '@/components/scenes/Scene1Receipt';
import { Scene2Gap } from '@/components/scenes/Scene2Gap';
import { Scene3Ripple } from '@/components/scenes/Scene3Ripple';
import { Scene4Waterfall } from '@/components/scenes/Scene4Waterfall';

export default function Home() {
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper paper-grain text-ink font-ui antialiased flex flex-col justify-between overflow-x-hidden selection:bg-red-soft selection:text-ink">
      {/* Sticky Progress Rule Header */}
      <ProgressRule />

      {/* Main Core Scenes Sequence */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20 md:space-y-32">
        {/* Scene 1: Wow 1 — The Receipt Reveal */}
        <Scene1Receipt />

        {/* Scene 2: The Gap — Macro Problem Framing */}
        <Scene2Gap />

        {/* Scene 3: Wow 2 — The Ripple (Reactive Engine Proof) */}
        <Scene3Ripple />

        {/* Scene 4: Shortfall Waterfall — Stepping Bar Breakdown */}
        <Scene4Waterfall />
      </main>

      {/* Floating 90-Second Judge Auto-Tour Pill */}
      <TourPill />

      {/* Persistent Legal Honesty Strip Footer */}
      <HonestyStrip />
    </div>
  );
}
