// src/components/Layout/Header.jsx
import React from 'react';
import egwiapp from '../../images/egwiapp.jpg';

const Header = ({ activeNurses, currentUser, onLogout }) => {
  return (
    
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>

      <div style={{ textAlign: 'center', padding: '2px', backgroundColor: 'grey' }}>
      <img src={egwiapp} alt='egwiapp 로고' style={{ height: '50px' }}/>
    </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '60px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937' 
          }}>
            병원 간호사 근무 관리 시스템
          </h1>
          {currentUser?.hospitalName && (
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {currentUser.hospitalName}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            근무 중인 간호사: {activeNurses.length}명
          </span>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>
                {currentUser.name}
                {currentUser.role === 'admin' && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    관리자
                  </span>
                )}
              </span>
              <button
                onClick={onLogout}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

