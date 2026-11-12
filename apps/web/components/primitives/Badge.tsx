import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: 'payable' | 'deduction' | 'neutral' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  variant,
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    payable: 'bg-green-soft text-green border-green/30',
    success: 'bg-green-soft text-green border-green/30',
    deduction: 'bg-red-soft text-red border-red/30',
    danger: 'bg-red-soft text-red border-red/30',
    neutral: 'bg-paper-2 text-ink-2 border-rule',
    outline: 'bg-transparent text-ink-2 border-rule',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md',
  };

  const ariaLabel =
    variant === 'deduction' || variant === 'danger'
      ? `Deduction: ${typeof children === 'string' ? children : ''}`
      : variant === 'payable' || variant === 'success'
      ? `Payable: ${typeof children === 'string' ? children : ''}`
      : undefined;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-medium select-none border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={props['aria-label'] || ariaLabel}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
