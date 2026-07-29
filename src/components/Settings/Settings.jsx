// src/components/Settings/Settings.jsx
import React from 'react';

const Settings = ({ rosterConfig, updateRosterConfig }) => {
  const configFields = [
    { key: 'morningShiftSize', label: 'Morning Shift Size', min: 1, max: 10 },
    { key: 'nightShiftSize', label: 'Night Shift Size', min: 1, max: 10 },
    { key: 'morningShiftDays', label: 'Morning Shift Duration (days)', min: 3, max: 7 },
    { key: 'nightShiftDays', label: 'Night Shift Duration (days)', min: 3, max: 7 },
    { key: 'offDutyAfterMorning', label: 'Off-Duty After Morning (days)', min: 1, max: 5 },
    { key: 'offDutyAfterNight', label: 'Off-Duty After Night (days)', min: 1, max: 5 },
    { key: 'minRNPerShift', label: 'Min RN per Shift', min: 1, max: 5 },
    { key: 'minMWPerShift', label: 'Min MW per Shift', min: 1, max: 5 }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Roster Configuration</h2>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          {configFields.map(field => (
            <div key={field.key}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                {field.label}
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={rosterConfig[field.key]}
                onChange={(e) => updateRosterConfig({
                  [field.key]: parseInt(e.target.value)
                })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;