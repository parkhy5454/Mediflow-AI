// src/components/Layout/Navigation.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, Calendar, Settings, UserCheck, ShieldCheck, Repeat, Umbrella, CreditCard } from 'lucide-react';

// 개발자(운영자) 전용 탭을 노출하기 위한 기준 이메일 (서버의 ADMIN_EMAIL과 동일)
const ADMIN_EMAIL = 'parkhy5454@gmail.com';

const Navigation = ({ activeTab, setActiveTab, currentUser }) => {
  const { t } = useTranslation();
  const isDeveloperAccount = currentUser?.email === ADMIN_EMAIL;

  const tabs = [
    { id: 'dashboard', label: t('대시보드'), icon: BarChart3 },
    { id: 'nurses', label: t('간호사 관리'), icon: Users },
    { id: 'roster', label: t('근무표'), icon: Calendar },
    { id: 'swap-requests', label: t('근무 변경 요청'), icon: Repeat },
    { id: 'leave-requests', label: t('휴가 신청'), icon: Umbrella },
    { id: 'settings', label: t('근무표 설정'), icon: Settings },
    { id: 'members', label: t('회원 관리'), icon: UserCheck },
    ...(isDeveloperAccount ? [{ id: 'admin', label: t('운영자 대시보드'), icon: ShieldCheck }] : []),
    { id: 'subscription', label: t('구독 관리'), icon: CreditCard }
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>
      <div
        className="app-nav-tabs"
        style={{
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className="app-nav-tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;