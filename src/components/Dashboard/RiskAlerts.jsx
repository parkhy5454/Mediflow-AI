// src/components/Dashboard/RiskAlerts.jsx
// [추가] 관리자용 "위험 신호" 카드. 지금 갖고 있는 데이터만으로 계산할 수 있는 두 가지를 보여준다.
// 1) 초과근무 몰림: 이번 달 실제로 생성된 근무표에서 같은 간호사가 같은 교대를 가이드라인
//    권장 상한보다 더 길게 연속으로 하고 있는 경우.
// 2) 인원 부족 위험: 현재 근무표 설정(교대별 필요 인원 · 순환 주기)을 계속 유지하는 데 필요한
//    최소 간호사 수 대비, 지금 활성 간호사 수가 부족한 경우.
// 관리자만 볼 수 있게 currentUser.role === 'admin' 조건으로 렌더링 여부를 판단한다(부모에서 처리).
// 두 계산 모두 "확정된 예측"이 아니라 참고용 추정이므로, 문구에서 단정적인 표현을 피한다.
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { shiftLabel } from '../../constants/shiftTypes';
import { findConsecutiveWorkRisks, findStaffingRisk } from '../../utils/rosterRiskAnalysis';

const RiskAlerts = ({ monthRoster, rosterConfig, activeNurseCount }) => {
  const { t } = useTranslation();
  const shiftCodes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : ['D', 'E', 'N', 'M'];

  const consecutiveRisks = findConsecutiveWorkRisks(monthRoster, shiftCodes);
  const staffingRisk = findStaffingRisk(rosterConfig, activeNurseCount);

  if (consecutiveRisks.length === 0 && !staffingRisk) return null;

  return (
    <div style={{
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 14px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
        <AlertTriangle size={18} />
        {t('위험 신호')}
      </h3>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#92400e', lineHeight: '1.5' }}>
        {t('아래 항목은 실제 발생 여부를 보장하는 확정된 예측이 아니라, 현재 데이터를 바탕으로 한 참고용 추정입니다.')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {staffingRisk && (
          <div style={{ backgroundColor: 'white', borderRadius: '6px', padding: '12px 14px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
              {t('인원 부족 위험')}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {t('현재 근무표 설정을 계속 순환시키려면 약 {{required}}명이 필요할 것으로 추정되는데, 현재 활성 간호사는 {{active}}명입니다. ({{shortfall}}명 부족)', {
                required: staffingRisk.required,
                active: staffingRisk.active,
                shortfall: staffingRisk.shortfall
              })}
            </div>
          </div>
        )}

        {consecutiveRisks.map((risk, idx) => (
          <div key={`${risk.nurseId}-${risk.startDay}-${idx}`} style={{ backgroundColor: 'white', borderRadius: '6px', padding: '12px 14px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
              {t('초과근무 몰림')}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {t('{{name}}님이 {{startDay}}일부터 {{endDay}}일까지 {{shift}} 근무를 {{streak}}일 연속으로 하고 있어, 권장 상한({{max}}일)을 초과했습니다.', {
                name: risk.name,
                startDay: risk.startDay,
                endDay: risk.endDay,
                shift: t(shiftLabel(risk.shiftType)),
                streak: risk.streak,
                max: risk.recommendedMax
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAlerts;
