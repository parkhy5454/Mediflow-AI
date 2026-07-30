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
  getCurrentMonthRoster
}) => {
  const stats = getRosterStats();
  const assignmentData = generateNurseAssignmentChart();
  const monthRoster = getCurrentMonthRoster();
  const hasRosterData = Object.keys(monthRoster).length > 0;

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
              nurses={nurses}
              disabled={!hasRosterData}
            />
          </div>
        )}
      </div>
      
      <StatsCards 
        nurses={nurses}
        activeNurses={activeNurses}
        stats={stats}
      />

      {/* Balance Analysis - NEW */}
      <BalanceAnalysis 
        nurses={nurses}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      <AssignmentChart assignmentData={assignmentData} />

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