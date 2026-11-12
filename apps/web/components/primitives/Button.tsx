import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'stamp';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      'bg-ink text-paper border-ink hover:bg-ink-2 shadow-sm active:translate-y-[1px]',
    secondary:
      'bg-paper-2 text-ink border-rule hover:bg-paper hover:border-ink-2/60 shadow-sm active:translate-y-[1px]',
    ghost:
      'bg-transparent text-ink-2 border-transparent hover:bg-paper-2 hover:text-ink active:translate-y-[1px]',
    stamp:
      'bg-red-soft text-red border-red border-dashed font-mono uppercase tracking-wider hover:bg-red hover:text-paper active:scale-95',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[44px]',
    md: 'text-sm px-4 py-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-ui font-medium rounded border transition-all duration-150 select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
