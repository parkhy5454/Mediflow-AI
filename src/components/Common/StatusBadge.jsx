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

  return (
    <span style={{
      ...styles,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    }}>
      {text}
    </span>
  );
};

export default StatusBadge;

