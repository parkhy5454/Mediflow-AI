// src/utils/dateUtils.js
export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

// 앱에서 선택 가능한 언어(ko/en/zh) → 날짜 포맷/Intl에 쓸 로케일 문자열.
export const LOCALE_BY_LANG = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN' };
export const localeFor = (lang) => LOCALE_BY_LANG[(lang || 'ko').slice(0, 2)] || 'ko-KR';

// [수정] 화면 언어와 무관하게 항상 "9월" 형태(한국어)로만 표시되던 문제 수정.
// lang을 넘기면 그 언어에 맞는 월 이름을("September", "9月" 등) 반환하고,
// 넘기지 않으면 기존과 동일하게 한국어("9월")를 반환한다(하위 호환).
const MONTHS_KO = ['1월', '2월', '3월', '4월', '5월', '6월',
                   '7월', '8월', '9월', '10월', '11월', '12월'];

export const getMonthName = (month, lang) => {
  if (!lang || lang.slice(0, 2) === 'ko') return MONTHS_KO[month];
  try {
    return new Intl.DateTimeFormat(localeFor(lang), { month: 'long' }).format(new Date(2000, month, 1));
  } catch (e) {
    return MONTHS_KO[month];
  }
};

export const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

