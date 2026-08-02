
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
const ErrorFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ textAlign: 'center', maxWidth: '360px' }}>
      <h2 style={{ color: '#1f2937' }}>문제가 발생했습니다</h2>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        일시적인 오류일 수 있습니다. 페이지를 새로고침해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}
      >
        새로고침
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)