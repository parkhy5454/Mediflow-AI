// src/components/NurseManagement/AddNurseForm.jsx
import React, { useState } from 'react';

// [추가] 자격/경력/부서 목록 — 종합병원 기준으로 폭넓게 구성.
// 목록에 없는 값은 "직접 입력"으로 자유롭게 넣을 수 있다.
const QUALIFICATION_OPTIONS = [
  { value: 'RN', label: 'RN (정간호사)' },
  { value: 'MW', label: 'MW (조산사)' },
  { value: 'RN-MW', label: 'RN-MW (둘 다)' }
];

const EXPERIENCE_OPTIONS = ['주니어', '중급', '시니어'].map(v => ({ value: v, label: v }));

const DEPARTMENT_OPTIONS = [
  '중환자실', '응급실', '수술실', '분만실', '신생아중환자실', '회복실',
  '내과', '외과', '정형외과', '신경외과', '신경과', '흉부외과', '성형외과',
  '산부인과', '소아청소년과', '정신건강의학과', '피부과', '비뇨의학과',
  '이비인후과', '안과', '치과', '재활의학과', '마취통증의학과',
  '영상의학과', '진단검사의학과', '가정의학과', '인공신장실(투석실)',
  '일반병동', '외래'
].map(v => ({ value: v, label: v }));

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

// [추가] 목록에서 선택하거나, "직접 입력"을 골라 자유 텍스트로 입력할 수 있는 공용 컴포넌트.
const SelectOrCustom = ({ value, onChange, options }) => {
  const [isCustom, setIsCustom] = useState(!options.some(o => o.value === value));

  if (isCustom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="직접 입력..."
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => { setIsCustom(false); onChange(options[0].value); }}
          style={{
            fontSize: '11px',
            color: '#3b82f6',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0
          }}
        >
          ▾ 목록에서 선택
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === '__custom__') {
          setIsCustom(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
      style={inputStyle}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
      <option value="__custom__">✏️ 직접 입력...</option>
    </select>
  );
};

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
        gap: '15px',
        alignItems: 'start'
      }}>
        <input
          type="text"
          placeholder="간호사 이름"
          value={newNurse.name}
          onChange={(e) => setNewNurse({ ...newNurse, name: e.target.value })}
          style={inputStyle}
        />

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
