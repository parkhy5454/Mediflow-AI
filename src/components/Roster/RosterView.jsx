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
import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import MonthSelector from './MonthSelector';
import RosterTable from './RosterTable';
import ExportButtons from './ExportButtons';
import CycleContinuityDisplay from './CycleContinuityDisplay';
import RosterResultModal from './RosterResultModal';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { getMonthName, getDaysInMonth } from '../../utils/dateUtils';
import { shiftLabel } from '../../constants/shiftTypes';

const RosterView = ({ 
  selectedMonth, 
  selectedYear, 
  setSelectedMonth, 
  setSelectedYear,
  generateBalancedRoster,
  getCurrentMonthRoster,
  rosterConfig,
  nurses,
  clearRoster,
  currentUser
}) => {
  const monthRoster = getCurrentMonthRoster();
  const hasRosterData = Object.keys(monthRoster).length > 0;
  // [수정] alert() 대신 예쁜 모달로 근무표 생성 결과를 보여주기 위한 상태
  const [rosterResult, setRosterResult] = useState(null);

  // [추가] 승인된 휴가를 근무표 생성에 반영하기 위해 조회. 관리자는 병원 전체 신청이 다 보인다.
  const { requests: leaveRequests } = useLeaveRequests(currentUser);

  // [추가] 예전(간호사 명단이 바뀌기 전) 근무표를 지우는 기능. 되돌릴 수 없어 확인창을 띄운다.
  const handleClearRoster = () => {
    const confirmed = window.confirm(
      `${selectedYear}년 ${getMonthName(selectedMonth)} 근무표를 초기화하시겠습니까?\n\n저장된 근무표 데이터가 완전히 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
    );
    if (confirmed && clearRoster) {
      clearRoster();
    }
  };

  const handleGenerateRoster = () => {
    // 이번에 생성하는 달과 겹치는 "승인됨" 휴가만 추려서 함께 반영한다.
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const pad = (n) => String(n).padStart(2, '0');
    const monthStart = `${selectedYear}-${pad(selectedMonth + 1)}-01`;
    const monthEnd = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(daysInMonth)}`;
    const approvedLeaves = (leaveRequests || [])
      .filter(r => r.status === 'approved' && r.nurseId && r.startDate <= monthEnd && r.endDate >= monthStart);

    const result = generateBalancedRoster(approvedLeaves);
    if (result && result.message) {
      setRosterResult(result);
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
          {hasRosterData && (
            <button
              onClick={handleClearRoster}
              style={{
                backgroundColor: 'white',
                color: '#dc2626',
                padding: '10px 20px',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              title="이번 달 저장된 근무표 데이터를 삭제합니다"
            >
              근무표 초기화
            </button>
          )}
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

      {rosterResult && (
        <RosterResultModal result={rosterResult} onClose={() => setRosterResult(null)} />
      )}
    </div>
  );
};

export default RosterView;