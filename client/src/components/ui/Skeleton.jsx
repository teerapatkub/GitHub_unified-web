import React from 'react';

export function SkeletonBlock({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-lg bg-pysim-surface-high motion-safe:animate-pulse ${className}`} />;
}

export function SkeletonRows({ count = 4, avatar = false }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-xl border border-pysim-outline-variant/30 bg-white p-4">
          {avatar && <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />}
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-2/3 max-w-64" />
            <SkeletonBlock className="h-3 w-1/2 max-w-44" />
          </div>
          <SkeletonBlock className="h-7 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3, image = false }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-pysim-outline-variant/30 bg-white shadow-sm">
          {image && <SkeletonBlock className="h-36 w-full rounded-none" />}
          <div className="space-y-3 p-5">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="mt-4 h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoading({ variant = 'cards', label = 'กำลังโหลดข้อมูล...', className = '' }) {
  let content;

  if (variant === 'profile') {
    content = (
      <div className="space-y-5" aria-hidden="true">
        <div className="rounded-2xl border border-pysim-outline-variant/30 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <SkeletonBlock className="h-20 w-20 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3"><SkeletonBlock className="h-7 w-40" /><SkeletonBlock className="h-4 w-56 max-w-full" /></div>
          </div>
        </div>
        <SkeletonCards count={3} />
        <SkeletonRows count={3} />
      </div>
    );
  } else if (variant === 'dashboard') {
    content = (
      <div className="space-y-6" aria-hidden="true">
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonCards count={3} />
        <SkeletonRows count={5} />
      </div>
    );
  } else if (variant === 'article' || variant === 'quiz') {
    content = (
      <div className="space-y-5 rounded-3xl border border-pysim-outline-variant/30 bg-white p-5 sm:p-8" aria-hidden="true">
        <SkeletonBlock className="h-8 w-2/3" />
        <SkeletonBlock className="h-4 w-1/3" />
        {variant === 'article' && <SkeletonBlock className="h-40 w-full rounded-2xl" />}
        <SkeletonRows count={variant === 'quiz' ? 4 : 3} />
      </div>
    );
  } else if (variant === 'workspace') {
    content = (
      <div className="grid gap-5 lg:grid-cols-[16rem_1fr]" aria-hidden="true">
        <SkeletonRows count={4} />
        <div className="space-y-4 rounded-2xl border border-pysim-outline-variant/30 bg-white p-5">
          <SkeletonBlock className="h-7 w-2/3" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  } else if (variant === 'form') {
    content = (
      <div className="max-w-3xl space-y-5 rounded-2xl border border-pysim-outline-variant/30 bg-white p-6" aria-hidden="true">
        <SkeletonBlock className="h-7 w-1/2" />
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-2"><SkeletonBlock className="h-4 w-28" /><SkeletonBlock className="h-11 w-full" /></div>)}
      </div>
    );
  } else if (variant === 'list' || variant === 'table') {
    content = <SkeletonRows count={variant === 'table' ? 6 : 4} avatar={variant === 'list'} />;
  } else {
    content = <SkeletonCards image={variant === 'catalog'} />;
  }

  return (
    <div role="status" aria-busy="true" aria-label={label} className={`w-full ${className}`}>
      <span className="sr-only">{label}</span>
      {content}
    </div>
  );
}
