import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryServingNoteProps {
  note: string;
  language?: 'ar' | 'en';
  onSelectOption?: (option: string) => void;
  selectedOptions?: string[];
  interactive?: boolean;
}

export const CategoryServingNote: React.FC<CategoryServingNoteProps> = ({
  note,
  language = 'ar',
  onSelectOption,
  selectedOptions = [],
  interactive = false,
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  if (!note || !note.trim()) return null;

  // Check if note contains a colon separating prefix from options
  const hasColon = note.includes(':');
  let prefix = '';
  let optionsText = note;

  if (hasColon) {
    const parts = note.split(':');
    prefix = parts[0].trim();
    optionsText = parts.slice(1).join(':').trim();
  }

  // Check if optionsText has delimiters like '/' or '،' or ','
  const hasSlashes = optionsText.includes('/');
  const options = hasSlashes
    ? optionsText
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className={`my-2.5 p-3 sm:p-3.5 rounded-xl border shadow-sm text-right rtl:text-right ltr:text-left transition-all ${
      isLight
        ? 'bg-amber-50/60 border-amber-200/80 text-neutral-900'
        : 'bg-gradient-to-r from-amber-500/10 via-[#161616] to-[#121212] border-amber-500/25'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide border ${
          isLight
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-amber-400/15 border-amber-400/30 text-amber-300'
        }`}>
          <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
          <span>{language === 'ar' ? 'خيارات التقديم' : 'Serving Options'}</span>
        </span>

        {prefix && (
          <span className={`text-xs sm:text-[13px] font-bold tracking-wide ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            {prefix}:
          </span>
        )}

        {!prefix && !hasSlashes && (
          <span className={`text-xs sm:text-[13px] font-medium leading-relaxed ${
            isLight ? 'text-neutral-700' : 'text-neutral-200'
          }`}>
            {note}
          </span>
        )}
      </div>

      {/* Options Chips (if available) */}
      {options.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {options.map((option, idx) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOption && onSelectOption(option)}
                disabled={!interactive && !onSelectOption}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? isLight
                      ? 'bg-amber-500 text-black border border-amber-600 font-bold shadow-sm'
                      : 'bg-amber-400 text-black border border-amber-300 font-bold shadow-sm'
                    : isLight
                    ? 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400'
                    : 'bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 hover:border-white/20'
                } ${interactive ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-black' : isLight ? 'bg-amber-600' : 'bg-amber-400'
                  }`}
                />
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Single sentence without slashes if prefix existed */}
      {prefix && options.length === 0 && (
        <p className={`text-xs sm:text-[13px] font-medium leading-relaxed pt-0.5 ${
          isLight ? 'text-neutral-700' : 'text-neutral-300'
        }`}>
          {optionsText}
        </p>
      )}
    </div>
  );
};
