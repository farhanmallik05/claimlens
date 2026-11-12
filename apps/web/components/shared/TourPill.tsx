'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TourPill() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scenes = [
    'scene-1',
    'scene-2',
    'scene-3',
    'scene-4',
    'scene-5',
    'scene-6',
    'scene-7',
    'scene-8',
  ];

  const stopTour = useCallback(() => {
    if (tourTimerRef.current) {
      clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    setIsPlaying(false);
    setTourStep(0);
  }, []);

  const advanceTour = useCallback((stepIndex: number) => {
    const sceneTargets = [
      'scene-1',
      'scene-2',
      'scene-3',
      'scene-4',
      'scene-5',
      'scene-6',
      'scene-7',
      'scene-8',
    ];
    if (stepIndex >= sceneTargets.length) {
      if (tourTimerRef.current) {
        clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
      setIsPlaying(false);
      setTourStep(0);
      return;
    }

    setTourStep(stepIndex);
    const targetScene = document.getElementById(sceneTargets[stepIndex]);
    if (targetScene) {
      targetScene.scrollIntoView({ behavior: 'smooth' });
    }

    // Step duration: ~7 seconds per scene in interactive tour mode
    tourTimerRef.current = setTimeout(() => {
      advanceTour(stepIndex + 1);
    }, 7000);
  }, []);

  const startTour = useCallback(() => {
    if (isPlaying) {
      stopTour();
      return;
    }

    setIsPlaying(true);
    advanceTour(0);
  }, [isPlaying, stopTour, advanceTour]);

  // Keyboard shortcut: 'J' to toggle tour, and cancel on any key/wheel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J') {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          e.preventDefault();
          startTour();
        }
      } else if (isPlaying && e.key !== 'Shift') {
        stopTour();
      }
    };

    const handleWheel = () => {
      if (isPlaying) {
        stopTour();
      }
    };

    const handleTouch = () => {
      if (isPlaying) {
        stopTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch);
      if (tourTimerRef.current) {
        clearTimeout(tourTimerRef.current);
      }
    };
  }, [isPlaying, startTour, stopTour]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        id="tour-pill-button"
        type="button"
        onClick={startTour}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer border select-none',
          isPlaying
            ? 'bg-red text-white border-red animate-pulse'
            : 'bg-ink text-paper border-ink hover:bg-ink-2 hover:scale-105 active:scale-95'
        )}
        aria-label={isPlaying ? 'Stop judge auto-tour' : 'Start 90-second judge auto-tour'}
      >
        {isPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Tour Scene 0{tourStep + 1}/04 · Click to Stop</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>90s Tour <kbd className="opacity-60 text-[10px] ml-1 px-1 py-0.5 bg-paper/20 rounded">J</kbd></span>
          </>
        )}
      </button>
    </div>
  );
}
