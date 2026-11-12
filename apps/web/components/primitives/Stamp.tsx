'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StampProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  subtext?: string;
  variant?: 'deduction' | 'approved' | 'disallowed';
  angle?: number;
  isStamped?: boolean;
  onStampComplete?: () => void;
}

export function Stamp({
  text,
  subtext,
  variant = 'deduction',
  angle = -3,
  isStamped = true,
  onStampComplete,
  className,
  style,
  ...props
}: StampProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isStamped && !hasAnimated) {
      setHasAnimated(true);
      const timer = setTimeout(() => {
        onStampComplete?.();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isStamped, hasAnimated, onStampComplete]);

  const variantColors = {
    deduction: 'border-red text-red drop-shadow-[0_1px_2px_rgba(200,55,45,0.25)]',
    disallowed: 'border-red text-red drop-shadow-[0_1px_2px_rgba(200,55,45,0.25)]',
    approved: 'border-green text-green drop-shadow-[0_1px_2px_rgba(31,107,74,0.25)]',
  };

  if (!isStamped) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label={`Stamp: ${text}${subtext ? ` — ${subtext}` : ''}`}
      style={
        {
          '--stamp-angle': `${angle}deg`,
          transform: `rotate(${angle}deg)`,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        'inline-block px-3 py-1.5 border-2 md:border-[3px] border-dashed rounded-sm select-none text-center bg-paper/90 backdrop-blur-[1px]',
        'animate-stamp-slam mix-blend-multiply pointer-events-none',
        variantColors[variant],
        className
      )}
      {...props}
    >
      <span className="font-mono text-xs md:text-sm lg:text-base font-black tracking-widest block leading-tight uppercase">
        {text}
      </span>
      {subtext && (
        <span className="font-mono text-[9px] md:text-[10px] tracking-tight block uppercase opacity-85 mt-0.5 leading-none">
          {subtext}
        </span>
      )}
    </div>
  );
}
