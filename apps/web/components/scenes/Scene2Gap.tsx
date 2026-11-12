'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Paper, Odometer, Money, Badge, Button, SectionHeading } from '@/components/primitives';
import { ExternalLink, ArrowDown, FileText, Clock, AlertTriangle } from 'lucide-react';

export function Scene2Gap() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="scene-2"
      ref={containerRef}
      className="relative scroll-mt-20 py-8 md:py-16"
      aria-label="Scene 2: The Gap — Macro Problem Framing"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <SectionHeading
          sceneNumber="02"
          badge="THE MACRO PROBLEM"
          title="Insured, yet still left with the bill"
          subtitle="Health insurance was supposed to protect Indian families from medical ruin. In practice, opaque fine print creates massive financial shortfalls at the hospital discharge desk."
          align="left"
        />

        {/* 3 Macroeconomic Stat Odometers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1: Lives Covered */}
          <Paper variant="card" surface="paper-2" className="p-6 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-2">
              National Health Coverage
            </div>
            <div>
              <Odometer
                value={inView ? 57 : 0}
                suffix=" crore"
                size="4xl"
                color="ink"
                duration={1.4}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                Lives covered by health insurance in FY24
              </p>
              <p className="text-xs text-ink-2 leading-relaxed">
                Over 40% of India&apos;s population across commercial group, retail, and government schemes.
              </p>
              <div className="pt-2 border-t border-rule/60">
                <a
                  href="https://irdai.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-2 hover:text-ink underline decoration-rule hover:decoration-ink transition-colors"
                >
                  <span>IRDAI Annual Report 2023-24, Part I</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Paper>

          {/* Stat 2: Disallowed Claims (Semantic Red) */}
          <Paper variant="card" surface="paper-2" className="p-6 space-y-4 border-red/20 bg-red-soft/10">
            <div className="text-xs font-mono uppercase tracking-wider text-red font-semibold">
              Disallowed or Repudiated
            </div>
            <div>
              <Odometer
                value={inView ? 26038 : 0}
                prefix="₹"
                suffix=" cr"
                size="4xl"
                color="red"
                duration={1.6}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                Claims chopped or denied in FY24 alone
              </p>
              <p className="text-xs text-ink-2 leading-relaxed">
                Billions deducted via room-rent sub-limits, non-payable consumables, and proportionate cuts.
              </p>
              <div className="pt-2 border-t border-rule/60">
                <a
                  href="https://irdai.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-2 hover:text-ink underline decoration-rule hover:decoration-ink transition-colors"
                >
                  <span>IRDAI Report Part II, Table 4.8 (PTI / BS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Paper>

          {/* Stat 3: Claim Settlement Ratio */}
          <Paper variant="card" surface="paper-2" className="p-6 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-2">
              Value Realization Ratio
            </div>
            <div>
              <Odometer
                value={inView ? 71 : 0}
                suffix="%"
                size="4xl"
                color="ink"
                duration={1.2}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                Of claimed rupee value actually paid
              </p>
              <p className="text-xs text-ink-2 leading-relaxed">
                Nearly 29% of every claimed rupee evaporates to deductions before reaching the hospital desk.
              </p>
              <div className="pt-2 border-t border-rule/60">
                <a
                  href="https://gicouncil.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-2 hover:text-ink underline decoration-rule hover:decoration-ink transition-colors"
                >
                  <span>General Insurance Council & Handbook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Paper>
        </div>

        {/* 2-Column Section: Why It Keeps Happening + Raju Case Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          {/* Left Column: 3 Numbered Why Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
              Why it keeps happening
            </div>

            {/* Card 01 */}
            <Paper variant="card" surface="paper" className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">01 / ASYMMETRY</Badge>
                <span className="text-xs font-mono text-ink-2">Policy Complexity</span>
              </div>
              <h4 className="font-ui font-semibold text-ink text-base">
                Dense wordings hide room-rent caps, co-pay and sub-limits.
              </h4>
              <p className="font-ui text-sm text-ink-2 leading-relaxed">
                Policies run 30–50 pages of dense legalese. A standard 1% room cap quietly triggers proportionate haircuts across surgeon fees, operating theatre, and nursing care.
              </p>
            </Paper>

            {/* Card 02 */}
            <Paper variant="card" surface="paper" className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">02 / TIMING</Badge>
                <span className="text-xs font-mono text-ink-2">Late Discovery</span>
              </div>
              <h4 className="font-ui font-semibold text-ink text-base">
                Shortfalls surface at final discharge, after costs are incurred.
              </h4>
              <p className="font-ui text-sm text-ink-2 leading-relaxed">
                Patients are admitted with provisional cashless pre-authorization. The true deductions strike at final discharge, forcing families to scramble for cash while leaving the hospital.
              </p>
            </Paper>

            {/* Card 03 */}
            <Paper variant="card" surface="paper" className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">03 / FRICTION</Badge>
                <span className="text-xs font-mono text-ink-2">Dispute Barrier</span>
              </div>
              <h4 className="font-ui font-semibold text-ink text-base">
                Appealing means opaque grievance cells, then the Ombudsman.
              </h4>
              <p className="font-ui text-sm text-ink-2 leading-relaxed">
                Patients rarely know which deductions violate IRDAI circulars. Challenging an unjustified cut requires tedious formal grievance letters citing specific policy clauses.
              </p>
            </Paper>
          </div>

          {/* Right Column: Meet Raju Case Preview */}
          <div className="lg:col-span-5">
            <Paper variant="card" surface="paper-2" className="p-6 space-y-5 border-rule">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
                  Example Case Study
                </span>
                <Badge variant="neutral" size="sm">Raju Verma</Badge>
              </div>

              <div>
                <h4 className="font-display text-2xl text-ink font-normal">
                  Meet Raju
                </h4>
                <p className="font-ui text-sm text-ink-2 mt-2 leading-relaxed">
                  His mother needed urgent hip replacement surgery. He chose a ₹8,000/day Deluxe room instead of the ₹5,000 policy cap. That single choice triggered ₹41,500 in surprise out-of-pocket deductions.
                </p>
              </div>

              {/* Mini Receipt Preview */}
              <div className="bg-paper p-4 rounded border border-rule space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-ink-2 border-b border-rule/60 pb-2">
                  <span>Gross Hospital Bill</span>
                  <Money amount={150000} size="xs" color="ink" />
                </div>
                <div className="flex justify-between text-ink-2">
                  <span>Insurer Approved</span>
                  <Money amount={108500} size="xs" color="green" />
                </div>
                <div className="flex justify-between items-center text-ink font-semibold pt-1 border-t border-rule/60">
                  <span className="text-red">Patient Shortfall</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="deduction" size="sm">Deduction</Badge>
                    <Money amount={41500} sign="negative-only" size="xs" color="red" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  icon={<ArrowDown className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => {
                    const el = document.getElementById('scene-3');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore the Ripple Effect
                </Button>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    </section>
  );
}
