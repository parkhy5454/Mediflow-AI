// // src/components/Roster/RosterView.jsx
// import React from 'react';
// import { Calendar } from 'lucide-react';
// import MonthSelector from './MonthSelector';
// import RosterTable from './RosterTable';

// const RosterView = ({ 
//   selectedMonth, 
//   selectedYear, 
//   setSelectedMonth, 
//   setSelectedYear,
//   generateBalancedRoster,
//   getCurrentMonthRoster,
//   rosterConfig
// }) => {
//   const handleGenerateRoster = () => {
//     const result = generateBalancedRoster();
//     if (result && result.message) {
//       alert(result.message);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: '20px',
//         flexWrap: 'wrap',
//         gap: '10px'
//       }}>
//         <h2 style={{ color: '#1f2937' }}>
//           Roster - {['January', 'February', 'March', 'April', 'May', 'June',
//                     'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
//         </h2>
//         <button 
//           onClick={handleGenerateRoster}
//           style={{
//             backgroundColor: '#10b981',
//             color: 'white',
//             padding: '10px 20px',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px'
//           }}
//         >
//           <Calendar size={18} />
//           Generate Roster
//         </button>
//       </div>

//       <MonthSelector 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         setSelectedMonth={setSelectedMonth}
//         setSelectedYear={setSelectedYear}
//       />

//       <RosterTable 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         getCurrentMonthRoster={getCurrentMonthRoster}
//         rosterConfig={rosterConfig}
//       />
//     </div>
//   );
// };

// export default RosterView;


// // src/components/Roster/RosterView.jsx (Updated)
// import React from 'react';
// import { Calendar } from 'lucide-react';
// import MonthSelector from './MonthSelector';
// import RosterTable from './RosterTable';
// import ExportButtons from './ExportButtons';
// import { getMonthName } from '../../utils/dateUtils';

// const RosterView = ({ 
//   selectedMonth, 
//   selectedYear, 
//   setSelectedMonth, 
//   setSelectedYear,
//   generateBalancedRoster,
//   getCurrentMonthRoster,
//   rosterConfig,
//   nurses
// }) => {
//   const monthRoster = getCurrentMonthRoster();
//   const hasRosterData = Object.keys(monthRoster).length > 0;

//   const handleGenerateRoster = () => {
//     const result = generateBalancedRoster();
//     if (result && result.message) {
//       alert(result.message);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: '20px',
//         flexWrap: 'wrap',
//         gap: '15px'
//       }}>
//         <h2 style={{ color: '#1f2937', margin: 0 }}>
//           Roster - {getMonthName(selectedMonth)} {selectedYear}
//         </h2>
        
//         <div style={{ 
//           display: 'flex', 
//           gap: '10px', 
//           alignItems: 'center',
//           flexWrap: 'wrap'
//         }}>
//           <button 
//             onClick={handleGenerateRoster}
//             style={{
//               backgroundColor: '#10b981',
//               color: 'white',
//               padding: '10px 20px',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             <Calendar size={18} />
//             Generate Roster
//           </button>
//         </div>
//       </div>

//       {/* Month/Year Selector */}
//       <MonthSelector 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         setSelectedMonth={setSelectedMonth}
//         setSelectedYear={setSelectedYear}
//       />

//       {/* Export Buttons - Show only when roster data exists */}
//       {hasRosterData && (
//         <div style={{ 
//           marginBottom: '20px',
//           padding: '15px',
//           backgroundColor: 'white',
//           borderRadius: '8px',
//           border: '1px solid #e5e7eb'
//         }}>
//           <ExportButtons
//             monthRoster={monthRoster}
//             selectedMonth={selectedMonth}
//             selectedYear={selectedYear}
//             rosterConfig={rosterConfig}
//             nurses={nurses}
//             disabled={!hasRosterData}
//           />
//         </div>
//       )}

//       {/* Roster Status Info */}
//       <div style={{ 
//         marginBottom: '20px',
//         padding: '12px 16px',
//         backgroundColor: hasRosterData ? '#f0f9ff' : '#fef3c7',
//         borderRadius: '6px',
//         border: `1px solid ${hasRosterData ? '#bfdbfe' : '#fcd34d'}`,
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px'
//       }}>
//         <div style={{ 
//           width: '8px', 
//           height: '8px', 
//           borderRadius: '50%', 
//           backgroundColor: hasRosterData ? '#3b82f6' : '#f59e0b' 
//         }}></div>
//         <span style={{ 
//           fontSize: '14px', 
//           color: hasRosterData ? '#1e40af' : '#92400e',
//           fontWeight: '500'
//         }}>
//           {hasRosterData 
//             ? `Roster generated for ${getMonthName(selectedMonth)} ${selectedYear}. You can export it now.`
//             : `No roster generated for ${getMonthName(selectedMonth)} ${selectedYear}. Click "Generate Roster" to create one.`
//           }
//         </span>
//       </div>

//       {/* Roster Table */}
//       <RosterTable 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         getCurrentMonthRoster={getCurrentMonthRoster}
//         rosterConfig={rosterConfig}
//       />
//     </div>
//   );
// };

// export default RosterView;

// src/components/Roster/RosterView.jsx (Updated with Cycle Continuity)
import React from 'react';
import { Calendar, Info } from 'lucide-react';
import MonthSelector from './MonthSelector';
import RosterTable from './RosterTable';
import ExportButtons from './ExportButtons';
import CycleContinuityDisplay from './CycleContinuityDisplay';
import { getMonthName } from '../../utils/dateUtils';
import { shiftLabel } from '../../constants/shiftTypes';

