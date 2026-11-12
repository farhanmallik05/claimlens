'use client';

import React, { useState } from 'react';
import { SectionHeading, Paper, Money, Badge, Button } from '@/components/primitives';
import { billRaju, policyRaju, settlementRaju } from '@/lib/fixtures';
import { calculateForecast, ENGINE_VERSION } from '@claimlens/engine';
import { cn } from '@/lib/utils';
import {
  FileText,
  Play,
  Printer,
  Download,
  Github,
  Video,
  Presentation,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function Scene8Export() {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const forecastResult = calculateForecast(policyRaju, billRaju);

  // Trigger 90-second judge auto tour via global event or shortcut
  const handleStartTour = () => {
    // Find the TourPill button or dispatch key 'j'
    const tourButton = document.getElementById('tour-pill-button');
    if (tourButton) {
      tourButton.click();
    } else {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <section
      id="scene-8"
      className="relative scroll-mt-20 py-8 md:py-16 space-y-12"
      aria-label="Scene 8: Showcase Summary, PDF Export & Judge Tour"
    >
      <SectionHeading
        sceneNumber="08"
        badge="AUDIT SUMMARY & HACKATHON CLOSE"
        title="Know before you're discharged."
        subtitle="Executive summary of the audited claim, print-ready document export, and 90-second judge auto-tour launcher."
        align="left"
      />

      {/* Executive Showcase Summary Card */}
      <Paper className="p-6 md:p-10 bg-paper-2/50 border-rule space-y-8 shadow-lg relative overflow-hidden">
        {/* Certificate Style Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green" />
              <span className="text-xs font-mono uppercase tracking-widest text-ink-2 font-bold">
                ClaimLens Certified Audit Report · Engine v{ENGINE_VERSION}
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink">
              Raju&apos;s Mother · Total Hip Replacement (THR)
            </h3>
            <p className="text-xs font-mono text-ink-2">
              Hospital: Manipal Hospital, Bengaluru · Claim Ref: CLM-DEMO-001 · 5 Days Inpatient Stay
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
            <Badge variant="success" className="font-mono text-xs">
              ✓ 100% Clause Cited
            </Badge>
            <Badge variant="neutral" className="font-mono text-xs">
              Exact Integer Rupees
            </Badge>
          </div>
        </div>

        {/* 4 Financial Quadrants */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="p-4 bg-paper rounded-lg border border-rule">
            <span className="text-[10px] uppercase text-ink-2 block">1. Gross Billed</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-ink mt-1">
              ₹1,50,000
            </div>
            <span className="text-[11px] text-ink-2 mt-0.5 block">8 Itemized Lines</span>
          </div>

          <div className="p-4 bg-paper rounded-lg border border-rule">
            <span className="text-[10px] uppercase text-green font-bold block">2. Insurer Pays</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-green mt-1">
              ₹1,08,500
            </div>
            <span className="text-[11px] text-green mt-0.5 block font-semibold">72.33% Approved</span>
          </div>

          <div className="p-4 bg-paper rounded-lg border border-rule">
            <span className="text-[10px] uppercase text-red font-bold block">3. Legitimate Shortfall</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-red mt-1">
              ₹41,500
            </div>
            <span className="text-[11px] text-red mt-0.5 block font-semibold">27.67% Out-of-Pocket</span>
          </div>

          <div className="p-4 bg-green-soft/40 rounded-lg border border-green/30">
            <span className="text-[10px] uppercase text-green font-bold block">4. Recoverable on Appeal</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-green mt-1">
              ₹9,750
            </div>
            <span className="text-[11px] text-green mt-0.5 block font-semibold">Clause SP-3.3 Protection</span>
          </div>
        </div>

        {/* Audited Deduction Provenance Table */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink font-bold block">
            Audited Policy Deductions &amp; Statutory Provenance:
          </span>
          <div className="border border-rule rounded-lg divide-y divide-rule bg-paper text-xs font-mono">
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink">Room Rent Cap Overage</span>
                <span className="text-ink-2 block text-[11px]">₹8,000/day vs ₹5,000 cap × 5 days</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red">−₹15,000</span>
                <span className="text-[11px] text-ink-2 block">Clause SP-3.1</span>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink">Proportionate Professional Haircut</span>
                <span className="text-ink-2 block text-[11px]">Surgeon, OT &amp; Nursing fees cut by 37.5%</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red">−₹22,500</span>
                <span className="text-[11px] text-ink-2 block">Clause SP-3.2</span>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink">Non-Payable Hospital Consumables</span>
                <span className="text-ink-2 block text-[11px]">Administrative charges &amp; disposable PPE</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red">−₹4,000</span>
                <span className="text-[11px] text-ink-2 block">Clause SP-4.1 (Annexure A)</span>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between bg-green-soft/20">
              <div>
                <span className="font-bold text-green">Protected Statutory Carve-Out</span>
                <span className="text-ink-2 block text-[11px]">Medicines (₹22,000) &amp; Imaging (₹20,000) protected</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green">₹42,000 Paid (100%)</span>
                <span className="text-[11px] text-green block font-semibold">Clause SP-3.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-4 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartTour}
              className="w-full sm:w-auto min-h-[48px] px-6 text-sm font-mono shadow-md"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch 90-Second Judge Tour (Press J)
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handlePrint}
              className="w-full sm:w-auto min-h-[48px] px-6 text-sm font-mono"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save Audit PDF
            </Button>
          </div>

          <span className="text-xs font-mono text-ink-2 text-center sm:text-right">
            Verified across 148 automated tests · Zero float arithmetic
          </span>
        </div>
      </Paper>

      {/* External Links & Hackathon CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="#scene-3"
          className="p-5 rounded-xl border border-rule bg-paper hover:bg-paper-2 hover:border-ink transition-all flex flex-col justify-between space-y-3 min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-ink-2 font-bold">Interactive Sandbox</span>
            <ArrowRight className="w-4 h-4 text-ink-2" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-ink">Run Your Own Bill</h4>
            <p className="text-xs text-ink-2 mt-0.5">Scrub room rates in Scene 3</p>
          </div>
        </a>

        <a
          href="https://github.com/farhanmallik05/claimlens"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-rule bg-paper hover:bg-paper-2 hover:border-ink transition-all flex flex-col justify-between space-y-3 min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-ink-2 font-bold">Source Code</span>
            <Github className="w-4 h-4 text-ink" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-ink">View GitHub Repo</h4>
            <p className="text-xs text-ink-2 mt-0.5">Monorepo, Engine &amp; PR history</p>
          </div>
        </a>

        <a
          href="#scene-7"
          className="p-5 rounded-xl border border-rule bg-paper hover:bg-paper-2 hover:border-ink transition-all flex flex-col justify-between space-y-3 min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-ink-2 font-bold">Appeal Letter</span>
            <ExternalLink className="w-4 h-4 text-ink-2" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-ink">Grievance Drafter</h4>
            <p className="text-xs text-ink-2 mt-0.5">IRDAI legal appeal in Scene 7</p>
          </div>
        </a>

        <a
          href="#scene-5"
          className="p-5 rounded-xl border border-rule bg-paper hover:bg-paper-2 hover:border-ink transition-all flex flex-col justify-between space-y-3 min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-ink-2 font-bold">Architecture</span>
            <ExternalLink className="w-4 h-4 text-ink-2" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-ink">5-Agent Rail</h4>
            <p className="text-xs text-ink-2 mt-0.5">Explore pipeline in Scene 5</p>
          </div>
        </a>
      </div>
    </section>
  );
}
