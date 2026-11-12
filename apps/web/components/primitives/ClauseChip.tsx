import React from 'react';
import { cn } from '@/lib/utils';

export interface ClauseChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  clauseId: string;
  label?: string;
  peeled?: boolean;
  active?: boolean;
}

export function ClauseChip({
  clauseId,
  label,
  peeled = false,
  active = false,
  className,
  ...props
}: ClauseChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-all duration-200 select-none cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 min-h-[36px] sm:min-h-[32px]',
        active
          ? 'bg-ink text-paper border-ink font-semibold shadow-md translate-y-[-1px]'
          : peeled
          ? 'bg-paper text-ink border-ink-2/40 shadow-sm translate-x-1.5 -rotate-1'
          : 'bg-paper-2 text-ink-2 border-rule hover:bg-paper hover:text-ink hover:border-ink-2/50',
        className
      )}
      aria-label={props['aria-label'] || `Policy Clause ${clauseId}${label ? `: ${label}` : ''}`}
      {...props}
    >
      <span className="font-semibold text-ink group-hover:text-ink group-data-[active=true]:text-paper">
        {clauseId}
      </span>
      {label && (
        <>
          <span className="opacity-40">·</span>
          <span className="opacity-80 text-[11px] truncate max-w-[140px]">{label}</span>
        </>
      )}
    </button>
  );
}
