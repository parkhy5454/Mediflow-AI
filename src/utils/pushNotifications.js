// src/utils/pushNotifications.js
// 웹 푸시 알림 구독/해지 헬퍼.
// - 서비스 워커(public/sw.js) 등록 → 브라우저 PushManager로 구독 → 서버에 구독 정보 저장, 순서로 동작한다.
// - VAPID 공개키는 서버(/api/push/vapid-public-key)에서 받아오며, 서버에 키가 설정되어 있지
//   않으면(404) 기능 자체가 지원되지 않는 것으로 간주한다.
// - 이 파일은 React 컴포넌트 트리 밖에서 쓰이므로 useTranslation 훅 대신 i18n 인스턴스를 직접 사용한다.
import i18n from '../i18n';
const tGlobal = (...args) => i18n.t(...args);

// base64url 문자열을 Uint8Array로 변환 (PushManager.subscribe의 applicationServerKey 형식 요구사항).
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// 이 브라우저/기기가 웹 푸시를 지원하는지 (iOS Safari는 홈 화면 추가 전에는 지원 안 함 등).
export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

// 현재 알림 권한 상태: 'granted' | 'denied' | 'default'
export const getPushPermission = () => (isPushSupported() ? Notification.permission : 'unsupported');

// 현재 이 기기에서 알림 구독이 활성화되어 있는지 확인.
export const isPushSubscribed = async () => {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    return false;
  }
};

// 알림 켜기: 권한 요청 → 서비스 워커 등록 → 구독 생성 → 서버에 저장.
export const subscribeToPush = async (token) => {
  if (!isPushSupported()) throw new Error(tGlobal('이 브라우저에서는 알림을 지원하지 않습니다.'));

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(tGlobal('알림 권한이 허용되지 않았습니다.'));
  }

  const keyRes = await fetch('/api/push/vapid-public-key');
  if (!keyRes.ok) throw new Error(tGlobal('푸시 알림 기능이 아직 설정되지 않았습니다.'));
  const { publicKey } = await keyRes.json();

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
  }

  const saveRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subscription: subscription.toJSON() })
  });
  if (!saveRes.ok) {
    const data = await saveRes.json().catch(() => ({}));
    throw new Error(data.error || tGlobal('알림 구독 저장에 실패했습니다.'));
  }

  return true;
};

// 알림 끄기: 서버에서 구독 삭제 + 브라우저 구독 해지.
export const unsubscribeFromPush = async (token) => {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  } catch (err) {
    // 서버 삭제가 실패해도 브라우저 쪽 구독 해지는 계속 진행
    console.error('push unsubscribe (server) 실패:', err);
  }

  await subscription.unsubscribe();
};
