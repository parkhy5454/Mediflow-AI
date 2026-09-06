// src/utils/kakaoShare.js
// 카카오톡 공유(Kakao JS SDK) 관련 헬퍼. index.html에서 로드한 전역 window.Kakao를 사용한다.
// KAKAO_JS_KEY가 비어있거나 SDK 로드에 실패해도 앱 동작에는 영향이 없고,
// isKakaoShareAvailable()이 false를 반환해서 호출부(ShareInviteButton)가 다른 공유 방법으로 대체한다.
import { KAKAO_JS_KEY } from '../config/kakao';

let initTried = false;

export const initKakao = () => {
  if (initTried) return;
  initTried = true;
  try {
    if (KAKAO_JS_KEY && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
  } catch (err) {
    console.error('Kakao SDK 초기화 실패:', err);
  }
};

export const isKakaoShareAvailable = () => {
  try {
    return !!(KAKAO_JS_KEY && window.Kakao && window.Kakao.isInitialized());
  } catch (err) {
    return false;
  }
};

// title/description/link(webUrl 하나만 있으면 mobileWebUrl도 동일하게 사용)/imageUrl을 받아
// 카카오톡 공유 시트를 띄운다. 실패 시 에러를 던지므로 호출부에서 대체 수단으로 넘어가면 된다.
export const shareToKakao = ({ title, description, link, imageUrl, buttonTitle }) => {
  if (!isKakaoShareAvailable()) {
    throw new Error('Kakao share not available');
  }
  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: link, webUrl: link }
    },
    buttons: [
      {
        title: buttonTitle,
        link: { mobileWebUrl: link, webUrl: link }
      }
    ]
  });
};
