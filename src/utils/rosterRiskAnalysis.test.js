// src/utils/rosterRiskAnalysis.test.js
// 대시보드 "위험 신호" 계산 로직에 대한 유닛 테스트.
// 이 함수들은 실제 화면 없이도 입력 데이터만으로 결과가 결정되는 순수 함수라서,
// 회귀(다른 기능 고치다가 이 계산이 조용히 깨지는 것)를 잡아내기 좋은 대상이다.
import { findConsecutiveWorkRisks, estimateMinimumStaffNeeded, findStaffingRisk } from './rosterRiskAnalysis';

describe('findConsecutiveWorkRisks', () => {
  test('나이트를 권장 상한(3일)보다 길게 연속으로 하면 위험으로 잡아낸다', () => {
    const monthRoster = {
      1: { N: [{ id: 1, name: '김간호' }] },
      2: { N: [{ id: 1, name: '김간호' }] },
      3: { N: [{ id: 1, name: '김간호' }] },
      4: { N: [{ id: 1, name: '김간호' }] }, // 4일 연속 — 나이트 권장 상한(3일) 초과
      5: { offDuty: [{ id: 1, name: '김간호' }] }
    };

    const risks = findConsecutiveWorkRisks(monthRoster, ['D', 'E', 'N', 'M']);

    expect(risks).toHaveLength(1);
    expect(risks[0]).toMatchObject({
      name: '김간호',
      shiftType: 'N',
      streak: 4,
      startDay: 1,
      endDay: 4,
      recommendedMax: 3
    });
  });

  test('권장 상한과 정확히 같은 일수는 위험으로 보지 않는다 (상한 자체는 초과가 아님)', () => {
    const monthRoster = {};
    for (let day = 1; day <= 5; day++) {
      monthRoster[day] = { D: [{ id: 2, name: '박간호' }] };
    }
    // 데이(D)는 기본 가이드라인상 권장 상한이 5일 — 정확히 5일 연속은 초과가 아니다.
    expect(findConsecutiveWorkRisks(monthRoster, ['D'])).toHaveLength(0);
  });

  test('상한보다 하루라도 더 길면 위험으로 잡아낸다', () => {
    const monthRoster = {};
    for (let day = 1; day <= 6; day++) {
      monthRoster[day] = { D: [{ id: 2, name: '박간호' }] };
    }
    const risks = findConsecutiveWorkRisks(monthRoster, ['D']);
    expect(risks).toHaveLength(1);
    expect(risks[0].streak).toBe(6);
  });

  test('교대 종류가 바뀌면 연속 기록이 끊긴 것으로 본다', () => {
    // 6일 내내 근무하지만 D→E로 바뀌므로, 같은 교대 연속 근무로는 3일을 넘지 않는다.
    const monthRoster = {
      1: { D: [{ id: 3, name: '이간호' }] },
      2: { D: [{ id: 3, name: '이간호' }] },
      3: { D: [{ id: 3, name: '이간호' }] },
      4: { E: [{ id: 3, name: '이간호' }] },
      5: { E: [{ id: 3, name: '이간호' }] },
      6: { E: [{ id: 3, name: '이간호' }] }
    };
    expect(findConsecutiveWorkRisks(monthRoster, ['D', 'E'])).toHaveLength(0);
  });

  test('휴무로 하루 쉬면 다음 근무는 새 연속기록으로 취급한다', () => {
    const monthRoster = {
      1: { N: [{ id: 1, name: '김간호' }] },
      2: { N: [{ id: 1, name: '김간호' }] },
      3: { N: [{ id: 1, name: '김간호' }] }, // 3일 연속(상한 이내)
      4: { offDuty: [{ id: 1, name: '김간호' }] },
      5: { N: [{ id: 1, name: '김간호' }] },
      6: { N: [{ id: 1, name: '김간호' }] },
      7: { N: [{ id: 1, name: '김간호' }] } // 다시 3일 연속(상한 이내)
    };
    expect(findConsecutiveWorkRisks(monthRoster, ['N'])).toHaveLength(0);
  });

  test('근무표가 비어있으면 빈 배열을 반환한다', () => {
    expect(findConsecutiveWorkRisks({}, ['D', 'E', 'N', 'M'])).toEqual([]);
    expect(findConsecutiveWorkRisks(null, ['D'])).toEqual([]);
  });
});

describe('estimateMinimumStaffNeeded / findStaffingRisk', () => {
  const defaultRosterConfig = {
    shifts: {
      D: { size: 4, shiftDays: 4, offDutyAfter: 2 },
      E: { size: 3, shiftDays: 4, offDutyAfter: 2 },
      N: { size: 4, shiftDays: 4, offDutyAfter: 3 },
      M: { size: 2, shiftDays: 4, offDutyAfter: 2 }
    }
  };

  test('기본 설정에서 순환 유지에 필요한 최소 인원을 계산한다', () => {
    // D: ceil(4*6/4)=6, E: ceil(3*6/4)=5, N: ceil(4*7/4)=7, M: ceil(2*6/4)=3 → 합계 21
    expect(estimateMinimumStaffNeeded(defaultRosterConfig)).toBe(21);
  });

  test('활성 간호사가 최소 인원보다 적으면 부족분을 반환한다', () => {
    const risk = findStaffingRisk(defaultRosterConfig, 15);
    expect(risk).toEqual({ required: 21, active: 15, shortfall: 6 });
  });

  test('활성 간호사가 충분하면 null을 반환한다', () => {
    expect(findStaffingRisk(defaultRosterConfig, 21)).toBeNull();
    expect(findStaffingRisk(defaultRosterConfig, 30)).toBeNull();
  });

  test('설정이 비어있으면 위험 판단을 하지 않는다', () => {
    expect(findStaffingRisk({ shifts: {} }, 0)).toBeNull();
    expect(findStaffingRisk(null, 0)).toBeNull();
  });
});
