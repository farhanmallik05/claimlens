import React from 'react';
import { cn } from '@/lib/utils';

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'aside';
  variant?: 'flat' | 'card' | 'elevated' | 'receipt';
  surface?: 'paper' | 'paper-2';
  grain?: boolean;
  perforated?: 'none' | 'top' | 'bottom' | 'both';
  children?: React.ReactNode;
}

export function Paper({
  as: Component = 'div',
  variant = 'card',
  surface = 'paper',
  grain = false,
  perforated = 'none',
  className,
  children,
  ...props
}: PaperProps) {
  const surfaceClass = surface === 'paper-2' ? 'bg-paper-2' : 'bg-paper';

  const variantClasses = {
    flat: 'border border-rule shadow-none rounded-none',
    card: 'border border-rule rounded-lg shadow-[0_1px_3px_rgba(20,17,15,0.06),0_1px_2px_rgba(20,17,15,0.04)]',
    elevated: 'border border-rule rounded-lg shadow-[0_4px_16px_rgba(20,17,15,0.08),0_1px_3px_rgba(20,17,15,0.05)]',
    receipt: 'border-x border-rule shadow-[0_6px_20px_rgba(20,17,15,0.07)] rounded-none relative',
  };

  const hasTopPerforation = perforated === 'top' || perforated === 'both';
  const hasBottomPerforation = perforated === 'bottom' || perforated === 'both';

  return (
    <Component
      className={cn(
        'text-ink relative transition-shadow duration-200',
        surfaceClass,
        grain && 'paper-grain',
        variantClasses[variant],
        hasTopPerforation && 'border-t-0',
        hasBottomPerforation && 'border-b-0',
        className
      )}
      {...props}
    >
      {hasTopPerforation && (
        <div
          aria-hidden="true"
          className="w-full h-2.5 overflow-hidden absolute -top-2.5 left-0 right-0 pointer-events-none flex"
        >
          <svg
            className="w-full h-full text-paper fill-current"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10" />
          </svg>
        </div>
      )}

      {children}

      {hasBottomPerforation && (
        <div
          aria-hidden="true"
          className="w-full h-2.5 overflow-hidden absolute -bottom-2.5 left-0 right-0 pointer-events-none flex"
        >
          <svg
            className="w-full h-full text-paper fill-current"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <polygon points="0,0 5,10 10,0 15,10 20,0 25,10 30,0 35,10 40,0 45,10 50,0 55,10 60,0 65,10 70,0 75,10 80,0 85,10 90,0 95,10 100,0" />
          </svg>
        </div>
      )}
    </Component>
  );
}
