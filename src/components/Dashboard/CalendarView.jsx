// src/components/Dashboard/CalendarView.jsx
import React from 'react';
import { useRoster } from '../../hooks/useRoster';
import { getDaysInMonth } from '../../utils/dateUtils';

const CalendarView = ({ selectedMonth, selectedYear, rosterConfig }) => {
  const { getCurrentMonthRoster } = useRoster();
  const monthRoster = getCurrentMonthRoster();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  
  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '10px' }}></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = monthRoster[day];
    const morningCount = dayData?.morning?.length || 0;
    const nightCount = dayData?.night?.length || 0;
    const hasIssues = morningCount < rosterConfig.morningShiftSize || nightCount < rosterConfig.nightShiftSize;
    
    days.push(
      <div key={day} style={{ 
        border: '1px solid #e5e7eb',
        padding: '8px',
        minHeight: '80px',
        backgroundColor: hasIssues ? '#fef2f2' : '#f9fafb'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
        {dayData && (
          <div style={{ fontSize: '12px' }}>
            <div style={{ color: morningCount < rosterConfig.morningShiftSize ? '#ef4444' : '#3b82f6' }}>
              M: {morningCount}/{rosterConfig.morningShiftSize}
            </div>
            <div style={{ color: nightCount < rosterConfig.nightShiftSize ? '#ef4444' : '#8b5cf6' }}>
              N: {nightCount}/{rosterConfig.nightShiftSize}
            </div>
            <div style={{ color: '#6b7280' }}>Off: {dayData.offDuty?.length || 0}</div>
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
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Monthly Calendar</h3>
      <div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '2px', 
          marginBottom: '10px' 
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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