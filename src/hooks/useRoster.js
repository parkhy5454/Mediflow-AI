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

// src/hooks/useRoster.js (Updated with nurse state management)
import { useState } from 'react';
import { generateRoster } from '../services/rosterGenerator';
import { getDaysInMonth } from '../utils/dateUtils';

export const useRoster = (nurses, selectedMonth, selectedYear, updateNurses) => {
  const [roster, setRoster] = useState({});

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

  const getRosterStats = () => {
    const monthRoster = getCurrentMonthRoster();
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    let totalMorningAssignments = 0;
    let totalNightAssignments = 0;
    let totalOffDutyDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      if (monthRoster[day]) {
        totalMorningAssignments += monthRoster[day].morning?.length || 0;
        totalNightAssignments += monthRoster[day].night?.length || 0;
        totalOffDutyDays += monthRoster[day].offDuty?.length || 0;
      }
    }

    return {
      totalMorningAssignments,
      totalNightAssignments,
      totalOffDutyDays,
      daysInMonth
    };
  };

  const generateNurseAssignmentChart = () => {
    const monthRoster = getCurrentMonthRoster();
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const activeNurses = nurses.filter(nurse => nurse.status === 'active');
    const nurseAssignments = {};

    // Initialize all active nurses
    activeNurses.forEach(nurse => {
      nurseAssignments[nurse.name] = {
        name: nurse.name,
        morningDays: 0,
        nightDays: 0,
        offDutyDays: 0
      };
    });

    // Count assignments for each nurse
    for (let day = 1; day <= daysInMonth; day++) {
      if (monthRoster[day]) {
        monthRoster[day].morning?.forEach(nurse => {
          if (nurseAssignments[nurse.name]) {
            nurseAssignments[nurse.name].morningDays++;
          }
        });
        
        monthRoster[day].night?.forEach(nurse => {
          if (nurseAssignments[nurse.name]) {
            nurseAssignments[nurse.name].nightDays++;
          }
        });
        
        monthRoster[day].offDuty?.forEach(nurse => {
          if (nurseAssignments[nurse.name]) {
            nurseAssignments[nurse.name].offDutyDays++;
          }
        });
      }
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