// public/sw.js
// Mediflow-AI 서비스 워커. 두 가지 역할을 한다.
// 1) 웹 푸시 알림 — 앱을 열어두지 않아도 근무 변경/휴가 승인·거절, 근무표 발행 알림을 받을 수 있게 한다.
// 2) 오프라인 지원 — 정적 자원(JS/CSS/아이콘)과 최근 조회한 화면 데이터(간호사 목록, 이번 달 근무표
//    등 GET API 응답)를 캐싱해서, 병동처럼 네트워크가 불안정한 곳에서도 최근에 열어본 화면은
//    계속 볼 수 있게 한다. 다만 로그인/저장/승인처럼 서버에 실제로 뭔가를 바꾸는 요청(GET이 아닌
//    요청)은 절대 캐시하지 않고 항상 네트워크로만 보낸다 — 오프라인 상태에서 "성공한 것처럼 보이지만
//    실제로는 반영 안 된" 상황을 만들지 않기 위함.
// - CRA(create-react-app)는 이 파일을 별도 빌드 처리 없이 public/ 그대로 정적 파일로 복사하므로,
//   순수 브라우저 JS(빌드 툴 문법 없이)로만 작성한다.

const STATIC_CACHE = 'mediflow-static-v1';
const API_CACHE = 'mediflow-api-v1';
const KNOWN_CACHES = [STATIC_CACHE, API_CACHE];

self.addEventListener('install', (event) => {
  // 새 서비스 워커를 대기 상태 없이 바로 활성화 준비.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 이전 버전에서 남은 캐시(이름이 바뀐 것)는 정리한다.
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KNOWN_CACHES.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// GET 정적 자원(주로 /static/... 빌드 산출물, 아이콘): 캐시에 있으면 즉시 응답하면서 동시에
// 백그라운드에서 새 버전을 받아 캐시를 갱신한다(stale-while-revalidate). 빌드마다 파일명에 해시가
// 붙으므로, 새 배포가 나오면 어차피 새 URL을 요청하게 되어 자연스럽게 최신 파일이 캐싱된다.
const handleStaticRequest = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkFetch; // 백그라운드 갱신은 흘러가게 두고, 응답 자체는 캐시로 즉시.
    return cached;
  }
  const networkResponse = await networkFetch;
  return networkResponse || Response.error();
};

// GET API 요청(근무표/간호사 목록 등 조회용): 네트워크를 우선 시도하고, 성공하면 캐시를 갱신한다.
// 네트워크가 안 되면(오프라인) 마지막으로 캐시해둔 응답을 대신 보여준다 — "최신은 아닐 수 있지만
// 완전히 빈 화면보다는 낫다"는 취지. 캐시에도 없으면 그냥 실패를 전달한다.
const handleApiGetRequest = async (request) => {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET 요청만 가로챈다. 로그인/저장/승인 같은 POST/PUT/DELETE는 항상 네트워크로 직행시켜서,
  // 오프라인 중에 "저장됐다고 착각"하는 일이 없도록 한다.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 외부 요청(폰트 CDN 등)은 건드리지 않음.

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiGetRequest(request));
    return;
  }

  if (url.pathname.startsWith('/static/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(handleStaticRequest(request));
  }
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
