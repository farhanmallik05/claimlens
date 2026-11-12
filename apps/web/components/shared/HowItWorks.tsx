'use client';

import React, { useState } from 'react';
import { Paper, Badge, Button } from '@/components/primitives';
import { cn } from '@/lib/utils';
import {
  FileText,
  Scan,
  Cpu,
  FileCheck,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  Play
} from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  zone: 'llm' | 'rules';
  status: 'idle' | 'running' | 'completed';
  description: string;
  detail: string;
  stat: string;
}

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(4);

  const steps = [
    {
      step: '01',
      title: 'Upload or Select Preset',
      subtitle: 'Client-Side Ingestion & PII Redaction',
      icon: FileText,
      description:
        'Upload your hospital final bill and health insurance policy schedule, or pick an authoritative clinical scenario preset. Sensitive identifiers (patient full name, contact, Aadhaar) are masked client-side before any network transmission.',
      bulletPoints: [
        'Local PII redaction with black-bar preview',
        'Multi-page PDF and scanned receipt support',
        'Pre-loaded Raju Hip Surgery golden preset',
      ],
      tag: 'Zero-Knowledge Privacy',
    },
    {
      step: '02',
      title: 'Multimodal Vision Extraction',
      subtitle: 'Dual-Agent Structured Parsers',
      icon: Scan,
      description:
        'Policy Parser maps room rent eligibility (Clause SP-3.1), proportionate cascades (SP-3.2), and exclusions (SP-4.1). Bill Reader normalizes messy line-item charges, quantities, unit tariffs, and statutory consumable annexures into typed JSON.',
      bulletPoints: [
        'Extracts structured line items with categories',
        'Identifies room rent caps (% of SI or fixed/day)',
        'Classifies protected medicines & diagnostic tests',
      ],
      tag: 'Multimodal Parsing',
    },
    {
      step: '03',
      title: 'Deterministic Rules Engine',
      subtitle: 'Pure TypeScript · Zero-Float Math',
      icon: Cpu,
      description:
        'Evaluates claim liabilities strictly in integer rupees. Solves multi-room transitions, proportionate professional fee haircuts, non-payable deductions, and sum insured exhaustion in <0.05ms without floating-point inaccuracies.',
      bulletPoints: [
        'Conservation Law: Billed − Insurer Pays === Total Deductions',
        '100% deduction provenance linked to exact clauses',
        'Strict integer rupee calculations (zero float leakage)',
      ],
      tag: 'Exact Math (<1ms)',
    },
    {
      step: '04',
      title: 'Audit & Appeal Architect',
      subtitle: 'Automated Grievance & Escalation',
      icon: FileCheck,
      description:
        'Compares the engine forecast against the insurer settlement statement. If illegal over-deductions are detected (such as proportionate haircuts on pharmacy), ClaimLens automatically drafts an IRDAI-compliant legal appeal.',
      bulletPoints: [
        '1-click grievance letter for Insurer Redressal Officer',
        'Direct statutory citations (IRDAI Master Circular 2020)',
        'Ombudsman jurisdiction routing for 17 regional centers',
      ],
      tag: '1-Click Dispute',
    },
  ];

  const agents: AgentStep[] = [
    {
      id: 'policy-parser',
      name: 'Policy Parser',
      zone: 'llm',
      status: currentStepIndex >= 0 ? 'completed' : 'idle',
      description: 'Extracts caps & clauses',
      detail: 'Parses SafeCare Plus schedule to SP-3.1, SP-3.2, SP-3.3 clauses',
      stat: '6 clauses typed',
    },
    {
      id: 'bill-reader',
      name: 'Bill Reader',
      zone: 'llm',
      status: currentStepIndex >= 1 ? 'completed' : 'idle',
      description: 'Itemizes hospital bills',
      detail: 'Extracts 8 line items from Raju bill totaling ₹1,50,000',
      stat: '8 items itemized',
    },
    {
      id: 'rules-engine',
      name: 'Rules Engine',
      zone: 'rules',
      status: currentStepIndex >= 2 ? 'completed' : 'idle',
      description: 'Deterministic math',
      detail: 'Runs integer arithmetic: ₹1,08,500 payable, ₹41,500 shortfall',
      stat: '0.04ms execution',
    },
    {
      id: 'explainer',
      name: 'Explainer',
      zone: 'rules',
      status: currentStepIndex >= 3 ? 'completed' : 'idle',
      description: 'Deduction provenance',
      detail: 'Maps ₹15,000 to SP-3.1, ₹22,500 to SP-3.2, ₹4,000 to SP-4.1',
      stat: '100% cited',
    },
    {
      id: 'appeal-drafter',
      name: 'Appeal Drafter',
      zone: 'rules',
      status: currentStepIndex >= 4 ? 'completed' : 'idle',
      description: 'Statutory grievance',
      detail: 'Detects ₹9,750 illegal pharmacy cut, drafts Ombudsman notice',
      stat: 'IRDAI §5 Cl. 19',
    },
  ];

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentStepIndex(-1);

    const stepIntervals = [0, 1, 2, 3, 4];
    stepIntervals.forEach((stepIdx, i) => {
      setTimeout(() => {
        setCurrentStepIndex(stepIdx);
        if (i === stepIntervals.length - 1) {
          setIsSimulating(false);
        }
      }, (i + 1) * 700);
    });
  };

  return (
    <div className="space-y-10">
      {/* 5-Agent Horizontal Rail */}
      <div className="bg-paper border border-rule rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-2">
                5-Agent Architecture Rail
              </span>
            </div>
            <h3 className="text-lg font-serif text-ink font-bold mt-1">
              LLMs read. Rules decide. Clauses prove.
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="self-start sm:self-auto min-h-[44px] sm:min-h-[36px]"
          >
            <Play className={cn('w-3.5 h-3.5 mr-1.5', isSimulating && 'animate-spin')} />
            {isSimulating ? 'Simulating Pipeline...' : 'Simulate Agent Pipeline'}
          </Button>
        </div>

        {/* Zone Boundaries: LLM Zone vs Rules Zone */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {agents.map((agent, index) => {
            const isCompleted = agent.status === 'completed';
            const isCurrent = currentStepIndex === index;
            const isLLM = agent.zone === 'llm';

            return (
              <div
                key={agent.id}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-300 relative flex flex-col justify-between min-h-[140px]',
                  isCurrent
                    ? 'border-ink bg-paper shadow-md ring-2 ring-ink/20 scale-[1.02]'
                    : isCompleted
                    ? 'border-rule bg-paper-2/80'
                    : 'border-rule/50 bg-paper-2/30 opacity-60'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={cn(
                        'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold',
                        isLLM ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                      )}
                    >
                      {isLLM ? 'LLM Zone' : 'Rules Zone'}
                    </span>
                    <span className="text-[11px] font-mono text-ink-2 font-bold">
                      0{index + 1}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-ink">{agent.name}</h4>
                  <p className="text-xs text-ink-2 mt-1">{agent.description}</p>
                </div>

                <div className="pt-2 border-t border-rule/50 flex items-center justify-between text-[11px] font-mono text-ink-2">
                  <span className="truncate">{agent.stat}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0 ml-1" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Caption strip */}
        <div className="bg-paper-2/60 p-3 rounded-lg border border-rule/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-ink-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-ink" />
            <span>Local PII redaction executes client-side before LLM extraction.</span>
          </div>
          <span className="text-ink font-semibold">
            Status: {isSimulating ? 'Executing Agent Pipeline' : 'Verified against ground truth (8/8 lines matched)'}
          </span>
        </div>
      </div>

      {/* 4-Step Interactive Visual Flow */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-rule pb-2">
          {steps.map((s, idx) => {
            const isActive = activeTab === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  'p-3 rounded-lg text-left transition-all border min-h-[44px] cursor-pointer',
                  isActive
                    ? 'bg-ink text-paper border-ink shadow-sm'
                    : 'bg-paper text-ink-2 border-rule hover:bg-paper-2 hover:text-ink'
                )}
              >
                <div className="flex items-center gap-2 text-xs font-mono mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-bold">Step {s.step}</span>
                </div>
                <span className="text-xs font-serif font-bold block truncate">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        {steps[activeTab] && (
          <Paper className="p-6 md:p-8 space-y-5 bg-paper-2/40 border-rule">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rule pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
                  Step {steps[activeTab].step} · {steps[activeTab].subtitle}
                </span>
                <h3 className="text-xl md:text-2xl font-serif text-ink font-bold mt-1">
                  {steps[activeTab].title}
                </h3>
              </div>
              <Badge variant="neutral" className="self-start md:self-auto font-mono">
                {steps[activeTab].tag}
              </Badge>
            </div>

            <p className="text-sm md:text-base text-ink-2 leading-relaxed font-ui">
              {steps[activeTab].description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {steps[activeTab].bulletPoints.map((point, i) => (
                <div
                  key={i}
                  className="bg-paper p-3.5 rounded-lg border border-rule flex items-start gap-2.5 text-xs text-ink"
                >
                  <CheckCircle2 className="w-4 h-4 text-green shrink-0 mt-0.5" />
                  <span className="font-medium leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
}
