// src/constants/rosterConfig.js
// [수정] 2교대(주간/야간) → 4교대(D/E/N/M) 시스템으로 변경.
// 교대별로 필요 인원, 연속 근무일수, 근무 후 휴무일수를 각각 설정한다.

export const defaultRosterConfig = {
  shifts: {
    D: { size: 4, shiftDays: 4, offDutyAfter: 2 },
    E: { size: 3, shiftDays: 4, offDutyAfter: 2 },
    N: { size: 4, shiftDays: 4, offDutyAfter: 3 },
    M: { size: 2, shiftDays: 4, offDutyAfter: 2 }
  },
  minRNPerShift: 2,
  minMWPerShift: 1
};
