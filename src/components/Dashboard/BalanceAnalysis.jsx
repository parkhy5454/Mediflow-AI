// // src/components/Dashboard/BalanceAnalysis.jsx
// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
// import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

// const BalanceAnalysis = ({ nurses, selectedMonth, selectedYear }) => {
//   // Generate balance analysis data
//   const balanceData = nurses
//     .filter(nurse => nurse.status === 'active')
//     .map(nurse => {
//       const thisMonthMorning = nurse.lastMonthMorning || 0;
//       const thisMonthNight = nurse.lastMonthNight || 0;
//       const cumulativeMorning = nurse.totalCumulativeMorning || thisMonthMorning;
//       const cumulativeNight = nurse.totalCumulativeNight || thisMonthNight;
      
//       const thisMonthBalance = thisMonthMorning - thisMonthNight;
//       const cumulativeBalance = cumulativeMorning - cumulativeNight;
//       const balanceScore = nurse.balanceMetadata?.balanceScore || Math.abs(thisMonthBalance);
      
//       return {
//         name: nurse.name,
//         thisMonthMorning,
//         thisMonthNight,
//         cumulativeMorning,
//         cumulativeNight,
//         thisMonthBalance,
//         cumulativeBalance,
//         balanceScore,
//         isBalanced: Math.abs(cumulativeBalance) <= 1,
//         trend: cumulativeBalance > thisMonthBalance ? 'improving' : 
//                cumulativeBalance < thisMonthBalance ? 'declining' : 'stable'
//       };
//     })
//     .sort((a, b) => Math.abs(a.cumulativeBalance) - Math.abs(b.cumulativeBalance));

//   const balancedNurses = balanceData.filter(n => n.isBalanced).length;
//   const totalNurses = balanceData.length;
//   const avgCumulativeBalance = balanceData.reduce((sum, n) => sum + Math.abs(n.cumulativeBalance), 0) / totalNurses;
  
//   // Get balance trend icon
//   const getBalanceIcon = (balance, trend) => {
//     if (Math.abs(balance) <= 1) return <CheckCircle size={16} style={{ color: '#10b981' }} />;
//     if (trend === 'improving') return <TrendingUp size={16} style={{ color: '#3b82f6' }} />;
//     if (trend === 'declining') return <TrendingDown size={16} style={{ color: '#ef4444' }} />;
//     return <Minus size={16} style={{ color: '#6b7280' }} />;
//   };

//   // Get balance status color
//   const getBalanceColor = (balance) => {
//     const absBalance = Math.abs(balance);
//     if (absBalance <= 1) return '#10b981'; // Green - Perfect balance
//     if (absBalance <= 3) return '#f59e0b'; // Yellow - Minor imbalance
//     return '#ef4444'; // Red - Major imbalance
//   };

//   return (
//     <div style={{ 
//       backgroundColor: 'white', 
//       padding: '20px', 
//       borderRadius: '8px', 
//       border: '1px solid #e5e7eb', 
//       marginBottom: '20px' 
//     }}>
//       <h3 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
//         📊 Workload Balance Analysis
//         <div style={{
//           backgroundColor: balancedNurses === totalNurses ? '#dcfce7' : balancedNurses > totalNurses / 2 ? '#fef3c7' : '#fee2e2',
//           color: balancedNurses === totalNurses ? '#166534' : balancedNurses > totalNurses / 2 ? '#92400e' : '#dc2626',
//           padding: '4px 8px',
//           borderRadius: '12px',
//           fontSize: '12px',
//           fontWeight: '600'
//         }}>
//           {balancedNurses}/{totalNurses} Balanced
//         </div>
//       </h3>

//       {/* Balance Summary Cards */}
//       <div style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
//         gap: '15px', 
//         marginBottom: '25px' 
//       }}>
//         <div style={{
//           backgroundColor: '#f0f9ff',
//           border: '1px solid #bae6fd',
//           borderRadius: '8px',
//           padding: '15px',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
//             {((balancedNurses / totalNurses) * 100).toFixed(0)}%
//           </div>
//           <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
//             Perfect Balance
//           </div>
//         </div>

