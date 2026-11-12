'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, X, HelpCircle, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOUR_STEPS, TourStep } from '@/lib/tour';
import { ShortcutsModal } from './ShortcutsModal';

export function TourPill() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);

  const currentStep: TourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  const clearAllTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const scrollToScene = useCallback((sceneId: string) => {
    const el = document.getElementById(sceneId);
    if (el) {
      const navOffset = 64;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      clearAllTimers();
      if (index >= TOUR_STEPS.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentStepIndex(0);
        setStepProgress(0);
        return;
      }

      const nextIndex = Math.max(0, index);
      setCurrentStepIndex(nextIndex);
      setIsPlaying(true);
      setIsPaused(false);
      setStepProgress(0);

      const target = TOUR_STEPS[nextIndex];
      scrollToScene(target.sceneId);

      const duration = target.durationMs;
      stepStartTimeRef.current = Date.now();
      remainingTimeRef.current = duration;

      const intervalMs = 100;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - stepStartTimeRef.current;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setStepProgress(progress);
      }, intervalMs);

      stepTimerRef.current = setTimeout(() => {
        goToStep(nextIndex + 1);
      }, duration);
    },
    [clearAllTimers, scrollToScene]
  );

  const startTour = useCallback(() => {
    goToStep(0);
  }, [goToStep]);

  const stopTour = useCallback(() => {
    clearAllTimers();
    setIsPlaying(false);
    setIsPaused(false);
    setStepProgress(0);
  }, [clearAllTimers]);

  const togglePause = useCallback(() => {
    if (!isPlaying) return;

    if (!isPaused) {
      // Pause
      clearAllTimers();
      setIsPaused(true);
      const elapsed = Date.now() - stepStartTimeRef.current;
      const total = currentStep.durationMs;
      remainingTimeRef.current = Math.max(500, total - elapsed);
    } else {
      // Resume
      setIsPaused(false);
      const remaining = remainingTimeRef.current;
      stepStartTimeRef.current = Date.now() - (currentStep.durationMs - remaining);

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - stepStartTimeRef.current;
        const progress = Math.min(100, (elapsed / currentStep.durationMs) * 100);
        setStepProgress(progress);
      }, 100);

      stepTimerRef.current = setTimeout(() => {
        goToStep(currentStepIndex + 1);
      }, remaining);
    }
  }, [isPlaying, isPaused, clearAllTimers, currentStep, currentStepIndex, goToStep]);

  const handleNext = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const handlePrev = useCallback(() => {
    goToStep(Math.max(0, currentStepIndex - 1));
  }, [currentStepIndex, goToStep]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (isPlaying) {
          stopTour();
        } else {
          startTour();
        }
      } else if (e.key === ' ' && isPlaying) {
        e.preventDefault();
        togglePause();
      } else if ((e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') && isPlaying) {
        e.preventDefault();
        handleNext();
      } else if ((e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') && isPlaying) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else if (isPlaying) {
          stopTour();
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      } else if (!e.ctrlKey && !e.metaKey && e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < TOUR_STEPS.length) {
          e.preventDefault();
          goToStep(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, showShortcuts, startTour, stopTour, togglePause, handleNext, handlePrev, goToStep]);

  return (
    <>
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Floating Pill when Tour is Inactive */}
      {!isPlaying && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="p-2.5 rounded-full bg-paper border border-ink/20 text-ink-2 hover:text-ink hover:border-ink/40 shadow-md transition-all duration-200 cursor-pointer"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="tour-pill-button"
            type="button"
            onClick={startTour}
            className={cn(
              'inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider',
              'bg-ink text-paper border border-ink shadow-lg cursor-pointer transition-all duration-200',
              'hover:bg-ink-2 hover:scale-105 active:scale-95'
            )}
            aria-label="Start 90-second judge auto-tour (J)"
          >
            <Play className="w-3.5 h-3.5 fill-current text-accent" />
            <span className="font-semibold">90s Judge Tour</span>
            <kbd className="opacity-60 text-[10px] px-1.5 py-0.5 bg-paper/20 rounded font-mono">
              J
            </kbd>
          </button>
        </div>
      )}

      {/* Interactive Bottom HUD during Active Tour */}
      {isPlaying && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[540px] z-50 animate-slide-up">
          <div className="bg-paper border-2 border-ink shadow-2xl rounded-xl overflow-hidden text-ink font-sans">
            {/* Top Step Progress Bar */}
            <div className="h-1.5 bg-paper-2 w-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-100 ease-linear"
                style={{ width: `${stepProgress}%` }}
              />
            </div>

            <div className="p-4 sm:p-5">
              {/* Badge & Step indicator */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                  {currentStep.badge}
                </span>
                <span className="font-mono text-xs font-semibold text-ink-2">
                  Step {currentStep.stepNumber} of {currentStep.totalSteps}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h4 className="font-serif text-base sm:text-lg font-bold leading-snug">
                {currentStep.title}
              </h4>
              <p className="text-xs text-ink-2 font-mono mt-0.5">{currentStep.subtitle}</p>

              {/* Caption Description */}
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed mt-2.5">
                {currentStep.caption}
              </p>

              {/* Stat Highlight if present */}
              {currentStep.statHighlight && (
                <div className="mt-3 py-1.5 px-3 bg-paper-2 rounded border border-ink/10 flex items-center justify-between text-xs">
                  <span className="text-ink-3">{currentStep.statHighlight.label}</span>
                  <span className="font-mono font-bold text-accent">
                    {currentStep.statHighlight.value}
                  </span>
                </div>
              )}

              {/* Bottom Controller Bar */}
              <div className="mt-4 pt-3 border-t border-ink/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="p-1.5 rounded hover:bg-ink/5 disabled:opacity-30 disabled:pointer-events-none text-ink transition-colors"
                    aria-label="Previous scene (P)"
                    title="Previous (P / ←)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePause}
                    className="p-1.5 rounded bg-ink/10 hover:bg-ink/20 text-ink transition-colors font-mono text-xs inline-flex items-center gap-1 px-2.5"
                    aria-label={isPaused ? 'Resume tour (Space)' : 'Pause tour (Space)'}
                    title="Toggle Pause (Space)"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-accent" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStepIndex === TOUR_STEPS.length - 1}
                    className="p-1.5 rounded hover:bg-ink/5 disabled:opacity-30 disabled:pointer-events-none text-ink transition-colors"
                    aria-label="Next scene (N)"
                    title="Next (N / →)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowShortcuts(true)}
                    className="text-xs text-ink-3 hover:text-ink font-mono px-2 py-1 rounded hover:bg-ink/5"
                    title="Keyboard shortcuts (?)"
                  >
                    Shortcuts (?)
                  </button>

                  <button
                    type="button"
                    onClick={stopTour}
                    className="p-1.5 rounded bg-red/10 text-red hover:bg-red/20 transition-colors"
                    aria-label="Exit tour (Esc)"
                    title="Exit Tour (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
