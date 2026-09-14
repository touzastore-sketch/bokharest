import React from 'react';
import { UtensilsCrossed, MessageSquareText } from 'lucide-react';

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
    <div className="my-2.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#161616] to-[#121212] border border-amber-500/25 shadow-sm text-right rtl:text-right ltr:text-left transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wide">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{language === 'ar' ? 'خيارات التقديم' : 'Serving Options'}</span>
        </span>

        {prefix && (
          <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
            {prefix}:
          </span>
        )}

        {!prefix && !hasSlashes && (
          <span className="text-xs sm:text-[13px] font-medium text-neutral-200 leading-relaxed">
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
                    ? 'bg-amber-400 text-black border border-amber-300 font-bold shadow-sm'
                    : 'bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 hover:border-white/20'
                } ${interactive ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-black' : 'bg-amber-400'
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
        <p className="text-xs sm:text-[13px] text-neutral-300 font-medium leading-relaxed pt-0.5">
          {optionsText}
        </p>
      )}

      {/* Customer Instruction Guide */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-300/90 font-medium">
        <MessageSquareText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          {language === 'ar'
            ? 'يمكنك كتابة اختيار الطبق الجانبي في ملاحظات الطلب عند إنشائه'
            : 'You can specify your side dish choice in the order notes when placing it'}
        </span>
      </div>
    </div>
  );
};