//         <div style={{
//           backgroundColor: '#fef3c7',
//           border: '1px solid #fcd34d',
//           borderRadius: '8px',
//           padding: '15px',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
//             {avgCumulativeBalance.toFixed(1)}
//           </div>
//           <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
//             Avg Balance Score
//           </div>
//         </div>

//         <div style={{
//           backgroundColor: '#f0fdf4',
//           border: '1px solid #bbf7d0',
//           borderRadius: '8px',
//           padding: '15px',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
//             {balanceData.filter(n => n.trend === 'improving').length}
//           </div>
//           <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
//             Improving Balance
//           </div>
//         </div>

//         <div style={{
//           backgroundColor: '#fef2f2',
//           border: '1px solid #fecaca',
//           borderRadius: '8px',
//           padding: '15px',
//           textAlign: 'center'
//         }}>
//           <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
//             {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 3).length}
//           </div>
//           <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
//             Need Attention
//           </div>
//         </div>
//       </div>

//       {/* Cumulative Balance Chart */}
//       <div style={{ marginBottom: '25px' }}>
//         <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>Cumulative Morning vs Night Balance</h4>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={balanceData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis 
//               dataKey="name" 
//               angle={-45} 
//               textAnchor="end" 
//               height={80}
//               fontSize={12}
//             />
//             <YAxis />
//             <Tooltip 
//               formatter={(value, name) => [
//                 value, 
//                 name === 'cumulativeMorning' ? 'Morning Shifts' : 'Night Shifts'
//               ]}
//               labelFormatter={(label) => `Nurse: ${label}`}
//             />
//             <Legend />
//             <Bar dataKey="cumulativeMorning" fill="#3b82f6" name="Morning Shifts" />
//             <Bar dataKey="cumulativeNight" fill="#8b5cf6" name="Night Shifts" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Balance Details Table */}
//       <div style={{ marginBottom: '20px' }}>
//         <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>Individual Balance Details</h4>
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ 
//             width: '100%', 
//             borderCollapse: 'collapse',
//             fontSize: '13px'
//           }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f9fafb' }}>
//                 <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
//                   Nurse
//                 </th>
//                 <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
//                   This Month
//                 </th>
//                 <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
//                   Cumulative
//                 </th>
//                 <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
//                   Balance
//                 </th>
//                 <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {balanceData.map((nurse, index) => (
//                 <tr key={nurse.name} style={{ 
//                   backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
//                   borderBottom: '1px solid #f3f4f6'
//                 }}>
//                   <td style={{ padding: '10px 8px', fontWeight: '500' }}>
//                     {nurse.name}
//                   </td>
//                   <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px' }}>
//                     <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
//                       <span style={{ color: '#3b82f6' }}>{nurse.thisMonthMorning}M</span>
//                       <span style={{ color: '#8b5cf6' }}>{nurse.thisMonthNight}N</span>
//                     </div>
//                   </td>
//                   <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px' }}>
//                     <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
//                       <span style={{ color: '#3b82f6', fontWeight: '600' }}>{nurse.cumulativeMorning}M</span>
//                       <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{nurse.cumulativeNight}N</span>
//                     </div>
//                   </td>
//                   <td style={{ padding: '10px 8px', textAlign: 'center' }}>
//                     <div style={{ 
//                       display: 'inline-flex', 
//                       alignItems: 'center', 
//                       gap: '4px',
//                       padding: '4px 8px',
//                       borderRadius: '12px',
//                       backgroundColor: Math.abs(nurse.cumulativeBalance) <= 1 ? '#dcfce7' : 
//                                      Math.abs(nurse.cumulativeBalance) <= 3 ? '#fef3c7' : '#fee2e2',
//                       color: Math.abs(nurse.cumulativeBalance) <= 1 ? '#166534' : 
//                              Math.abs(nurse.cumulativeBalance) <= 3 ? '#92400e' : '#dc2626',
//                       fontSize: '12px',
//                       fontWeight: '600'
//                     }}>
//                       {nurse.cumulativeBalance > 0 ? '+' : ''}{nurse.cumulativeBalance}
//                     </div>
//                   </td>
//                   <td style={{ padding: '10px 8px', textAlign: 'center' }}>
//                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
//                       {getBalanceIcon(nurse.cumulativeBalance, nurse.trend)}
//                       <span style={{ 
//                         fontSize: '11px',
//                         color: Math.abs(nurse.cumulativeBalance) <= 1 ? '#166534' : '#6b7280'
//                       }}>
//                         {Math.abs(nurse.cumulativeBalance) <= 1 ? 'Perfect' : 
//                          nurse.trend === 'improving' ? 'Improving' :
//                          nurse.trend === 'declining' ? 'Declining' : 'Stable'}
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Balance Recommendations */}
//       {balancedNurses < totalNurses && (
//         <div style={{
//           backgroundColor: '#fffbeb',
//           border: '1px solid #fcd34d',
//           borderRadius: '8px',
//           padding: '15px'
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
//             <AlertTriangle size={18} style={{ color: '#d97706' }} />
//             <strong style={{ color: '#92400e' }}>Balance Recommendations</strong>
//           </div>
//           <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
//             {balanceData
//               .filter(n => Math.abs(n.cumulativeBalance) > 1)
//               .slice(0, 3)
//               .map(nurse => (
//                 <div key={nurse.name} style={{ marginBottom: '4px' }}>
//                   • <strong>{nurse.name}</strong>: {nurse.cumulativeBalance > 0 ? 
//                     `Has ${nurse.cumulativeBalance} more morning shifts - prioritize for night shifts next month` :
//                     `Has ${Math.abs(nurse.cumulativeBalance)} more night shifts - prioritize for morning shifts next month`}
//                 </div>
//               ))}
//             {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 1).length > 3 && (
//               <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
//                 And {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 1).length - 3} more nurses need balance adjustments...
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BalanceAnalysis;


