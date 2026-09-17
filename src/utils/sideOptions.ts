export interface ParsedSideOptions {
  hasOptions: boolean;
  title: string;
  options: string[];
}

/**
 * Parses serving / side dish notes (e.g. from category.note_ar or category.note_en)
 * into a structured object for easy rendering on product cards and modals.
 */
export function parseSideOptions(note?: string, language: 'ar' | 'en' = 'ar'): ParsedSideOptions {
  if (!note || !note.trim()) {
    return { hasOptions: false, title: '', options: [] };
  }

  let title = language === 'ar' ? 'الطبق الجانبي' : 'Side Choice';
  let optionsText = note.trim();

  // If note has a colon prefix (e.g. "تُقدَّم مع اختيارك من: خضار سوتيه / ...")
  if (note.includes(':')) {
    const parts = note.split(':');
    title = parts[0].trim();
    optionsText = parts.slice(1).join(':').trim();
  }

  let options: string[] = [];

  // Split by slashes if available
  if (optionsText.includes('/')) {
    options = optionsText
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (optionsText.includes(' أو ') || optionsText.includes(' or ')) {
    // Handle options separated by "أو" or "or" (e.g. BBQ: "تقدم مع أرز بالخلطة أو بطاطس محمرة")
    const splitter = optionsText.includes(' أو ') ? ' أو ' : ' or ';
    let cleanText = optionsText;
    if (language === 'ar') {
      cleanText = cleanText.replace(/^(كل أطباق|جميع أطباق|تقدم مع|تُقدم مع|تُقدَّم مع|يُقدم مع)\s+/i, '');
    } else {
      cleanText = cleanText.replace(/^(all grills are served with|all dishes are served with|served with)\s+/i, '');
    }
    options = cleanText
      .split(splitter)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return {
    hasOptions: options.length > 0,
    title,
    options,
  };
}
