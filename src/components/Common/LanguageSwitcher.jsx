// src/components/Common/LanguageSwitcher.jsx
// 한국어/EN/中文 전환 버튼. 홈페이지(nduty.kr)의 언어 전환 UI와 동일한 톤으로 맞췄습니다.
import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'ko').slice(0, 2);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        backgroundColor: '#f3f4f6',
        borderRadius: '7px',
        padding: '3px',
      }}
    >
      {LANGS.map(({ code, label }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            style={{
              border: 'none',
              background: active ? 'white' : 'transparent',
              color: active ? '#1f2937' : '#6b7280',
              padding: '6px 10px',
              borderRadius: '5px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: active ? '0 1px 2px rgba(16,24,40,0.08)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
