// src/components/Roster/RosterTable.jsx
// [수정] 주간/야간 2컬럼 고정 → 4교대(D/E/N/M) + 비번 컬럼으로 동적 렌더링
import React from 'react';
import { getDaysInMonth } from '../../utils/dateUtils';
import { SHIFT_TYPES, shiftFullLabel } from '../../constants/shiftTypes';

// 교대별 배지 색상 (연한 배경 / 진한 글자)
const SHIFT_BADGE_STYLE = {
  D: { backgroundColor: '#fef3c7', color: '#92400e' },
  E: { backgroundColor: '#dbeafe', color: '#1e40af' },
  N: { backgroundColor: '#e0e7ff', color: '#5b21b6' },
  M: { backgroundColor: '#d1fae5', color: '#065f46' }
};

const RosterTable = ({ selectedMonth, selectedYear, getCurrentMonthRoster, rosterConfig }) => {
  const monthRoster = getCurrentMonthRoster();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : SHIFT_TYPES;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div className="scroll-container" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
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
              {shiftTypes.map(s => (
                <th key={s} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  {shiftFullLabel(s)}
                </th>
              ))}
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                비번 (OFF)
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
                  {shiftTypes.map(s => (
                    <td key={s} style={{ padding: '12px', verticalAlign: 'top' }}>
                      {dayData?.[s]?.map(nurse => (
                        <div key={nurse.id} style={{
                          ...SHIFT_BADGE_STYLE[s],
                          padding: '4px 8px',
                          margin: '2px 0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {nurse.name} ({nurse.qualification})
                        </div>
                      ))}
                    </td>
                  ))}
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
