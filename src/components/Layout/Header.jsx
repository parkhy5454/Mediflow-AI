// src/components/Layout/Header.jsx
import React from 'react';
import egwiapp from '../../images/egwiapp.jpg';

const Header = ({ activeNurses }) => {
  return (
    
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>

      <div style={{ textAlign: 'center', padding: '2px', backgroundColor: 'grey' }}>
      <img src={egwiapp} alt='egwiapp logo' style={{ height: '50px' }}/>
    </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '60px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937' 
        }}>
          Hospital Nurse Duties System
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Active Nurses: {activeNurses.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;

