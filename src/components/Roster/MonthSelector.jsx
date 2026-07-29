// src/components/Roster/MonthSelector.jsx
import React from 'react';
import { getMonthName } from '../../utils/dateUtils';

const MonthSelector = ({ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      marginBottom: '20px', 
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        style={{
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>{getMonthName(i)}</option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        style={{
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() + i;
          return <option key={year} value={year}>{year}</option>;
        })}
      </select>
    </div>
  );
};

export default MonthSelector;

