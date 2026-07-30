// src/components/NurseManagement/AddNurseForm.jsx
import React, { useState } from 'react';

const AddNurseForm = ({ onAddNurse, onCancel }) => {
  const [newNurse, setNewNurse] = useState({
    name: '',
    qualification: 'RN',
    experience: '주니어',
    department: '중환자실'
  });

  const handleSubmit = () => {
    if (!newNurse.name.trim()) {
      alert('간호사 이름을 입력해주세요');
      return;
    }
    
    const success = onAddNurse(newNurse);
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
        gap: '15px' 
      }}>
        <input
          type="text"
          placeholder="간호사 이름"
          value={newNurse.name}
          onChange={(e) => setNewNurse({ ...newNurse, name: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <select
          value={newNurse.qualification}
          onChange={(e) => setNewNurse({ ...newNurse, qualification: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="RN">RN (정간호사)</option>
          <option value="MW">MW (조산사)</option>
          <option value="RN-MW">RN-MW (둘 다)</option>
        </select>
        <select
          value={newNurse.experience}
          onChange={(e) => setNewNurse({ ...newNurse, experience: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="주니어">주니어</option>
          <option value="중급">중급</option>
          <option value="시니어">시니어</option>
        </select>
        <select
          value={newNurse.department}
          onChange={(e) => setNewNurse({ ...newNurse, department: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="중환자실">중환자실</option>
          <option value="응급실">응급실</option>
          <option value="수술실">수술실</option>
          <option value="산부인과">산부인과</option>
        </select>
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