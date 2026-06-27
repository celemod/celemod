import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import ruRU from './locales/ru-RU.json'
import frFR from './locales/fr-FR.json'
import deDE from './locales/de-DE.json'
import ptBR from './locales/pt-BR.json'

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'de-DE': { translation: deDE },
  'ru-RU': { translation: ruRU },
  'fr-FR': { translation: frFR },
  'pt-BR': { translation: ptBR },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // React already escapes
      prefix: '{',
      suffix: '}',
    },
    returnObjects: false,
  })

// Direct access to i18n instance for non-component code
export default i18n
