// src/components/Dashboard/CalendarView.jsx
// [수정] 주간/야간 2칸 고정 → rosterConfig에 설정된 교대(D/E/N/M) 수만큼 동적으로 표시
// [수정] 이름이 많을 때 축약 표시 + 클릭 시 전체 펼쳐보기
import React, { useState } from 'react';
import { getDaysInMonth } from '../../utils/dateUtils';
import { SHIFT_TYPES, shiftLabel, shiftColor } from '../../constants/shiftTypes';

const NAME_PREVIEW_COUNT = 3; // 기본으로 몇 명까지 보여줄지

// 교대 한 줄(데이/이브닝/... 또는 휴무)을 담당하는 컴포넌트.
// 이름이 NAME_PREVIEW_COUNT를 넘으면 "+N명"으로 축약하고, 클릭하면 전체를 펼친다.
const NameLine = ({ label, count, size, names, color, isIssue }) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = names.length > NAME_PREVIEW_COUNT;
  const visibleNames = expanded || !hasMore ? names : names.slice(0, NAME_PREVIEW_COUNT);

  return (
    <div
      onClick={() => hasMore && setExpanded(prev => !prev)}
      style={{
        color: isIssue ? '#ef4444' : '#374151',
        marginBottom: '2px',
        lineHeight: '1.4',
        wordBreak: 'keep-all',
        cursor: hasMore ? 'pointer' : 'default'
      }}
      title={hasMore ? (expanded ? '클릭하여 접기' : `클릭하여 전체 ${names.length}명 보기`) : names.join(', ')}
    >
      {color && (
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '4px'
          }}
        />
      )}
      <span style={{ fontWeight: 600 }}>
        {label} {size !== undefined ? `(${count}/${size})` : `(${count})`}
      </span>
      {visibleNames.length > 0 && (
        <span style={{ color: '#6b7280' }}> {visibleNames.join(', ')}</span>
      )}
      {hasMore && (
        <span style={{ color: '#2563eb', fontWeight: 600 }}>
          {' '}
          {expanded ? '접기 ▲' : `+${names.length - NAME_PREVIEW_COUNT}명 더보기`}
        </span>
      )}
    </div>
  );
};

const CalendarView = ({ selectedMonth, selectedYear, rosterConfig, getCurrentMonthRoster }) => {
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
    // 배열 원소가 문자열(이름) 또는 {id, name} 객체 둘 다 대응
    const getName = (entry) => (typeof entry === 'string' ? entry : entry?.name || '');
    const counts = shiftTypes.map(s => {
      const nurses = dayData?.[s] || [];
      return {
        shiftType: s,
        count: nurses.length,
        size: rosterConfig.shifts[s].size,
        names: nurses.map(getName).filter(Boolean)
      };
    });
    const hasIssues = counts.some(c => c.count < c.size);
    const offDutyNames = (dayData?.offDuty || []).map(getName).filter(Boolean);

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
              <NameLine
                key={c.shiftType}
                label={shiftLabel(c.shiftType)}
                count={c.count}
                size={c.size}
                names={c.names}
                color={shiftColor(c.shiftType)}
                isIssue={c.count < c.size}
              />
            ))}
            <NameLine
              label="휴무"
              count={dayData.offDuty?.length || 0}
              names={offDutyNames}
              isIssue={false}
            />
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
