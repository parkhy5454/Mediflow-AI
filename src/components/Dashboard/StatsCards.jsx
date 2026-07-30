// src/components/Dashboard/StatsCards.jsx
// [수정] "주간 근무/야간 근무" 고정 카드 → stats.totalsByShift에 있는 교대 종류(D/E/N/M)만큼 동적 카드 생성
import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';
import { SHIFT_TYPES, shiftLabel, shiftColor } from '../../constants/shiftTypes';

const StatsCards = ({ nurses, activeNurses, stats }) => {
  const totalsByShift = stats?.totalsByShift || {};
  const shiftKeys = Object.keys(totalsByShift).length > 0 ? Object.keys(totalsByShift) : SHIFT_TYPES;

  const statsConfig = [
    {
      title: '전체 간호사',
      value: nurses.length,
      icon: Users,
      color: '#3b82f6'
    },
    {
      title: '근무 가능 간호사',
      value: activeNurses.length,
      icon: CheckCircle,
      color: '#10b981'
    },
    ...shiftKeys.map(s => ({
      title: `${shiftLabel(s)} 근무`,
      value: totalsByShift[s] || 0,
      icon: Clock,
      color: shiftColor(s)
    }))
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            style={{ 
              backgroundColor: stat.color, 
              color: 'white', 
              padding: '20px', 
              borderRadius: '8px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</div>
                <div>{stat.title}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
