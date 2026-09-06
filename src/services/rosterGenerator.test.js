// src/services/rosterGenerator.test.js
// 근무표 자동 생성 핵심 로직에 대한 유닛 테스트.
// 이 파일이 지키려는 것: 코드를 고치다가 아래 네 가지 중 하나라도 조용히 깨지면 즉시 알아챌 수 있어야 한다.
// 1) 간호사가 모자라면 명확히 실패로 응답한다.
// 2) 여유 있게 인원이 있으면 매일 필요한 인원을 빠짐없이 채운다.
// 3) 같은 교대 연속 근무일수가 설정(shiftDays)을 벗어나지 않는다(사이클이 끝나면 반드시 쉰다).
// 4) 간호사가 설정한 선호/기피 근무가 실제 배정 결과에 (공정성을 해치지 않는 선에서) 반영된다.
import { generateRoster } from './rosterGenerator';

const makeNurse = (id, overrides = {}) => ({
  id,
  name: id,
  qualification: 'RN',
  experience: '주니어',
  historicalDaysByShift: {},
  ...overrides
});

describe('generateRoster - 인원 부족', () => {
  test('활성 간호사가 필요 인원보다 적으면 실패를 반환한다', () => {
    const rosterConfig = { shifts: { D: { size: 4, shiftDays: 4, offDutyAfter: 2 } } };
    const nurses = [makeNurse('a'), makeNurse('b')]; // 4명 필요한데 2명뿐
    const result = generateRoster(nurses, 30, rosterConfig);

    expect(result.success).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
  });
});

describe('generateRoster - 인원 충족 시 매일 빈자리 없이 채운다', () => {
  const rosterConfig = { shifts: { D: { size: 2, shiftDays: 3, offDutyAfter: 2 } } };
  // 최소 필요 인원(ceil(2*5/3)=4)보다 여유 있게 6명을 둔다.
  const nurses = Array.from({ length: 6 }, (_, i) => makeNurse(`n${i}`));
  const daysInMonth = 20;
  const result = generateRoster(nurses, daysInMonth, rosterConfig);

  test('생성에 성공하고, 채워지지 않은 근무가 없다', () => {
    expect(result.success).toBe(true);
    expect(result.continuityInfo.hasEmptyShifts).toBe(false);
    expect(result.continuityInfo.totalEmptyShifts).toBe(0);
  });

  test('모든 날짜에 설정된 인원 수(size)만큼 정확히 배정된다', () => {
    for (let day = 1; day <= daysInMonth; day++) {
      expect(result.roster[day].D).toHaveLength(2);
    }
  });

  test('같은 간호사가 연속으로 근무하는 일수는 shiftDays(3일)를 넘지 않는다', () => {
    const streaks = {};
    const running = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const workingIds = new Set(result.roster[day].D.map((n) => n.id));
      nurses.forEach((nurse) => {
        if (workingIds.has(nurse.id)) {
          running[nurse.id] = (running[nurse.id] || 0) + 1;
          streaks[nurse.id] = Math.max(streaks[nurse.id] || 0, running[nurse.id]);
        } else {
          running[nurse.id] = 0;
        }
      });
    }
    Object.values(streaks).forEach((maxStreak) => {
      expect(maxStreak).toBeLessThanOrEqual(3);
    });
  });
});

describe('generateRoster - 선호/기피 근무 반영', () => {
  // 교대 3종류(D/E/N), 각 1자리씩, 아주 짧은 근무/휴무 주기로 설정해서 매일 "쉬고 있는" 인원끼리
  // 서로 경쟁하는 상황을 만든다 — 이래야 선호/기피에 따른 우선순위 차이가 실제로 드러난다.
  const rosterConfig = {
    shifts: {
      D: { size: 1, shiftDays: 1, offDutyAfter: 1 },
      E: { size: 1, shiftDays: 1, offDutyAfter: 1 },
      N: { size: 1, shiftDays: 1, offDutyAfter: 1 }
    }
  };
  const nurses = [
    makeNurse('pref', { preferredShiftType: 'D' }),
    makeNurse('avoid', { avoidedShiftType: 'D' }),
    ...Array.from({ length: 6 }, (_, i) => makeNurse(`n${i}`))
  ];
  const daysInMonth = 28;
  const result = generateRoster(nurses, daysInMonth, rosterConfig);

  const dCountFor = (id) => {
    const nurse = result.updatedNurses.find((n) => n.id === id);
    return nurse.historicalDaysByShift.D || 0;
  };

  test('D를 선호하는 간호사는 다른 누구보다 D 근무를 더 많이 배정받는다', () => {
    const prefD = dCountFor('pref');
    const otherD = nurses
      .filter((n) => n.id !== 'pref')
      .map((n) => dCountFor(n.id));
    expect(prefD).toBeGreaterThan(Math.max(...otherD));
  });

  test('D를 기피하는 간호사는 D 근무를 가장 적게(또는 최소와 동률로) 배정받는다', () => {
    const avoidD = dCountFor('avoid');
    const neutralD = nurses
      .filter((n) => n.id !== 'pref' && n.id !== 'avoid')
      .map((n) => dCountFor(n.id));
    expect(avoidD).toBeLessThanOrEqual(Math.min(...neutralD));
  });

  test('선호/기피가 있어도 전체 근무일수 공정성 배분은 심하게 깨지지 않는다', () => {
    // 목표(targetTotalWorkDays)와 실제 배정 간 편차가 하루 이틀을 넘어서지 않는지 정도만 확인한다.
    // (선호는 "참고용 가중치"일 뿐 공정성 배분 자체를 뒤엎으면 안 된다는 설계 의도를 지킨다)
    const totalWorkDaysList = result.updatedNurses.map((n) => {
      const values = Object.values(n.historicalDaysByShift);
      return values.reduce((sum, v) => sum + v, 0);
    });
    const avg = totalWorkDaysList.reduce((a, b) => a + b, 0) / totalWorkDaysList.length;
    totalWorkDaysList.forEach((total) => {
      expect(Math.abs(total - avg)).toBeLessThanOrEqual(3);
    });
  });
});
