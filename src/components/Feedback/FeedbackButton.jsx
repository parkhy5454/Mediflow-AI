// src/components/Feedback/FeedbackButton.jsx
// 모든 로그인 사용자가 버그신고/기능제안/기타 문의를 보낼 수 있는 플로팅 버튼 + 모달.
import React, { useState } from 'react';
import { MessageCircle, X, Bug, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'bug', label: '버그 신고', icon: Bug, color: '#dc2626' },
  { value: 'feature', label: '기능 제안', icon: Lightbulb, color: '#d97706' },
  { value: 'other', label: '기타 문의', icon: HelpCircle, color: '#3b82f6' }
];

const FeedbackButton = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const resetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setType('bug');
      setTitle('');
      setMessage('');
      setPhone('');
      setSubmitted(false);
      setError('');
    }, 300);
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim() || !message.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ type, title: title.trim(), message: message.trim(), phone: phone.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '문의 접수에 실패했습니다.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40
        }}
        title="문의하기"
      >
        <MessageCircle size={22} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px'
          }}
          onClick={resetAndClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '440px',
              maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>문의하기</h3>
              <button onClick={resetAndClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
                <p style={{ color: '#1f2937', fontWeight: '600', marginBottom: '6px' }}>문의가 접수되었습니다</p>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
                  확인 후 등록하신 이메일{phone ? '이나 연락처' : ''}로 답변드릴게요.
                </p>
                <button
                  onClick={resetAndClose}
                  style={{
                    padding: '10px 24px', backgroundColor: '#4f46e5', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  닫기
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>문의 유형</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {TYPE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const active = type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          style={{
                            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            padding: '10px 6px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                            border: active ? `1.5px solid ${opt.color}` : '1px solid #e5e7eb',
                            backgroundColor: active ? `${opt.color}15` : 'white',
                            color: active ? opt.color : '#6b7280'
                          }}
                        >
                          <Icon size={16} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="간단히 요약해주세요"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>내용</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="자세히 적어주시면 빠르게 확인하는 데 도움이 돼요"
                    rows={4}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                    연락처 <span style={{ color: '#9ca3af', fontWeight: '400' }}>(선택, 문자로 답변받고 싶을 때)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                  답변은 가입하신 이메일({currentUser?.email})로 드립니다.
                </p>

                {error && (
                  <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', margin: 0 }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none',
                    borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px',
                    fontWeight: '600', opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? '접수 중...' : '문의 보내기'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
