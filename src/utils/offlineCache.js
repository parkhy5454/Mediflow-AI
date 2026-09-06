// src/utils/offlineCache.js
// public/sw.js가 조회 API(GET) 응답을 오프라인 지원용으로 캐싱해두는 캐시 이름.
// [주의] public/sw.js는 번들러를 거치지 않는 순수 정적 파일이라 이 상수를 import할 수 없으므로,
// 캐시 이름 문자열('mediflow-api-v1')은 sw.js 안에도 그대로 하드코딩되어 있다. 캐시 이름을
// 바꾸게 되면 두 파일을 함께 수정해야 한다.
const API_CACHE_NAME = 'mediflow-api-v1';

// 로그아웃 시 호출 — 같은 기기를 다른 계정이 이어서 쓸 때, 로그아웃한 사용자의 근무표/간호사
// 목록 같은 조회 데이터가 오프라인 캐시에 남아 다음 사람에게 잠깐이라도 보이는 일을 막는다.
export const clearOfflineApiCache = async () => {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    await window.caches.delete(API_CACHE_NAME);
  } catch (err) {
    console.error('오프라인 캐시 삭제 실패:', err);
  }
};
