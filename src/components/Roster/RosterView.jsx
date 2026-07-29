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
        alertMessage += `\n\n🔄 CYCLE CONTINUITY: ${result.continuityInfo.nursesInTransition} nurse(s) will continue their current work cycles into next month.`;
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
        const confirmMessage = `You're switching to ${getMonthName(newMonth)} ${newYear}.\n\n` +
          `${nursesInTransition.length} nurse(s) have incomplete cycles from the previous month:\n` +
          nursesInTransition.map(n => {
            if (n.lastOffDutyRemaining > 0) {
              return `• ${n.name}: ${n.lastOffDutyRemaining} off-duty day(s) remaining`;
            } else {
              const totalDays = n.lastShiftType === 'morning' ? rosterConfig.morningShiftDays : rosterConfig.nightShiftDays;
              const remaining = totalDays - n.lastShiftCycleDay;
              return `• ${n.name}: ${remaining} ${n.lastShiftType} shift day(s) remaining`;
            }
          }).join('\n') +
          `\n\nThese nurses will complete their cycles before new assignments. Continue?`;
        
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
          Roster - {getMonthName(selectedMonth)} {selectedYear}
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
            Generate Roster
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
              ? `Roster generated for ${getMonthName(selectedMonth)} ${selectedYear}`
              : `No roster generated for ${getMonthName(selectedMonth)} ${selectedYear}`
            }
          </span>
          {hasRosterData ? (
            <span style={{ 
              fontSize: '12px', 
              color: '#6366f1',
              marginTop: '4px',
              display: 'block'
            }}>
              ✅ You can export this roster or generate a new one to update it.
            </span>
          ) : (
            <span style={{ 
              fontSize: '12px', 
              color: '#d97706',
              marginTop: '4px',
              display: 'block'
            }}>
              Click "Generate Roster" to create a schedule with proper cycle continuity.
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
            <strong>Cycle Continuity Feature:</strong> When generating rosters for future months, 
            nurses will automatically complete their current work cycles (morning shifts, night shifts, or off-duty periods) 
            before being assigned new duties. This ensures proper rest periods and maintains work-life balance.
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