const RosterView = ({ 
  selectedMonth, 
  selectedYear, 
  setSelectedMonth, 
  setSelectedYear,
  generateBalancedRoster,
  getCurrentMonthRoster,
  rosterConfig,
  nurses
}) => {
  const monthRoster = getCurrentMonthRoster();
  const hasRosterData = Object.keys(monthRoster).length > 0;

  const handleGenerateRoster = () => {
    const result = generateBalancedRoster();
    if (result && result.message) {
      // Enhanced alert with continuity information
      let alertMessage = result.message;
      
      if (result.continuityInfo && result.continuityInfo.nursesInTransition > 0) {
        alertMessage += `\n\n🔄 근무 주기 연속성: 간호사 ${result.continuityInfo.nursesInTransition}명이 현재 근무 주기를 다음 달로 이어서 계속합니다.`;
      }
      
      alert(alertMessage);
    }
  };

  const handleMonthChange = (newMonth, newYear) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Check if switching to a future month
    const isNextMonth = (newYear > currentYear) || 
                       (newYear === currentYear && newMonth > currentMonth);
    
    if (isNextMonth) {
      const activeNurses = nurses.filter(n => n.status === 'active');
      const nursesInTransition = activeNurses.filter(nurse => 
        nurse.lastOffDutyRemaining > 0 || 
        (nurse.lastShiftCycleDay > 0 && nurse.lastOffDutyRemaining === 0)
      );
      
      if (nursesInTransition.length > 0) {
        const confirmMessage = `${getMonthName(newMonth)} ${newYear}년으로 전환합니다.\n\n` +
          `${nursesInTransition.length}명의 간호사가 이전 달의 근무 주기를 완료하지 못했습니다:\n` +
          nursesInTransition.map(n => {
            if (n.lastOffDutyRemaining > 0) {
              return `• ${n.name}: 휴무 ${n.lastOffDutyRemaining}일 남음`;
            } else {
              const shiftCfg = rosterConfig.shifts[n.lastShiftType];
              const totalDays = shiftCfg ? shiftCfg.shiftDays : 0;
              const remaining = totalDays - n.lastShiftCycleDay;
              return `• ${n.name}: ${shiftLabel(n.lastShiftType)} 근무 ${remaining}일 남음`;
            }
          }).join('\n') +
          `\n\n이 간호사들은 새로운 배정 전에 현재 주기를 완료합니다. 계속하시겠습니까?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
    }
    
    if (newMonth !== selectedMonth) setSelectedMonth(newMonth);
    if (newYear !== selectedYear) setSelectedYear(newYear);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ color: '#1f2937', margin: 0 }}>
          근무표 - {selectedYear}년 {getMonthName(selectedMonth)}
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleGenerateRoster}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Calendar size={18} />
            근무표 생성
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div style={{ marginBottom: '20px' }}>
        <MonthSelector 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedMonth={(month) => handleMonthChange(month, selectedYear)}
          setSelectedYear={(year) => handleMonthChange(selectedMonth, year)}
        />
      </div>

      {/* Cycle Continuity Display - Show for future months */}
      {(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const isNextMonth = (selectedYear > currentYear) || 
                           (selectedYear === currentYear && selectedMonth > currentMonth);
        
        return isNextMonth && (
          <CycleContinuityDisplay 
            nurses={nurses}
            rosterConfig={rosterConfig}
          />
        );
      })()}

      {/* Export Buttons - Show only when roster data exists */}
      {hasRosterData && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <ExportButtons
            monthRoster={monthRoster}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            rosterConfig={rosterConfig}
            nurses={nurses}
            disabled={!hasRosterData}
          />
        </div>
      )}

      {/* Roster Status Info */}
      <div style={{ 
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: hasRosterData ? '#f0f9ff' : '#fef3c7',
        borderRadius: '6px',
        border: `1px solid ${hasRosterData ? '#bfdbfe' : '#fcd34d'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: hasRosterData ? '#3b82f6' : '#f59e0b',
          marginTop: '6px',
          flexShrink: 0
        }}></div>
        <div>
          <span style={{ 
            fontSize: '14px', 
            color: hasRosterData ? '#1e40af' : '#92400e',
            fontWeight: '500',
            display: 'block'
          }}>
            {hasRosterData 
              ? `${selectedYear}년 ${getMonthName(selectedMonth)} 근무표가 생성되었습니다`
              : `${selectedYear}년 ${getMonthName(selectedMonth)} 근무표가 아직 생성되지 않았습니다`
            }
          </span>
          {hasRosterData ? (
            <span style={{ 
              fontSize: '12px', 
              color: '#6366f1',
              marginTop: '4px',
              display: 'block'
            }}>
              ✅ 이 근무표를 내보내거나, 새로 생성해서 업데이트할 수 있습니다.
            </span>
          ) : (
            <span style={{ 
              fontSize: '12px', 
              color: '#d97706',
              marginTop: '4px',
              display: 'block'
            }}>
              "근무표 생성" 버튼을 눌러 근무 주기 연속성을 반영한 근무표를 만드세요.
            </span>
          )}
        </div>
        {hasRosterData && (
          <Info size={16} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
        )}
      </div>

      {/* Important Notice for Cycle Continuity */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0,
            marginTop: '1px'
          }}>
            i
          </div>
          <div style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: '1.4' }}>
            <strong>근무 주기 연속성 기능:</strong> 미래 달의 근무표를 생성할 때, 
            간호사는 새로운 근무를 배정받기 전에 현재 진행 중인 근무 주기(데이/이브닝/나이트/미들 근무, 휴무 기간)를 자동으로 완료합니다. 
            이를 통해 적절한 휴식 기간을 보장하고 일과 삶의 균형을 유지합니다.
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <RosterTable 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        getCurrentMonthRoster={getCurrentMonthRoster}
        rosterConfig={rosterConfig}
      />
    </div>
  );
};

export default RosterView;