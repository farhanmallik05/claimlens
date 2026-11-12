'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatNumberIN } from '@/lib/format';

export interface OdometerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // seconds
  color?: 'ink' | 'red' | 'green' | 'inherit';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function Odometer({
  value,
  prefix = '',
  suffix = '',
  duration = 1.2,
  color = 'inherit',
  size = 'base',
  className,
  ...props
}: OdometerProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const colorClasses = {
    ink: 'text-ink',
    red: 'text-red',
    green: 'text-green',
    inherit: 'text-inherit',
  };

  const sizeClasses = {
    sm: 'text-sm h-5',
    base: 'text-base h-6',
    lg: 'text-lg h-7',
    xl: 'text-xl h-8',
    '2xl': 'text-2xl h-9',
    '3xl': 'text-3xl h-11',
    '4xl': 'text-4xl h-12',
    '5xl': 'text-5xl h-14',
    '6xl': 'text-6xl h-16',
  };

  const formattedNum = formatNumberIN(Math.abs(Math.floor(value)));
  const chars = formattedNum.split('');

  const displayDuration = reducedMotion || !mounted ? 0 : duration;
  const fullLabel = `${value < 0 ? '−' : ''}${prefix}${formattedNum}${suffix}`;

  return (
    <span
      role="text"
      aria-label={props['aria-label'] || fullLabel}
      className={cn(
        'font-mono tabular-nums inline-flex items-center font-bold tracking-tight select-none',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {value < 0 && <span className="inline-block mr-0.5">−</span>}
      {prefix && <span className="inline-block mr-0.5">{prefix}</span>}

      <span className="inline-flex items-center h-full overflow-hidden" aria-hidden="true">
        {chars.map((char, index) => {
          const isDigit = /^[0-9]$/.test(char);

          if (!isDigit) {
            return (
              <span
                key={`sep-${index}`}
                className="inline-block text-center shrink-0"
                style={{ width: char === ',' ? '0.45ch' : '0.6ch' }}
              >
                {char}
              </span>
            );
          }

          const targetDigit = parseInt(char, 10);
          const digitIndex = chars.filter((c, i) => i <= index && /^[0-9]$/.test(c)).length - 1;
          const staggerDelay = reducedMotion || !mounted ? 0 : digitIndex * 0.03;

          return (
            <span
              key={`digit-${index}`}
              className="w-[1ch] h-full overflow-hidden relative inline-block align-baseline shrink-0"
            >
              <span
                className="inline-flex flex-col w-full will-change-transform"
                style={{
                  transform: `translateY(-${targetDigit * 10}%)`,
                  transition: `transform ${displayDuration}s cubic-bezier(0.22, 1, 0.36, 1) ${staggerDelay}s`,
                }}
              >
                {DIGITS.map((d) => (
                  <span
                    key={d}
                    className="h-full flex items-center justify-center font-mono tabular-nums leading-none"
                    style={{ height: '100%', minHeight: '1em' }}
                  >
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>

      {suffix && <span className="inline-block ml-0.5">{suffix}</span>}
    </span>
  );
}
