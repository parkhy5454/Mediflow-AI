// src/components/Settings/Settings.jsx
// [수정] 2교대(주간/야간) 고정 필드 → 4교대(D/E/N/M) 시스템에 맞게 교대별로 동적으로 렌더링.
// [수정 2] 입력할 때마다 자동저장하던 방식 → 화면에서는 임시로만 수정하고, "저장" 버튼을
//   눌러야 실제로 반영되는 방식으로 변경. 인증 방식이 바뀌면서 자동저장이 조용히 실패하고
//   있던 문제도 있었고, 사용자가 명확하게 "저장했다"는 걸 확인할 수 있도록 하기 위함.
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SHIFT_TYPES, shiftFullLabel, shiftTime } from '../../constants/shiftTypes';

const numberInputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const Settings = ({ rosterConfig, updateRosterConfig, departmentOptions, selectedDepartment, setSelectedDepartment }) => {
  // 서버에서 불러온 원본과 별개로, 화면에서 편집 중인 임시 값을 따로 들고 있는다.
  const [draft, setDraft] = useState(rosterConfig);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { success: true } | { success: false, message }

  // 서버에서 설정을 새로 불러오면(예: 페이지 첫 진입) 편집 임시값도 그걸로 맞춘다.
  // 단, 이미 사용자가 뭔가 편집 중이면(dirty 상태) 덮어쓰지 않도록 rosterConfig 자체가
  // 바뀔 때만 반응한다.
  useEffect(() => {
    setDraft(rosterConfig);
  }, [rosterConfig]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(rosterConfig);

  const updateShiftField = (shiftCode, field, value) => {
    setSaveResult(null);
    setDraft(prev => ({
      ...prev,
      shifts: {
        ...prev.shifts,
        [shiftCode]: {
          ...prev.shifts[shiftCode],
          [field]: parseInt(value) || 0
        }
      }
    }));
  };

  const updateOtherField = (key, value) => {
    setSaveResult(null);
    setDraft(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    const result = await updateRosterConfig(draft);
    setSaving(false);
    setSaveResult(result);
  };

  const handleReset = () => {
    setDraft(rosterConfig);
    setSaveResult(null);
  };

  const otherFields = [
    { key: 'minRNPerShift', label: '근무당 최소 정간호사(RN) 수', min: 1, max: 5 },
    { key: 'minMWPerShift', label: '근무당 최소 조산사(MW) 수', min: 1, max: 5 }
  ];

  return (
    <div style={{ padding: '20px', paddingBottom: '90px' }}>
      <h2 style={{ marginBottom: '4px', color: '#1f2937' }}>근무표 설정</h2>
      <p style={{ marginBottom: '14px', color: '#6b7280', fontSize: '13px' }}>
        4교대(데이/이브닝/나이트/미들) 시스템 기준으로 교대별 필요 인원과 근무/휴무 일수를 설정합니다.
        값을 바꾼 뒤 아래 <strong>저장</strong> 버튼을 눌러야 실제로 반영됩니다.
      </p>

      {departmentOptions && departmentOptions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginRight: '8px' }}>
            부서(병동)
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
              fontSize: '14px', fontWeight: '600', color: '#1f2937', backgroundColor: 'white'
            }}
          >
            {departmentOptions.map(dept => (
              <option key={dept || '_unset'} value={dept}>{dept || '미지정'}</option>
            ))}
          </select>
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9ca3af' }}>
            부서마다 필요 인원과 근무/휴무 일수를 따로 설정할 수 있습니다. 지금 편집 중인 설정은 위에서 선택한 부서 것입니다.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SHIFT_TYPES.map(shiftCode => {
          const cfg = draft.shifts[shiftCode];
          return (
            <div
              key={shiftCode}
              style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>{shiftFullLabel(shiftCode)}</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{shiftTime(shiftCode)}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    필요 인원
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cfg.size}
                    onChange={(e) => updateShiftField(shiftCode, 'size', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    연속 근무 기간 (일)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cfg.shiftDays}
                    onChange={(e) => updateShiftField(shiftCode, 'shiftDays', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                    근무 후 휴무 (일)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cfg.offDutyAfter}
                    onChange={(e) => updateShiftField(shiftCode, 'offDutyAfter', e.target.value)}
                    style={numberInputStyle}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#1f2937', fontSize: '16px' }}>공통 설정</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {otherFields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151', fontSize: '13px' }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={draft[field.key]}
                  onChange={(e) => updateOtherField(field.key, e.target.value)}
                  style={numberInputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 저장 바 */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        backgroundColor: 'white', borderTop: '1px solid #e5e7eb',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)', zIndex: 10
      }}>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '6px', border: 'none',
            backgroundColor: (!hasChanges || saving) ? '#d1d5db' : '#3b82f6',
            color: 'white', fontSize: '14px', fontWeight: '600',
            cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer'
          }}
        >
          <Save size={16} />
          {saving ? '저장 중...' : '저장'}
        </button>

        {hasChanges && !saving && (
          <button
            onClick={handleReset}
            style={{
              padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db',
              backgroundColor: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer'
            }}
          >
            변경 취소
          </button>
        )}

        {hasChanges && !saveResult && (
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>저장하지 않은 변경사항이 있습니다.</span>
        )}
        {saveResult?.success && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
            <CheckCircle2 size={16} /> 저장되었습니다.
          </span>
        )}
        {saveResult && !saveResult.success && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
            <AlertTriangle size={16} /> {saveResult.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default Settings;
