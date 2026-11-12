'use client';

import React, { useState } from 'react';
import { SectionHeading, Paper, Badge, Button, ClauseChip } from '@/components/primitives';
import { HowItWorks } from '@/components/shared/HowItWorks';
import { policyRaju, regulatoryRefs } from '@/lib/fixtures';
import { cn } from '@/lib/utils';
import {
  FileSearch,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

export function Scene5ClauseInspector() {
  const [selectedClauseId, setSelectedClauseId] = useState<string>('SP-3.2');

  const clauseList = Object.entries(policyRaju.clauses).map(([id, clause]) => ({
    id,
    heading: clause.heading,
    page: clause.page,
    text: clause.text,
  }));

  const activeClause = policyRaju.clauses[selectedClauseId] || policyRaju.clauses['SP-3.2'];

  const getImpactExplanation = (clauseId: string) => {
    switch (clauseId) {
      case 'SP-2.1':
        return {
          title: 'Maximum Policy Liability',
          amount: '₹5,00,000 Sum Insured',
          rupeeImpact: '₹0 deduction (Well within limit)',
          details: 'Raju’s ₹1,50,000 bill is fully within the ₹5,00,000 annual sum insured limit; zero clamp is triggered.',
        };
      case 'SP-3.1':
        return {
          title: 'Room Rent Capping (1% SI)',
          amount: '₹5,000 / day eligibility',
          rupeeImpact: '−₹15,000 room overage',
          details: 'Raju chose a Deluxe room at ₹8,000/day. The ₹3,000/day excess for 5 days is disallowed in full.',
        };
      case 'SP-3.2':
        return {
          title: 'Proportionate Cascading Haircut',
          amount: '62.5% payable ratio applied',
          rupeeImpact: '−₹22,500 professional haircut',
          details: 'Surgeon (₹30,000), OT (₹20,000), and nursing (₹10,000) charges are slashed by (1 − 5000/8000) = 37.5%.',
        };
      case 'SP-3.3':
        return {
          title: 'Protected Carve-out: Medicines & Labs',
          amount: 'Exempt from Proportionate Cuts',
          rupeeImpact: '₹0 legal cut (Protected by law)',
          details: 'Clause 3.2 expressly cannot touch pharmacy or diagnostics. Insurer attempts to cut this can be overturned on appeal.',
        };
      case 'SP-4.1':
        return {
          title: 'Annexure A Non-Payable Items',
          amount: 'Scheduled Consumable Exclusions',
          rupeeImpact: '−₹4,000 non-payable deduction',
          details: 'Disposable gloves, sanitizers, and administrative registration charges are non-payable under standard guidelines.',
        };
      case 'SP-5.1':
        return {
          title: 'Co-Payment Provision',
          amount: '0% Nil Co-Pay',
          rupeeImpact: '₹0 co-pay deduction',
          details: 'The policy schedule carries zero co-payment requirement; no post-cap haircut is levied.',
        };
      default:
        return {
          title: 'Policy Condition',
          amount: 'Deterministic Rule',
          rupeeImpact: 'Evaluated in <1ms',
          details: 'Audited by pure rules engine.',
        };
    }
  };

  const impact = getImpactExplanation(selectedClauseId);

  const openDrawerWithClause = (clauseId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('claimlens:open-clause', {
          detail: { clauseId },
        })
      );
    }
  };

  return (
    <section
      id="scene-5"
      className="relative scroll-mt-20 py-8 md:py-16 space-y-12"
      aria-label="Scene 5: How It Works & Policy Clause Inspector"
    >
      <SectionHeading
        sceneNumber="05"
        badge="ARCHITECTURE & CLAUSE PROVENANCE"
        title="LLMs read, rules decide, clauses prove"
        subtitle="How ClaimLens separates probabilistic document extraction from deterministic financial adjudication — with 100% clause attribution."
        align="left"
      />

      {/* 5-Agent Architecture Rail & 4-Step Pipeline Flow */}
      <HowItWorks />

      {/* Policy Fine-Print Decrypter Section */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-ink" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
                Policy Fine-Print Decrypter
              </span>
            </div>
            <h3 className="text-xl font-serif text-ink font-bold mt-1">
              Every Clause Behind Raju&apos;s ₹41,500 Shortfall
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openDrawerWithClause(selectedClauseId)}
            className="self-start sm:self-auto min-h-[44px] sm:min-h-[36px]"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Full Policy Schedule
          </Button>
        </div>

        {/* Clause Navigator & Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Clause Selector List */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-mono text-ink-2 uppercase tracking-wider block font-semibold mb-2">
              Select Contract Clause:
            </span>
            <div className="space-y-2">
              {clauseList.map((item) => {
                const isSelected = item.id === selectedClauseId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedClauseId(item.id)}
                    className={cn(
                      'p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between select-none min-h-[48px]',
                      isSelected
                        ? 'border-ink bg-paper shadow-sm ring-1 ring-ink/20'
                        : 'border-rule bg-paper-2/60 hover:bg-paper hover:border-ink-2/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'text-xs font-mono font-bold px-2 py-0.5 rounded',
                          isSelected ? 'bg-ink text-paper' : 'bg-ink/10 text-ink'
                        )}
                      >
                        {item.id}
                      </span>
                      <div>
                        <div className="text-sm font-serif font-bold text-ink">
                          {item.heading}
                        </div>
                        <div className="text-[11px] font-mono text-ink-2/70">
                          Schedule Page {item.page}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isSelected ? 'text-ink translate-x-1' : 'text-ink-2/40'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Verbatim Clause Inspector Paper */}
          <div className="lg:col-span-7">
            <Paper className="p-6 md:p-7 space-y-6 bg-paper-2/40 border-rule relative">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ink text-paper">
                    Clause {selectedClauseId}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-ink">
                    {activeClause.heading}
                  </h4>
                </div>
                <span className="text-xs font-mono text-ink-2">
                  Page {activeClause.page} of 2
                </span>
              </div>

              {/* Verbatim contract wording */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-ink-2 font-semibold block">
                  Verbatim Policy Contract Text:
                </span>
                <blockquote className="p-4 bg-paper rounded-lg border-l-4 border-ink font-ui text-sm sm:text-base text-ink italic leading-relaxed shadow-xs">
                  &ldquo;{activeClause.text}&rdquo;
                </blockquote>
              </div>

              {/* Raju clinical impact card */}
              <div className="bg-paper p-4 rounded-lg border border-rule space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-ink">
                    Application in Raju&apos;s Hip Surgery Claim:
                  </span>
                  <span className="text-xs font-mono font-bold text-red">
                    {impact.rupeeImpact}
                  </span>
                </div>
                <div className="text-xs font-mono text-ink-2 font-semibold">
                  {impact.title} · {impact.amount}
                </div>
                <p className="text-xs text-ink-2 leading-relaxed">
                  {impact.details}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-rule">
                <span className="text-xs font-mono text-ink-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green" />
                  <span>Enforced via CI Clause Guard (FR-12)</span>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openDrawerWithClause(selectedClauseId)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View in Synthetic Policy Drawer
                </Button>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    </section>
  );
}
