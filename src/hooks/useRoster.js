// src/hooks/useRoster.js (4교대 D/E/N/M 시스템, 서버 API 기반 저장)
// [수정] localStorage 대신 서버 API(Supabase)를 통해 병원별로 근무표를 저장/조회한다.
import { useState, useEffect } from 'react';
import { generateRoster } from '../services/rosterGenerator';
import { getDaysInMonth } from '../utils/dateUtils';

export const useRoster = (nurses, selectedMonth, selectedYear, updateNurses, currentUser) => {
  const [roster, setRoster] = useState({});
  const monthKey = `${selectedYear}-${selectedMonth}`;

  // 선택된 달이 바뀌면 그 달의 근무표를 서버에서 불러온다 (이미 불러온 적 있으면 캐시된 값 유지)
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await fetch(`/api/roster/${monthKey}`, {
          headers: { 'x-user-id': currentUser.id }
        });
        const data = await res.json();
        if (res.ok) {
          setRoster(prev => ({ ...prev, [monthKey]: data.roster || {} }));
        }
      } catch (err) {
        console.error('근무표 조회 실패:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, currentUser?.id]);

  const saveRosterToServer = (key, rosterData) => {
    if (!currentUser) return;
    fetch(`/api/roster/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
      body: JSON.stringify({ roster: rosterData })
    }).catch(err => console.error('근무표 저장 실패:', err));
  };

  const generateBalancedRoster = (rosterConfig) => {
    const activeNurses = nurses.filter(nurse => nurse.status === 'active');
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    const result = generateRoster(activeNurses, daysInMonth, rosterConfig);
    
    if (result.success) {
      setRoster(prev => ({ ...prev, [monthKey]: result.roster }));
      saveRosterToServer(monthKey, result.roster);
      
      // Update nurses with new lastShiftType information
      if (result.updatedNurses && updateNurses) {
        // Merge updated nurses with existing inactive nurses
        const inactiveNurses = nurses.filter(nurse => nurse.status !== 'active');
        const allUpdatedNurses = [...result.updatedNurses, ...inactiveNurses];
        updateNurses(allUpdatedNurses);
      }
      
      return { 
        success: true, 
        message: result.message, 
        workloadSummary: result.workloadSummary 
      };
    } else {
      return { success: false, message: result.message };
    }
  };

  const getCurrentMonthRoster = () => {
    return roster[monthKey] || {};
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
    const activeNurses = nurses.filter(nurse => nurse.status === 'active');
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
    setRoster(prev => {
      const newRoster = { ...prev };
      delete newRoster[key];
      return newRoster;
    });
    if (currentUser) {
      fetch(`/api/roster/${key}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      }).catch(err => console.error('근무표 삭제 실패:', err));
    }
  };

  const hasRosterData = (month = selectedMonth, year = selectedYear) => {
    const key = `${year}-${month}`;
    return roster[key] && Object.keys(roster[key]).length > 0;
  };

  return {
    roster,
    generateBalancedRoster,
    getCurrentMonthRoster,
    getRosterStats,
    generateNurseAssignmentChart,
    clearRoster,
    hasRosterData
  };
};
