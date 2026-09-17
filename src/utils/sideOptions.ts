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

/**
 * Gets effective side options for a menu item:
 * 1. If item.side_options is defined as an array of items -> uses item.side_options
 * 2. If item.side_options is defined as empty [] -> side dishes explicitly disabled for this item
 * 3. If item.side_options is undefined -> falls back to category note
 */
export function getItemSideOptions(
  item: { side_options?: string[] },
  categoryNote?: string,
  language: 'ar' | 'en' = 'ar'
): ParsedSideOptions {
  if (item && item.side_options !== undefined) {
    if (!Array.isArray(item.side_options) || item.side_options.length === 0) {
      return { hasOptions: false, title: '', options: [] };
    }
    return {
      hasOptions: true,
      title: language === 'ar' ? 'الطبق الجانبي' : 'Side Choice',
      options: item.side_options,
    };
  }

  return parseSideOptions(categoryNote, language);
}

