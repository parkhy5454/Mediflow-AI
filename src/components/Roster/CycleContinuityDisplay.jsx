// src/components/Roster/CycleContinuityDisplay.jsx
// [수정] 근무 사이클에 있는 간호사들을 "주간/야간 둘 중 하나"로 가정하지 않고,
// 실제 배정된 교대 종류(D/E/N/M)별로 그룹핑해서 각각 보여주도록 일반화했다.
import React from 'react';
import { Clock, UserCheck, UserX, Users } from 'lucide-react';
import { SHIFT_TYPES, shiftFullLabel, shiftColor } from '../../constants/shiftTypes';

const CycleContinuityDisplay = ({ nurses, rosterConfig }) => {
  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : SHIFT_TYPES;

  const isNotFullyInCycle = (nurse) => {
    const cfg = rosterConfig.shifts[nurse.lastShiftType];
    return nurse.lastShiftCycleDay > 0 && cfg && nurse.lastShiftCycleDay < cfg.shiftDays;
  };

  const nursesInTransition = nurses.filter(nurse =>
    nurse.status === 'active' && (nurse.lastOffDutyRemaining > 0 || isNotFullyInCycle(nurse))
  );

  const nursesOffDuty = nurses.filter(nurse =>
    nurse.status === 'active' && nurse.lastOffDutyRemaining > 0
  );

  const nursesInShiftCycle = nurses.filter(nurse =>
    nurse.status === 'active' && nurse.lastShiftCycleDay > 0 && nurse.lastOffDutyRemaining === 0 &&
    shiftTypes.includes(nurse.lastShiftType)
  );

  const nursesAvailable = nurses.filter(nurse =>
    nurse.status === 'active' && nurse.lastOffDutyRemaining === 0 && nurse.lastShiftCycleDay === 0
  );

  // 근무 사이클 중인 간호사를 실제 교대 종류별로 그룹핑
  const shiftCycleGroups = shiftTypes
    .map(s => ({ shiftType: s, list: nursesInShiftCycle.filter(n => n.lastShiftType === s) }))
    .filter(g => g.list.length > 0);

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
        {/* 휴무 계속 */}
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

        {/* 교대 종류별 근무 계속 (D/E/N/M 각각 별도 카드) */}
        {shiftCycleGroups.map(({ shiftType, list }) => {
          const color = shiftColor(shiftType);
          return (
            <div key={shiftType} style={{
              backgroundColor: `${color}1a`,
              border: `1px solid ${color}`,
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Clock size={16} style={{ color }} />
                <strong style={{ color, fontSize: '14px' }}>
                  {shiftFullLabel(shiftType)} 계속 ({list.length}명)
                </strong>
              </div>
              {list.map(nurse => {
                const cfg = rosterConfig.shifts[shiftType];
                const totalDays = cfg ? cfg.shiftDays : 0;
                const remaining = totalDays - nurse.lastShiftCycleDay;
                return (
                  <div key={nurse.id} style={{
                    fontSize: '12px',
                    color,
                    marginBottom: '4px',
                    paddingLeft: '8px'
                  }}>
                    • {nurse.name}: {totalDays}일 중 {nurse.lastShiftCycleDay}일차 ({remaining}일 남음)
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* 즉시 근무 가능 */}
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
