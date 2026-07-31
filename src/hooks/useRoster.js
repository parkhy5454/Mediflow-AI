// // src/hooks/useRoster.js
// import { useState } from 'react';
// import { generateRoster } from '../services/rosterGenerator';
// import { getDaysInMonth } from '../utils/dateUtils';

// export const useRoster = (nurses, selectedMonth, selectedYear) => {
//   const [roster, setRoster] = useState({});

//   const generateBalancedRoster = (rosterConfig) => {
//     const activeNurses = nurses.filter(nurse => nurse.status === 'active');
//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     const monthKey = `${selectedYear}-${selectedMonth}`;
    
//     const result = generateRoster(activeNurses, daysInMonth, rosterConfig);
    
//     if (result.success) {
//       setRoster(prev => ({ ...prev, [monthKey]: result.roster }));
//       // Update nurses with new lastShiftType information
//       // This would typically be handled by the parent component
//       return { success: true, message: result.message, updatedNurses: result.updatedNurses };
//     } else {
//       return { success: false, message: result.message };
//     }
//   };

//   const getCurrentMonthRoster = () => {
//     const monthKey = `${selectedYear}-${selectedMonth}`;
//     return roster[monthKey] || {};
//   };

//   const getRosterStats = () => {
//     const monthRoster = getCurrentMonthRoster();
//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     let totalMorningAssignments = 0;
//     let totalNightAssignments = 0;
//     let totalOffDutyDays = 0;

//     for (let day = 1; day <= daysInMonth; day++) {
//       if (monthRoster[day]) {
//         totalMorningAssignments += monthRoster[day].morning?.length || 0;
//         totalNightAssignments += monthRoster[day].night?.length || 0;
//         totalOffDutyDays += monthRoster[day].offDuty?.length || 0;
//       }
//     }

//     return {
//       totalMorningAssignments,
//       totalNightAssignments,
//       totalOffDutyDays,
//       daysInMonth
//     };
//   };

//   const generateNurseAssignmentChart = () => {
//     const monthRoster = getCurrentMonthRoster();
//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     const activeNurses = nurses.filter(nurse => nurse.status === 'active');
//     const nurseAssignments = {};

//     // Initialize all active nurses
//     activeNurses.forEach(nurse => {
//       nurseAssignments[nurse.name] = {
//         name: nurse.name,
//         morningDays: 0,
//         nightDays: 0,
//         offDutyDays: 0
//       };
//     });

//     // Count assignments for each nurse
//     for (let day = 1; day <= daysInMonth; day++) {
//       if (monthRoster[day]) {
//         monthRoster[day].morning?.forEach(nurse => {
//           if (nurseAssignments[nurse.name]) {
//             nurseAssignments[nurse.name].morningDays++;
//           }
//         });
        
//         monthRoster[day].night?.forEach(nurse => {
//           if (nurseAssignments[nurse.name]) {
//             nurseAssignments[nurse.name].nightDays++;
//           }
//         });
        
//         monthRoster[day].offDuty?.forEach(nurse => {
//           if (nurseAssignments[nurse.name]) {
//             nurseAssignments[nurse.name].offDutyDays++;
//           }
//         });
//       }
//     }

//     return Object.values(nurseAssignments);
//   };

//   return {
//     roster,
//     generateBalancedRoster,
//     getCurrentMonthRoster,
//     getRosterStats,
//     generateNurseAssignmentChart
//   };
// };

// src/hooks/useRoster.js (4교대 D/E/N/M 시스템 대응)
import { useState, useEffect } from 'react';
import { generateRoster } from '../services/rosterGenerator';
import { getDaysInMonth } from '../utils/dateUtils';

const STORAGE_KEY = 'mediflow_roster';

const loadSavedRoster = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

export const useRoster = (nurses, selectedMonth, selectedYear, updateNurses) => {
  const [roster, setRoster] = useState(loadSavedRoster);

  // 근무표가 바뀔 때마다(생성/초기화) 자동 저장 → 새로고침/재로그인해도 유지
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
    } catch (e) {
      console.error('근무표 저장 실패:', e);
    }
  }, [roster]);

  const generateBalancedRoster = (rosterConfig) => {
    const activeNurses = nurses.filter(nurse => nurse.status === 'active');
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthKey = `${selectedYear}-${selectedMonth}`;
    
    const result = generateRoster(activeNurses, daysInMonth, rosterConfig);
    
    if (result.success) {
      setRoster(prev => ({ ...prev, [monthKey]: result.roster }));
      
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
    const monthKey = `${selectedYear}-${selectedMonth}`;
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
    const monthKey = `${year}-${month}`;
    setRoster(prev => {
      const newRoster = { ...prev };
      delete newRoster[monthKey];
      return newRoster;
    });
  };

  const hasRosterData = (month = selectedMonth, year = selectedYear) => {
    const monthKey = `${year}-${month}`;
    return roster[monthKey] && Object.keys(roster[monthKey]).length > 0;
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
