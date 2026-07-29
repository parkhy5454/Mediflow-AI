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

const BalanceAnalysis = ({ nurses, selectedMonth, selectedYear }) => {
  // Generate balance analysis data
  const balanceData = nurses
    .filter(nurse => nurse.status === 'active')
    .map(nurse => {
      const thisMonthMorning = nurse.lastMonthMorning || 0;
      const thisMonthNight = nurse.lastMonthNight || 0;
      const cumulativeMorning = nurse.totalCumulativeMorning || thisMonthMorning;
      const cumulativeNight = nurse.totalCumulativeNight || thisMonthNight;
      
      const thisMonthBalance = thisMonthMorning - thisMonthNight;
      const cumulativeBalance = cumulativeMorning - cumulativeNight;
      const balanceScore = nurse.balanceMetadata?.balanceScore || Math.abs(thisMonthBalance);
      
      return {
        name: nurse.name,
        thisMonthMorning,
        thisMonthNight,
        cumulativeMorning,
        cumulativeNight,
        thisMonthBalance,
        cumulativeBalance,
        balanceScore,
        isBalanced: Math.abs(cumulativeBalance) <= 1,
        trend: cumulativeBalance > thisMonthBalance ? 'improving' : 
               cumulativeBalance < thisMonthBalance ? 'declining' : 'stable'
      };
    })
    .sort((a, b) => Math.abs(a.cumulativeBalance) - Math.abs(b.cumulativeBalance));

  const balancedNurses = balanceData.filter(n => n.isBalanced).length;
  const totalNurses = balanceData.length;
  const avgCumulativeBalance = balanceData.reduce((sum, n) => sum + Math.abs(n.cumulativeBalance), 0) / totalNurses;
  
  // Get balance trend icon
  const getBalanceIcon = (balance, trend) => {
    if (Math.abs(balance) <= 1) return <CheckCircle size={16} style={{ color: '#10b981' }} />;
    if (trend === 'improving') return <TrendingUp size={16} style={{ color: '#3b82f6' }} />;
    if (trend === 'declining') return <TrendingDown size={16} style={{ color: '#ef4444' }} />;
    return <Minus size={16} style={{ color: '#6b7280' }} />;
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb', 
      marginBottom: '20px' 
    }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
        📊 Workload Balance Analysis
        <div style={{
          backgroundColor: balancedNurses === totalNurses ? '#dcfce7' : balancedNurses > totalNurses / 2 ? '#fef3c7' : '#fee2e2',
          color: balancedNurses === totalNurses ? '#166534' : balancedNurses > totalNurses / 2 ? '#92400e' : '#dc2626',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {balancedNurses}/{totalNurses} Balanced
        </div>
      </h3>

      {/* Balance Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '25px' 
      }}>
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
            {((balancedNurses / totalNurses) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
            Perfect Balance
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
            {avgCumulativeBalance.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
            Avg Balance Score
          </div>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {balanceData.filter(n => n.trend === 'improving').length}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
            Improving Balance
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 3).length}
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
            Need Attention
          </div>
        </div>
      </div>

      {/* Cumulative Balance Chart */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>Cumulative Morning vs Night Balance</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'cumulativeMorning' ? 'Morning Shifts' : 'Night Shifts'
              ]}
              labelFormatter={(label) => `Nurse: ${label}`}
            />
            <Legend />
            <Bar dataKey="cumulativeMorning" fill="#3b82f6" name="Morning Shifts" />
            <Bar dataKey="cumulativeNight" fill="#8b5cf6" name="Night Shifts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Balance Details Table */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>Individual Balance Details</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Nurse
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  This Month
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  Cumulative
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  Balance
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map((nurse, index) => (
                <tr key={nurse.name} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                    {nurse.name}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <span style={{ color: '#3b82f6' }}>{nurse.thisMonthMorning}M</span>
                      <span style={{ color: '#8b5cf6' }}>{nurse.thisMonthNight}N</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <span style={{ color: '#3b82f6', fontWeight: '600' }}>{nurse.cumulativeMorning}M</span>
                      <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{nurse.cumulativeNight}N</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: Math.abs(nurse.cumulativeBalance) <= 1 ? '#dcfce7' : 
                                     Math.abs(nurse.cumulativeBalance) <= 3 ? '#fef3c7' : '#fee2e2',
                      color: Math.abs(nurse.cumulativeBalance) <= 1 ? '#166534' : 
                             Math.abs(nurse.cumulativeBalance) <= 3 ? '#92400e' : '#dc2626',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {nurse.cumulativeBalance > 0 ? '+' : ''}{nurse.cumulativeBalance}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                      {getBalanceIcon(nurse.cumulativeBalance, nurse.trend)}
                      <span style={{ 
                        fontSize: '11px',
                        color: Math.abs(nurse.cumulativeBalance) <= 1 ? '#166534' : '#6b7280'
                      }}>
                        {Math.abs(nurse.cumulativeBalance) <= 1 ? 'Perfect' : 
                         nurse.trend === 'improving' ? 'Improving' :
                         nurse.trend === 'declining' ? 'Declining' : 'Stable'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Recommendations */}
      {balancedNurses < totalNurses && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
            <strong style={{ color: '#92400e' }}>Balance Recommendations</strong>
          </div>
          <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
            {balanceData
              .filter(n => Math.abs(n.cumulativeBalance) > 1)
              .slice(0, 3)
              .map(nurse => (
                <div key={nurse.name} style={{ marginBottom: '4px' }}>
                  • <strong>{nurse.name}</strong>: {nurse.cumulativeBalance > 0 ? 
                    `Has ${nurse.cumulativeBalance} more morning shifts - prioritize for night shifts next month` :
                    `Has ${Math.abs(nurse.cumulativeBalance)} more night shifts - prioritize for morning shifts next month`}
                </div>
              ))}
            {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 1).length > 3 && (
              <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                And {balanceData.filter(n => Math.abs(n.cumulativeBalance) > 1).length - 3} more nurses need balance adjustments...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceAnalysis;