// src/constants/shiftTypes.js
// 4교대(D/E/N/M) 시스템 정의. 실제 병원 근무 형태를 반영한 교대 코드/이름/시간대.

export const SHIFT_TYPES = ['D', 'E', 'N', 'M'];

export const SHIFT_INFO = {
  D: { code: 'D', name: '데이', fullName: '데이 (Day)', time: '07:00~15:00', color: '#f59e0b' },
  E: { code: 'E', name: '이브닝', fullName: '이브닝 (Evening)', time: '14:00~22:00', color: '#3b82f6' },
  N: { code: 'N', name: '나이트', fullName: '나이트 (Night)', time: '22:00~07:30', color: '#8b5cf6' },
  M: { code: 'M', name: '미들', fullName: '미들 (지원근무)', time: '09:00~18:00', color: '#10b981' }
};

export const shiftLabel = (code) => SHIFT_INFO[code]?.name || code;
export const shiftFullLabel = (code) => SHIFT_INFO[code]?.fullName || code;
export const shiftTime = (code) => SHIFT_INFO[code]?.time || '';
export const shiftColor = (code) => SHIFT_INFO[code]?.color || '#6b7280';
