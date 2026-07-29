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
          <h3 style={{ margin: 0, color: '#0c4a6e', fontSize: '16px' }}>Month Transition Status</h3>
        </div>
        <p style={{ margin: 0, color: '#0369a1' }}>
          ✅ All nurses will be available at the start of next month. No cycle continuity required.
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
        <h3 style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>Month Transition - Cycle Continuity</h3>
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
                Continuing Off-Duty ({nursesOffDuty.length})
              </strong>
            </div>
            {nursesOffDuty.map(nurse => (
              <div key={nurse.id} style={{
                fontSize: '12px',
                color: '#78350f',
                marginBottom: '4px',
                paddingLeft: '8px'
              }}>
                • {nurse.name}: {nurse.lastOffDutyRemaining} day{nurse.lastOffDutyRemaining !== 1 ? 's' : ''} remaining
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
                Continuing {nursesInShiftCycle[0]?.lastShiftType === 'morning' ? 'Morning' : 'Night'} Shifts ({nursesInShiftCycle.length})
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
                  • {nurse.name}: Day {nurse.lastShiftCycleDay} of {totalDays} ({remaining} day{remaining !== 1 ? 's' : ''} left)
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
                Available Immediately ({nursesAvailable.length})
              </strong>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#166534',
              paddingLeft: '8px'
            }}>
              {nursesAvailable.slice(0, 3).map(nurse => nurse.name).join(', ')}
              {nursesAvailable.length > 3 && ` and ${nursesAvailable.length - 3} more`}
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
        <strong>🔄 Cycle Continuity:</strong> Nurses will complete their current work cycles before being assigned new duties in the next month.
        This ensures proper rest periods and maintains work-life balance.
      </div>
    </div>
  );
};

export default CycleContinuityDisplay;