import React from "react";
import { formatRupees } from "@/lib/format";
import { ENGINE_VERSION } from "@claimlens/engine";
import { ShieldCheck, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper paper-grain flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto">
      {/* Top Progress Rule & Meta Header */}
      <header className="border-b border-rule pb-4 flex justify-between items-center text-xs font-mono tracking-wider text-ink-2 uppercase">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green" />
          CodeQuest 2026 · Engine v{ENGINE_VERSION}
        </span>
        <span>SCENE 01 / RECEIPT PREVIEW</span>
      </header>

      {/* Hero Body */}
      <section className="my-16 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-paper-2 border border-rule text-xs font-mono text-ink-2">
            <FileText className="w-3.5 h-3.5" />
            <span>THE RECEIPT THAT FIGHTS BACK</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-ink tracking-tight leading-[0.95]">
            ClaimLens
          </h1>

          <p className="font-ui text-lg md:text-xl text-ink-2 max-w-2xl leading-relaxed">
            Your shortfall, forecast before discharge, with the clause behind every rupee.
            Deterministic financial audit engine running in integer rupees.
          </p>
        </div>

        {/* Design Token Proof / Artifact Card */}
        <div className="bg-paper-2 border border-rule rounded-lg p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
            <div>
              <p className="text-xs font-mono text-ink-2 uppercase tracking-wide">
                Raju&apos;s mother · Hip surgery · 5 days
              </p>
              <h2 className="text-2xl font-display text-ink mt-1">
                Pre-Discharge Audit Baseline
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-xs font-mono text-ink-2 uppercase">
                  Insurer Pays
                </span>
                <span className="text-xl md:text-2xl font-mono tabular-nums text-green font-medium">
                  {formatRupees(108500)}
                </span>
              </div>
              <div className="h-8 w-px bg-rule" />
              <div className="text-right">
                <span className="block text-xs font-mono text-ink-2 uppercase">
                  You Pay (Shortfall)
                </span>
                <span className="text-xl md:text-2xl font-mono tabular-nums text-red font-medium">
                  {formatRupees(41500)}
                </span>
              </div>
            </div>
          </div>

          {/* Token Swatch Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 rounded border border-rule bg-paper">
              <span className="block text-ink font-semibold">--paper</span>
              <span className="text-ink-2 text-[10px]">#F5F0E6</span>
            </div>
            <div className="p-3 rounded border border-rule bg-paper-2">
              <span className="block text-ink font-semibold">--paper-2</span>
              <span className="text-ink-2 text-[10px]">#EDE6D6</span>
            </div>
            <div className="p-3 rounded border border-rule bg-ink text-paper">
              <span className="block font-semibold">--ink</span>
              <span className="text-paper/70 text-[10px]">#14110F</span>
            </div>
            <div className="p-3 rounded border border-rule bg-red text-white">
              <span className="block font-semibold">--red</span>
              <span className="text-white/80 text-[10px]">#C8372D</span>
            </div>
            <div className="p-3 rounded border border-rule bg-red-soft text-red">
              <span className="block font-semibold">--red-soft</span>
              <span className="text-red/80 text-[10px]">#F3D9D5</span>
            </div>
            <div className="p-3 rounded border border-rule bg-green text-white">
              <span className="block font-semibold">--green</span>
              <span className="text-white/80 text-[10px]">#1F6B4A</span>
            </div>
          </div>

          {/* Interactive Sandbox Callout (COUNTER_PLAN WP-05 / WP-09 Compliance) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-rule text-sm">
            <div className="flex items-center gap-2 text-ink-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green" />
              <span>Verified Sandbox Mode: In-browser deterministic computation</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-ink text-paper text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ready for Scene 1-8 Implementation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Honesty Strip */}
      <footer className="border-t border-rule pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-ink-2">
        <p>Cites sources, not legal advice.</p>
        <p>Illustrative · synthetic documents · CodeQuest 2026</p>
      </footer>
    </main>
  );
}
