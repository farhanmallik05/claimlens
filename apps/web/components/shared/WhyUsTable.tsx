'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus, HelpCircle, Shield, Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/primitives';

interface ComparisonRow {
  capability: string;
  description: string;
  aggregators: 'yes' | 'partial' | 'no';
  aggregatorsNote: string;
  portals: 'yes' | 'partial' | 'no';
  portalsNote: string;
  chatbots: 'yes' | 'partial' | 'no';
  chatbotsNote: string;
  claimlens: 'yes';
  claimlensNote: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    capability: 'Understands your exact policy',
    description: 'Reads individual schedule endorsements, sum insured room-cap ratios, and co-payment clauses.',
    aggregators: 'partial',
    aggregatorsNote: 'Generic brochure terms only, lacks uploaded policy endorsement parsing.',
    portals: 'partial',
    portalsNote: 'Knows policy limits but does not explain clause implications before admission.',
    chatbots: 'partial',
    chatbotsNote: 'Hallucinates clause terms when processing multi-page legal schedules.',
    claimlens: 'yes',
    claimlensNote: 'Extracts exact clause IDs (SP-2.1 to SP-5.1) and binds every rule deterministically.',
  },
  {
    capability: 'Audits the bill line by line',
    description: 'Decomposes 8+ itemized clinical categories into payable, non-payable, and proportionate portions.',
    aggregators: 'no',
    aggregatorsNote: 'Does not process hospital discharge invoices.',
    portals: 'partial',
    portalsNote: 'Aggregated lump sums shown at settlement without per-line audit trail.',
    chatbots: 'partial',
    chatbotsNote: 'Unreliable math on itemized medical tables; mixes up taxes and discounts.',
    claimlens: 'yes',
    claimlensNote: 'Evaluates each line item with exact category-specific room cap & consumable rules.',
  },
  {
    capability: 'Forecasts payout pre-discharge',
    description: 'Simulates out-of-pocket liabilities and room upgrade consequences before the bill is finalized.',
    aggregators: 'no',
    aggregatorsNote: 'No hospital workflow or pre-discharge estimation tools.',
    portals: 'partial',
    portalsNote: 'Initial cashless approval amounts often differ wildly from final settlement.',
    chatbots: 'no',
    chatbotsNote: 'Cannot model real-time room rate cascading or multi-room hospital stays.',
    claimlens: 'yes',
    claimlensNote: 'Real-time pre-admission room advisor calculates avoidable shortfall in <1ms.',
  },
  {
    capability: 'Cites the clause per deduction',
    description: 'Every rupee deducted carries a direct reference to a numbered contract clause and IRDAI rule.',
    aggregators: 'no',
    aggregatorsNote: 'No deduction breakdown provided.',
    portals: 'no',
    portalsNote: 'Opaque reason codes (e.g. "Deduction as per policy terms") without legal text.',
    chatbots: 'partial',
    chatbotsNote: 'Invents or misquotes clause references (confabulation risk).',
    claimlens: 'yes',
    claimlensNote: '100% cited guarantee: every deduction links to exact clause text and formula.',
  },
  {
    capability: 'Drafts legal appeal & grievance',
    description: 'Auto-generates formal grievance letters citing IRDAI Master Circulars and Ombudsman jurisdiction.',
    aggregators: 'partial',
    aggregatorsNote: 'Basic email templates lacking statutory citations or discrepancy audit.',
    portals: 'no',
    portalsNote: 'Incentivized against helping policyholders dispute internal deductions.',
    chatbots: 'partial',
    chatbotsNote: 'Generic complaint letters without verified arithmetic discrepancies.',
    claimlens: 'yes',
    claimlensNote: 'Detects unauthorized cuts (e.g. ₹9,750 on medicines) and drafts ready-to-send appeals.',
  },
  {
    capability: 'Independent of commissions',
    description: 'No affiliate revenue, no insurer commission cuts, no hospital referral kickbacks.',
    aggregators: 'no',
    aggregatorsNote: 'Earns distributor commissions (15–20%) from insurance companies.',
    portals: 'no',
    portalsNote: 'Employed by or contracted to insurers to minimize claim outlays.',
    chatbots: 'yes',
    chatbotsNote: 'Neutral, but lacks deep insurance domain grounding.',
    claimlens: 'yes',
    claimlensNote: '100% policyholder-aligned audit advocate; zero insurer sponsorship.',
  },
  {
    capability: 'Exact integer rupee math (zero float leakage)',
    description: 'Strict conservation law: Billed − Insurer Pays === Total Deductions.',
    aggregators: 'no',
    aggregatorsNote: 'No computational engine.',
    portals: 'partial',
    portalsNote: 'Internal proprietary black boxes prone to round-off disputes.',
    chatbots: 'no',
    chatbotsNote: 'Probabilistic token prediction cannot guarantee arithmetic invariants.',
    claimlens: 'yes',
    claimlensNote: 'Pure TypeScript rules engine mathematically verified across 148 automated tests.',
  },
  {
    capability: 'Offline synthetic replay fallback',
    description: 'Operates completely locally for privacy and hackathon reliability without external API keys.',
    aggregators: 'no',
    aggregatorsNote: 'Online SaaS only.',
    portals: 'no',
    portalsNote: 'Requires authenticated enterprise insurer backend.',
    chatbots: 'no',
    chatbotsNote: 'Dependent on external cloud LLM API connectivity.',
    claimlens: 'yes',
    claimlensNote: 'Zero-downtime offline circuit breaker with pre-recorded golden test fixtures.',
  },
];

