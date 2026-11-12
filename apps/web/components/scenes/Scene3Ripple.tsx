'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Paper, Money, Badge, Button, SectionHeading } from '@/components/primitives';
import { billRaju, policyRaju } from '@/lib/fixtures';
import { calculateForecast, getRoomAdvice, sanitizeRoomCapInput, Policy, Bill } from '@claimlens/engine';
import { cn } from '@/lib/utils';
import { Sliders, ShieldCheck, AlertCircle, ArrowRight, Zap, Info } from 'lucide-react';

const TIERS = [
  { id: 'general', name: 'General', rate: 2000, label: 'General (₹2,000)' },
  { id: 'semi-private', name: 'Semi-Private', rate: 3500, label: 'Semi-Private (₹3,500)' },
  { id: 'single-ac', name: 'Single AC', rate: 5000, label: 'Single AC (₹5,000) [Cap]' },
  { id: 'deluxe', name: 'Deluxe (Raju)', rate: 8000, label: 'Deluxe (₹8,000)' },
  { id: 'suite', name: 'Suite', rate: 12000, label: 'Suite (₹12,000)' },
];

export function Scene3Ripple() {
  const [roomRate, setRoomRate] = useState<number>(8000);
  const [customCapInput, setCustomCapInput] = useState<string>('');
  const [customCap, setCustomCap] = useState<number | null>(null);
  const [isWashing, setIsWashing] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [onboardingHint, setOnboardingHint] = useState<boolean>(true);
  const prevOverCap = useRef<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine current active policy
  const activePolicy: Policy = useMemo(() => {
    if (customCap !== null && customCap > 0) {
      return {
        ...policyRaju,
        roomRent: {
          mode: 'fixedPerDay',
          value: customCap,
          clauseId: 'SP-3.1',
        },
      };
    }
    return policyRaju;
  }, [customCap]);

  // Determine current active bill
  const activeBill: Bill = useMemo(() => {
    const updatedLines = billRaju.lines.map((line) => {
      if (line.category === 'room') {
        return {
          ...line,
          rate: roomRate,
          amount: line.qty * roomRate,
        };
      }
      return line;
    });
    return {
      ...billRaju,
      lines: updatedLines,
    };
  }, [roomRate]);

  // Execute pure TypeScript rules engine synchronously (<0.05ms)
  const forecastResult = useMemo(() => {
    return calculateForecast(activePolicy, activeBill);
  }, [activePolicy, activeBill]);

  // Compile pre-admission room advice
  const roomAdvice = useMemo(() => {
    return getRoomAdvice(activePolicy, activeBill);
  }, [activePolicy, activeBill]);

  const activeCap = activePolicy.roomRent?.value ?? 5000;
  const isOverCap = roomRate > activeCap;

  // Cap-crossing detection & haptic vibration
  useEffect(() => {
    if (prevOverCap.current !== isOverCap) {
      setIsWashing(true);
      const timer = setTimeout(() => setIsWashing(false), 450);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(12);
        } catch {
          // Ignore vibration failure
        }
      }
      prevOverCap.current = isOverCap;
      return () => clearTimeout(timer);
    }
  }, [isOverCap]);

  // Onboarding auto-drag demonstration on first view
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasInteracted) {
          // Check prefers-reduced-motion
          const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          if (!prefersReduced) {
            timeout = setTimeout(() => {
              // Demonstrate slider movement: 8000 -> 5000 -> 8000
              setRoomRate(5000);
              setTimeout(() => {
                setRoomRate(8000);
              }, 900);
            }, 800);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [hasInteracted]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setOnboardingHint(false);
    setRoomRate(parseInt(e.target.value, 10));
  };

  const handleTierSelect = (tierRate: number) => {
    setHasInteracted(true);
    setOnboardingHint(false);
    setRoomRate(tierRate);
  };

  const handleCustomCapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);
    setOnboardingHint(false);
    const sanitized = sanitizeRoomCapInput(customCapInput, activePolicy.sumInsured);
    if (sanitized > 0) {
      setCustomCap(sanitized);
    } else {
      setCustomCap(null);
    }
  };

  const handleResetCap = () => {
    setCustomCap(null);
    setCustomCapInput('');
  };

  return (
    <section
      id="scene-3"
      ref={containerRef}
      className="relative scroll-mt-20 py-8 md:py-16"
      aria-label="Scene 3: The Ripple — Reactive Engine Proof"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <SectionHeading
          sceneNumber="03"
          badge="WOW 2: THE RIPPLE"
          title="Move the room. Watch the bill move."
          subtitle="Interactive simulation powered by pure TypeScript engine. See how choosing a room tier ripples through every line item in real time with zero float drift."
          align="left"
        />

        {/* Interactive Controls & Slider Bar */}
        <Paper variant="card" surface="paper-2" className="p-6 space-y-5 border-rule">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-ink" />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
                  Select Room Rent Tier
                </span>
                {isOverCap ? (
                  <Badge variant="deduction" size="sm">
                    Cap Exceeded (+Proportionate)
                  </Badge>
                ) : (
                  <Badge variant="payable" size="sm">
                    In Cap (No Haircut)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink-2 font-mono">
                Current selection: <span className="font-semibold text-ink">₹{roomRate.toLocaleString('en-IN')}/day</span> (Total room: ₹{(roomRate * 5).toLocaleString('en-IN')})
              </p>
            </div>

            {/* "Try your own cap" input form (FR-13) */}
            <form onSubmit={handleCustomCapSubmit} className="flex items-center gap-2">
              <label htmlFor="custom-cap-input" className="text-xs font-mono text-ink-2 shrink-0">
                Custom Cap:
              </label>
              <input
                id="custom-cap-input"
                type="text"
                placeholder={`₹${activeCap}`}
                value={customCapInput}
                onChange={(e) => setCustomCapInput(e.target.value)}
                className="w-24 px-2.5 py-1 text-xs font-mono bg-paper border border-rule rounded focus-visible:outline-ink text-ink"
              />
              <Button type="submit" size="sm" variant="secondary">
                Apply
              </Button>
              {customCap !== null && (
                <button
                  type="button"
                  onClick={handleResetCap}
                  className="text-xs font-mono text-red underline hover:text-red/80 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </form>
          </div>

          {/* Native Slider with 44px min touch height */}
          <div className="space-y-2">
            <div className="relative flex items-center min-h-[44px]">
              <input
                type="range"
                min={2000}
                max={12000}
                step={250}
                value={roomRate}
                onChange={handleSliderChange}
                aria-label="Room Rent Per Day Slider"
                aria-valuetext={`₹${roomRate.toLocaleString('en-IN')} a day, ${
                  isOverCap ? `₹${(roomRate - activeCap).toLocaleString('en-IN')} over cap` : 'within cap'
                }`}
                className="w-full h-3 bg-paper rounded-lg appearance-none cursor-pointer accent-ink border border-rule focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
            </div>

            {/* 5 Clickable Magnetic Tier Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {TIERS.map((tier) => {
                const isSelected = roomRate === tier.rate;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleTierSelect(tier.rate)}
                    className={cn(
                      'px-2 py-1.5 text-xs font-mono rounded border transition-all cursor-pointer text-center select-none min-h-[44px] flex flex-col justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                      isSelected
                        ? 'bg-ink text-paper border-ink font-semibold shadow-sm'
                        : 'bg-paper text-ink-2 border-rule hover:bg-paper-2 hover:border-ink-2/50'
                    )}
                  >
                    <div>{tier.name}</div>
                    <div className="text-[10px] opacity-80">₹{tier.rate.toLocaleString('en-IN')}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Onboarding hint */}
          {onboardingHint && (
            <div className="flex items-center gap-2 text-xs font-mono text-ink-2 bg-paper/60 p-2 rounded border border-rule/60">
              <Info className="w-3.5 h-3.5 text-ink shrink-0" />
              <span>Your turn: drag the room rate or click any tier button above.</span>
            </div>
          )}
        </Paper>

        {/* 3-Column Reactive Engine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Policy Rules Card */}
          <Paper variant="card" surface="paper-2" className="lg:col-span-3 p-5 space-y-4">
            <div className="border-b border-rule pb-3 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2 font-semibold">
                Active Policy
              </span>
              <h4 className="font-ui font-semibold text-ink text-sm">
                {activePolicy.insurer} · {activePolicy.planName}
              </h4>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-ink-2">Sum Insured:</span>
                <span className="font-semibold text-ink">₹5,00,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-2">Room Cap:</span>
                <span className="font-semibold text-ink">
                  {activePolicy.roomRent?.mode === 'pctSI' ? '1% of SI = ' : ''}₹{activeCap.toLocaleString('en-IN')}/day
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-2">Proportionate Cut:</span>
                <span className="font-semibold text-red">Enabled (SP-3.2)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-2">Co-Pay:</span>
                <span className="font-semibold text-ink">0%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-rule space-y-2">
              <div className="text-[11px] font-mono text-ink-2">Adjudication Trigger:</div>
              {isOverCap ? (
                <div className="text-xs text-red font-medium leading-relaxed bg-red-soft/30 p-2.5 rounded border border-red/30">
                  Room rate exceeds cap by ₹{(roomRate - activeCap).toLocaleString('en-IN')}/day. Clause SP-3.2 reduces surgeon, OT, and nursing fees by{' '}
                  {((1 - activeCap / roomRate) * 100).toFixed(1)}%.
                </div>
              ) : (
                <div className="text-xs text-green font-medium leading-relaxed bg-green-soft/30 p-2.5 rounded border border-green/30">
                  Room rate is within eligible cap. Zero room cut and zero proportionate reduction applied.
                </div>
              )}
            </div>
          </Paper>

          {/* Column 2: Live Adjudication Bill Table */}
          <Paper
            variant="card"
            surface="paper"
            className={cn(
              'lg:col-span-5 p-5 space-y-4 transition-colors duration-300',
              isWashing && isOverCap && 'bg-red-soft/20'
            )}
          >
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2 font-semibold">
                Live Adjudication Table
              </span>
              <span className="text-[10px] font-mono text-ink-2">
                5 Days Stay
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-12 text-[11px] font-mono uppercase tracking-wider text-ink-2 border-b border-rule/60 pb-1.5 font-semibold">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-right">Billed</span>
                <span className="col-span-2 text-right">Payable</span>
                <span className="col-span-2 text-right">Cut</span>
              </div>

              {forecastResult.lines.map((line) => {
                const isRoom = line.id === 'line-room';
                const hasDeduction = line.deducted > 0;
                const isProportionateCut = isOverCap && ['line-surgeon', 'line-ot', 'line-nursing'].includes(line.id);

                return (
                  <div
                    key={line.id}
                    className={cn(
                      'grid grid-cols-12 items-center py-1.5 border-b border-rule/40 font-mono transition-colors duration-150',
                      isRoom && 'font-semibold',
                      (hasDeduction || isProportionateCut) && 'bg-red-soft/15 -mx-1 px-1 rounded-sm'
                    )}
                  >
                    <div className="col-span-6 pr-1 truncate">
                      <span className="text-ink">{line.label}</span>
                      {isRoom && (
                        <span className="text-[10px] text-ink-2 ml-1">(@₹{roomRate})</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-ink">
                      ₹{line.billed.toLocaleString('en-IN')}
                    </div>
                    <div className="col-span-2 text-right text-green font-medium">
                      ₹{line.payable.toLocaleString('en-IN')}
                    </div>
                    <div className="col-span-2 text-right">
                      {line.deducted > 0 ? (
                        <span className="text-red font-medium">
                          −₹{line.deducted.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-ink-2 text-[10px]">₹0</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Totals Row */}
              <div className="grid grid-cols-12 items-center pt-2.5 border-t-2 border-rule font-mono font-bold text-xs">
                <span className="col-span-6 uppercase">Total</span>
                <span className="col-span-2 text-right text-ink">
                  ₹{forecastResult.billed.toLocaleString('en-IN')}
                </span>
                <span className="col-span-2 text-right text-green">
                  ₹{forecastResult.insurerPays.toLocaleString('en-IN')}
                </span>
                <span className="col-span-2 text-right text-red">
                  ₹{forecastResult.youPay.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Paper>

          {/* Column 3: Live Summary & Actionable Advice */}
          <div className="lg:col-span-4 space-y-4">
            {/* Financial Waterfall Summary Card */}
            <Paper variant="card" surface="paper-2" className="p-5 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2 font-semibold block border-b border-rule pb-2">
                Payout Breakdown
              </span>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-2">Total Billed:</span>
                  <Money amount={forecastResult.billed} size="sm" color="ink" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green font-semibold">Insurer Pays:</span>
                  <Money amount={forecastResult.insurerPays} size="sm" color="green" />
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-rule/60">
                  <span className="text-red font-semibold">Your Shortfall:</span>
                  <Money amount={forecastResult.youPay} size="base" color="red" />
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="pt-2">
                <div className="h-3 w-full bg-paper rounded overflow-hidden flex border border-rule">
                  <div
                    className="h-full bg-green transition-all duration-200"
                    style={{
                      width: `${(forecastResult.insurerPays / forecastResult.billed) * 100}%`,
                    }}
                    title={`Insurer Pays: ₹${forecastResult.insurerPays}`}
                  />
                  <div
                    className="h-full bg-red transition-all duration-200"
                    style={{
                      width: `${(forecastResult.youPay / forecastResult.billed) * 100}%`,
                    }}
                    title={`You Pay: ₹${forecastResult.youPay}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-ink-2 mt-1">
                  <span>Insurer: {((forecastResult.insurerPays / forecastResult.billed) * 100).toFixed(0)}%</span>
                  <span>Patient: {((forecastResult.youPay / forecastResult.billed) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Paper>

            {/* Dynamic Room Advice Card (from advice.ts) */}
            <Paper variant="card" surface="paper" className="p-5 space-y-3 border-rule">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                <Zap className="w-3.5 h-3.5 text-ink" />
                <span>Pre-Admission Advice</span>
              </div>

              <p className="text-xs font-ui text-ink-2 leading-relaxed">
                {roomAdvice.recommendation}
              </p>

              {roomAdvice.isOverCap && roomAdvice.avoidableShortfall > 0 && (
                <div className="bg-green-soft/40 border border-green/30 p-2.5 rounded text-xs font-mono text-green font-medium flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-green shrink-0 mt-0.5" />
                  <span>
                    Action: Choose a room at or below ₹{roomAdvice.maxEligiblePerDay.toLocaleString('en-IN')}/day to save ₹{roomAdvice.avoidableShortfall.toLocaleString('en-IN')} out-of-pocket.
                  </span>
                </div>
              )}
            </Paper>
          </div>
        </div>
      </div>
    </section>
  );
}
