import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumberIN } from '@/lib/format';

export interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
  sign?: 'auto' | 'always' | 'never' | 'negative-only';
  color?: 'green' | 'red' | 'ink' | 'ink-2' | 'inherit';
  compact?: boolean;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Money({
  amount,
  currency = '₹',
  sign = 'auto',
  color = 'inherit',
  compact = false,
  size = 'base',
  className,
  ...props
}: MoneyProps) {
  const isNegative = amount < 0;
  const absAmount = Math.floor(Math.abs(amount));

  let displaySign = '';
  if (sign === 'always') {
    displaySign = isNegative ? '−' : '+';
  } else if (sign === 'negative-only' || sign === 'auto') {
    displaySign = isNegative ? '−' : '';
  }

  let formattedNumber = '';
  if (compact && absAmount >= 10000000) {
    const crValue = absAmount / 10000000;
    formattedNumber = `${formatNumberIN(crValue)} cr`;
  } else {
    formattedNumber = formatNumberIN(absAmount);
  }

  const colorClasses = {
    green: 'text-green',
    red: 'text-red',
    ink: 'text-ink',
    'ink-2': 'text-ink-2',
    inherit: 'text-inherit',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const ariaText = `${displaySign === '−' ? 'Minus ' : ''}${absAmount} rupees`;

  return (
    <span
      className={cn(
        'font-mono tabular-nums inline-block tracking-tight font-medium',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      aria-label={props['aria-label'] || ariaText}
      {...props}
    >
      {displaySign}
      {currency}
      {formattedNumber}
    </span>
  );
}
