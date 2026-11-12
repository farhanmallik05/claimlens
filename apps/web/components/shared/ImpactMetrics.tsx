'use client';

import React from 'react';
import { Paper, Badge } from '@/components/primitives';
import { Users, Building2, Scale, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ImpactMetrics() {
  const stats = [
    {
      value: '57 crore',
      label: 'Lives Covered in India',
      subtitle: 'Health insurance policies active across private & public insurers in FY24',
      badge: 'Total Market Scale',
      color: 'neutral',
    },
    {
      value: '₹26,038 cr',
      label: 'Disallowed or Repudiated',
      subtitle: 'Out-of-pocket claim deductions absorbed by families in FY24 alone',
      badge: 'Unreimbursed Shortfall',
      color: 'red',
    },
    {
      value: '71.2%',
      label: 'Average Value Settlement Ratio',
      subtitle: 'Nearly 29% of every billed rupee is sliced away by caps and fine-print cuts',
      badge: 'Industry Average',
      color: 'neutral',
    },
  ];

  const beneficiaries = [
    {
      icon: Users,
      title: 'For Indian Families',
      subtitle: 'Eliminate Discharge Counter Hostage Situations',
      points: [
        'Pre-admission clarity on exact room rent caps and proportionate cascades.',
        'Know beforehand if a room upgrade will trigger a ₹37,500 surprise haircut.',
        '1-click legally backed appeal letters when insurers unfairly slash bills.',
      ],
      tag: 'Zero Surprises',
    },
    {
      icon: Building2,
      title: 'For Hospital Billing Desks',
      subtitle: 'Transparent Counseling & Faster Discharge Turnaround',
      points: [
        'Counsel patients before admission with deterministic policy calculations.',
        'Reduce hours spent in stressful arguments at the final discharge counter.',
        'Verify cashless approvals against policy contracts before discharge submission.',
      ],
      tag: 'Counter Friction ↓ 80%',
    },
    {
      icon: Scale,
      title: 'For NGOs & Consumer Advocates',
      subtitle: 'Evidence-Backed Grievances for Insurance Ombudsman',
      points: [
        'Generate grievance letters citing IRDAI Master Circular 2020 §5 Cl. 19.',
        'Automatic routing to 17 territorial Insurance Ombudsman centers.',
        'Level the playing field against well-funded insurer claims denial teams.',
      ],
      tag: 'Statutory Defense',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-2 font-semibold">
            Macro Scale & Economic Impact
          </span>
          <h3 className="text-xl md:text-2xl font-serif text-ink font-bold mt-1">
            Fewer surprise bills, stronger appeals
          </h3>
        </div>
        <Badge variant="neutral" className="self-start sm:self-auto font-mono text-xs">
          IRDAI FY24 Data Grounded
        </Badge>
      </div>

      {/* 3 Macro Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-6 rounded-xl border border-rule bg-paper shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-paper-2 text-ink-2 font-semibold">
                  {s.badge}
                </span>
              </div>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight tabular-nums">
                {s.value}
              </div>
              <h4 className="font-ui font-semibold text-sm text-ink mt-1">
                {s.label}
              </h4>
            </div>
            <p className="text-xs text-ink-2 leading-relaxed border-t border-rule/50 pt-3">
              {s.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Illustrative Economic Projection Banner */}
      <div className="bg-paper-2 border border-rule rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                National Economic Benefit Projection
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-ink/10 text-ink-2">
                Illustrative
              </span>
            </div>
            <div className="font-serif text-2xl md:text-3xl font-bold text-ink">
              1 lakh families × ₹10,000 average saving = <span className="text-green">₹100 Crore</span>
            </div>
            <p className="text-xs text-ink-2 max-w-2xl leading-relaxed mt-1">
              If just 1,00,000 admitted patients avoid an unnecessary room-upgrade deduction or recover an illegal proportionate pharmacy cut using ClaimLens, over ₹100 crore in disposable household income is safeguarded from medical debt.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Beneficiary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {beneficiaries.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="p-5 rounded-xl border border-rule bg-paper shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-paper-2 border border-rule flex items-center justify-center text-ink">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-paper-2 text-ink-2 font-semibold">
                    {b.tag}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-ink">{b.title}</h4>
                <p className="text-xs text-ink-2 mt-0.5 font-medium">{b.subtitle}</p>

                <div className="space-y-2 mt-4">
                  {b.points.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-ink-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0 mt-0.5" />
                      <span className="leading-snug">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source Citation Footnote */}
      <div className="text-xs font-mono text-ink-2/70 text-center sm:text-left flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>
          Source: IRDAI Annual Report 2023-24 (Table 4.8), as reported by PTI and Business Standard. National economic figures are illustrative projections.
        </span>
      </div>
    </div>
  );
}
