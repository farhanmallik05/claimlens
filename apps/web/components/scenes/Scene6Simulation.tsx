'use client';

import React, { useState, useMemo } from 'react';
import { SectionHeading, Paper, Money, Badge, Button } from '@/components/primitives';
import { WhyUsTable } from '@/components/shared/WhyUsTable';
import { billRaju, policyRaju } from '@/lib/fixtures';
import {
  calculateForecast,
  getRoomAdvice,
  avoidableShortfall,
  Policy,
  Bill,
} from '@claimlens/engine';
import { cn } from '@/lib/utils';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

const TIERS = [
  { id: 'general', name: 'General', rate: 2000, label: 'General (₹2,000)' },
  { id: 'semi-private', name: 'Semi-Private', rate: 3500, label: 'Semi-Private (₹3,500)' },
  { id: 'single-ac', name: 'Single AC', rate: 5000, label: 'Single AC (₹5,000) [Cap]' },
  { id: 'deluxe', name: 'Deluxe (Raju)', rate: 8000, label: 'Deluxe (₹8,000)' },
  { id: 'suite', name: 'Suite', rate: 12000, label: 'Suite (₹12,000)' },
];

export function Scene6Simulation() {
  const [roomRate, setRoomRate] = useState<number>(8000);
  const [stayDays, setStayDays] = useState<number>(5);
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [proportionateEnabled, setProportionateEnabled] = useState<boolean>(true);
  const [copayPct, setCopayPct] = useState<number>(0);

  // Dynamic policy derived from interactive controls
  const dynamicPolicy: Policy = useMemo(() => {
    return {
      ...policyRaju,
      sumInsured,
      roomRent: {
        mode: 'pctSI',
        value: 1, // 1% of Sum Insured
        clauseId: 'SP-3.1',
      },
      proportionate: {
        enabled: proportionateEnabled,
        appliesTo: ['professional'],
        clauseId: 'SP-3.2',
      },
      copay: {
        pct: copayPct,
        order: 'afterCap',
        clauseId: 'SP-5.1',
      },
    };
  }, [sumInsured, proportionateEnabled, copayPct]);

  // Dynamic bill derived from interactive controls
  const dynamicBill: Bill = useMemo(() => {
    const updatedLines = billRaju.lines.map((l) => {
      if (l.category === 'room') {
        return {
          ...l,
          qty: stayDays,
          rate: roomRate,
          amount: stayDays * roomRate,
        };
      }
      return l;
    });

    return {
      ...billRaju,
      lines: updatedLines,
    };
  }, [roomRate, stayDays]);

  // Real-time pure engine evaluation (deterministic, integer rupees, <0.05ms)
  const forecastResult = useMemo(() => {
    return calculateForecast(dynamicPolicy, dynamicBill);
  }, [dynamicPolicy, dynamicBill]);

  // Real-time pre-admission advice
  const roomAdvice = useMemo(() => {
    return getRoomAdvice(dynamicPolicy, dynamicBill);
  }, [dynamicPolicy, dynamicBill]);

  const capRate = Math.floor(sumInsured * 0.01);
  const isOverCap = roomRate > capRate;

  // Extract deduction totals
  const roomCut = forecastResult.deductions
    .filter((d) => d.ruleId === 'ROOM_CAP')
    .reduce((sum, d) => sum + d.amount, 0);

  const profCut = forecastResult.deductions
    .filter((d) => d.ruleId === 'PROPORTIONATE')
    .reduce((sum, d) => sum + d.amount, 0);

  const nonPayableCut = forecastResult.deductions
    .filter((d) => d.ruleId === 'NON_PAYABLE')
    .reduce((sum, d) => sum + d.amount, 0);

  const copayCut = forecastResult.deductions
    .filter((d) => d.ruleId === 'COPAY')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <section
      id="scene-6"
      className="relative scroll-mt-20 py-8 md:py-16 space-y-12"
      aria-label="Scene 6: Pre-Admission Room Advisor & What-If Simulation"
    >
      <SectionHeading
        sceneNumber="06"
        badge="PRE-ADMISSION ROOM ADVISOR & SCENARIO ENGINE"
        title="Move the room. Watch the bill move."
        subtitle="Test pre-admission choices with real-time what-if parameter sliders. The engine recalculates liabilities deterministically in exact integer rupees."
        align="left"
      />

      {/* Interactive Simulation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Paper className="p-6 bg-paper-2/50 border-rule space-y-6">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-ink" />
                <h3 className="font-serif font-bold text-base text-ink">
                  Simulation Parameters
                </h3>
              </div>
              <Badge variant={isOverCap ? 'danger' : 'success'} className="font-mono text-xs">
                {isOverCap ? 'Over Cap (Haircut Active)' : 'Safe Zone (Within Cap)'}
              </Badge>
            </div>

            {/* Parameter 1: Room Rent Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink font-bold uppercase">1. Room Rent / Day:</span>
                <span className="text-base font-bold text-ink">
                  <Money amount={roomRate} />
                  <span className="text-xs font-normal text-ink-2">/day</span>
                </span>
              </div>

              {/* Slider */}
              <div className="relative flex items-center min-h-[44px]">
                <input
                  type="range"
                  min={1000}
                  max={15000}
                  step={500}
                  value={roomRate}
                  onChange={(e) => setRoomRate(parseInt(e.target.value, 10))}
                  className="w-full accent-ink cursor-pointer h-2 bg-rule rounded-lg appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  aria-label="Room rent rate per day slider"
                  aria-valuetext={`₹${roomRate.toLocaleString('en-IN')} a day, ${
                    isOverCap ? `₹${(roomRate - capRate).toLocaleString('en-IN')} over cap` : 'within cap'
                  }`}
                />
              </div>

              {/* Tier Quick-Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 pt-1">
                {TIERS.map((tier) => {
                  const isCurrent = roomRate === tier.rate;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setRoomRate(tier.rate)}
                      className={cn(
                        'px-1.5 py-1 text-[11px] font-mono rounded border text-center transition-all min-h-[44px] flex flex-col justify-center items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                        isCurrent
                          ? 'bg-ink text-paper border-ink font-bold shadow-xs'
                          : 'bg-paper text-ink-2 border-rule hover:bg-paper-2 hover:text-ink'
                      )}
                    >
                      <span className="truncate w-full">{tier.name}</span>
                      <span className="text-[10px] opacity-70">₹{tier.rate / 1000}k</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parameter 2: Hospital Stay Days */}
            <div className="space-y-2 pt-2 border-t border-rule/60">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink font-bold uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>2. Hospital Stay:</span>
                </span>
                <span className="text-sm font-bold text-ink">{stayDays} Days</span>
              </div>
              <div className="relative flex items-center min-h-[44px]">
                <input
                  type="range"
                  min={1}
                  max={14}
                  step={1}
                  value={stayDays}
                  onChange={(e) => setStayDays(parseInt(e.target.value, 10))}
                  className="w-full accent-ink cursor-pointer h-2 bg-rule rounded-lg appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  aria-label="Hospital stay duration in days"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-ink-2/60">
                <span>1 Day</span>
                <span>5 Days (Raju)</span>
                <span>14 Days</span>
              </div>
            </div>

            {/* Parameter 3: Policy Sum Insured */}
            <div className="space-y-2 pt-2 border-t border-rule/60">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink font-bold uppercase">3. Policy Sum Insured:</span>
                <span className="text-sm font-bold text-ink">
                  <Money amount={sumInsured} />
                </span>
              </div>
              <div className="relative flex items-center min-h-[44px]">
                <input
                  type="range"
                  min={200000}
                  max={1500000}
                  step={100000}
                  value={sumInsured}
                  onChange={(e) => setSumInsured(parseInt(e.target.value, 10))}
                  className="w-full accent-ink cursor-pointer h-2 bg-rule rounded-lg appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  aria-label="Policy sum insured slider"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-ink-2/60">
                <span>₹2 Lakh</span>
                <span>₹5 Lakh (1% = ₹5,000 cap)</span>
                <span>₹15 Lakh</span>
              </div>
            </div>

            {/* Parameter 4 & 5: Proportionate Toggle & Co-Pay Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rule/60">
              {/* Proportionate Cut Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-ink font-bold uppercase block">
                  Proportionate Clause:
                </label>
                <button
                  type="button"
                  onClick={() => setProportionateEnabled(!proportionateEnabled)}
                  className={cn(
                    'w-full py-2 px-3 rounded border text-xs font-mono font-bold transition-all min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                    proportionateEnabled
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper text-ink-2 border-rule hover:bg-paper-2'
                  )}
                >
                  {proportionateEnabled ? 'Clause Active (SP-3.2)' : 'Clause Waived (0%)'}
                </button>
              </div>

              {/* Co-Payment Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-ink font-bold uppercase block">
                  Co-Payment Tier:
                </label>
                <div className="flex gap-1">
                  {[0, 10, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCopayPct(pct)}
                      className={cn(
                        'flex-1 py-2 text-xs font-mono rounded border text-center transition-all min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                        copayPct === pct
                          ? 'bg-ink text-paper border-ink font-bold'
                          : 'bg-paper text-ink-2 border-rule hover:bg-paper-2'
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Paper>
        </div>

        {/* Live Forecast & Waterfall Output Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Paper className="p-6 md:p-8 bg-paper border-rule space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
                  Pure Rules Engine Output (<span className="text-green font-bold">&lt;0.05ms</span>)
                </span>
                <h3 className="text-xl md:text-2xl font-serif text-ink font-bold mt-1">
                  Simulated Claim Adjudication
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono uppercase text-ink-2 block">Policy Room Cap</span>
                <span className="font-mono text-sm font-bold text-ink">
                  ₹{capRate.toLocaleString('en-IN')}/day (1% of ₹{(sumInsured / 100000).toFixed(0)}L)
                </span>
              </div>
            </div>

            {/* Top 3 Summary Big Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-paper-2 border border-rule">
                <span className="text-[10px] font-mono uppercase text-ink-2/70 block font-semibold">
                  Total Hospital Bill
                </span>
                <div className="text-xl sm:text-2xl font-serif font-bold text-ink mt-1">
                  <Money amount={forecastResult.billed} />
                </div>
                <span className="text-[11px] font-mono text-ink-2 block mt-1">
                  {stayDays} days stay @ ₹{roomRate.toLocaleString('en-IN')}/day
                </span>
              </div>

              <div className="p-4 rounded-lg bg-green-soft/40 border border-green/30">
                <span className="text-[10px] font-mono uppercase text-green font-bold block">
                  Insurer Pays
                </span>
                <div className="text-xl sm:text-2xl font-serif font-bold text-green mt-1">
                  <Money amount={forecastResult.insurerPays} />
                </div>
                <span className="text-[11px] font-mono text-green block mt-1 font-semibold">
                  {((forecastResult.insurerPays / forecastResult.billed) * 100).toFixed(1)}% of bill
                </span>
              </div>

              <div className="p-4 rounded-lg bg-red-soft/50 border border-red/30">
                <span className="text-[10px] font-mono uppercase text-red font-bold block">
                  Patient Shortfall
                </span>
                <div className="text-xl sm:text-2xl font-serif font-bold text-red mt-1">
                  <Money amount={forecastResult.youPay} />
                </div>
                <span className="text-[11px] font-mono text-red block mt-1 font-semibold">
                  {((forecastResult.youPay / forecastResult.billed) * 100).toFixed(1)}% out-of-pocket
                </span>
              </div>
            </div>

            {/* Deductions Breakdown Table */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-ink-2 font-bold block">
                Itemized Deduction Breakdown:
              </span>
              <div className="border border-rule rounded-lg divide-y divide-rule bg-paper-2/40 text-xs font-mono">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-ink">Direct Room Rent Cap Overage (Clause SP-3.1):</span>
                  <span className={cn('font-bold', roomCut > 0 ? 'text-red' : 'text-ink-2')}>
                    {roomCut > 0 ? `−₹${roomCut.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-ink">Proportionate Haircut on Professional Fees (Clause SP-3.2):</span>
                  <span className={cn('font-bold', profCut > 0 ? 'text-red' : 'text-ink-2')}>
                    {profCut > 0 ? `−₹${profCut.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-ink">Non-Payable Consumables & Admin (Clause SP-4.1):</span>
                  <span className={cn('font-bold', nonPayableCut > 0 ? 'text-red' : 'text-ink-2')}>
                    {nonPayableCut > 0 ? `−₹${nonPayableCut.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                {copayCut > 0 && (
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-ink">Post-Cap Co-Payment Deduction ({copayPct}%):</span>
                    <span className="font-bold text-red">
                      −₹{copayCut.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="p-3 flex items-center justify-between bg-paper font-bold">
                  <span className="text-ink">Total Deducted Balance:</span>
                  <span className="text-red">
                    ₹{(roomCut + profCut + nonPayableCut + copayCut).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Advice Action Banner */}
            <div
              className={cn(
                'p-4 rounded-lg border flex items-start gap-3 transition-colors',
                isOverCap
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-green-soft/40 border-green/30 text-ink'
              )}
            >
              {isOverCap ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase block">
                  {isOverCap ? 'Pre-Admission Avoidable Shortfall Alert:' : 'In-Cap Optimization Verified:'}
                </span>
                <p className="text-xs md:text-sm leading-relaxed">
                  {roomAdvice.recommendation}
                </p>
                {roomAdvice.avoidableShortfall > 0 && (
                  <div className="pt-1 font-mono text-xs font-bold text-red">
                    Actionable Savings: Choosing a room at or below ₹{capRate.toLocaleString('en-IN')}/day avoids ₹{roomAdvice.avoidableShortfall.toLocaleString('en-IN')} out-of-pocket!
                  </div>
                )}
              </div>
            </div>
          </Paper>
        </div>
      </div>

      {/* Embedded WhyUsTable: Real Rules vs Opaque Portals */}
      <div className="pt-8">
        <WhyUsTable />
      </div>
    </section>
  );
}
