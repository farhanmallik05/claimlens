import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  sceneNumber?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  sceneNumber,
  badge,
  title,
  subtitle,
  align = 'left',
  className,
  ...props
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'space-y-3',
        isCenter ? 'text-center mx-auto items-center' : 'text-left items-start',
        className
      )}
      {...props}
    >
      {(sceneNumber || badge) && (
        <div
          className={cn(
            'inline-flex items-center gap-2 px-2.5 py-1 rounded bg-paper-2 border border-rule text-xs font-mono uppercase tracking-widest text-ink-2'
          )}
        >
          {sceneNumber && (
            <span className="font-semibold text-ink">SCENE {sceneNumber}</span>
          )}
          {sceneNumber && badge && <span className="opacity-40">·</span>}
          {badge && <span>{badge}</span>}
        </div>
      )}

      <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight leading-[1.08] font-normal">
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'font-ui text-base sm:text-lg md:text-xl text-ink-2 leading-relaxed',
            isCenter ? 'max-w-3xl mx-auto' : 'max-w-2xl'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