// src/components/Dashboard/BalanceAnalysis.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
// src/components/Dashboard/BalanceAnalysis.jsx (4교대 D/E/N/M 분포 분석으로 재설계)
import { SHIFT_TYPES, shiftLabel, shiftColor } from '../../constants/shiftTypes';

const BalanceAnalysis = ({ nurses, rosterConfig }) => {
  const shiftTypes = rosterConfig?.shifts ? Object.keys(rosterConfig.shifts) : SHIFT_TYPES;

  // [수정] "주간 vs 야간" 이분법 대신, 누적 근무일이 교대 4종류에 얼마나 고르게
  // 퍼져 있는지를 기준으로 균형을 판단한다. (평균에서 가장 많이 벗어난 교대의 편차 = 균형 점수)
  const balanceData = nurses
    .filter(nurse => nurse.status === 'active')
    .map(nurse => {
      const daysByShift = {};
      shiftTypes.forEach(s => {
        daysByShift[s] = (nurse.historicalDaysByShift && nurse.historicalDaysByShift[s]) || 0;
      });
      const total = shiftTypes.reduce((sum, s) => sum + daysByShift[s], 0);
      const avg = total / shiftTypes.length;
      const maxDeviation = shiftTypes.length > 0
        ? Math.max(...shiftTypes.map(s => Math.abs(daysByShift[s] - avg)))
        : 0;

      // 가장 적게 배정된 교대 (다음 달 우선 배정 추천용)
      const leastShift = shiftTypes.reduce((min, s) => (daysByShift[s] < daysByShift[min] ? s : min), shiftTypes[0]);

      return {
        name: nurse.name,
        daysByShift,
        total,
        maxDeviation,
        isBalanced: maxDeviation <= 1,
        leastShift
      };
    })
    .sort((a, b) => a.maxDeviation - b.maxDeviation);

  const totalNurses = balanceData.length;
  const balancedNurses = balanceData.filter(n => n.isBalanced).length;
  const needsAttention = balanceData.filter(n => n.maxDeviation > 3).length;
  const avgDeviation = totalNurses > 0
    ? balanceData.reduce((sum, n) => sum + n.maxDeviation, 0) / totalNurses
    : 0;

  if (totalNurses === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
        📊 업무량 균형 분석 (4교대)
        <div style={{
          backgroundColor: balancedNurses === totalNurses ? '#dcfce7' : balancedNurses > totalNurses / 2 ? '#fef3c7' : '#fee2e2',
          color: balancedNurses === totalNurses ? '#166534' : balancedNurses > totalNurses / 2 ? '#92400e' : '#dc2626',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {balancedNurses}/{totalNurses}명 균형
        </div>
      </h3>

      {/* 요약 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
            {((balancedNurses / totalNurses) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>완벽한 균형</div>
        </div>

        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
            {avgDeviation.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>평균 편차 점수</div>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {needsAttention}
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>주의 필요</div>
        </div>
      </div>

      {/* 교대별 누적 근무일 차트 */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>간호사별 누적 교대 분포</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={balanceData.map(n => ({ name: n.name, ...n.daysByShift }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, shiftLabel(name)]} labelFormatter={(label) => `간호사: ${label}`} />
            <Legend formatter={(value) => shiftLabel(value)} />
            {shiftTypes.map(s => (
              <Bar key={s} dataKey={s} fill={shiftColor(s)} name={s} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 상세 표 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>개인별 균형 상세</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>간호사</th>
                {shiftTypes.map(s => (
                  <th key={s} style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    {shiftLabel(s)} (누적)
                  </th>
                ))}
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>편차</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map(nurse => (
                <tr key={nurse.name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '500' }}>{nurse.name}</td>
                  {shiftTypes.map(s => (
                    <td key={s} style={{ padding: '10px 8px', textAlign: 'center', color: shiftColor(s), fontWeight: '600' }}>
                      {nurse.daysByShift[s]}
                    </td>
                  ))}
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: nurse.maxDeviation <= 1 ? '#dcfce7' : nurse.maxDeviation <= 3 ? '#fef3c7' : '#fee2e2',
                      color: nurse.maxDeviation <= 1 ? '#166534' : nurse.maxDeviation <= 3 ? '#92400e' : '#dc2626',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {nurse.maxDeviation.toFixed(1)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                      {nurse.isBalanced
                        ? <CheckCircle size={16} style={{ color: '#10b981' }} />
                        : <AlertTriangle size={16} style={{ color: '#d97706' }} />}
                      <span style={{ fontSize: '11px', color: nurse.isBalanced ? '#166534' : '#6b7280' }}>
                        {nurse.isBalanced ? '완벽' : '조정 필요'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 균형 조정 권장사항 */}
      {needsAttention > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={16} style={{ color: '#d97706' }} />
            <strong style={{ color: '#92400e' }}>균형 조정 권장사항</strong>
          </div>
          <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
            {balanceData
              .filter(n => n.maxDeviation > 1)
              .slice(0, 3)
              .map(nurse => (
                <div key={nurse.name} style={{ marginBottom: '4px' }}>
                  • <strong>{nurse.name}</strong>: {shiftLabel(nurse.leastShift)} 근무가 상대적으로 적음 - 다음 달은 {shiftLabel(nurse.leastShift)} 우선 배정 권장
                </div>
              ))}
            {balanceData.filter(n => n.maxDeviation > 1).length > 3 && (
              <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                그 외 {balanceData.filter(n => n.maxDeviation > 1).length - 3}명의 간호사가 균형 조정이 필요합니다...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceAnalysis;
