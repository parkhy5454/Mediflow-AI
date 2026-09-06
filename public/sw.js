// public/sw.js
// Mediflow-AI 웹 푸시 알림용 서비스 워커.
// - 앱을 열어두지 않아도 근무 변경/휴가 승인·거절, 근무표 발행 같은 알림을 받을 수 있게 한다.
// - CRA(create-react-app)는 이 파일을 별도 빌드 처리 없이 public/ 그대로 정적 파일로 복사하므로,
//   순수 브라우저 JS(빌드 툴 문법 없이)로만 작성한다.

self.addEventListener('install', (event) => {
  // 새 서비스 워커를 대기 상태 없이 바로 활성화 준비.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 서버(web-push)로부터 푸시 메시지가 도착했을 때.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: 'Mediflow-AI', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Mediflow-AI';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag || undefined
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림을 클릭하면 앱 탭이 이미 열려 있으면 그 탭으로 포커스, 없으면 새 탭으로 연다.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
