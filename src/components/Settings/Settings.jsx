// src/components/Settings/Settings.jsx
// [수정] 2교대(주간/야간) 고정 필드 → 4교대(D/E/N/M) 시스템에 맞게 교대별로 동적으로 렌더링.
import React from 'react';
import { SHIFT_TYPES, shiftFullLabel, shiftTime } from '../../constants/shiftTypes';

const numberInputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const Settings = ({ rosterConfig, updateRosterConfig }) => {
  const updateShiftField = (shiftCode, field, value) => {
    const nextShifts = {
      ...rosterConfig.shifts,
      [shiftCode]: {
        ...rosterConfig.shifts[shiftCode],
        [field]: parseInt(value) || 0
      }
    };
    updateRosterConfig({ shifts: nextShifts });
  };

  const otherFields = [
    { key: 'minRNPerShift', label: '근무당 최소 정간호사(RN) 수', min: 1, max: 5 },
    { key: 'minMWPerShift', label: '근무당 최소 조산사(MW) 수', min: 1, max: 5 }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '4px', color: '#1f2937' }}>근무표 설정</h2>
      <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: '13px' }}>
        4교대(데이/이브닝/나이트/미들) 시스템 기준으로 교대별 필요 인원과 근무/휴무 일수를 설정합니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SHIFT_TYPES.map(shiftCode => {
          const cfg = rosterConfig.shifts[shiftCode];
          return (
            <div
              key={shiftCode}
              style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>{shiftFullLabel(shiftCode)}</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{shiftTime(shiftCode)}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    필요 인원
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cfg.size}
                    onChange={(e) => updateShiftField(shiftCode, 'size', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    연속 근무 기간 (일)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cfg.shiftDays}
                    onChange={(e) => updateShiftField(shiftCode, 'shiftDays', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    근무 후 휴무 (일)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cfg.offDutyAfter}
                    onChange={(e) => updateShiftField(shiftCode, 'offDutyAfter', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#1f2937', fontSize: '16px' }}>공통 설정</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {otherFields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={rosterConfig[field.key]}
                  onChange={(e) => updateRosterConfig({ [field.key]: parseInt(e.target.value) || 0 })}
                  style={numberInputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
