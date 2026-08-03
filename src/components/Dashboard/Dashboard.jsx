// // src/components/Dashboard/Dashboard.jsx
// import React from 'react';
// import StatsCards from './StatsCards';
// import AssignmentChart from './AssignmentChart';
// import CalendarView from './CalendarView';
// import { getMonthName } from '../../utils/dateUtils';

// const Dashboard = ({ 
//   nurses, 
//   activeNurses, 
//   selectedMonth, 
//   selectedYear, 
//   getRosterStats, 
//   generateNurseAssignmentChart,
//   rosterConfig
// }) => {
//   const stats = getRosterStats();
//   const assignmentData = generateNurseAssignmentChart();

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
//         Dashboard - {getMonthName(selectedMonth)} {selectedYear}
//       </h2>
      
//       <StatsCards 
//         nurses={nurses}
//         activeNurses={activeNurses}
//         stats={stats}
//       />

//       <AssignmentChart assignmentData={assignmentData} />

//       <CalendarView 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         rosterConfig={rosterConfig}
//       />
//     </div>
//   );
// };

// export default Dashboard;


// src/components/Dashboard/Dashboard.jsx (Updated with Export)
// import React from 'react';
// import StatsCards from './StatsCards';
// import AssignmentChart from './AssignmentChart';
// import CalendarView from './CalendarView';
// import ExportButtons from '../Roster/ExportButtons';
// import { getMonthName } from '../../utils/dateUtils';
// import Footer from '../../footer';

// const Dashboard = ({ 
//   nurses, 
//   activeNurses, 
//   selectedMonth, 
//   selectedYear, 
//   getRosterStats, 
//   generateNurseAssignmentChart,
//   rosterConfig,
//   getCurrentMonthRoster
// }) => {
//   const stats = getRosterStats();
//   const assignmentData = generateNurseAssignmentChart();
//   const monthRoster = getCurrentMonthRoster();
//   const hasRosterData = Object.keys(monthRoster).length > 0;

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
//           Dashboard - {getMonthName(selectedMonth)} {selectedYear}
//         </h2>
        
//         {/* Quick Export from Dashboard */}
//         {hasRosterData && (
//           <div style={{ 
//             padding: '10px 15px',
//             backgroundColor: 'white',
//             borderRadius: '8px',
//             border: '1px solid #e5e7eb'
//           }}>
//             <ExportButtons
//               monthRoster={monthRoster}
//               selectedMonth={selectedMonth}
//               selectedYear={selectedYear}
//               rosterConfig={rosterConfig}
//               nurses={nurses}
//               disabled={!hasRosterData}
//             />
//           </div>
//         )}
//       </div>
      
//       <StatsCards 
//         nurses={nurses}
//         activeNurses={activeNurses}
//         stats={stats}
//       />

//       <AssignmentChart assignmentData={assignmentData} />

//       <CalendarView 
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         rosterConfig={rosterConfig}
//         getCurrentMonthRoster={getCurrentMonthRoster}
//       />
//       <Footer/>
//     </div>
    
//   );
// };

// export default Dashboard;


// src/components/Dashboard/Dashboard.jsx (Updated with Balance Analysis)
import React from 'react';
import StatsCards from './StatsCards';
import AssignmentChart from './AssignmentChart';
import BalanceAnalysis from './BalanceAnalysis';
import CalendarView from './CalendarView';
import ExportButtons from '../Roster/ExportButtons';
import { getMonthName } from '../../utils/dateUtils';
import Footer from '../../footer';

const Dashboard = ({ 
  nurses, 
  activeNurses, 
  selectedMonth, 
  selectedYear, 
  getRosterStats, 
  generateNurseAssignmentChart,
  rosterConfig,
  getCurrentMonthRoster,
  departmentOptions,
  selectedDepartment,
  setSelectedDepartment
}) => {
  // [추가] 대시보드 통계도 병원 전체가 아니라 현재 선택된 부서(병동) 기준으로 보여준다.
  // (근무표/근무표 설정 탭과 같은 selectedDepartment를 공유한다)
  const deptNurses = nurses.filter(n => (n.department || '') === selectedDepartment);
  const deptActiveNurses = activeNurses.filter(n => (n.department || '') === selectedDepartment);

  const stats = getRosterStats();
  const assignmentData = generateNurseAssignmentChart();
  const monthRoster = getCurrentMonthRoster();
  const hasRosterData = Object.keys(monthRoster).length > 0;

  return (
    <div style={{ padding: '20px' }}>
      {departmentOptions && departmentOptions.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginRight: '8px' }}>
            부서(병동)
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
              fontSize: '14px', fontWeight: '600', color: '#1f2937', backgroundColor: 'white'
            }}
          >
            {departmentOptions.map(dept => (
              <option key={dept || '_unset'} value={dept}>{dept || '미지정'}</option>
            ))}
          </select>
        </div>
      )}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ color: '#1f2937', margin: 0 }}>
          대시보드 - {selectedYear}년 {getMonthName(selectedMonth)}
        </h2>
        
        {/* Quick Export from Dashboard */}
        {hasRosterData && (
          <div style={{ 
            padding: '10px 15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <ExportButtons
              monthRoster={monthRoster}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              rosterConfig={rosterConfig}
              nurses={deptNurses}
              disabled={!hasRosterData}
            />
          </div>
        )}
      </div>
      
      <StatsCards 
        nurses={deptNurses}
        activeNurses={deptActiveNurses}
        stats={stats}
      />

      {/* Balance Analysis - NEW */}
      <BalanceAnalysis 
        nurses={deptNurses}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        rosterConfig={rosterConfig}
      />

      <AssignmentChart assignmentData={assignmentData} rosterConfig={rosterConfig} />

      <CalendarView 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        rosterConfig={rosterConfig}
        getCurrentMonthRoster={getCurrentMonthRoster}
      />
    <Footer/>
     </div>
  );
};

export default Dashboard;