export function WhyUsTable() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const renderIcon = (status: 'yes' | 'partial' | 'no') => {
    switch (status) {
      case 'yes':
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green/10 text-green font-bold">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        );
      case 'partial':
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold">
            <Minus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'no':
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-soft/60 text-red font-bold">
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
            Competitive Differentiation Matrix
          </span>
          <h3 className="text-xl md:text-2xl font-serif text-ink font-bold mt-1">
            Why ClaimLens: Real Rules vs Opaque Portals
          </h3>
        </div>
        <Badge variant="payable" className="self-start sm:self-auto font-mono text-xs">
          Policyholder First · 100% Cited
        </Badge>
      </div>

      {/* Comparison Table */}
      <div className="border border-rule rounded-xl overflow-hidden bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-paper-2 border-b border-rule text-xs font-mono text-ink uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6 font-bold w-2/5">Capability</th>
                <th className="py-4 px-3 text-center text-ink-2/80 font-medium hidden sm:table-cell">
                  Aggregators
                </th>
                <th className="py-4 px-3 text-center text-ink-2/80 font-medium hidden md:table-cell">
                  Insurer / TPA
                </th>
                <th className="py-4 px-3 text-center text-ink-2/80 font-medium">
                  Generic AI
                </th>
                <th className="py-4 px-4 sm:px-6 text-center bg-green-soft/40 text-green font-bold border-l border-rule">
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ClaimLens</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-ui">
              {COMPARISON_DATA.map((row, idx) => {
                const isSelected = selectedRow === idx;
                return (
                  <React.Fragment key={row.capability}>
                    <tr
                      onClick={() => setSelectedRow(isSelected ? null : idx)}
                      className={cn(
                        'transition-colors cursor-pointer select-none hover:bg-paper-2/60',
                        isSelected && 'bg-paper-2/90 font-medium'
                      )}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-ink">{row.capability}</div>
                        <div className="text-[11px] text-ink-2 leading-snug line-clamp-1 sm:line-clamp-none mt-0.5">
                          {row.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center hidden sm:table-cell">
                        {renderIcon(row.aggregators)}
                      </td>
                      <td className="py-3.5 px-3 text-center hidden md:table-cell">
                        {renderIcon(row.portals)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {renderIcon(row.chatbots)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center bg-green-soft/20 border-l border-rule font-bold">
                        <div className="flex items-center justify-center gap-2">
                          {renderIcon(row.claimlens)}
                          <span className="text-green text-xs font-mono font-bold hidden sm:inline">
                            YES
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail explanation */}
                    {isSelected && (
                      <tr className="bg-paper-2/40 border-b border-rule">
                        <td colSpan={5} className="p-4 sm:p-5 text-xs text-ink space-y-2">
                          <div className="font-mono font-bold text-ink-2 uppercase text-[11px] mb-2">
                            Deep Dive: {row.capability}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-paper rounded border border-rule">
                              <span className="text-[10px] font-mono uppercase text-ink-2/60 block">Aggregators</span>
                              <p className="mt-1 text-ink-2">{row.aggregatorsNote}</p>
                            </div>
                            <div className="p-3 bg-paper rounded border border-rule">
                              <span className="text-[10px] font-mono uppercase text-ink-2/60 block">Insurer / TPA</span>
                              <p className="mt-1 text-ink-2">{row.portalsNote}</p>
                            </div>
                            <div className="p-3 bg-paper rounded border border-rule">
                              <span className="text-[10px] font-mono uppercase text-ink-2/60 block">Generic LLMs</span>
                              <p className="mt-1 text-ink-2">{row.chatbotsNote}</p>
                            </div>
                            <div className="p-3 bg-green-soft/30 rounded border border-green/30">
                              <span className="text-[10px] font-mono uppercase text-green font-bold block">ClaimLens Engine</span>
                              <p className="mt-1 text-ink font-medium">{row.claimlensNote}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Persistent Footnote */}
        <div className="bg-paper-2/60 px-4 sm:px-6 py-3 border-t border-rule flex items-center justify-between gap-3 text-xs font-mono text-ink-2">
          <span>
            * Our assessment of expected typical offerings; capabilities vary by provider.
          </span>
          <span className="text-ink font-semibold shrink-0 hidden sm:inline">
            Click any row to view audit breakdown
          </span>
        </div>
      </div>
    </div>
  );
}
