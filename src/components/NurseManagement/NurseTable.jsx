// src/components/NurseManagement/NurseTable.jsx
// [수정] 간호사 목록을 부서별로 그룹핑 + 행마다 "수정" 버튼으로 입력 실수를 바로잡을 수 있게 함
import React, { useState } from 'react';
import { Eye, EyeOff, Archive, Trash2, Pencil, Check, X, CalendarClock, Loader2 } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import SelectOrCustom, { inputStyle } from '../Common/SelectOrCustom';
import { QUALIFICATION_OPTIONS, EXPERIENCE_OPTIONS, DEPARTMENT_OPTIONS } from '../../constants/nurseOptions';
import { SHIFT_TYPES, shiftLabel } from '../../constants/shiftTypes';

import { useTranslation } from 'react-i18next';

const NurseTable = ({ nurses, updateNurseStatus, updateNurse, deleteNurse, nameOptions = [], currentUser }) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(null);
  // 캘린더 구독 링크 발급 중인 간호사 id (버튼 로딩 상태 표시용)
  const [calendarLoadingId, setCalendarLoadingId] = useState(null);

  // [추가] 개인 캘린더(iCal) 구독 링크. 서버가 병원코드+간호사id로부터 계산한 추측 불가능한
  // 토큰이 포함된 주소를 내려주므로, 그 주소를 그대로 클립보드에 복사해서 간호사에게 전달하면
  // 구글/애플 캘린더의 "URL로 구독" 기능에 붙여넣어 발행된 근무표를 자동으로 받아볼 수 있다.
  const handleCopyCalendarLink = async (nurse) => {
    if (!currentUser?.token) return;
    setCalendarLoadingId(nurse.id);
    try {
      const res = await fetch(`/api/nurses/${nurse.id}/calendar-link`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('캘린더 구독 링크를 가져오지 못했습니다.'));
      const fullUrl = `${window.location.origin}${data.path}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
        alert(t('{{name}}님의 캘린더 구독 링크가 복사되었습니다.\n구글/애플 캘린더의 "URL로 구독" 기능에 붙여넣으면, 발행된 근무표가 자동으로 캘린더에 표시됩니다.', { name: nurse.name }));
      } catch (clipboardErr) {
        // 클립보드 접근이 막힌 환경(권한 없음 등)에서는 링크를 그냥 보여준다.
        window.prompt(t('아래 링크를 복사해서 캘린더 앱의 "URL로 구독" 기능에 붙여넣으세요.'), fullUrl);
      }
    } catch (err) {
      alert(err.message || t('오류가 발생했습니다.'));
    } finally {
      setCalendarLoadingId(null);
    }
  };

  // 부서별로 그룹핑 (부서 미지정은 "미지정 부서"로 묶음), 부서명 가나다순 정렬
  const groups = React.useMemo(() => {
    const map = new Map();
    nurses.forEach(nurse => {
      const dept = (nurse.department || '').trim() || '미지정 부서';
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept).push(nurse);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'ko'));
  }, [nurses]);

  const startEdit = (nurse) => {
    setEditingId(nurse.id);
    setEditValues({
      name: nurse.name,
      qualification: nurse.qualification,
      experience: nurse.experience,
      department: nurse.department
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const saveEdit = async (id) => {
    if (!editValues.name.trim()) {
      alert(t('간호사 이름을 입력해주세요'));
      return;
    }
    const success = await updateNurse(id, editValues);
    if (success !== false) {
      setEditingId(null);
      setEditValues(null);
    }
  };

  const renderActions = (nurse) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      <button
        onClick={() => startEdit(nurse)}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
        title={t('수정')}
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => handleCopyCalendarLink(nurse)}
        disabled={calendarLoadingId === nurse.id}
        style={{
          backgroundColor: '#0ea5e9',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: calendarLoadingId === nurse.id ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          opacity: calendarLoadingId === nurse.id ? 0.6 : 1
        }}
        title={t('캘린더 구독 링크 복사')}
      >
        {calendarLoadingId === nurse.id ? <Loader2 size={14} className="animate-spin" /> : <CalendarClock size={14} />}
      </button>
      {nurse.status === 'active' && (
        <button
          onClick={() => updateNurseStatus(nurse.id, 'disabled')}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={t('근무 중지')}
        >
          <EyeOff size={14} />
        </button>
      )}
      {nurse.status === 'disabled' && (
        <button
          onClick={() => updateNurseStatus(nurse.id, 'active')}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={t('근무 재개')}
        >
          <Eye size={14} />
        </button>
      )}
      <button
        onClick={() => updateNurseStatus(nurse.id, 'archived')}
        style={{
          backgroundColor: '#6b7280',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
        title={t('보관')}
      >
        <Archive size={14} />
      </button>
      <button
        onClick={() => deleteNurse(nurse.id)}
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
        title={t('삭제')}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const renderEditActions = (nurse) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      <button
        onClick={() => saveEdit(nurse.id)}
        style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
        title={t('저장')}
      >
        <Check size={14} />
      </button>
      <button
        onClick={cancelEdit}
        style={{
          backgroundColor: '#6b7280',
          color: 'white',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
        title={t('취소')}
      >
        <X size={14} />
      </button>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div className="scroll-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('이름')}</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('자격')}</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('경력')}</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('부서')}</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('상태')}</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{t('마지막 근무')}</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{t('작업')}</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>
                  {t('표시할 간호사가 없습니다.')}
                </td>
              </tr>
            ) : (
              groups.map(([department, deptNurses]) => (
                <React.Fragment key={department}>
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#eef2ff',
                        borderTop: '1px solid #e0e7ff',
                        borderBottom: '1px solid #e0e7ff',
                        fontWeight: '700',
                        color: '#3730a3',
                        fontSize: '13px'
                      }}
                    >
                      {t(department)} <span style={{ fontWeight: '400', color: '#6366f1', fontSize: '12px' }}>{t('({{length}}명)', {
                        length: deptNurses.length
                      })}</span>
                    </td>
                  </tr>
                  {deptNurses.map(nurse => {
                    const isEditing = editingId === nurse.id;

                    if (isEditing) {
                      return (
                        <tr key={nurse.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#eff6ff' }}>
                          <td style={{ padding: '10px' }}>
                            {nameOptions.length > 0 ? (
                              <SelectOrCustom
                                value={editValues.name}
                                onChange={(v) => setEditValues({ ...editValues, name: v })}
                                options={nameOptions}
                              />
                            ) : (
                              <input
                                type="text"
                                value={editValues.name}
                                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                style={inputStyle}
                              />
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <SelectOrCustom
                              value={editValues.qualification}
                              onChange={(v) => setEditValues({ ...editValues, qualification: v })}
                              options={QUALIFICATION_OPTIONS}
                            />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <SelectOrCustom
                              value={editValues.experience}
                              onChange={(v) => setEditValues({ ...editValues, experience: v })}
                              options={EXPERIENCE_OPTIONS}
                            />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <SelectOrCustom
                              value={editValues.department}
                              onChange={(v) => setEditValues({ ...editValues, department: v })}
                              options={DEPARTMENT_OPTIONS}
                            />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <StatusBadge text={nurse.status} type="status" status={nurse.status} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            {SHIFT_TYPES.includes(nurse.lastShiftType) ? t(shiftLabel(nurse.lastShiftType)) : t('없음')}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {renderEditActions(nurse)}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={nurse.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{nurse.name}</td>
                        <td style={{ padding: '12px' }}>
                          <StatusBadge
                            text={nurse.qualification}
                            type="qualification"
                            qualification={nurse.qualification}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>{t(nurse.experience)}</td>
                        <td style={{ padding: '12px' }}>{t(nurse.department)}</td>
                        <td style={{ padding: '12px' }}>
                          <StatusBadge
                            text={nurse.status}
                            type="status"
                            status={nurse.status}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          {SHIFT_TYPES.includes(nurse.lastShiftType) ? t(shiftLabel(nurse.lastShiftType)) : t('없음')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {renderActions(nurse)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NurseTable;
