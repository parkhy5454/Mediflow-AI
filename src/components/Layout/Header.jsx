// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import ProfileEditModal from './ProfileEditModal';

const Header = ({ activeNurses, currentUser, onLogout, onUserUpdate }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>

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
            {currentUser?.hospitalName ? `${currentUser.hospitalName} 간호사 근무 관리 시스템` : '병원 간호사 근무 관리 시스템'}
          </h1>
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
                onClick={() => setShowProfileModal(true)}
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
                내 정보
              </button>
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

      {showProfileModal && (
        <ProfileEditModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSaved={(updatedUser) => onUserUpdate && onUserUpdate(updatedUser)}
        />
      )}
    </div>
  );
};

export default Header;

