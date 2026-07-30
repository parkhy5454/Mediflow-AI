// src/components/Dashboard/AssignmentChart.jsx
// [수정] 주간/야간 2개 막대 고정 → 4교대(D/E/N/M) + 비번 막대로 동적 렌더링
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SHIFT_TYPES, shiftLabel, shiftColor } from '../../constants/shiftTypes';

const AssignmentChart = ({ assignmentData, rosterConfig }) => {
  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : SHIFT_TYPES;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>
        월간 간호사 배정 차트
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={assignmentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {shiftTypes.map(s => (
            <Bar key={s} dataKey={s} fill={shiftColor(s)} name={`${shiftLabel(s)} 근무일`} />
          ))}
          <Bar dataKey="offDutyDays" fill="#6b7280" name="비번일" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignmentChart;
