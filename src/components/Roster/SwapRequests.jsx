// src/components/Roster/SwapRequests.jsx
// 근무표 확정 후 간호사들의 변경 요청(1:1 맞교환 / 공개 대타)을 접수하고,
// 관리자가 승인하면 실제 근무표에 반영하는 화면.
import React, { useState } from 'react';
import { Repeat, Users, Plus, Check, X, Loader2, Clock, History } from 'lucide-react';
import { useSwapRequests } from '../../hooks/useSwapRequests';
import { getDaysInMonth } from '../../utils/dateUtils';
import { shiftFullLabel } from '../../constants/shiftTypes';

const STATUS_LABEL = {
  pending: { text: '대타 모집중', bg: '#fef3c7', color: '#92400e' },
  ready_for_review: { text: '승인 대기', bg: '#dbeafe', color: '#1e40af' },
  approved: { text: '승인됨', bg: '#dcfce7', color: '#166534' },
  rejected: { text: '거절됨', bg: '#fee2e2', color: '#991b1b' },
  cancelled: { text: '취소됨', bg: '#f3f4f6', color: '#6b7280' }
};

const badgeStyle = (status) => {
  const s = STATUS_LABEL[status] || STATUS_LABEL.pending;
  return {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '10px',
    backgroundColor: s.bg,
    color: s.color,
    whiteSpace: 'nowrap'
  };
};

const selectStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '13px',
  backgroundColor: 'white'
};

const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' };

