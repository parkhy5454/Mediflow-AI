// src/components/Dashboard/AssignmentChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AssignmentChart = ({ assignmentData }) => {
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
          <Bar dataKey="morningDays" fill="#3b82f6" name="주간 근무일" />
          <Bar dataKey="nightDays" fill="#8b5cf6" name="야간 근무일" />
          <Bar dataKey="offDutyDays" fill="#6b7280" name="비번일" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignmentChart;