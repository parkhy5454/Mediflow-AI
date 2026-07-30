// src/services/exportService.js (Enhanced with Error Handling and Features)
import { getDaysInMonth, getMonthName } from '../utils/dateUtils';

// Utility function to validate roster data
const validateRosterData = (monthRoster) => {
  if (!monthRoster || Object.keys(monthRoster).length === 0) {
    throw new Error('내보낼 근무표 데이터가 없습니다.');
  }

  const hasValidData = Object.keys(monthRoster).some(day => {
    const dayData = monthRoster[day];
    return dayData && (
      (dayData.morning && dayData.morning.length > 0) ||
      (dayData.night && dayData.night.length > 0) ||
      (dayData.offDuty && dayData.offDuty.length > 0)
    );
  });

  if (!hasValidData) {
    throw new Error('근무표 데이터가 비어있거나 올바르지 않습니다.');
  }

  return true;
};

// Generate nurse workload summary for exports
const generateWorkloadSummary = (monthRoster, selectedMonth, selectedYear) => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const nurseWorkload = {};

  // Initialize and calculate workload for each nurse
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = monthRoster[day];
    if (!dayData) continue;

    // Count morning shifts
    dayData.morning?.forEach(nurse => {
      if (!nurseWorkload[nurse.name]) {
        nurseWorkload[nurse.name] = {
          name: nurse.name,
          qualification: nurse.qualification,
          morningShifts: 0,
          nightShifts: 0,
          offDutyDays: 0,
          totalWorkDays: 0
        };
      }
      nurseWorkload[nurse.name].morningShifts++;
      nurseWorkload[nurse.name].totalWorkDays++;
    });

    // Count night shifts
    dayData.night?.forEach(nurse => {
      if (!nurseWorkload[nurse.name]) {
        nurseWorkload[nurse.name] = {
          name: nurse.name,
          qualification: nurse.qualification,
          morningShifts: 0,
          nightShifts: 0,
          offDutyDays: 0,
          totalWorkDays: 0
        };
      }
      nurseWorkload[nurse.name].nightShifts++;
      nurseWorkload[nurse.name].totalWorkDays++;
    });

    // Count off-duty days
    dayData.offDuty?.forEach(nurse => {
      if (!nurseWorkload[nurse.name]) {
        nurseWorkload[nurse.name] = {
          name: nurse.name,
          qualification: nurse.qualification || 'N/A',
          morningShifts: 0,
          nightShifts: 0,
          offDutyDays: 0,
          totalWorkDays: 0
        };
      }
      nurseWorkload[nurse.name].offDutyDays++;
    });
  }

  return Object.values(nurseWorkload).sort((a, b) => a.name.localeCompare(b.name));
};

// Export to Excel using CSV format (compatible with Excel)
export const exportToExcel = (monthRoster, selectedMonth, selectedYear, rosterConfig) => {
  try {
    validateRosterData(monthRoster);

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthName = getMonthName(selectedMonth);
    const workloadSummary = generateWorkloadSummary(monthRoster, selectedMonth, selectedYear);
    
    // Create CSV content with UTF-8 BOM for proper Excel encoding
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `병원 간호사 근무표 - ${selectedYear}년 ${monthName}\n`;
    csvContent += `생성일: ${new Date().toLocaleDateString()}\n\n`;
    
    // Add configuration info
    csvContent += `근무표 설정\n`;
    csvContent += `주간 근무 인원,${rosterConfig.morningShiftSize}\n`;
    csvContent += `야간 근무 인원,${rosterConfig.nightShiftSize}\n`;
    csvContent += `주간 근무 기간,${rosterConfig.morningShiftDays}일\n`;
    csvContent += `야간 근무 기간,${rosterConfig.nightShiftDays}일\n`;
    csvContent += `주간 근무 후 휴무,${rosterConfig.offDutyAfterMorning}일\n`;
    csvContent += `야간 근무 후 휴무,${rosterConfig.offDutyAfterNight}일\n\n`;
    
    // Daily roster table
    csvContent += `일별 근무표\n`;
    csvContent += `일,날짜,요일,주간 근무,야간 근무,비번\n`;
    
    // Data rows
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = date.toLocaleDateString('ko-KR', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString();
      const dayData = monthRoster[day];
      
      const morningNurses = dayData?.morning?.map(n => `${n.name} (${n.qualification})`).join('; ') || '';
      const nightNurses = dayData?.night?.map(n => `${n.name} (${n.qualification})`).join('; ') || '';
      const offDutyNurses = dayData?.offDuty?.map(n => {
        const status = n.daysRemaining > 0 ? `${n.daysRemaining}일 남음` : 
                     n.status === 'Available' ? '근무 가능' : '';
        return `${n.name}${status ? ` (${status})` : ''}`;
      }).join('; ') || '';
      
      csvContent += `${day},"${formattedDate}","${dayName}","${morningNurses}","${nightNurses}","${offDutyNurses}"\n`;
    }
    
    // Add workload summary
    csvContent += `\n\n업무량 요약\n`;
    csvContent += `간호사 이름,자격,주간 근무,야간 근무,총 근무일,휴무일\n`;
    
    workloadSummary.forEach(nurse => {
      csvContent += `"${nurse.name}","${nurse.qualification}",${nurse.morningShifts},${nurse.nightShifts},${nurse.totalWorkDays},${nurse.offDutyDays}\n`;
    });
    
    // Add summary statistics
    csvContent += `\n\n월간 통계\n`;
    let totalMorningShifts = 0;
    let totalNightShifts = 0;
    let totalOffDutyDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      totalMorningShifts += dayData?.morning?.length || 0;
      totalNightShifts += dayData?.night?.length || 0;
      totalOffDutyDays += dayData?.offDuty?.length || 0;
    }
    
    csvContent += `총 주간 근무,${totalMorningShifts}\n`;
    csvContent += `총 야간 근무,${totalNightShifts}\n`;
    csvContent += `총 휴무일,${totalOffDutyDays}\n`;
    csvContent += `근무표 내 전체 간호사,${workloadSummary.length}\n`;
    csvContent += `간호사당 평균 근무일,${workloadSummary.length > 0 ? ((totalMorningShifts + totalNightShifts) / workloadSummary.length).toFixed(1) : 0}\n`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `병원_근무표_${selectedYear}년_${monthName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: `${selectedYear}년 ${monthName} 엑셀 파일이 성공적으로 내보내졌습니다.` };

  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error(`엑셀 파일 내보내기에 실패했습니다: ${error.message}`);
  }
};

// Export to PDF using HTML and print
export const exportToPDF = (monthRoster, selectedMonth, selectedYear, rosterConfig, nurses) => {
  try {
    validateRosterData(monthRoster);

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthName = getMonthName(selectedMonth);
    const workloadSummary = generateWorkloadSummary(monthRoster, selectedMonth, selectedYear);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!printWindow) {
      throw new Error('인쇄 창을 열 수 없습니다. 브라우저의 팝업 차단 설정을 확인해주세요.');
    }
    
    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>병원 간호사 근무표 - ${selectedYear}년 ${monthName}</title>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
          }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header h2 {
            color: #6b7280;
            margin: 8px 0;
            font-size: 20px;
            font-weight: normal;
          }
          .header .meta {
            color: #9ca3af;
            font-size: 14px;
            margin-top: 10px;
          }
          
          .section {
            margin-bottom: 25px;
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .section h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 18px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
          }
          .config-item {
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
          
          .roster-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .roster-table th,
          .roster-table td {
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: left;
            vertical-align: top;
          }
          .roster-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #1f2937;
            font-size: 12px;
          }
          .roster-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .roster-table tr:hover {
            background-color: #f0f9ff;
          }
          
          .day-cell {
            font-weight: bold;
            background-color: #f8fafc !important;
            width: 40px;
            text-align: center;
          }
          .date-cell {
            width: 100px;
            font-size: 10px;
          }
          .weekend {
            background-color: #fef2f2 !important;
          }
          .weekend .day-cell {
            background-color: #fee2e2 !important;
            color: #dc2626;
          }
          
          .nurse-badge {
            display: inline-block;
            padding: 2px 6px;
            margin: 1px;
            border-radius: 3px;
            font-size: 10px;
            white-space: nowrap;
          }
          .morning-shift {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .night-shift {
            background-color: #e0e7ff;
            color: #5b21b6;
          }
          .off-duty {
            background-color: #f3f4f6;
            color: #374151;
          }
          .available {
            background-color: #dcfce7;
            color: #166534;
          }
          
          .workload-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          .workload-table th,
          .workload-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: center;
          }
          .workload-table th {
            background-color: #3b82f6;
            color: white;
          }
          .workload-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .stat-card {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 12px;
            opacity: 0.9;
          }
          
          @media print {
            body { 
              margin: 10px; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .section { 
              break-inside: avoid; 
              margin-bottom: 15px;
            }
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header no-break">
          <h1>🏥 병원 간호사 근무표 시스템</h1>
          <h2>${selectedYear}년 ${monthName}</h2>
          <div class="meta">생성일: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <div class="section no-break">
          <h3>📊 근무표 설정</h3>
          <div class="config-grid">
            <div class="config-item"><strong>주간 근무 인원:</strong> ${rosterConfig.morningShiftSize}명</div>
            <div class="config-item"><strong>야간 근무 인원:</strong> ${rosterConfig.nightShiftSize}명</div>
            <div class="config-item"><strong>주간 근무 기간:</strong> ${rosterConfig.morningShiftDays}일</div>
            <div class="config-item"><strong>야간 근무 기간:</strong> ${rosterConfig.nightShiftDays}일</div>
            <div class="config-item"><strong>주간 근무 후 휴무:</strong> ${rosterConfig.offDutyAfterMorning}일</div>
            <div class="config-item"><strong>야간 근무 후 휴무:</strong> ${rosterConfig.offDutyAfterNight}일</div>
          </div>
        </div>
        
        <div class="section">
          <h3>📅 일별 근무표</h3>
          <table class="roster-table">
            <thead>
              <tr>
                <th>일</th>
                <th>날짜</th>
                <th>주간 근무 (${rosterConfig.morningShiftSize})</th>
                <th>야간 근무 (${rosterConfig.nightShiftSize})</th>
                <th>비번</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Generate table rows
    const generateTableRows = () => {
      let tableRows = '';
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth, day);
        const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const dayData = monthRoster[day];
        
        tableRows += `
          <tr ${isWeekend ? 'class="weekend"' : ''}>
            <td class="day-cell">${day}</td>
            <td class="date-cell">${dayName}<br>${day}/${selectedMonth + 1}</td>
            <td>
        `;
        
        // Morning shift nurses
        if (dayData?.morning) {
          const morningBadges = dayData.morning.map(nurse => 
            `<span class="nurse-badge morning-shift">${nurse.name} (${nurse.qualification})</span>`
          ).join(' ');
          tableRows += morningBadges;
        }
        
        tableRows += `</td><td>`;
        
        // Night shift nurses
        if (dayData?.night) {
          const nightBadges = dayData.night.map(nurse => 
            `<span class="nurse-badge night-shift">${nurse.name} (${nurse.qualification})</span>`
          ).join(' ');
          tableRows += nightBadges;
        }
        
        tableRows += `</td><td>`;
        
        // Off duty nurses
        if (dayData?.offDuty) {
          const offDutyBadges = dayData.offDuty.map(nurse => {
            const badgeClass = nurse.status === 'Available' ? 'available' : 'off-duty';
            const status = nurse.daysRemaining > 0 ? ` (${nurse.daysRemaining}일)` : 
                         nurse.status === 'Available' ? ' (근무 가능)' : '';
            return `<span class="nurse-badge ${badgeClass}">${nurse.name}${status}</span>`;
          }).join(' ');
          tableRows += offDutyBadges;
        }
        
        tableRows += `</td></tr>`;
      }
      
      return tableRows;
    };

    htmlContent += generateTableRows();
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <div class="page-break"></div>
        
        <div class="section">
          <h3>👥 간호사 업무량 요약</h3>
          <table class="workload-table">
            <thead>
              <tr>
                <th>간호사 이름</th>
                <th>자격</th>
                <th>주간 근무</th>
                <th>야간 근무</th>
                <th>총 근무일</th>
                <th>휴무일</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Generate workload summary rows
    const workloadRows = workloadSummary.map(nurse => `
      <tr>
        <td><strong>${nurse.name}</strong></td>
        <td>${nurse.qualification}</td>
        <td>${nurse.morningShifts}</td>
        <td>${nurse.nightShifts}</td>
        <td><strong>${nurse.totalWorkDays}</strong></td>
        <td>${nurse.offDutyDays}</td>
      </tr>
    `).join('');
    
    htmlContent += workloadRows;
    
    // Calculate summary statistics
    let totalMorningShifts = 0;
    let totalNightShifts = 0;
    let totalOffDutyDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      totalMorningShifts += dayData?.morning?.length || 0;
      totalNightShifts += dayData?.night?.length || 0;
      totalOffDutyDays += dayData?.offDuty?.length || 0;
    }
    
    const averageWorkDays = workloadSummary.length > 0 ? 
      ((totalMorningShifts + totalNightShifts) / workloadSummary.length).toFixed(1) : 0;
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>📈 월간 통계</h3>
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-number">${totalMorningShifts}</div>
              <div class="stat-label">총 주간 근무</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalNightShifts}</div>
              <div class="stat-label">총 야간 근무</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalOffDutyDays}</div>
              <div class="stat-label">총 휴무일</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${workloadSummary.length}</div>
              <div class="stat-label">근무 중인 간호사</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${averageWorkDays}</div>
              <div class="stat-label">간호사당 평균 근무일</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${daysInMonth}</div>
              <div class="stat-label">이번 달 일수</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>이 근무표는 병원 간호사 근무 관리 시스템에 의해 자동으로 생성되었습니다.</p>
          <p>© ${new Date().getFullYear()} 병원 관리 시스템 | 생성 시각: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Write content to new window and trigger print
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1500);

    return { success: true, message: `${selectedYear}년 ${monthName} PDF 내보내기가 시작되었습니다.` };

  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`PDF 내보내기에 실패했습니다: ${error.message}`);
  }
};