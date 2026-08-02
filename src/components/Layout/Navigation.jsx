// src/components/Layout/Navigation.jsx
import React from 'react';
import { BarChart3, Users, Calendar, Settings, UserCheck, ShieldCheck, Repeat, Umbrella, CreditCard } from 'lucide-react';

// 개발자(운영자) 전용 탭을 노출하기 위한 기준 이메일 (서버의 ADMIN_EMAIL과 동일)
const ADMIN_EMAIL = 'parkhy5454@gmail.com';

const Navigation = ({ activeTab, setActiveTab, currentUser }) => {
  const isDeveloperAccount = currentUser?.email === ADMIN_EMAIL;

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'nurses', label: '간호사 관리', icon: Users },
    { id: 'roster', label: '근무표', icon: Calendar },
    { id: 'swap-requests', label: '근무 변경 요청', icon: Repeat },
    { id: 'leave-requests', label: '휴가 신청', icon: Umbrella },
    { id: 'settings', label: '근무표 설정', icon: Settings },
    { id: 'members', label: '회원 관리', icon: UserCheck },
    { id: 'subscription', label: '구독 관리', icon: CreditCard },
    ...(isDeveloperAccount ? [{ id: 'admin', label: '운영자 대시보드', icon: ShieldCheck }] : [])
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>
      <div
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