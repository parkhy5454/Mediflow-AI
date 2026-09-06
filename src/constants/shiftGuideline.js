// src/constants/shiftGuideline.js
// 교대별 연속 근무일수 / 근무 후 휴무일수에 대한 "참고용" 권장 가이드라인.
// 법적으로 강제되는 기준이 아니라, 간호 인력 운영에서 흔히 권장되는 값을 참고삼아 안내하는
// 용도이며, 실제 기준은 병원 내규나 관련 법령·단체협약에 따라 다를 수 있다.
// Settings.jsx(근무표 설정 화면의 경고)와 rosterRiskAnalysis.js(대시보드 위험 신호)가 함께 쓴다.
export const SHIFT_GUIDELINE = {
  N: { maxShiftDays: 3, minOffDutyAfter: 2 }, // 나이트: 연속 3일 이내, 이후 최소 2일 휴무 권장
  DEFAULT: { maxShiftDays: 5, minOffDutyAfter: 1 }
};

export const getShiftGuidelineRule = (shiftCode) => SHIFT_GUIDELINE[shiftCode] || SHIFT_GUIDELINE.DEFAULT;
