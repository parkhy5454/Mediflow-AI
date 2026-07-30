// src/components/NurseManagement/NurseFilters.jsx
import React from 'react';

const NurseFilters = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      marginBottom: '20px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <input
        type="text"
        placeholder="간호사 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          minWidth: '200px'
        }}
      />
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        style={{
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        <option value="all">전체 상태</option>
        <option value="active">근무 가능</option>
        <option value="disabled">근무 불가</option>
        <option value="archived">보관됨</option>
      </select>
    </div>
  );
};

export default NurseFilters;

