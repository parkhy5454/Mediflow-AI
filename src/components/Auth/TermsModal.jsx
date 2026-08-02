// src/components/Auth/TermsModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../legal/termsText';

const TermsModal = ({ onClose }) => {
  const [tab, setTab] = useState('terms'); // 'terms' | 'privacy'

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTab('terms')}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                backgroundColor: tab === 'terms' ? '#eff6ff' : 'transparent',
                color: tab === 'terms' ? '#1d4ed8' : '#6b7280'
              }}
            >
              이용약관
            </button>
            <button
              onClick={() => setTab('privacy')}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                backgroundColor: tab === 'privacy' ? '#eff6ff' : 'transparent',
                color: tab === 'privacy' ? '#1d4ed8' : '#6b7280'
              }}
            >
              개인정보처리방침
            </button>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '12.5px', lineHeight: '1.7', color: '#374151' }}>
          {tab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={onClose}
            style={{ width: '100%', padding: '9px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
