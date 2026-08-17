import { useEffect, useRef, useState } from 'react';
import { QUALITY_OPTIONS, type Quality } from '../lib/quality';

interface Props {
  value: Quality;
  onChange: (quality: Quality) => void;
  // 'overlay' is for embedding directly in the video player's dark control
  // bar — compact button, dark panel that opens upward (the player container
  // clips overflow, and the button sits near its bottom edge).
  variant?: 'default' | 'overlay';
}

export default function QualitySelect({ value, onChange, variant = 'default' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = QUALITY_OPTIONS.find((option) => option.value === value)!;
  const isOverlay = variant === 'overlay';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          isOverlay
            ? 'player-btn w-auto gap-1 px-2 text-xs font-semibold'
            : 'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:hover:border-white/20'
        }
      >
        {isOverlay ? selected.short : selected.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOverlay ? '' : 'text-slate-400'} ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className={
            isOverlay
              ? 'absolute right-0 bottom-full z-10 mb-2 max-h-56 w-48 overflow-y-auto rounded-xl border border-white/10 bg-ink-900/95 p-1 shadow-xl backdrop-blur'
              : 'absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-ink-900'
          }
        >
          {QUALITY_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            const optionClass = isOverlay
              ? isSelected
                ? 'bg-white/10 text-white'
                : 'text-slate-200 hover:bg-white/10'
              : isSelected
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10';
            const badgeClass = isOverlay ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400';

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${optionClass}`}
              >
                <span className="whitespace-nowrap">{option.label}</span>
                {option.recommended && (
                  <span className={`shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
                    Recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
