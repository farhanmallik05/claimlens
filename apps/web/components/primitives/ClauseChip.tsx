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
  onKeyDown,
  ...props
}: ClauseChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Allow default button click behavior or trigger explicit click
      if (props.onClick) {
        props.onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <button
      type="button"
      onKeyDown={handleKeyDown}
      className={cn(
        'group inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded border transition-all duration-200 select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 min-h-[44px]',
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
