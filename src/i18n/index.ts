import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getItem, setItem, storageKeys } from '@/lib/storage';

import en from './locales/en';
import uk, { type Translation } from './locales/uk';

export const languages = ['uk', 'en'] as const;
export type Language = (typeof languages)[number];

const isLanguage = (value: string | null | undefined): value is Language =>
  languages.includes(value as Language);

/** Мова пристрою: українська, якщо вона перша, інакше англійська. */
function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'uk' ? 'uk' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: deviceLanguage(),
  fallbackLng: 'uk',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Підтягує мову, яку користувач обрав раніше. */
export async function restoreLanguage(): Promise<void> {
  const stored = await getItem(storageKeys.language);
  if (isLanguage(stored) && stored !== i18n.language) {
    await i18n.changeLanguage(stored);
  }
}

export async function setLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  await setItem(storageKeys.language, language);
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: Translation };
  }
}

export default i18n;
