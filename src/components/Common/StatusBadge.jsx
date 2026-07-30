// src/components/Common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ text, type, qualification, status }) => {
  const getStyles = () => {
    if (type === 'qualification') {
      switch (qualification) {
        case 'RN':
          return { backgroundColor: '#dbeafe', color: '#1e40af' };
        case 'MW':
          return { backgroundColor: '#fef3c7', color: '#92400e' };
        case 'RN-MW':
          return { backgroundColor: '#e0e7ff', color: '#5b21b6' };
        default:
          return { backgroundColor: '#f3f4f6', color: '#374151' };
      }
    }
    
    if (type === 'status') {
      switch (status) {
        case 'active':
          return { backgroundColor: '#dcfce7', color: '#166534' };
        case 'disabled':
          return { backgroundColor: '#fee2e2', color: '#dc2626' };
        case 'archived':
          return { backgroundColor: '#f3f4f6', color: '#374151' };
        default:
          return { backgroundColor: '#f3f4f6', color: '#374151' };
      }
    }
    
    return { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const styles = getStyles();

  // [수정] 실제 상태값(active/disabled/archived)은 그대로 두고, 화면에 보이는 텍스트만 한글로 변환
  const getDisplayText = () => {
    if (type === 'status') {
      const statusLabels = { active: '근무 가능', disabled: '근무 중지', archived: '보관됨' };
      return statusLabels[status] || text;
    }
    return text;
  };

  return (
    <span style={{
      ...styles,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      {getDisplayText()}
    </span>
  );
};

export default StatusBadge;

