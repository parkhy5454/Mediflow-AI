// // src/App.jsx
// import React, { useState } from 'react';
// import Header from './components/Layout/Header';
// import Navigation from './components/Layout/Navigation';
// import Dashboard from './components/Dashboard/Dashboard';
// import NurseManagement from './components/NurseManagement/NurseManagement';
// import RosterView from './components/Roster/RosterView';
// import Settings from './components/Settings/Settings';
// import { useNurses } from './hooks/useNurses';
// import { useRoster } from './hooks/useRoster';
// import { useRosterConfig } from './hooks/useRosterConfig';
// import Footer from './footer'

// const HospitalRosterSystem = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   // Custom hooks for state management
//   const {
//     nurses,
//     addNurse,
//     updateNurseStatus,
//     deleteNurse,
//     getActiveNurses,
//     getFilteredNurses
//   } = useNurses();

//   const {
//     roster,
//     generateBalancedRoster,
//     getCurrentMonthRoster,
//     getRosterStats,
//     generateNurseAssignmentChart
//   } = useRoster(nurses, selectedMonth, selectedYear);

//   const { rosterConfig, updateRosterConfig } = useRosterConfig();

//   const sharedProps = {
//     nurses,
//     activeNurses: getActiveNurses(),
//     roster,
//     selectedMonth,
//     selectedYear,
//     setSelectedMonth,
//     setSelectedYear,
//     rosterConfig
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
//       <Header activeNurses={getActiveNurses()} />
      
//       <Navigation 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//       />

//       <div>
//         {activeTab === 'dashboard' && (
//           <Dashboard 
//             {...sharedProps}
//             getRosterStats={getRosterStats}
//             generateNurseAssignmentChart={generateNurseAssignmentChart}
//           />
//         )}
        
//         {activeTab === 'nurses' && (
//           <NurseManagement 
//             nurses={nurses}
//             addNurse={addNurse}
//             updateNurseStatus={updateNurseStatus}
//             deleteNurse={deleteNurse}
//             getFilteredNurses={getFilteredNurses}
//           />
//         )}
        
//         {activeTab === 'roster' && (
//           <RosterView 
//             {...sharedProps}
//             generateBalancedRoster={() => generateBalancedRoster(rosterConfig)}
//             getCurrentMonthRoster={getCurrentMonthRoster}
//           />
//         )}
        
//         {activeTab === 'settings' && (
//           <Settings 
//             rosterConfig={rosterConfig}
//             updateRosterConfig={updateRosterConfig}
//           />
//         )}
//       </div>
//       <Footer/>
//     </div>
    
//   );
// };

// export default HospitalRosterSystem;



// src/App.jsx (Updated with Export Support)
import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import NurseManagement from './components/NurseManagement/NurseManagement';
import RosterView from './components/Roster/RosterView';
import Settings from './components/Settings/Settings';
import { useNurses } from './hooks/useNurses';
import { useRoster } from './hooks/useRoster';
import { useRosterConfig } from './hooks/useRosterConfig';

const HospitalRosterSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Custom hooks for state management
  const {
    nurses,
    addNurse,
    updateNurseStatus,
    deleteNurse,
    getActiveNurses,
    getFilteredNurses,
    updateNurses
  } = useNurses();

  const {
    roster,
    generateBalancedRoster,
    getCurrentMonthRoster,
    getRosterStats,
    generateNurseAssignmentChart
  } = useRoster(nurses, selectedMonth, selectedYear, updateNurses);

  const { rosterConfig, updateRosterConfig } = useRosterConfig();

  const sharedProps = {
    nurses,
    activeNurses: getActiveNurses(),
    roster,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    rosterConfig,
    getCurrentMonthRoster
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header activeNurses={getActiveNurses()} />
      
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div>
        {activeTab === 'dashboard' && (
          <Dashboard 
            {...sharedProps}
            getRosterStats={getRosterStats}
            generateNurseAssignmentChart={generateNurseAssignmentChart}
          />
        )}
        
        {activeTab === 'nurses' && (
          <NurseManagement 
            nurses={nurses}
            addNurse={addNurse}
            updateNurseStatus={updateNurseStatus}
            deleteNurse={deleteNurse}
            getFilteredNurses={getFilteredNurses}
          />
        )}
        
        {activeTab === 'roster' && (
          <RosterView 
            {...sharedProps}
            generateBalancedRoster={() => generateBalancedRoster(rosterConfig)}
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            rosterConfig={rosterConfig}
            updateRosterConfig={updateRosterConfig}
          />
        )}
      </div>
    </div>
  );
};

export default HospitalRosterSystem;