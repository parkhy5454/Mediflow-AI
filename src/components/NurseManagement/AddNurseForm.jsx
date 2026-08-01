// src/components/NurseManagement/AddNurseForm.jsx
import React, { useState } from 'react';
import { QUALIFICATION_OPTIONS, EXPERIENCE_OPTIONS, DEPARTMENT_OPTIONS } from '../../constants/nurseOptions';
import SelectOrCustom, { inputStyle } from '../Common/SelectOrCustom';

const AddNurseForm = ({ onAddNurse, onCancel, nameOptions = [] }) => {
  const [newNurse, setNewNurse] = useState({
    name: '',
    qualification: 'RN',
    experience: '주니어',
    department: '중환자실'
  });

  const handleSubmit = async () => {
    if (!newNurse.name.trim()) {
      alert('간호사 이름을 입력해주세요');
      return;
    }
    
    const success = await onAddNurse(newNurse);
    if (success) {
      setNewNurse({ 
        name: '', 
        qualification: 'RN', 
        experience: '주니어', 
        department: '중환자실' 
      });
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>새 간호사 추가</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        alignItems: 'start'
      }}>
        {nameOptions.length > 0 ? (
          <SelectOrCustom
            value={newNurse.name}
            onChange={(v) => setNewNurse({ ...newNurse, name: v })}
            options={nameOptions}
          />
        ) : (
          <input
            type="text"
            placeholder="간호사 이름"
            value={newNurse.name}
            onChange={(e) => setNewNurse({ ...newNurse, name: e.target.value })}
            style={inputStyle}
          />
        )}

        <SelectOrCustom
          value={newNurse.qualification}
          onChange={(v) => setNewNurse({ ...newNurse, qualification: v })}
          options={QUALIFICATION_OPTIONS}
        />

        <SelectOrCustom
          value={newNurse.experience}
          onChange={(v) => setNewNurse({ ...newNurse, experience: v })}
          options={EXPERIENCE_OPTIONS}
        />

        <SelectOrCustom
          value={newNurse.department}
          onChange={(v) => setNewNurse({ ...newNurse, department: v })}
          options={DEPARTMENT_OPTIONS}
        />
      </div>
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleSubmit}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          간호사 추가
        </button>
        <button 
          onClick={onCancel}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default AddNurseForm;
