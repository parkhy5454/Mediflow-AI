import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

const StatsCards = ({ nurses, activeNurses, stats }) => {
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
    {
      title: '주간 근무',
      value: stats.totalMorningAssignments,
      icon: Clock,
      color: '#f59e0b'
    },
    {
      title: '야간 근무',
      value: stats.totalNightAssignments,
      icon: Clock,
      color: '#8b5cf6'
    }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
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