// src/components/Common/SelectOrCustom.jsx
// 목록에서 선택하거나, "직접 입력"을 골라 자유 텍스트로 입력할 수 있는 공용 컴포넌트.
// AddNurseForm(추가)과 NurseTable(수정)에서 함께 사용한다.
import React, { useState } from 'react';

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

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

export default SelectOrCustom;
export { inputStyle };
