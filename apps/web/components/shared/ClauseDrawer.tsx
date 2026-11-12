'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ExternalLink, ShieldCheck, Scale, FileText, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import { policyRaju } from '@/lib/fixtures';
import { cn } from '@/lib/utils';
import { Badge, Button } from '@/components/primitives';

export interface ClauseDrawerProps {
  clauseId?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ClauseMeta {
  page: number;
  heading: string;
  text: string;
  statutoryBasis?: string;
  statutoryCitation?: string;
  appliedFormula?: string;
  calculationExplanation?: string;
}

const CLAUSE_REGULATORY_MAP: Record<string, { basis: string; citation: string; formula: string; explanation: string }> = {
  'SP-2.1': {
    basis: 'Sum Insured Limit',
    citation: 'IRDAI (Health Insurance) Regulations, 2016 Reg 12',
    formula: 'Max Annual Liability = ₹5,00,000',
    explanation: 'Caps the cumulative reimbursement across all itemized hospital claims within the active policy year.',
  },
  'SP-3.1': {
    basis: 'Room Rent Capping',
    citation: 'IRDAI Master Circular 2020 §5 Cl. 19 & Policy Schedule Item 3',
    formula: 'Room Cap = 1% of Sum Insured (1% × ₹5,00,000 = ₹5,000/day)',
    explanation: 'Limits daily room rent allowance to ₹5,000. In Raju’s stay (₹8,000/day), ₹3,000/day is deemed excess overage, producing a ₹15,000 direct deduction.',
  },
  'SP-3.2': {
    basis: 'Proportionate Deduction Clause',
    citation: 'Policy Clause SP-3.2 & IRDAI Standardization Guidelines',
    formula: 'Payable Ratio = Eligible Room Cap ÷ Actual Room Rate = ₹5,000 ÷ ₹8,000 = 62.5%',
    explanation: 'Surgeon, OT, and nursing fees (total ₹60,000) are trimmed to 62.5% (₹37,500 payable), deducting ₹22,500 as an associated room-upgrade haircut.',
  },
  'SP-3.3': {
    basis: 'Statutory Exemption for Medicines & Diagnostics',
    citation: 'IRDAI Master Circular (IRDAI/HLT/CIR/GDL/61/04/2020) §5 Cl. 19 & Clause SP-3.3',
    formula: 'Exempt Expenses: Pharmacy (₹22,000) + Diagnostics (₹20,000) = Paid @ 100%',
    explanation: 'Express statutory carve-out strictly protecting medicines, investigations, and implants from proportionate room cuts. Any insurer cut on these is legally disputable.',
  },
  'SP-4.1': {
    basis: 'Non-Payable Consumables Schedule',
    citation: 'IRDAI Standardization of Exclusions 2019 (Annexure 1 Non-Payable Items)',
    formula: 'Non-Payables = Administrative charges + Disposable PPE = ₹4,000 deducted',
    explanation: 'Statutory list of 199 non-payable hospital items under IRDAI guidelines that are ineligible for reimbursement under standard indemnity policies.',
  },
  'SP-5.1': {
    basis: 'Co-Payment Provision',
    citation: 'Policy Schedule Part C & IRDAI Guidelines',
    formula: 'Co-pay % = 0% (Standard Nil Co-pay Policy)',
    explanation: 'No percentage co-pay is levied at final settlement against the admissible payable balance.',
  },
};

export function ClauseDrawer({
  clauseId: controlledClauseId,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: ClauseDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeClauseId, setActiveClauseId] = useState<string>('SP-3.2');
  const [activePage, setActivePage] = useState<number>(1);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const currentClauseId = controlledClauseId !== undefined && controlledClauseId !== null ? controlledClauseId : activeClauseId;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  // Listen to global custom event `claimlens:open-clause`
  useEffect(() => {
    const handleOpenClauseEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ clauseId?: string }>;
      if (customEvent.detail?.clauseId) {
        setActiveClauseId(customEvent.detail.clauseId);
        const clause = policyRaju.clauses[customEvent.detail.clauseId];
        if (clause?.page) {
          setActivePage(clause.page);
        }
      }
      setInternalIsOpen(true);
    };

    window.addEventListener('claimlens:open-clause', handleOpenClauseEvent);
    return () => {
      window.removeEventListener('claimlens:open-clause', handleOpenClauseEvent);
    };
  }, []);

  // Update active page when clause changes
  useEffect(() => {
    if (currentClauseId && policyRaju.clauses[currentClauseId]) {
      setActivePage(policyRaju.clauses[currentClauseId].page);
    }
  }, [currentClauseId]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeClauseMeta = policyRaju.clauses[currentClauseId];
  const regMeta = CLAUSE_REGULATORY_MAP[currentClauseId] || {
    basis: 'Policy Condition',
    citation: 'SafeCare Plus Policy Terms & IRDAI Guidelines',
    formula: 'Adjudicated per standard terms',
    explanation: 'Policy condition evaluated deterministically by the rules engine.',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Policy Clause Inspector Drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-2xl bg-paper h-full shadow-2xl border-l border-rule flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-paper-2 border-b border-rule px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-ink-2 font-semibold">
                Policy Document Viewer
              </span>
              <h2 className="text-lg font-serif text-ink font-bold">
                SafeCare Plus (Demo) · Policy Schedule & Clauses
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="p-2 rounded-md hover:bg-paper text-ink-2 hover:text-ink border border-transparent hover:border-rule transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close clause inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Page Switcher Tabs */}
        <div className="bg-paper border-b border-rule px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage(1)}
              type="button"
              className={cn(
                'px-3 py-1.5 rounded transition-all min-h-[44px] sm:min-h-[36px] flex items-center cursor-pointer',
                activePage === 1
                  ? 'bg-ink text-paper font-semibold shadow-xs'
                  : 'text-ink-2 hover:text-ink hover:bg-paper-2'
              )}
            >
              Page 1: Schedule & Room Caps (SP-2.1 – SP-3.3)
            </button>
            <button
              onClick={() => setActivePage(2)}
              type="button"
              className={cn(
                'px-3 py-1.5 rounded transition-all min-h-[44px] sm:min-h-[36px] flex items-center cursor-pointer',
                activePage === 2
                  ? 'bg-ink text-paper font-semibold shadow-xs'
                  : 'text-ink-2 hover:text-ink hover:bg-paper-2'
              )}
            >
              Page 2: Exclusions & Co-pay (SP-4.1 – SP-5.1)
            </button>
          </div>
          <span className="text-[11px] text-ink-2/60 uppercase hidden sm:inline">
            Policy Ref: {policyRaju.id}
          </span>
        </div>

        {/* Synthetic Policy Paper Document Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative paper-grain">
          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-10"
            aria-hidden="true"
          >
            <span className="text-red font-black text-6xl md:text-8xl transform -rotate-30 tracking-widest uppercase">
              SAMPLE · SYNTHETIC
            </span>
          </div>

          {/* Synthetic Schedule Box (Page 1) */}
          {activePage === 1 && (
            <div className="bg-paper-2/90 border border-rule p-4 rounded-md space-y-3 font-mono text-xs shadow-xs relative">
              <div className="flex items-center justify-between border-b border-rule/80 pb-2">
                <span className="font-bold text-ink tracking-tight uppercase">Policy Schedule Summary</span>
                <span className="text-[11px] bg-ink/10 px-2 py-0.5 rounded text-ink font-semibold">Demo Assure India</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-ink-2">
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Policyholder</span>
                  <span className="font-semibold text-ink">Raju Verma (Mother)</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Sum Insured</span>
                  <span className="font-semibold text-ink">₹5,00,000</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Validity Period</span>
                  <span className="font-semibold text-ink">01-Nov-2026 to 31-Oct-2027</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Room Rent Limit</span>
                  <span className="font-semibold text-ink">1% SI / Day (₹5,000)</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Proportionate Clause</span>
                  <span className="font-semibold text-ink">Active (Clause SP-3.2)</span>
                </div>
                <div>
                  <span className="text-[10px] block uppercase opacity-60">Co-Pay Term</span>
                  <span className="font-semibold text-green">0% (Nil Co-payment)</span>
                </div>
              </div>
            </div>
          )}

          {/* Clause Selector Quick Pills */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
              Browse Document Clauses:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(policyRaju.clauses).map(([id, clause]) => {
                const isSelected = id === currentClauseId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveClauseId(id);
                      setActivePage(clause.page);
                    }}
                    className={cn(
                      'px-2.5 py-1 text-xs font-mono rounded border transition-all select-none min-h-[44px] sm:min-h-[32px] flex items-center cursor-pointer',
                      isSelected
                        ? 'bg-ink text-paper border-ink font-bold shadow-xs'
                        : 'bg-paper-2 text-ink-2 border-rule hover:bg-paper hover:text-ink'
                    )}
                  >
                    <span>{id}</span>
                    <span className="opacity-40 mx-1">·</span>
                    <span className="text-[11px] truncate max-w-[120px]">{clause.heading}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clauses on Active Page */}
          <div className="space-y-4">
            {Object.entries(policyRaju.clauses)
              .filter(([_, clause]) => clause.page === activePage)
              .map(([id, clause]) => {
                const isTarget = id === currentClauseId;
                return (
                  <div
                    key={id}
                    id={`policy-clause-${id}`}
                    onClick={() => setActiveClauseId(id)}
                    className={cn(
                      'p-4 rounded-lg border transition-all relative cursor-pointer select-text',
                      isTarget
                        ? 'bg-paper border-ink shadow-md ring-2 ring-ink/20'
                        : 'bg-paper-2/60 border-rule hover:bg-paper hover:border-ink-2/40'
                    )}
                  >
                    {/* Yellow Highlighter marker effect when active */}
                    {isTarget && (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-yellow-400 rounded-l" />
                    )}

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-ink/10 text-ink">
                          Clause {id}
                        </span>
                        <h3 className="font-serif text-base font-bold text-ink">
                          {clause.heading}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-ink-2/60">
                        Page {clause.page}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'text-sm leading-relaxed text-ink/90 font-ui',
                        isTarget && 'bg-yellow-100/70 p-2 rounded border-l-2 border-yellow-500'
                      )}
                    >
                      &ldquo;{clause.text}&rdquo;
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Detailed Verification & Arithmetic Breakdown Card */}
          {activeClauseMeta && (
            <div className="bg-paper-2 border border-rule rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-ink" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Audited Arithmetic Breakdown
                  </span>
                </div>
                <Badge variant={currentClauseId === 'SP-3.3' ? 'payable' : 'neutral'}>
                  {currentClauseId === 'SP-3.3' ? 'Protected Carve-out' : 'Deterministic Rule'}
                </Badge>
              </div>

              {/* Step-by-step formula */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-ink-2 block">Formula Execution:</span>
                <div className="p-3 bg-paper rounded border border-rule font-mono text-xs text-ink font-semibold break-all">
                  {regMeta.formula}
                </div>
              </div>

              {/* Legal explanation */}
              <div className="space-y-1 text-xs text-ink-2">
                <span className="text-[11px] font-mono uppercase text-ink-2 block font-semibold">Clinical Audit Application:</span>
                <p className="leading-relaxed bg-paper/60 p-3 rounded border border-rule/60 text-ink">
                  {regMeta.explanation}
                </p>
              </div>

              {/* Statutory Citation Box */}
              <div className="bg-green-soft/40 border border-green/30 p-3.5 rounded-md flex items-start gap-3 text-xs">
                <Scale className="w-4 h-4 text-green shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-mono font-bold text-green block uppercase text-[11px]">
                    IRDAI Statutory Ground:
                  </span>
                  <span className="text-ink font-semibold block">
                    {regMeta.citation}
                  </span>
                  <span className="text-[11px] text-ink-2 leading-tight block">
                    {regMeta.basis} — Cites authoritative circulars; not legal advice.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Annexure A Note for Page 2 */}
          {activePage === 2 && (
            <div className="border border-dashed border-rule p-4 rounded bg-paper-2/40 text-xs text-ink-2 space-y-2">
              <span className="font-bold text-ink font-serif block text-sm">Annexure A: Non-Payable Items (Summary)</span>
              <p className="text-[12px] leading-relaxed">
                Disposable gloves, administrative fees, registration charge, admission kit, luxury toiletries, and telephone charges are excluded from claim settlement per IRDAI Guidelines on Standardization of Exclusions (2019).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-paper-2 border-t border-rule px-6 py-3.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-ink-2">
            <CheckCircle2 className="w-4 h-4 text-green" />
            <span>100% Clause Provenance Enforced</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="min-h-[44px] sm:min-h-[32px]"
          >
            Done Inspecting
          </Button>
        </div>
      </div>
    </div>
  );
}
