export type AboutLang = 'en' | 'kr';

// Route params come through as string | string[] | undefined — normalize to a
// known language, defaulting to English for anything missing/unexpected.
export function parseLang(value: string | string[] | undefined): AboutLang {
  return value === 'kr' ? 'kr' : 'en';
}
