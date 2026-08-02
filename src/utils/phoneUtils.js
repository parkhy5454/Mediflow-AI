// src/utils/phoneUtils.js
// 전화번호 입력값을 숫자만 남겨서 자동으로 하이픈(-)을 넣어주는 공통 함수.
// 입력창의 onChange에도 쓰고, 이미 저장된 값을 화면에 표시할 때도 그대로 통과시키면
// 어떤 형식으로 저장되어 있었든(하이픈 없음/다르게 있음) 항상 같은 모양으로 보여줄 수 있다.
//
// 규칙:
// - 서울 지역번호(02): 02-XXX-XXXX 또는 02-XXXX-XXXX
// - 그 외(010, 011, 031 등 3자리 코드): XXX-XXXX-XXXX (11자리) 또는 XXX-XXX-XXXX (10자리)
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/[^\d]/g, '').slice(0, 11);
  if (!digits) return '';

  if (digits.startsWith('02')) {
    if (digits.length < 3) return digits;
    if (digits.length < 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length < 10) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length < 11) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};
