// src/components/Layout/Navigation.jsx
import React from 'react';
import { BarChart3, Users, Calendar, Settings } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'nurses', label: '간호사 관리', icon: Users },
    { id: 'roster', label: '근무표', icon: Calendar },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px'
    }}>
      <div style={{ display: 'flex', gap: '0' }}>
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
                fontWeight: '500'
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