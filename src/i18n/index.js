// src/i18n/index.js
//
// N-Duty 다국어(한국어/영어/중국어) 설정.
//
// 방식: 한국어 원문 그대로를 i18next 키로 사용합니다 (예: t('저장')).
// i18next는 활성 언어에 해당 키의 번역이 없으면 "키 자체"를 화면에 표시하는데,
// 한국어를 키로 쓰면 그 fallback이 곧 한국어 원문이 되므로 별도의 ko.json이 필요 없습니다.
// 즉 en.json / zh.json 두 파일에만 "원문 한국어 문장" → "번역문"을 채우면 됩니다.
//
// 문장에 변수가 들어가는 경우 {{변수명}} 형태로 보간(interpolation)합니다.
// 예: t('{{count}}명 배정됨', { count: 3 })
//     en.json:  "{{count}}명 배정됨": "{{count}} assigned"
//
// 사용법:
//   import { useTranslation } from 'react-i18next';
//   const { t } = useTranslation();
//   <button>{t('저장')}</button>

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en', 'zh'];
export const LANGUAGE_STORAGE_KEY = 'nduty_lang';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      // ko는 리소스를 두지 않습니다 — 키(=한국어 원문)가 그대로 표시됩니다.
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: 'ko',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React가 이미 XSS를 방지하므로 불필요
    },
    // 번역이 없는 키(=한국어 원문)를 만나도 경고를 띄우지 않음 (의도된 동작이므로)
    saveMissing: false,
    returnEmptyString: false,
  });

// ------------------------------------------------------------------
// [추가] 백엔드(server.js)도 에러/안내 메시지를 같은 언어로 응답하도록,
// 모든 API 요청(fetch)에 현재 언어를 X-App-Language 헤더로 실어 보낸다.
// 개별 fetch 호출부(hooks 등 40여 곳)를 전부 고칠 필요 없이 전역 fetch를
// 한 번만 감싸서 처리한다. 언어를 바꾸면(i18n.changeLanguage) 이후의
// 모든 요청에 즉시 새 언어가 반영된다.
// ------------------------------------------------------------------
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || (input && input.headers) || {});
    if (!headers.has('X-App-Language')) {
      headers.set('X-App-Language', i18n.language || 'ko');
    }
    return originalFetch(input, { ...init, headers });
  };
}

export default i18n;
