// src/components/Roster/RosterTable.jsx
import React from 'react';
import { getDaysInMonth } from '../../utils/dateUtils';

const RosterTable = ({ selectedMonth, selectedYear, getCurrentMonthRoster, rosterConfig }) => {
  const monthRoster = getCurrentMonthRoster();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div className="scroll-container" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                borderBottom: '1px solid #e5e7eb', 
                position: 'sticky', 
                left: 0, 
                backgroundColor: '#f9fafb',
                zIndex: 10
              }}>
                날짜
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                주간 근무
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                야간 근무
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                비번
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = monthRoster[day];
              return (
                <tr key={day} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ 
                    padding: '12px', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'white',
                    borderRight: '1px solid #e5e7eb',
                    zIndex: 5
                  }}>
                    {day}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    {dayData?.morning?.map(nurse => (
                      <div key={nurse.id} style={{ 
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        margin: '2px 0',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {nurse.name} ({nurse.qualification})
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    {dayData?.night?.map(nurse => (
                      <div key={nurse.id} style={{ 
                        backgroundColor: '#e0e7ff',
                        color: '#5b21b6',
                        padding: '4px 8px',
                        margin: '2px 0',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {nurse.name} ({nurse.qualification})
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    {dayData?.offDuty?.map(nurse => (
                      <div key={nurse.id} style={{ 
                        backgroundColor: nurse.status === 'Available' ? '#dcfce7' : '#f3f4f6',
                        color: nurse.status === 'Available' ? '#166534' : '#374151',
                        padding: '4px 8px',
                        margin: '2px 0',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {nurse.name} {nurse.daysRemaining > 0 ? `(${nurse.daysRemaining}일)` : nurse.status === 'Available' ? '(근무 가능)' : ''}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RosterTable;


