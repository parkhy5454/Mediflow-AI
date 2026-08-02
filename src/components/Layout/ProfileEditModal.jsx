// src/components/Layout/ProfileEditModal.jsx
// 로그인한 사용자가 본인 이름/전화번호를 수정할 수 있는 모달.
// 기존 가입자가 나중에 전화번호를 채워 넣을 때도 이 화면을 쓴다.
import React, { useState } from 'react';
import { X, UserCircle } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneUtils';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const ProfileEditModal = ({ currentUser, onClose, onSaved }) => {
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone ? formatPhoneNumber(currentUser.phone) : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCircle size={20} style={{ color: '#3b82f6' }} />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>내 정보 수정</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              전화번호 (선택)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="010-1234-5678"
              style={inputStyle}
            />
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              근무 변경/대타 요청 시 동료가 연락할 수 있도록 등록해두면 좋습니다.
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              이메일
            </label>
            <input type="text" value={currentUser.email} disabled style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#9ca3af' }} />
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>이메일(아이디)은 변경할 수 없습니다.</p>
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px', borderRadius: '6px', border: 'none',
              backgroundColor: '#3b82f6', color: 'white', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
            }}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
