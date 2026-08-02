// src/components/Roster/LeaveRequests.jsx
import React, { useState } from 'react';
import { Umbrella, Plus, Check, X, Loader2, Clock, History } from 'lucide-react';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';

const STATUS_LABEL = {
  pending: { text: '승인 대기', bg: '#dbeafe', color: '#1e40af' },
  approved: { text: '승인됨', bg: '#dcfce7', color: '#166534' },
  rejected: { text: '거절됨', bg: '#fee2e2', color: '#991b1b' },
  cancelled: { text: '취소됨', bg: '#f3f4f6', color: '#6b7280' }
};

const badgeStyle = (status) => {
  const s = STATUS_LABEL[status] || STATUS_LABEL.pending;
  return {
    fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px',
    backgroundColor: s.bg, color: s.color, whiteSpace: 'nowrap'
  };
};

const inputStyle = {
  width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px'
};
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' };

const daysBetween = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveRequests = ({ currentUser }) => {
  const { requests, loading, error, createRequest, cancelRequest, decide } = useLeaveRequests(currentUser);
  const isAdmin = currentUser.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectNoteFor, setRejectNoteFor] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const resetForm = () => {
    setStartDate(''); setEndDate(''); setReason(''); setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!startDate || !endDate) {
      setSubmitError('시작일과 종료일을 선택해주세요.');
      return;
    }
    if (endDate < startDate) {
      setSubmitError('종료일이 시작일보다 빠를 수 없습니다.');
      return;
    }
    setSubmitting(true);
    const result = await createRequest({ startDate, endDate, reason });
    setSubmitting(false);
    if (result.success) {
      resetForm();
      setFormOpen(false);
    } else {
      setSubmitError(result.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('이 휴가 신청을 취소하시겠습니까?')) return;
    setBusyId(id);
    await cancelRequest(id);
    setBusyId(null);
  };

  const handleApprove = async (id) => {
    setBusyId(id);
    const result = await decide(id, 'approved');
    setBusyId(null);
    if (!result.success) alert(result.message);
  };

  const handleReject = async (id) => {
    setBusyId(id);
    const result = await decide(id, 'rejected', rejectNote);
    setBusyId(null);
    if (!result.success) alert(result.message);
    setRejectNoteFor(null);
    setRejectNote('');
  };

  const canCancel = (r) => (r.userId === currentUser.id || isAdmin) && r.status === 'pending';

  const pending = requests.filter(r => r.status === 'pending');
  const history = requests.filter(r => ['approved', 'rejected', 'cancelled'].includes(r.status));

  const renderCard = (r) => (
    <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px', backgroundColor: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={badgeStyle(r.status)}>{STATUS_LABEL[r.status]?.text}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{daysBetween(r.startDate, r.endDate)}일</span>
          </div>
          <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
            {r.requesterName} — {r.startDate} ~ {r.endDate}
          </div>
          {r.reason && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>사유: {r.reason}</div>}
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            신청일: {new Date(r.createdAt).toLocaleString()}
          </div>
          {r.reviewNote && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>처리 메모: {r.reviewNote}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          {r.status === 'pending' && isAdmin && (
            rejectNoteFor === r.id ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="거절 사유(선택)" style={{ ...inputStyle, width: '140px' }} />
                <button onClick={() => handleReject(r.id)} disabled={busyId === r.id} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '12px', cursor: 'pointer' }}>거절 확정</button>
                <button onClick={() => { setRejectNoteFor(null); setRejectNote(''); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>취소</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleApprove(r.id)} disabled={busyId === r.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 승인
                </button>
                <button onClick={() => setRejectNoteFor(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: 'white', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  <X size={14} /> 거절
                </button>
              </div>
            )
          )}
          {r.status === 'pending' && !isAdmin && (
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> 관리자 승인 대기 중
            </span>
          )}
          {canCancel(r) && (
            <button onClick={() => handleCancel(r.id)} disabled={busyId === r.id} style={{ fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              신청 취소
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Umbrella size={22} style={{ color: '#3b82f6' }} />
          <h2 style={{ color: '#1f2937', margin: 0 }}>휴가 신청</h2>
        </div>
        <button onClick={() => setFormOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={16} /> 새 신청
        </button>
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
        {isAdmin ? '관리자는 신청 목록을 승인/거절할 수 있습니다. 승인해도 근무표가 자동으로 바뀌지는 않으니, 근무표 생성 시 참고하거나 필요하면 근무 변경 요청을 별도로 만들어주세요.' : '휴가 신청 후 관리자 승인을 기다려주세요.'}
      </p>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>시작일</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>종료일</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>사유 (선택)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="예: 개인 사정으로 연차 사용합니다." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          {submitError && (
            <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>{submitError}</p>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={submitting} style={{ padding: '9px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '등록 중...' : '신청'}
            </button>
            <button type="button" onClick={() => { resetForm(); setFormOpen(false); }} style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', padding: '30px 0', justifyContent: 'center' }}>
          <Loader2 size={18} className="animate-spin" /> 불러오는 중...
        </div>
      ) : error ? (
        <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Clock size={16} /> 승인 대기 ({pending.length})
            </h3>
            {pending.length === 0 ? <p style={{ fontSize: '12px', color: '#9ca3af' }}>승인 대기 중인 신청이 없습니다.</p> : pending.map(renderCard)}
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <History size={16} /> 처리 완료 ({history.length})
            </h3>
            {history.length === 0 ? <p style={{ fontSize: '12px', color: '#9ca3af' }}>아직 처리된 신청이 없습니다.</p> : history.map(renderCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveRequests;
