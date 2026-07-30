// src/components/Dashboard/CalendarView.jsx
// [수정] 주간/야간 2칸 고정 → rosterConfig에 설정된 교대(D/E/N/M) 수만큼 동적으로 표시
import React from 'react';
import { useRoster } from '../../hooks/useRoster';
import { getDaysInMonth } from '../../utils/dateUtils';
import { SHIFT_TYPES, shiftLabel } from '../../constants/shiftTypes';

const CalendarView = ({ selectedMonth, selectedYear, rosterConfig }) => {
  const { getCurrentMonthRoster } = useRoster();
  const monthRoster = getCurrentMonthRoster();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : SHIFT_TYPES;

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '10px' }}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = monthRoster[day];
    const counts = shiftTypes.map(s => ({
      shiftType: s,
      count: dayData?.[s]?.length || 0,
      size: rosterConfig.shifts[s].size
    }));
    const hasIssues = counts.some(c => c.count < c.size);

    days.push(
      <div key={day} style={{
        border: '1px solid #e5e7eb',
        padding: '8px',
        minHeight: '80px',
        backgroundColor: hasIssues ? '#fef2f2' : '#f9fafb'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
        {dayData && (
          <div style={{ fontSize: '11px' }}>
            {counts.map(c => (
              <div key={c.shiftType} style={{ color: c.count < c.size ? '#ef4444' : '#374151' }}>
                {shiftLabel(c.shiftType)}: {c.count}/{c.size}
              </div>
            ))}
            <div style={{ color: '#6b7280' }}>휴무: {dayData.offDuty?.length || 0}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>월간 캘린더</h3>
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '10px'
        }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} style={{
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f3f4f6'
            }}>
              {day}
            </div>
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px'
        }}>
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
