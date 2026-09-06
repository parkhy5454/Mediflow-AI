// src/utils/rosterRiskAnalysis.js
// 대시보드 "위험 신호" 카드에 쓰이는 순수 계산 함수들.
// - 실제 화면에 뿌려진 컴포넌트 상태가 아니라 이미 갖고 있는 근무표/설정 데이터만 가지고
//   계산하므로, 테스트하기 쉽고(핵심 로직 유닛 테스트 과제에서도 재사용) 대시보드 렌더링과
//   분리되어 있다.
import { getShiftGuidelineRule } from '../constants/shiftGuideline';

// 이번 달 실제로 생성된 근무표(monthRoster)를 하루하루 훑어서, 같은 간호사가 같은 교대를
// 가이드라인 권장 상한보다 더 길게 연속으로 근무하는 구간을 찾아낸다.
// (예: 나이트를 4일 연속 — 권장 상한은 3일)
// monthRoster: { [day]: { D: [...nurse], E: [...nurse], N: [...nurse], M: [...nurse], offDuty: [...] } }
// shiftCodes: ['D','E','N','M'] 등 실제로 검사할 교대 코드 목록
export const findConsecutiveWorkRisks = (monthRoster, shiftCodes) => {
  if (!monthRoster) return [];
  const days = Object.keys(monthRoster)
    .map((d) => Number(d))
    .filter((d) => !Number.isNaN(d))
    .sort((a, b) => a - b);
  if (days.length === 0) return [];

  const risks = [];
  // nurseId(문자열로 통일) -> 현재 진행 중인 연속근무 기록
  const running = {};

  const finalize = (key) => {
    const rec = running[key];
    if (!rec) return;
    const rule = getShiftGuidelineRule(rec.shiftType);
    if (rec.streak > rule.maxShiftDays) {
      risks.push({
        nurseId: key,
        name: rec.name,
        shiftType: rec.shiftType,
        streak: rec.streak,
        startDay: rec.startDay,
        endDay: rec.endDay,
        recommendedMax: rule.maxShiftDays
      });
    }
    delete running[key];
  };

  days.forEach((day) => {
    const dayData = monthRoster[day] || {};
    const workingTodayKeys = new Set();

    shiftCodes.forEach((shiftType) => {
      const list = Array.isArray(dayData[shiftType]) ? dayData[shiftType] : [];
      list.forEach((nurse) => {
        if (!nurse || nurse.id === undefined || nurse.id === null) return;
        const key = String(nurse.id);
        workingTodayKeys.add(key);
        const prev = running[key];
        if (prev && prev.shiftType === shiftType) {
          prev.streak += 1;
          prev.endDay = day;
        } else {
          // 이전에 다른 교대로 진행 중이던 기록이 있으면 여기서 마무리 짓는다.
          if (prev) finalize(key);
          running[key] = { shiftType, streak: 1, startDay: day, endDay: day, name: nurse.name };
        }
      });
    });

    // 오늘 근무하지 않은(휴무) 사람은 연속 기록이 끊긴 것 — 여기서 마무리.
    Object.keys(running).forEach((key) => {
      if (!workingTodayKeys.has(key)) finalize(key);
    });
  });

  // 월말까지 이어진 기록도 마저 체크.
  Object.keys(running).forEach((key) => finalize(key));

  // 같은 사람이라도 구간이 다르면 별도 위험으로 보되, 보기 편하게 시작일 순으로 정렬.
  return risks.sort((a, b) => a.startDay - b.startDay);
};

// 현재 근무표 설정(rosterConfig)을 기준으로, 모든 교대를 계속 순환시키는 데 필요한
// 최소 간호사 인원을 추정한다. cfg.size명이 항상 근무 중이려면, shiftDays일 일하고
// offDutyAfter일 쉬는 순환 주기(cycle) 상 cfg.size * cycle / shiftDays 명이 필요하다는
// 계산이며, "정확한 배정 알고리즘의 결과"가 아니라 참고용 추정치다.
export const estimateMinimumStaffNeeded = (rosterConfig) => {
  const shifts = (rosterConfig && rosterConfig.shifts) || {};
  return Object.values(shifts).reduce((sum, cfg) => {
    if (!cfg || !cfg.size || !cfg.shiftDays) return sum;
    const cycle = cfg.shiftDays + (cfg.offDutyAfter || 0);
    const perShiftMin = Math.ceil((cfg.size * cycle) / cfg.shiftDays);
    return sum + perShiftMin;
  }, 0);
};

// 활성 간호사 수가 추정 최소 인원보다 적으면 인원 부족 위험으로 본다.
// 반환값이 null이면 위험 없음(또는 판단할 설정 자체가 없음).
export const findStaffingRisk = (rosterConfig, activeNurseCount) => {
  const required = estimateMinimumStaffNeeded(rosterConfig);
  if (required <= 0) return null;
  if (activeNurseCount >= required) return null;
  return { required, active: activeNurseCount, shortfall: required - activeNurseCount };
};
