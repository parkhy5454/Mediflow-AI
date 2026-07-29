
// import React from 'react';
// import ReactDOM from 'react-dom/client'; // ← updated
// import App from './App';
// import { NurseProvider } from './context/NurseContext';
// import { RosterProvider } from './context/RosterContext';

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//   <React.StrictMode>
//     <NurseProvider>
//       <RosterProvider>
//         <App />
//       </RosterProvider>
//     </NurseProvider>
//   </React.StrictMode>
// );


// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)