const SwapRequests = ({ currentUser, nurses, rosterConfig, selectedMonth, selectedYear, getCurrentMonthRoster, refetchRoster }) => {
  const { requests, loading, error, createRequest, volunteer, cancelRequest, decide } = useSwapRequests(currentUser, selectedYear, selectedMonth);

  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : [];
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthRoster = getCurrentMonthRoster ? getCurrentMonthRoster() : {};
  const isAdmin = currentUser.role === 'admin';
  const activeNurses = (nurses || []).filter(n => n.status === 'active');

  const [formOpen, setFormOpen] = useState(false);
  const [requestType, setRequestType] = useState('cover');
  const [fromDay, setFromDay] = useState('');
  const [fromShiftType, setFromShiftType] = useState('');
  const [fromNurseId, setFromNurseId] = useState('');
  const [toDay, setToDay] = useState('');
  const [toShiftType, setToShiftType] = useState('');
  const [toNurseId, setToNurseId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [volunteerFor, setVolunteerFor] = useState(null); // request id
  const [volunteerNurseId, setVolunteerNurseId] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectNoteFor, setRejectNoteFor] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const getNursesForDayShift = (day, shiftType) => {
    if (!day || !shiftType) return [];
    return monthRoster[day]?.[shiftType] || [];
  };

  const resetForm = () => {
    setRequestType('cover');
    setFromDay(''); setFromShiftType(''); setFromNurseId('');
    setToDay(''); setToShiftType(''); setToNurseId('');
    setReason(''); setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!fromDay || !fromShiftType || !fromNurseId) {
      setSubmitError('본인의 근무(날짜/교대/이름)를 모두 선택해주세요.');
      return;
    }
    if (requestType === 'swap' && (!toDay || !toShiftType || !toNurseId)) {
      setSubmitError('맞바꿀 상대방의 근무(날짜/교대/이름)를 모두 선택해주세요.');
      return;
    }

    setSubmitting(true);
    const result = await createRequest({
      requestType,
      selectedYear,
      selectedMonth,
      fromDay: Number(fromDay),
      fromShiftType,
      fromNurseId,
      toDay: requestType === 'swap' ? Number(toDay) : undefined,
      toShiftType: requestType === 'swap' ? toShiftType : undefined,
      toNurseId: requestType === 'swap' ? toNurseId : undefined,
      reason
    });
    setSubmitting(false);
    if (result.success) {
      resetForm();
      setFormOpen(false);
    } else {
      setSubmitError(result.message);
    }
  };

  const handleVolunteerSubmit = async (requestId) => {
    if (!volunteerNurseId) return;
    setBusyId(requestId);
    await volunteer(requestId, volunteerNurseId);
    setBusyId(null);
    setVolunteerFor(null);
    setVolunteerNurseId('');
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('이 요청을 취소하시겠습니까?')) return;
    setBusyId(requestId);
    await cancelRequest(requestId);
    setBusyId(null);
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('승인하면 실제 근무표에 바로 반영됩니다. 계속할까요?')) return;
    setBusyId(requestId);
    const result = await decide(requestId, 'approved');
    setBusyId(null);
    if (!result.success) {
      alert(result.message);
    } else if (refetchRoster) {
      // 승인으로 서버의 근무표가 바뀌었으니, 캘린더/대시보드가 보고 있는 roster 상태도 다시 불러와서 맞춰준다.
      refetchRoster();
    }
  };

  const handleReject = async (requestId) => {
    setBusyId(requestId);
    const result = await decide(requestId, 'rejected', rejectNote);
    setBusyId(null);
    if (!result.success) alert(result.message);
    setRejectNoteFor(null);
    setRejectNote('');
  };

  const describeRequest = (r) => {
    const fromText = `${r.fromDay}일 ${shiftFullLabel(r.fromShiftType)} — ${r.fromNurseName}`;
    if (r.requestType === 'swap') {
      const toText = `${r.toDay}일 ${shiftFullLabel(r.toShiftType)} — ${r.toNurseName || '?'}`;
      return `${fromText}  ⇄  ${toText}`;
    }
    return `${fromText}${r.toNurseName ? `  →  대타: ${r.toNurseName}` : ''}`;
  };

  const canCancel = (r) => (r.createdByUserId === currentUser.id || isAdmin) && ['pending', 'ready_for_review'].includes(r.status);

  const pendingCover = requests.filter(r => r.status === 'pending');
  const readyForReview = requests.filter(r => r.status === 'ready_for_review');
  const history = requests.filter(r => ['approved', 'rejected', 'cancelled'].includes(r.status));

  const renderRequestCard = (r) => (
    <div key={r.id} style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px 14px',
      marginBottom: '10px',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={badgeStyle(r.status)}>{STATUS_LABEL[r.status]?.text}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{r.requestType === 'swap' ? '1:1 맞교환' : '공개 대타'}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{describeRequest(r)}</div>
          {r.reason && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>사유: {r.reason}</div>}
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            요청자: {r.createdByUserName} · {new Date(r.createdAt).toLocaleString()}
          </div>
          {r.reviewNote && (
            <div style={{
              marginTop: '6px', padding: '8px 10px', borderRadius: '6px',
              backgroundColor: r.status === 'rejected' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${r.status === 'rejected' ? '#fecaca' : '#bbf7d0'}`,
              fontSize: '13px', fontWeight: '700',
              color: r.status === 'rejected' ? '#991b1b' : '#166534'
            }}>
              처리 메모: {r.reviewNote}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          {/* 공개 대타 모집중 → 지원 버튼 */}
          {r.status === 'pending' && r.requestType === 'cover' && (
            volunteerFor === r.id ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select value={volunteerNurseId} onChange={e => setVolunteerNurseId(e.target.value)} style={{ ...selectStyle, width: '140px' }}>
                  <option value="">간호사 선택</option>
                  {activeNurses.filter(n => n.id !== r.fromNurseId).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleVolunteerSubmit(r.id)}
                  disabled={!volunteerNurseId || busyId === r.id}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '12px', cursor: 'pointer' }}
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : '확정'}
                </button>
                <button onClick={() => { setVolunteerFor(null); setVolunteerNurseId(''); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setVolunteerFor(r.id)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                내가 대신 할게요
              </button>
            )
          )}

          {/* 승인 대기 → 관리자만 승인/거절 */}
          {r.status === 'ready_for_review' && isAdmin && (
            rejectNoteFor === r.id ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="거절 사유(선택)"
                  style={{ ...selectStyle, width: '140px' }}
                />
                <button onClick={() => handleReject(r.id)} disabled={busyId === r.id} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                  거절 확정
                </button>
                <button onClick={() => { setRejectNoteFor(null); setRejectNote(''); }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }}>
                  취소
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={busyId === r.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 승인
                </button>
                <button
                  onClick={() => setRejectNoteFor(r.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: 'white', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <X size={14} /> 거절
                </button>
              </div>
            )
          )}
          {r.status === 'ready_for_review' && !isAdmin && (
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> 관리자 승인 대기 중
            </span>
          )}

          {canCancel(r) && (
            <button
              onClick={() => handleCancel(r.id)}
              disabled={busyId === r.id}
              style={{ fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              요청 취소
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
          <Repeat size={22} style={{ color: '#3b82f6' }} />
          <h2 style={{ color: '#1f2937', margin: 0 }}>근무 변경 요청</h2>
        </div>
        <button
          onClick={() => setFormOpen(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={16} /> 새 요청
        </button>
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
        1:1 맞교환은 상대방까지 지정해서 바로 승인 대기로 올라가고, 공개 대타는 지원자가 나타나면 승인 대기로 전환됩니다.
        {isAdmin ? ' 관리자는 승인 대기 요청을 승인/거절할 수 있으며, 승인 즉시 근무표에 반영됩니다.' : ' 최종 반영은 관리자 승인 후에 이루어집니다.'}
      </p>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" checked={requestType === 'cover'} onChange={() => setRequestType('cover')} /> 공개 대타 요청
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" checked={requestType === 'swap'} onChange={() => setRequestType('swap')} /> 1:1 맞교환
            </label>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
            내 근무 (바꾸고 싶은 근무)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>날짜</label>
              <select value={fromDay} onChange={e => { setFromDay(e.target.value); setFromShiftType(''); setFromNurseId(''); }} style={selectStyle}>
                <option value="">선택</option>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>교대</label>
              <select value={fromShiftType} onChange={e => { setFromShiftType(e.target.value); setFromNurseId(''); }} style={selectStyle} disabled={!fromDay}>
                <option value="">선택</option>
                {shiftTypes.filter(s => getNursesForDayShift(fromDay, s).length > 0).map(s => (
                  <option key={s} value={s}>{shiftFullLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>이름</label>
              <select value={fromNurseId} onChange={e => setFromNurseId(e.target.value)} style={selectStyle} disabled={!fromShiftType}>
                <option value="">선택</option>
                {getNursesForDayShift(fromDay, fromShiftType).map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>

          {requestType === 'swap' && (
            <>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                맞바꿀 상대방 근무
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>날짜</label>
                  <select value={toDay} onChange={e => { setToDay(e.target.value); setToShiftType(''); setToNurseId(''); }} style={selectStyle}>
                    <option value="">선택</option>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>교대</label>
                  <select value={toShiftType} onChange={e => { setToShiftType(e.target.value); setToNurseId(''); }} style={selectStyle} disabled={!toDay}>
                    <option value="">선택</option>
                    {shiftTypes.filter(s => getNursesForDayShift(toDay, s).length > 0).map(s => (
                      <option key={s} value={s}>{shiftFullLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>이름</label>
                  <select value={toNurseId} onChange={e => setToNurseId(e.target.value)} style={selectStyle} disabled={!toShiftType}>
                    <option value="">선택</option>
                    {getNursesForDayShift(toDay, toShiftType).filter(n => n.id !== fromNurseId).map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>사유 (선택)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              placeholder="예: 개인 사정으로 근무 변경이 필요합니다."
              style={{ ...selectStyle, resize: 'vertical' }}
            />
          </div>

          {submitError && (
            <p style={{ color: '#dc2626', fontSize: '13px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
              {submitError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={submitting} style={{ padding: '9px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '등록 중...' : '요청 등록'}
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
              <Users size={16} /> 대타 모집중 ({pendingCover.length})
            </h3>
            {pendingCover.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>모집 중인 대타 요청이 없습니다.</p>
            ) : pendingCover.map(renderRequestCard)}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Clock size={16} /> 승인 대기 ({readyForReview.length})
            </h3>
            {readyForReview.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>승인 대기 중인 요청이 없습니다.</p>
            ) : readyForReview.map(renderRequestCard)}
          </div>

          <div>
            <h3 style={{ fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <History size={16} /> 처리 완료 ({history.length})
            </h3>
            {history.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>아직 처리된 요청이 없습니다.</p>
            ) : history.map(renderRequestCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default SwapRequests;
