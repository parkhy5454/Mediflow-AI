// src/hooks/useRoster.js (4교대 D/E/N/M 시스템, 서버 API 기반 저장)
// [수정] localStorage 대신 서버 API(Supabase)를 통해 병원별로 근무표를 저장/조회한다.
// [수정 2] 근무표를 병원 전체가 아니라 "부서(병동)"별로 따로 생성/저장/조회하도록 변경.
//   department가 빈 문자열('')이면 "미지정" 부서로 취급된다.
import { useState, useEffect } from 'react';
import { generateRoster, applyApprovedLeaveToRoster } from '../services/rosterGenerator';
import { getDaysInMonth } from '../utils/dateUtils';

export const useRoster = (nurses, selectedMonth, selectedYear, updateNurses, currentUser, department = '') => {
  const [roster, setRoster] = useState({});
  // [추가] 발행 상태(잠금 여부)를 월+부서별로 따로 관리. roster_data와 달리 메타 정보라서 분리.
  const [rosterMeta, setRosterMeta] = useState({});
  const monthKey = `${selectedYear}-${selectedMonth}`;
  // 로컬 상태(roster/rosterMeta)를 인덱싱할 때는 부서까지 합쳐서 키로 쓴다.
  // (같은 달이라도 부서가 다르면 완전히 다른 근무표이므로)
  const storageKey = `${monthKey}::${department || '_'}`;

  // 이 부서(department)에 속한 간호사만 필터링. 근무표 생성/통계는 항상 이 목록 기준으로 동작한다.
  const departmentNurses = nurses.filter(nurse => (nurse.department || '') === department);

  // 근무표를 서버에서 불러와 roster 상태에 반영.
  // [추가] 근무 변경 요청 승인처럼, 다른 화면에서 서버의 근무표를 직접 수정한 뒤
  // 이 함수를 호출해 화면(roster 상태)을 최신 상태로 강제 갱신할 수 있도록 외부에 노출한다.
  const fetchRosterForMonth = async (key = monthKey, dept = department) => {
    if (!currentUser) return;
    const sKey = `${key}::${dept || '_'}`;
    try {
      const res = await fetch(`/api/roster/${key}?department=${encodeURIComponent(dept || '')}`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRoster(prev => ({ ...prev, [sKey]: data.roster || {} }));
        setRosterMeta(prev => ({
          ...prev,
          [sKey]: {
            isPublished: !!data.isPublished,
            publishedAt: data.publishedAt || null,
            publishedByName: data.publishedByName || null
          }
        }));
      }
    } catch (err) {
      console.error('근무표 조회 실패:', err);
    }
  };

  // 선택된 달 또는 부서가 바뀌면 그 근무표를 서버에서 불러온다
  useEffect(() => {
    fetchRosterForMonth(monthKey, department);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, department, currentUser?.id]);

  const refetchRoster = () => fetchRosterForMonth(monthKey, department);

  const saveRosterToServer = (key, rosterData, dept = department) => {
    if (!currentUser) return;
    fetch(`/api/roster/${key}?department=${encodeURIComponent(dept || '')}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ roster: rosterData })
    }).catch(err => console.error('근무표 저장 실패:', err));
  };

  const generateBalancedRoster = (rosterConfig, approvedLeaves = []) => {
    if (rosterMeta[storageKey]?.isPublished) {
      return { success: false, message: '이 근무표는 이미 발행되어 있어 재생성할 수 없습니다. 먼저 발행을 취소해주세요.' };
    }

    const activeNurses = departmentNurses.filter(nurse => nurse.status === 'active');
    if (activeNurses.length === 0) {
      return { success: false, message: department ? `${department}에 소속된 활성 간호사가 없습니다.` : '부서가 지정되지 않은 활성 간호사가 없습니다. 간호사 관리에서 부서를 지정해주세요.' };
    }
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    const result = generateRoster(activeNurses, daysInMonth, rosterConfig);
    
    if (result.success) {
      let finalRoster = result.roster;
      let finalUpdatedNurses = result.updatedNurses;
      let leaveNotes = [];

      // 승인된 휴가가 있으면, 생성된 근무표에서 해당 날짜의 배정을 대체 인력으로 바꾼다.
      if (approvedLeaves && approvedLeaves.length > 0) {
        const applied = applyApprovedLeaveToRoster({
          roster: finalRoster,
          updatedNurses: finalUpdatedNurses,
          activeNurses,
          approvedLeaves,
          daysInMonth,
          selectedYear,
          selectedMonth,
          shiftTypes: result.shiftTypes
        });
        finalRoster = applied.roster;
        finalUpdatedNurses = applied.updatedNurses;
        leaveNotes = applied.notes;
      }

      setRoster(prev => ({ ...prev, [storageKey]: finalRoster }));
      saveRosterToServer(monthKey, finalRoster);
      
      // Update nurses with new lastShiftType information
      // (이 부서 간호사들만 갱신하고, 다른 부서/비활성 간호사는 그대로 둔다)
      if (finalUpdatedNurses && updateNurses) {
        const updatedIds = new Set(finalUpdatedNurses.map(n => n.id));
        const untouchedNurses = nurses.filter(nurse => !updatedIds.has(nurse.id));
        const allUpdatedNurses = [...finalUpdatedNurses, ...untouchedNurses];
        updateNurses(allUpdatedNurses);
      }
      
      return { 
        success: true, 
        message: result.message + (leaveNotes.length > 0 ? `\n\n🏖 승인된 휴가 반영:\n${leaveNotes.join('\n')}` : ''), 
        workloadSummary: result.workloadSummary,
        continuityInfo: result.continuityInfo,
        shiftTypes: result.shiftTypes
      };
    } else {
      return { success: false, message: result.message };
    }
  };

  const getCurrentMonthRoster = () => {
    return roster[storageKey] || {};
  };

  // [수정] 교대 종류(D/E/N/M)별 합계를 자동으로 계산. 근무표 데이터에 실제로 들어있는
  // 교대 키만 집계하므로, rosterConfig가 바뀌어도(교대 추가/삭제) 그대로 동작한다.
  const getRosterStats = () => {
    const monthRoster = getCurrentMonthRoster();
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const totalsByShift = {};
    let totalOffDutyDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      if (!dayData) continue;
      Object.keys(dayData).forEach(key => {
        if (key === 'offDuty') {
          totalOffDutyDays += dayData.offDuty?.length || 0;
        } else {
          totalsByShift[key] = (totalsByShift[key] || 0) + (dayData[key]?.length || 0);
        }
      });
    }

    return {
      totalsByShift,
      totalOffDutyDays,
      daysInMonth
    };
  };

  const generateNurseAssignmentChart = () => {
    const monthRoster = getCurrentMonthRoster();
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const activeNurses = departmentNurses.filter(nurse => nurse.status === 'active');
    const nurseAssignments = {};

    activeNurses.forEach(nurse => {
      nurseAssignments[nurse.name] = { name: nurse.name, offDutyDays: 0 };
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      if (!dayData) continue;

      Object.keys(dayData).forEach(key => {
        if (key === 'offDuty') {
          dayData.offDuty?.forEach(nurse => {
            if (nurseAssignments[nurse.name]) {
              nurseAssignments[nurse.name].offDutyDays++;
            }
          });
        } else {
          dayData[key]?.forEach(nurse => {
            if (nurseAssignments[nurse.name]) {
              nurseAssignments[nurse.name][key] = (nurseAssignments[nurse.name][key] || 0) + 1;
            }
          });
        }
      });
    }

    return Object.values(nurseAssignments);
  };

  const clearRoster = (month, year) => {
    const key = `${year}-${month}`;
    const sKey = `${key}::${department || '_'}`;
    if (rosterMeta[sKey]?.isPublished) {
      alert('이 근무표는 이미 발행되어 있어 초기화할 수 없습니다. 먼저 발행을 취소해주세요.');
      return false;
    }
    setRoster(prev => {
      const newRoster = { ...prev };
      delete newRoster[sKey];
      return newRoster;
    });
    if (currentUser) {
      fetch(`/api/roster/${key}?department=${encodeURIComponent(department || '')}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      }).catch(err => console.error('근무표 삭제 실패:', err));
    }
    return true;
  };

  // [추가] 근무표 발행 / 발행 취소 (관리자만 서버에서 허용됨)
  const publishRoster = async (month = selectedMonth, year = selectedYear) => {
    const key = `${year}-${month}`;
    const sKey = `${key}::${department || '_'}`;
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };
    try {
      const res = await fetch(`/api/roster/${key}/publish?department=${encodeURIComponent(department || '')}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || '발행에 실패했습니다.' };
      setRosterMeta(prev => ({
        ...prev,
        [sKey]: { isPublished: true, publishedAt: new Date().toISOString(), publishedByName: currentUser.name }
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: '발행 중 오류가 발생했습니다.' };
    }
  };

  const unpublishRoster = async (month = selectedMonth, year = selectedYear) => {
    const key = `${year}-${month}`;
    const sKey = `${key}::${department || '_'}`;
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };
    try {
      const res = await fetch(`/api/roster/${key}/unpublish?department=${encodeURIComponent(department || '')}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || '발행 취소에 실패했습니다.' };
      setRosterMeta(prev => ({ ...prev, [sKey]: { isPublished: false, publishedAt: null, publishedByName: null } }));
      return { success: true };
    } catch (err) {
      return { success: false, message: '발행 취소 중 오류가 발생했습니다.' };
    }
  };

  const hasRosterData = (month = selectedMonth, year = selectedYear) => {
    const key = `${year}-${month}::${department || '_'}`;
    return roster[key] && Object.keys(roster[key]).length > 0;
  };

  return {
    roster,
    rosterMeta,
    generateBalancedRoster,
    getCurrentMonthRoster,
    getRosterStats,
    generateNurseAssignmentChart,
    clearRoster,
    hasRosterData,
    refetchRoster,
    publishRoster,
    unpublishRoster,
    departmentNurses
  };
};
