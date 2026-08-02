// src/components/Roster/RosterResultModal.jsx
// 근무표 생성 결과(alert 대신)를 보여주는 모달. 모바일에서도 깔끔하게 보이도록 만듦.
import React from 'react';
import { CheckCircle2, AlertTriangle, X, RefreshCcw } from 'lucide-react';

const RosterResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const hasEmptyShifts = !!result.continuityInfo?.hasEmptyShifts;
  const isSuccess = result.success && !hasEmptyShifts;
  const nursesInTransition = result.continuityInfo?.nursesInTransition || 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '480px',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
          backgroundColor: isSuccess ? '#f0fdf4' : '#fffbeb',
          borderBottom: `1px solid ${isSuccess ? '#bbf7d0' : '#fde68a'}`
        }}>
          {isSuccess ? (
            <CheckCircle2 size={28} style={{ color: '#16a34a', flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={28} style={{ color: '#d97706', flexShrink: 0 }} />
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: isSuccess ? '#166534' : '#92400e' }}>
              {result.success
                ? (isSuccess ? '균형 잡힌 근무표가 생성되었습니다' : '근무표는 생성됐지만 확인이 필요합니다')
                : '근무표 생성에 실패했습니다'}
            </h3>
            {nursesInTransition > 0 && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCcw size={12} /> 간호사 {nursesInTransition}명이 근무 주기를 다음 달로 이어서 계속합니다
              </p>
            )}
          </div>
        </div>

        {/* 본문: 상세 리포트 */}
        <div style={{
          padding: '18px 20px', overflowY: 'auto', whiteSpace: 'pre-wrap',
          fontSize: '13px', lineHeight: '1.7', color: '#374151'
        }}>
          {result.message}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              backgroundColor: '#3b82f6', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterResultModal;
