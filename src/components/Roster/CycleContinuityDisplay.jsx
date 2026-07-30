// src/components/Roster/CycleContinuityDisplay.jsx
import React from 'react';
import { Clock, UserCheck, UserX, Users } from 'lucide-react';

const CycleContinuityDisplay = ({ nurses, rosterConfig }) => {
  // Analyze nurse states for next month
  const nursesInTransition = nurses.filter(nurse => 
    nurse.status === 'active' && (
      nurse.lastOffDutyRemaining > 0 || 
      (nurse.lastShiftCycleDay > 0 && nurse.lastShiftCycleDay < 
        (nurse.lastShiftType === 'morning' ? rosterConfig.morningShiftDays : rosterConfig.nightShiftDays))
    )
  );

  const nursesOffDuty = nurses.filter(nurse => 
    nurse.status === 'active' && nurse.lastOffDutyRemaining > 0
  );

  const nursesInShiftCycle = nurses.filter(nurse => 
    nurse.status === 'active' && nurse.lastShiftCycleDay > 0 && nurse.lastOffDutyRemaining === 0
  );

  const nursesAvailable = nurses.filter(nurse => 
    nurse.status === 'active' && nurse.lastOffDutyRemaining === 0 && nurse.lastShiftCycleDay === 0
  );

  if (nursesInTransition.length === 0) {
    return (
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <UserCheck size={20} style={{ color: '#0ea5e9' }} />
          <h3 style={{ margin: 0, color: '#0c4a6e', fontSize: '16px' }}>월 전환 상태</h3>
        </div>
        <p style={{ margin: 0, color: '#0369a1' }}>
          ✅ 다음 달 시작 시 모든 간호사가 근무 가능합니다. 근무 주기 연속성 처리가 필요 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fffbeb',
      border: '1px solid #fcd34d',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <Clock size={20} style={{ color: '#d97706' }} />
        <h3 style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>월 전환 - 근무 주기 연속성</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {/* Nurses Off-Duty */}
        {nursesOffDuty.length > 0 && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <UserX size={16} style={{ color: '#d97706' }} />
              <strong style={{ color: '#92400e', fontSize: '14px' }}>
                휴무 계속 ({nursesOffDuty.length}명)
              </strong>
            </div>
            {nursesOffDuty.map(nurse => (
              <div key={nurse.id} style={{
                fontSize: '12px',
                color: '#78350f',
                marginBottom: '4px',
                paddingLeft: '8px'
              }}>
                • {nurse.name}: {nurse.lastOffDutyRemaining}일 남음
              </div>
            ))}
          </div>
        )}

        {/* Nurses in Shift Cycles */}
        {nursesInShiftCycle.length > 0 && (
          <div style={{
            backgroundColor: nursesInShiftCycle[0]?.lastShiftType === 'morning' ? '#dbeafe' : '#e0e7ff',
            border: `1px solid ${nursesInShiftCycle[0]?.lastShiftType === 'morning' ? '#3b82f6' : '#8b5cf6'}`,
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={16} style={{ 
                color: nursesInShiftCycle[0]?.lastShiftType === 'morning' ? '#1e40af' : '#5b21b6' 
              }} />
              <strong style={{ 
                color: nursesInShiftCycle[0]?.lastShiftType === 'morning' ? '#1e3a8a' : '#4c1d95',
                fontSize: '14px' 
              }}>
                {nursesInShiftCycle[0]?.lastShiftType === 'morning' ? '주간' : '야간'} 근무 계속 ({nursesInShiftCycle.length}명)
              </strong>
            </div>
            {nursesInShiftCycle.map(nurse => {
              const totalDays = nurse.lastShiftType === 'morning' ? 
                rosterConfig.morningShiftDays : rosterConfig.nightShiftDays;
              const remaining = totalDays - nurse.lastShiftCycleDay;
              return (
                <div key={nurse.id} style={{
                  fontSize: '12px',
                  color: nurse.lastShiftType === 'morning' ? '#1e3a8a' : '#4c1d95',
                  marginBottom: '4px',
                  paddingLeft: '8px'
                }}>
                  • {nurse.name}: {totalDays}일 중 {nurse.lastShiftCycleDay}일차 ({remaining}일 남음)
                </div>
              );
            })}
          </div>
        )}

        {/* Available Nurses */}
        {nursesAvailable.length > 0 && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #16a34a',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Users size={16} style={{ color: '#15803d' }} />
              <strong style={{ color: '#14532d', fontSize: '14px' }}>
                즉시 근무 가능 ({nursesAvailable.length}명)
              </strong>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#166534',
              paddingLeft: '8px'
            }}>
              {nursesAvailable.slice(0, 3).map(nurse => nurse.name).join(', ')}
              {nursesAvailable.length > 3 && ` 외 ${nursesAvailable.length - 3}명`}
            </div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        backgroundColor: '#fbbf24',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#78350f'
      }}>
        <strong>🔄 근무 주기 연속성:</strong> 간호사는 다음 달 새로운 근무를 배정받기 전에 현재 진행 중인 근무 주기를 완료합니다.
        이를 통해 적절한 휴식 기간을 보장하고 일과 삶의 균형을 유지합니다.
      </div>
    </div>
  );
};

export default CycleContinuityDisplay;