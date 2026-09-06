
// import React from 'react';
// import ReactDOM from 'react-dom/client'; // ← updated
// import App from './App';
// import { NurseProvider } from './context/NurseContext';
// import { RosterProvider } from './context/RosterContext';

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//   <React.StrictMode>
//     <NurseProvider>
//       <RosterProvider>
//         <App />
//       </RosterProvider>
//     </NurseProvider>
//   </React.StrictMode>
// );


// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './styles/global.css'
import './i18n'

import { useTranslation } from 'react-i18next';

// [추가] 프론트엔드 에러 모니터링. DSN이 설정되어 있을 때만 활성화된다.
// (Render/로컬 .env 에 REACT_APP_SENTRY_DSN_FRONTEND 로 설정)
if (process.env.REACT_APP_SENTRY_DSN_FRONTEND) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN_FRONTEND,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1
  });
}

// 화면 렌더링 중 예상 못한 에러가 나도 흰 화면만 뜨는 대신, 안내 메시지를 보여주고
// 에러를 Sentry로 보고한다.
const ErrorFallback = () => {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <h2 style={{ color: '#1f2937' }}>{t('문제가 발생했습니다')}</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {t('일시적인 오류일 수 있습니다. 페이지를 새로고침해주세요.')}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}
        >
          {t('새로고침')}
        </button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)

// [추가] 오프라인 지원용 서비스 워커 등록. 푸시 알림을 켜지 않은 사용자에게도 정적 자원/조회
// API 응답 캐싱 혜택을 주기 위해, 로그인 여부와 무관하게 앱 시작 시 한 번 등록해둔다.
// (같은 파일(public/sw.js)을 푸시 알림 켜기(src/utils/pushNotifications.js)에서도 등록하는데,
// register()는 같은 스크립트 URL/스코프면 이미 등록된 워커를 그대로 반환하므로 중복 문제는 없다)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('서비스 워커 등록 실패:', err);
    });
  });
}