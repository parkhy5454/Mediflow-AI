// src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { isPushSupported, isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';

const Header = ({ activeNurses, currentUser, onLogout, onUserUpdate }) => {
  const { t } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const pushSupported = isPushSupported();

  useEffect(() => {
    if (!currentUser || !pushSupported) return;
    isPushSubscribed().then(setPushOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleTogglePush = async () => {
    if (!currentUser?.token || pushLoading) return;
    setPushLoading(true);
    try {
      if (pushOn) {
        await unsubscribeFromPush(currentUser.token);
        setPushOn(false);
      } else {
        await subscribeToPush(currentUser.token);
        setPushOn(true);
      }
    } catch (err) {
      alert(err.message || t('알림 설정 중 오류가 발생했습니다.'));
    } finally {
      setPushLoading(false);
    }
  };

  return (
    
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>

      <div className="app-header-row" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '60px',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 0'
      }}>
        <div className="app-header-title" style={{ minWidth: 0 }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            overflowWrap: 'anywhere'
          }}>
            {currentUser?.hospitalName ? `${currentUser.hospitalName} ${t('간호사 근무 관리 시스템')}` : t('병원 간호사 근무 관리 시스템')}
          </h1>
        </div>
        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span className="app-header-stats" style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
            {t('근무 중인 간호사: {{count}}명', { count: activeNurses.length })}
          </span>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
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
                    {t('관리자')}
                  </span>
                )}
              </span>
              {pushSupported && (
                <button
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  title={pushOn ? t('알림 끄기') : t('알림 받기')}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: pushOn ? '#eff6ff' : 'white',
                    color: pushOn ? '#2563eb' : '#374151',
                    cursor: pushLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    opacity: pushLoading ? 0.6 : 1
                  }}
                >
                  {pushLoading ? (
                    <Loader2 size={14} className="spin" />
                  ) : pushOn ? (
                    <Bell size={14} />
                  ) : (
                    <BellOff size={14} />
                  )}
                </button>
              )}
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('내 정보')}
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
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('로그아웃')}
              </button>
            </div>
          )}
          <LanguageSwitcher />
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

