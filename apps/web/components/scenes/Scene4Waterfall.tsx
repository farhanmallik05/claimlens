'use client';

import React, { useState } from 'react';
import { Paper, Money, Badge, ClauseChip, SectionHeading } from '@/components/primitives';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface StepDetail {
  id: string;
  stepNumber: string;
  label: string;
  amount: number;
  type: 'billed' | 'deduction' | 'exempt' | 'allowed' | 'shortfall';
  clauseId?: string;
  formula: string;
  explanation: string;
  percentageOfBilled: number;
}

export function Scene4Waterfall() {
  const [selectedStep, setSelectedStep] = useState<string | null>('room-cut');

  const steps: StepDetail[] = [
    {
      id: 'billed',
      stepNumber: '01',
      label: 'Gross Hospital Bill',
      amount: 150000,
      type: 'billed',
      formula: '5 days stay @ Manipal Hospital (THR Surgery)',
      explanation: 'Total invoiced charges across 8 itemized categories for Raju’s mother hip surgery.',
      percentageOfBilled: 100,
    },
    {
      id: 'room-cut',
      stepNumber: '02',
      label: 'Room Rent Capping',
      amount: -15000,
      type: 'deduction',
      clauseId: 'SP-3.1',
      formula: '(₹8,000 actual rate − ₹5,000 policy cap) × 5 days = ₹15,000',
      explanation: 'Policy clause SP-3.1 limits room rent to 1% of Sum Insured (₹5,00,000 = ₹5,000/day). The ₹3,000/day excess is fully disallowed.',
      percentageOfBilled: 10.0,
    },
    {
      id: 'prof-cut',
      stepNumber: '03',
      label: 'Proportionate Professional Haircut',
      amount: -22500,
      type: 'deduction',
      clauseId: 'SP-3.2',
      formula: '₹60,000 professional fees × (1 − ₹5,000 ÷ ₹8,000) = ₹22,500',
      explanation: 'Clause SP-3.2 slashes Surgeon (₹11,250), Operation Theatre (₹7,500), and Nursing (₹3,750) fees in direct proportion to the room rate overage (37.5% cut).',
      percentageOfBilled: 15.0,
    },
    {
      id: 'non-payable',
      stepNumber: '04',
      label: 'Non-Payable Consumables',
      amount: -4000,
      type: 'deduction',
      clauseId: 'SP-4.1',
      formula: 'Annexure A exclusions (Administrative fees, PPE, Gloves) = ₹4,000',
      explanation: 'Scheduled statutory exclusions under IRDAI 2019 guidelines and policy Clause SP-4.1 deducted from total consumables.',
      percentageOfBilled: 2.67,
    },
    {
      id: 'exempt',
      stepNumber: '05',
      label: 'Statutory Exemptions (Protected)',
      amount: 42000,
      type: 'exempt',
      clauseId: 'SP-3.3',
      formula: 'Medicines (₹22,000) + Diagnostics (₹20,000) = ₹42,000 paid at 100%',
      explanation: 'Under IRDAI Master Circular & Clause SP-3.3, pharmacy, medicines, and imaging are expressly exempt from proportionate room-rent cuts.',
      percentageOfBilled: 28.0,
    },
    {
      id: 'allowed',
      stepNumber: '06',
      label: 'Insurer Net Liability',
      amount: 108500,
      type: 'allowed',
      formula: '₹1,50,000 − (₹15,000 + ₹22,500 + ₹4,000) = ₹1,08,500',
      explanation: 'Net approved claim payable directly by Demo Assure under the policy terms.',
      percentageOfBilled: 72.33,
    },
    {
      id: 'shortfall',
      stepNumber: '07',
      label: 'Net Patient Shortfall',
      amount: 41500,
      type: 'shortfall',
      formula: '₹15,000 room + ₹22,500 proportionate + ₹4,000 non-payable = ₹41,500',
      explanation: 'The unexpected out-of-pocket balance Raju must pay at the discharge counter (27.67% of total bill).',
      percentageOfBilled: 27.67,
    },
  ];

  return (
    <section
      id="scene-4"
      className="relative scroll-mt-20 py-8 md:py-16"
      aria-label="Scene 4: Shortfall Waterfall"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <SectionHeading
          sceneNumber="04"
          badge="EVERY RUPEE HAS A RECEIPT"
          title="Every rupee accounted for"
          subtitle="The mathematical waterfall decomposing how Raju's ₹1,50,000 hospital bill became a ₹41,500 out-of-pocket shortfall."
          align="left"
        />

        {/* Conservation Law Invariant Banner */}
        <div className="bg-paper-2 p-4 rounded-lg border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
            <span className="text-ink font-semibold">Mathematical Invariant (FR-7):</span>
            <span className="text-ink-2">Billed − Insurer Pays === Total Deductions</span>
          </div>
          <div className="text-ink font-bold">
            ₹1,50,000 − ₹1,08,500 = <span className="text-red">₹41,500</span>
          </div>
        </div>

        {/* Desktop Waterfall Stepping Bars */}
        <div className="hidden md:block space-y-3">
          {steps.map((step) => {
            const isSelected = selectedStep === step.id;
            const isDeduction = step.type === 'deduction';
            const isExempt = step.type === 'exempt';
            const isAllowed = step.type === 'allowed';
            const isShortfall = step.type === 'shortfall';

            return (
              <div
                key={step.id}
                onClick={() => setSelectedStep(isSelected ? null : step.id)}
                className={cn(
                  'p-4 rounded-lg border transition-all cursor-pointer select-none',
                  isSelected ? 'border-ink bg-paper shadow-md' : 'border-rule bg-paper-2/60 hover:bg-paper hover:border-ink-2/40'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-ink-2 font-bold w-6">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-ink font-ui">
                        {step.label}
                      </span>
                      {step.clauseId && (
                        <span className="ml-2">
                          <ClauseChip clauseId={step.clauseId} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      {isDeduction && (
                        <Money amount={step.amount} sign="negative-only" color="red" size="base" />
                      )}
                      {isExempt && (
                        <span className="text-green text-sm font-semibold">100% Exempt (₹42,000)</span>
                      )}
                      {isAllowed && (
                        <Money amount={step.amount} color="green" size="base" />
                      )}
                      {isShortfall && (
                        <div className="flex items-center gap-2">
                          <Badge variant="deduction" size="sm">You Pay</Badge>
                          <Money amount={step.amount} color="red" size="lg" />
                        </div>
                      )}
                      {step.type === 'billed' && (
                        <Money amount={step.amount} color="ink" size="base" />
                      )}
                    </div>
                    {isSelected ? (
                      <ChevronDown className="w-4 h-4 text-ink-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-2" />
                    )}
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-2.5 h-2 w-full bg-paper rounded overflow-hidden flex border border-rule/50">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isDeduction ? 'bg-red' : isAllowed ? 'bg-green' : isShortfall ? 'bg-red' : 'bg-ink/70'
                    )}
                    style={{ width: `${Math.min(100, Math.max(5, step.percentageOfBilled))}%` }}
                  />
                </div>

                {/* Expanded Details Tray */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-rule/60 grid grid-cols-12 gap-4 text-xs font-mono">
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <div className="text-ink-2 uppercase tracking-wider text-[10px]">
                        Exact Formula:
                      </div>
                      <div className="text-ink font-semibold p-2 bg-paper-2 rounded border border-rule">
                        {step.formula}
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <div className="text-ink-2 uppercase tracking-wider text-[10px]">
                        Statutory Explanation:
                      </div>
                      <p className="text-ink-2 font-ui leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepping Ladder (<768px) */}
        <div className="block md:hidden space-y-4">
          {steps.map((step) => {
            const isDeduction = step.type === 'deduction';
            const isShortfall = step.type === 'shortfall';
            const isAllowed = step.type === 'allowed';

            return (
              <Paper
                key={step.id}
                variant="card"
                surface="paper"
                className="p-4 space-y-2 border-rule min-h-[44px]"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-2 font-bold">{step.stepNumber} · {step.label}</span>
                  {step.clauseId && <Badge variant="outline" size="sm">{step.clauseId}</Badge>}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-ink-2 font-mono">Amount:</span>
                  <div>
                    {isDeduction && <Money amount={step.amount} sign="negative-only" color="red" size="sm" />}
                    {isAllowed && <Money amount={step.amount} color="green" size="sm" />}
                    {isShortfall && <Money amount={step.amount} color="red" size="base" />}
                    {step.type === 'billed' && <Money amount={step.amount} color="ink" size="sm" />}
                    {step.type === 'exempt' && <span className="text-green text-xs font-mono font-semibold">Exempt (₹42k)</span>}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-ink-2 bg-paper-2 p-2 rounded border border-rule/50">
                  {step.formula}
                </div>
              </Paper>
            );
          })}
        </div>

        {/* Statutory Exemption Callout Box (SP-3.3) */}
        <Paper variant="card" surface="paper-2" className="p-6 border-rule space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="payable" size="sm">Legal Protection</Badge>
            <span className="text-xs font-mono font-semibold text-ink">
              Clause SP-3.3: Statutory Exemption from Haircuts
            </span>
          </div>

          <p className="text-xs sm:text-sm font-ui text-ink-2 leading-relaxed">
            Many insurers illegally apply proportionate cuts to pharmacy and diagnostics. ClaimLens strictly audits and preserves the IRDAI 2020 Master Circular protection: <span className="font-semibold text-ink">Medicines (₹22,000)</span> and <span className="font-semibold text-ink">Lab/Imaging (₹20,000)</span> are reimbursed without penalty.
          </p>

          <div className="text-[11px] font-mono text-ink-2 pt-1 border-t border-rule/60">
            Citation: IRDAI/HLT/CIR/GDL/61/04/2020 Clause 19 · SafeCare Plus Clause SP-3.3
          </div>
        </Paper>
      </div>
    </section>
  );
}
