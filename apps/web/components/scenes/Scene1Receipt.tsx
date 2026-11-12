'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Paper, Money, Odometer, Stamp, ClauseChip, SectionHeading, Badge } from '@/components/primitives';
import { billRaju } from '@/lib/fixtures';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, RefreshCw } from 'lucide-react';

export function Scene1Receipt() {
  const [animationStep, setAnimationStep] = useState<
    'initial' | 'scanning' | 'stamped' | 'rolling' | 'peeling' | 'complete'
  >('initial');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100%
  const [stampsActive, setStampsActive] = useState(false);
  const [odometerValues, setOdometerValues] = useState({
    insurer: 150000,
    youPay: 0,
  });
  const [chipsPeeled, setChipsPeeled] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    // Reset
    setAnimationStep('scanning');
    setIsScanning(true);
    setScanProgress(0);
    setStampsActive(false);
    setChipsPeeled(false);
    setOdometerValues({ insurer: 150000, youPay: 0 });

    // Step 1: Scan Bar Sweeping (2.5s)
    const startTime = Date.now();
    const scanDuration = 2400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / scanDuration) * 100));
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setAnimationStep('stamped');
        setStampsActive(true);

        // Screen-shake on stamp impact
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 150);

        // Step 2: Roll Odometers after stamps (400ms delay)
        setTimeout(() => {
          setAnimationStep('rolling');
          setOdometerValues({ insurer: 108500, youPay: 41500 });

          // Step 3: Stillness hold (400ms) then peel clause chips
          setTimeout(() => {
            setAnimationStep('peeling');
            setChipsPeeled(true);
            setAnimationStep('complete');
          }, 1600); // 1.2s roll + 400ms hold
        }, 500);
      }
    }, 20);
  };

  useEffect(() => {
    // Auto-trigger when in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && animationStep === 'initial') {
          startAnimation();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animationStep]);

  // Line item breakdown mapping
  const lineDetails = [
    {
      id: 'line-room',
      title: 'Room — Deluxe',
      subtitle: '5 days @ ₹8,000/day',
      billed: 40000,
      payable: 25000,
      deducted: 15000,
      hasCut: true,
      clause: 'SP-3.1',
      stamp: { text: '−₹15,000', subtext: 'ROOM CAP EXCEEDED · SP-3.1', angle: -3 },
    },
    {
      id: 'line-surgeon',
      title: 'Surgeon Fee',
      subtitle: 'Chief Orthopaedic Surgeon',
      billed: 30000,
      payable: 18750,
      deducted: 11250,
      hasCut: true,
      clause: 'SP-3.2',
    },
    {
      id: 'line-ot',
      title: 'Operation Theatre',
      subtitle: 'Major OT + Anaesthesia equipment',
      billed: 20000,
      payable: 12500,
      deducted: 7500,
      hasCut: true,
      clause: 'SP-3.2',
    },
    {
      id: 'line-nursing',
      title: 'Nursing Care',
      subtitle: '5 days @ ₹2,000/day',
      billed: 10000,
      payable: 6250,
      deducted: 3750,
      hasCut: true,
      clause: 'SP-3.2',
    },
    {
      id: 'line-medicines',
      title: 'Medicines & Implants',
      subtitle: 'Post-op analgesics & surgical pack',
      billed: 22000,
      payable: 22000,
      deducted: 0,
      hasCut: false,
      isExempt: true,
      clause: 'SP-3.3',
    },
    {
      id: 'line-consumables',
      title: 'Consumables & Admin',
      subtitle: 'Gloves, PPE, Registration',
      billed: 8000,
      payable: 4000,
      deducted: 4000,
      hasCut: true,
      clause: 'SP-4.1',
      stamp: { text: '−₹4,000', subtext: 'NON-PAYABLE ITEM · SP-4.1', angle: -4 },
    },
    {
      id: 'line-investigation',
      title: 'Lab Investigations',
      subtitle: 'Blood panel, Coagulation profile',
      billed: 12000,
      payable: 12000,
      deducted: 0,
      hasCut: false,
      isExempt: true,
      clause: 'SP-3.3',
    },
    {
      id: 'line-imaging',
      title: 'Imaging (X-Ray / MRI)',
      subtitle: 'Pre & post-op pelvis X-ray',
      billed: 8000,
      payable: 8000,
      deducted: 0,
      hasCut: false,
      isExempt: true,
      clause: 'SP-3.3',
    },
  ];

  return (
    <section
      id="scene-1"
      ref={containerRef}
      className="relative scroll-mt-20 py-8 md:py-16"
      aria-label="Scene 1: The Receipt Reveal"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <SectionHeading
          sceneNumber="01"
          badge="WOW 1: THE RECEIPT REVEAL"
          title="You were insured. You still owe ₹41,500."
          subtitle="ClaimLens forecasts your payout before discharge, and shows the clause behind every rupee."
          align="center"
        />

        {/* Interactive Controls Pill */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={startAnimation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink bg-paper-2 border border-rule rounded hover:bg-paper hover:border-ink transition-colors cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isScanning && 'animate-spin')} />
            <span>Replay Scan</span>
          </button>
          <span className="text-xs font-mono text-ink-2">
            Status: {animationStep === 'complete' ? 'Audited (3 Deductions Found)' : 'Live Adjudication'}
          </span>
        </div>

        {/* Main Bill Container with Side Margins for Clause Chips */}
        <div className="relative max-w-[620px] mx-auto">
          {/* Physical Receipt Container */}
          <Paper
            variant="receipt"
            surface="paper"
            perforated="both"
            className={cn(
              'w-full max-w-[540px] mx-auto p-6 sm:p-8 border border-rule bg-paper shadow-lg overflow-hidden relative transition-transform duration-100',
              isShaking && 'screen-shake-1px'
            )}
          >
            {/* Scan Beam Bar */}
            {isScanning && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none transition-all duration-75 ease-linear"
                style={{ top: `${scanProgress}%` }}
              >
                <div className="h-[2px] bg-gradient-to-r from-transparent via-ink to-transparent w-full shadow-[0_0_12px_rgba(20,17,15,0.6)]" />
                <div className="h-6 -mt-6 bg-gradient-to-t from-ink/[0.08] to-transparent w-full" />
              </div>
            )}

            {/* Receipt Watermark / Header */}
            <div className="border-b border-rule pb-4 mb-6 text-center space-y-1.5">
              <div className="font-mono text-xs uppercase tracking-widest text-ink-2">
                MANIPAL HOSPITAL · BENGALURU
              </div>
              <h3 className="font-display text-2xl text-ink font-normal tracking-tight">
                Inpatient Adjudication Summary
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-mono text-ink-2 pt-1">
                <span>PATIENT: Raju&apos;s mother</span>
                <span>·</span>
                <span>HIP SURGERY (THR)</span>
                <span>·</span>
                <span>STAY: 5 DAYS</span>
              </div>
              <div className="text-[11px] font-mono text-ink-2/70 pt-0.5">
                BILL # MAN-2026-88192 · POLICY: SAFECARE PLUS (₹5,00,000 SI)
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2.5 relative">
              <div className="grid grid-cols-12 text-[11px] font-mono uppercase tracking-wider text-ink-2 border-b border-rule pb-2 font-semibold">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-right">Billed</span>
                <span className="col-span-2 text-right">Payable</span>
                <span className="col-span-2 text-right">Deducted</span>
              </div>

              {lineDetails.map((line, idx) => {
                const isLineAudited = scanProgress >= (idx + 1) * 11 || animationStep !== 'scanning';
                const hasDeduction = line.hasCut && isLineAudited && animationStep !== 'initial';

                return (
                  <div
                    key={line.id}
                    className={cn(
                      'grid grid-cols-12 items-center py-2 border-b border-rule/50 text-xs transition-colors duration-200',
                      hasDeduction && 'bg-red-soft/20 -mx-2 px-2 rounded-sm'
                    )}
                  >
                    <div className="col-span-6 pr-2">
                      <div className="font-medium text-ink flex items-center gap-1.5">
                        {isLineAudited && !line.hasCut && (
                          <Check className="w-3.5 h-3.5 text-green shrink-0" aria-label="Payable" />
                        )}
                        {hasDeduction && (
                          <AlertCircle className="w-3.5 h-3.5 text-red shrink-0" aria-label="Deduction" />
                        )}
                        <span>{line.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-ink-2">{line.subtitle}</div>
                    </div>

                    <div className="col-span-2 text-right">
                      <Money amount={line.billed} size="xs" color="ink" />
                    </div>

                    <div className="col-span-2 text-right">
                      {isLineAudited && animationStep !== 'initial' ? (
                        <Money
                          amount={line.payable}
                          size="xs"
                          color={line.payable > 0 ? 'green' : 'ink-2'}
                        />
                      ) : (
                        <span className="font-mono text-xs text-ink-2">—</span>
                      )}
                    </div>

                    <div className="col-span-2 text-right">
                      {hasDeduction ? (
                        <Money amount={line.deducted} sign="negative-only" size="xs" color="red" />
                      ) : isLineAudited && line.isExempt ? (
                        <span className="text-[10px] font-mono text-green uppercase tracking-tight">
                          Exempt
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-ink-2">₹0</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overlaid Physical Stamps */}
            {stampsActive && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Stamp 1: Room Rent Cut */}
                <div className="absolute top-[165px] left-[20px] sm:left-[50px]">
                  <Stamp
                    text="−₹15,000"
                    subtext="ROOM CAP EXCEEDED · SP-3.1"
                    angle={-3}
                    variant="deduction"
                  />
                </div>

                {/* Stamp 2: Proportionate Professional Cut */}
                <div className="absolute top-[280px] right-[20px] sm:right-[40px]">
                  <Stamp
                    text="−₹22,500"
                    subtext="PROPORTIONATE CUT · SP-3.2"
                    angle={2}
                    variant="deduction"
                  />
                </div>

                {/* Stamp 3: Non-Payable Item */}
                <div className="absolute bottom-[180px] left-[30px] sm:left-[80px]">
                  <Stamp
                    text="−₹4,000"
                    subtext="NON-PAYABLE ITEM · SP-4.1"
                    angle={-4}
                    variant="deduction"
                  />
                </div>
              </div>
            )}

            {/* Total Billed & Concurrent Odometers Footer */}
            <div className="mt-6 pt-4 border-t-2 border-rule border-dashed space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink-2">
                <span>Total Hospital Bill</span>
                <Money amount={150000} size="sm" color="ink" />
              </div>

              {/* Dual Odometer Section */}
              <div className="grid grid-cols-2 gap-4 bg-paper-2 p-3 sm:p-4 rounded border border-rule">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-green font-semibold">
                    Insurer Pays
                  </div>
                  <div className="mt-1">
                    <Odometer
                      value={odometerValues.insurer}
                      prefix="₹"
                      size="2xl"
                      color="green"
                      duration={1.2}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-red font-semibold">
                    You Pay (Shortfall)
                  </div>
                  <div className="mt-1">
                    <Odometer
                      value={odometerValues.youPay}
                      prefix="₹"
                      size="2xl"
                      color="red"
                      duration={1.2}
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="text-[10px] font-mono text-ink-2 text-center pt-1">
                Verified deterministic audit: ₹1,50,000 − ₹1,08,500 = ₹41,500 patient shortfall
              </div>
            </div>
          </Paper>

          {/* Peeling Clause Chips Floating in Margin (Desktop & Mobile) */}
          <div
            className={cn(
              'mt-4 lg:mt-0 lg:absolute lg:-right-36 lg:top-1/3 flex lg:flex-col gap-2 justify-center transition-all duration-500 z-10',
              chipsPeeled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            )}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-2 hidden lg:block mb-1">
              Violated Clauses:
            </div>
            <ClauseChip
              clauseId="SP-3.1"
              label="1% Room Cap"
              peeled={chipsPeeled}
              onClick={() => {
                const el = document.getElementById('scene-4');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <ClauseChip
              clauseId="SP-3.2"
              label="Proportionate Cut"
              peeled={chipsPeeled}
              onClick={() => {
                const el = document.getElementById('scene-4');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <ClauseChip
              clauseId="SP-4.1"
              label="Non-Payable"
              peeled={chipsPeeled}
              onClick={() => {
                const el = document.getElementById('scene-4');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        </div>

        {/* Scroll Prompt Indicator */}
        <div className="text-center pt-2">
          <a
            href="#scene-2"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-2 hover:text-ink transition-colors"
          >
            <span>Understand the systemic problem</span>
            <span>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
