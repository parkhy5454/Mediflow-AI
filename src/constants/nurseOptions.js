// src/constants/nurseOptions.js
// [추가] "간호사 추가" 폼과 필터 드롭다운이 항상 같은 목록을 쓰도록 한 곳에서 관리.

export const QUALIFICATION_OPTIONS = [
  { value: 'RN', label: 'RN (정간호사)' },
  { value: 'MW', label: 'MW (조산사)' },
  { value: 'RN-MW', label: 'RN-MW (둘 다)' }
];

export const EXPERIENCE_OPTIONS = ['주니어', '중급', '시니어'].map(v => ({ value: v, label: v }));

export const DEPARTMENT_LIST = [
  '중환자실', '응급실', '수술실', '분만실', '신생아중환자실', '회복실',
  '내과', '외과', '정형외과', '신경외과', '신경과', '흉부외과', '성형외과',
  '산부인과', '소아청소년과', '정신건강의학과', '피부과', '비뇨의학과',
  '이비인후과', '안과', '치과', '재활의학과', '마취통증의학과',
  '영상의학과', '진단검사의학과', '가정의학과', '인공신장실(투석실)',
  '일반병동', '외래'
];

export const DEPARTMENT_OPTIONS = DEPARTMENT_LIST.map(v => ({ value: v, label: v }));
