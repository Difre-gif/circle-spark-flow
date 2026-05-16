import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import sw from './locales/sw';
import rw from './locales/rw';

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'rw', label: 'Kinyarwanda' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
      rw: { translation: rw },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages.map(language => language.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
