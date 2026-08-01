// src/services/exportService.js (4교대 D/E/N/M 시스템 대응)
import ExcelJS from 'exceljs';
import { getDaysInMonth, getMonthName } from '../utils/dateUtils';
import { shiftLabel, shiftFullLabel } from '../constants/shiftTypes';

const validateRosterData = (monthRoster) => {
  if (!monthRoster || Object.keys(monthRoster).length === 0) {
    throw new Error('내보낼 근무표 데이터가 없습니다.');
  }

  const hasValidData = Object.keys(monthRoster).some(day => {
    const dayData = monthRoster[day];
    if (!dayData) return false;
    return Object.keys(dayData).some(key => dayData[key] && dayData[key].length > 0);
  });

  if (!hasValidData) {
    throw new Error('근무표 데이터가 비어있거나 올바르지 않습니다.');
  }

  return true;
};

// 교대 종류(D/E/N/M)별 근무일수를 동적으로 집계
const generateWorkloadSummary = (monthRoster, selectedMonth, selectedYear, shiftTypes) => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const nurseWorkload = {};

  const ensureNurse = (nurse) => {
    if (!nurseWorkload[nurse.name]) {
      nurseWorkload[nurse.name] = {
        name: nurse.name,
        qualification: nurse.qualification || 'N/A',
        daysByShift: Object.fromEntries(shiftTypes.map(s => [s, 0])),
        offDutyDays: 0,
        totalWorkDays: 0
      };
    }
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = monthRoster[day];
    if (!dayData) continue;

    shiftTypes.forEach(s => {
      dayData[s]?.forEach(nurse => {
        ensureNurse(nurse);
        nurseWorkload[nurse.name].daysByShift[s]++;
        nurseWorkload[nurse.name].totalWorkDays++;
      });
    });

    dayData.offDuty?.forEach(nurse => {
      ensureNurse(nurse);
      nurseWorkload[nurse.name].offDutyDays++;
    });
  }

  return Object.values(nurseWorkload).sort((a, b) => a.name.localeCompare(b.name));
};

// PDF 내보내기(exportToPDF)에서 쓰는 것과 동일한 색상을 엑셀 셀 배경/글자색(ARGB)으로 사용해
// 두 내보내기 결과물의 색감이 서로 일치하도록 맞춘다.
const EXCEL_COLORS = {
  titleBg: 'FF3B82F6',
  titleText: 'FFFFFFFF',
  sectionHeaderText: 'FF1F2937',
  tableHeaderBg: 'FFF3F4F6',
  tableHeaderText: 'FF1F2937',
  workloadHeaderBg: 'FF3B82F6',
  workloadHeaderText: 'FFFFFFFF',
  zebra: 'FFF9FAFB',
  weekendBg: 'FFFEE2E2',
  weekendText: 'FFDC2626',
  offDutyBg: 'FFF3F4F6',
  offDutyText: 'FF374151',
  availableBg: 'FFDCFCE7',
  availableText: 'FF166534',
  border: 'FFD1D5DB',
  muted: 'FF6B7280'
};

const SHIFT_EXCEL_STYLE = {
  D: { bg: 'FFFEF3C7', text: 'FF92400E' },
  E: { bg: 'FFDBEAFE', text: 'FF1E40AF' },
  N: { bg: 'FFE0E7FF', text: 'FF5B21B6' },
  M: { bg: 'FFD1FAE5', text: 'FF065F46' }
};

const thinBorder = {
  top: { style: 'thin', color: { argb: EXCEL_COLORS.border } },
  left: { style: 'thin', color: { argb: EXCEL_COLORS.border } },
  bottom: { style: 'thin', color: { argb: EXCEL_COLORS.border } },
  right: { style: 'thin', color: { argb: EXCEL_COLORS.border } }
};

const solidFill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });


// Export to Excel (.xlsx) — PDF 내보내기와 동일한 색상/구조로 서식 있는 실제 엑셀 파일 생성
export const exportToExcel = async (monthRoster, selectedMonth, selectedYear, rosterConfig) => {
  try {
    validateRosterData(monthRoster);

    const shiftTypes = Object.keys(rosterConfig.shifts);
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthName = getMonthName(selectedMonth);
    const workloadSummary = generateWorkloadSummary(monthRoster, selectedMonth, selectedYear, shiftTypes);

    // 일별 근무표 테이블의 총 열 수(일/날짜/요일 + 교대별 열 + 비번) = 병합 범위 계산에 사용
    const totalCols = 3 + shiftTypes.length + 1;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '병원 간호사 근무 관리 시스템';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(`${selectedYear}년 ${monthName}`, {
      views: [{ showGridLines: false }]
    });

    let r = 1; // 현재 작성 중인 행 번호

    // ── 제목 ─────────────────────────────────────────
    sheet.mergeCells(r, 1, r, totalCols);
    const titleCell = sheet.getCell(r, 1);
    titleCell.value = '🏥 병원 간호사 근무표 시스템';
    titleCell.font = { size: 18, bold: true, color: { argb: EXCEL_COLORS.titleText } };
    titleCell.fill = solidFill(EXCEL_COLORS.titleBg);
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(r).height = 28;
    r++;

    sheet.mergeCells(r, 1, r, totalCols);
    const subtitleCell = sheet.getCell(r, 1);
    subtitleCell.value = `${selectedYear}년 ${monthName}   |   생성일: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    subtitleCell.font = { size: 11, italic: true, color: { argb: EXCEL_COLORS.muted } };
    subtitleCell.alignment = { horizontal: 'center' };
    r += 2;

    // ── 근무표 설정 ─────────────────────────────────────
    sheet.mergeCells(r, 1, r, totalCols);
    sheet.getCell(r, 1).value = '📊 근무표 설정';
    sheet.getCell(r, 1).font = { size: 13, bold: true, color: { argb: EXCEL_COLORS.sectionHeaderText } };
    r++;

    const configHeaderRow = sheet.getRow(r);
    ['교대', '필요 인원', '연속 근무(일)', '휴무(일)'].forEach((label, i) => {
      const cell = configHeaderRow.getCell(i + 1);
      cell.value = label;
      cell.font = { bold: true, color: { argb: EXCEL_COLORS.tableHeaderText } };
      cell.fill = solidFill(EXCEL_COLORS.tableHeaderBg);
      cell.border = thinBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    r++;

    shiftTypes.forEach(s => {
      const cfg = rosterConfig.shifts[s];
      const style = SHIFT_EXCEL_STYLE[s];
      const row = sheet.getRow(r);
      const nameCell = row.getCell(1);
      nameCell.value = shiftFullLabel(s);
      nameCell.font = { bold: true, color: { argb: style?.text || EXCEL_COLORS.sectionHeaderText } };
      nameCell.fill = solidFill(style?.bg || 'FFFFFFFF');
      [cfg.size, `${cfg.shiftDays}일`, `${cfg.offDutyAfter}일`].forEach((val, i) => {
        row.getCell(i + 2).value = val;
        row.getCell(i + 2).alignment = { horizontal: 'center' };
      });
      for (let c = 1; c <= 4; c++) row.getCell(c).border = thinBorder;
      r++;
    });
    r += 1;

    // ── 일별 근무표 ─────────────────────────────────────
    sheet.mergeCells(r, 1, r, totalCols);
    sheet.getCell(r, 1).value = '📅 일별 근무표';
    sheet.getCell(r, 1).font = { size: 13, bold: true, color: { argb: EXCEL_COLORS.sectionHeaderText } };
    r++;

    const rosterHeaderRowNum = r;
    const rosterHeaderRow = sheet.getRow(r);
    const rosterHeaders = ['일', '날짜', '요일', ...shiftTypes.map(s => `${shiftFullLabel(s)} (${rosterConfig.shifts[s].size})`), '비번 (OFF)'];
    rosterHeaders.forEach((label, i) => {
      const cell = rosterHeaderRow.getCell(i + 1);
      cell.value = label;
      cell.font = { bold: true, color: { argb: EXCEL_COLORS.tableHeaderText } };
      cell.fill = solidFill(EXCEL_COLORS.tableHeaderBg);
      cell.border = thinBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    r++;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
      const dayData = monthRoster[day];
      const row = sheet.getRow(r);

      const dayCell = row.getCell(1);
      dayCell.value = day;
      dayCell.alignment = { horizontal: 'center', vertical: 'middle' };
      dayCell.font = { bold: true, color: { argb: isWeekend ? EXCEL_COLORS.weekendText : EXCEL_COLORS.sectionHeaderText } };
      dayCell.fill = solidFill(isWeekend ? EXCEL_COLORS.weekendBg : 'FFFFFFFF');

      const dateCell = row.getCell(2);
      dateCell.value = `${day}/${selectedMonth + 1}`;
      const dowCell = row.getCell(3);
      dowCell.value = dayName;
      [dateCell, dowCell].forEach(c => {
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.fill = solidFill(isWeekend ? 'FFFEF2F2' : 'FFFFFFFF');
        if (isWeekend) c.font = { color: { argb: EXCEL_COLORS.weekendText } };
      });

      shiftTypes.forEach((s, si) => {
        const cell = row.getCell(4 + si);
        const nurses = dayData?.[s] || [];
        cell.value = nurses.map(n => `${n.name} (${n.qualification})`).join('\n');
        const style = SHIFT_EXCEL_STYLE[s];
        cell.fill = solidFill(style?.bg || 'FFFFFFFF');
        cell.font = { color: { argb: style?.text || 'FF000000' }, size: 10 };
        cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
      });

      const offCell = row.getCell(4 + shiftTypes.length);
      const offNurses = dayData?.offDuty || [];
      offCell.value = offNurses.map(n => {
        const status = n.daysRemaining > 0 ? `${n.daysRemaining}일 남음` : n.status === 'Available' ? '근무 가능' : '';
        return `${n.name}${status ? ` (${status})` : ''}`;
      }).join('\n');
      offCell.fill = solidFill(EXCEL_COLORS.offDutyBg);
      offCell.font = { color: { argb: EXCEL_COLORS.offDutyText }, size: 10 };
      offCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

      for (let c = 1; c <= totalCols; c++) row.getCell(c).border = thinBorder;

      // 배정 인원이 여러 명이라 줄바꿈이 필요한 행은 살짝 높게
      const maxLines = Math.max(1, ...shiftTypes.map(s => (dayData?.[s]?.length || 0)), offNurses.length);
      row.height = Math.max(18, maxLines * 14);
      r++;
    }
    // 스크롤해도 근무표 헤더가 보이도록 틀 고정
    sheet.views = [{ state: 'frozen', ySplit: rosterHeaderRowNum, showGridLines: false }];
    r += 1;

    // ── 간호사 업무량 요약 ────────────────────────────────
    sheet.mergeCells(r, 1, r, totalCols);
    sheet.getCell(r, 1).value = '👥 간호사 업무량 요약';
    sheet.getCell(r, 1).font = { size: 13, bold: true, color: { argb: EXCEL_COLORS.sectionHeaderText } };
    r++;

    const workloadHeaderRow = sheet.getRow(r);
    const workloadHeaders = ['간호사 이름', '자격', ...shiftTypes.map(s => shiftLabel(s)), '총 근무일', '휴무일'];
    workloadHeaders.forEach((label, i) => {
      const cell = workloadHeaderRow.getCell(i + 1);
      cell.value = label;
      cell.font = { bold: true, color: { argb: EXCEL_COLORS.workloadHeaderText } };
      cell.fill = solidFill(EXCEL_COLORS.workloadHeaderBg);
      cell.border = thinBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    r++;

    workloadSummary.forEach((nurse, idx) => {
      const row = sheet.getRow(r);
      const values = [nurse.name, nurse.qualification, ...shiftTypes.map(s => nurse.daysByShift[s]), nurse.totalWorkDays, nurse.offDutyDays];
      values.forEach((val, i) => {
        const cell = row.getCell(i + 1);
        cell.value = val;
        cell.border = thinBorder;
        cell.alignment = { horizontal: i <= 1 ? 'left' : 'center', vertical: 'middle' };
        cell.fill = solidFill(idx % 2 === 1 ? EXCEL_COLORS.zebra : 'FFFFFFFF');
        if (i === values.length - 2) cell.font = { bold: true }; // 총 근무일 강조
      });
      r++;
    });
    r += 1;

    // ── 월간 통계 ───────────────────────────────────────
    sheet.mergeCells(r, 1, r, totalCols);
    sheet.getCell(r, 1).value = '📈 월간 통계';
    sheet.getCell(r, 1).font = { size: 13, bold: true, color: { argb: EXCEL_COLORS.sectionHeaderText } };
    r++;

    const shiftTotals = {};
    shiftTypes.forEach(s => { shiftTotals[s] = 0; });
    let totalOffDutyDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      shiftTypes.forEach(s => { shiftTotals[s] += dayData?.[s]?.length || 0; });
      totalOffDutyDays += dayData?.offDuty?.length || 0;
    }
    const totalWorkDaysAll = shiftTypes.reduce((sum, s) => sum + shiftTotals[s], 0);
    const averageWorkDays = workloadSummary.length > 0 ? (totalWorkDaysAll / workloadSummary.length).toFixed(1) : 0;

    const stats = [
      ...shiftTypes.map(s => [`총 ${shiftLabel(s)} 근무`, shiftTotals[s]]),
      ['총 휴무일', totalOffDutyDays],
      ['근무 중인 간호사', workloadSummary.length],
      ['간호사당 평균 근무일', averageWorkDays],
      ['이번 달 일수', daysInMonth]
    ];
    stats.forEach(([label, value], idx) => {
      const row = sheet.getRow(r);
      const labelCell = row.getCell(1);
      labelCell.value = label;
      labelCell.font = { color: { argb: EXCEL_COLORS.sectionHeaderText } };
      const valueCell = row.getCell(2);
      valueCell.value = value;
      valueCell.font = { bold: true, color: { argb: EXCEL_COLORS.titleBg } };
      [labelCell, valueCell].forEach(c => {
        c.border = thinBorder;
        c.fill = solidFill(idx % 2 === 1 ? EXCEL_COLORS.zebra : 'FFFFFFFF');
      });
      r++;
    });
    r += 1;

    sheet.mergeCells(r, 1, r, totalCols);
    const footerCell = sheet.getCell(r, 1);
    footerCell.value = '이 근무표는 병원 간호사 근무 관리 시스템에 의해 자동으로 생성되었습니다.';
    footerCell.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.muted } };
    footerCell.alignment = { horizontal: 'center' };

    // ── 열 너비 ────────────────────────────────────────
    sheet.getColumn(1).width = 14;
    sheet.getColumn(2).width = 10;
    sheet.getColumn(3).width = 8;
    shiftTypes.forEach((s, i) => { sheet.getColumn(4 + i).width = 24; });
    sheet.getColumn(4 + shiftTypes.length).width = 26;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `병원_근무표_${selectedYear}년_${monthName}.xlsx`);
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

const SHIFT_BADGE_CLASS = { D: 'shift-d', E: 'shift-e', N: 'shift-n', M: 'shift-m' };

// Export to PDF using HTML and print
export const exportToPDF = (monthRoster, selectedMonth, selectedYear, rosterConfig, nurses) => {
  try {
    validateRosterData(monthRoster);

    const shiftTypes = Object.keys(rosterConfig.shifts);
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthName = getMonthName(selectedMonth);
    const workloadSummary = generateWorkloadSummary(monthRoster, selectedMonth, selectedYear, shiftTypes);

    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
      throw new Error('인쇄 창을 열 수 없습니다. 브라우저의 팝업 차단 설정을 확인해주세요.');
    }

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
          .shift-d { background-color: #fef3c7; color: #92400e; }
          .shift-e { background-color: #dbeafe; color: #1e40af; }
          .shift-n { background-color: #e0e7ff; color: #5b21b6; }
          .shift-m { background-color: #d1fae5; color: #065f46; }
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
            @page {
              margin: 10mm 8mm;
            }
            body { 
              margin: 0; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .section {
              margin-bottom: 15px;
            }
            /* break-inside: avoid는 제목/설정 카드처럼 짧은 섹션(.no-break)에만 건다.
               근무표처럼 긴 섹션까지 여기 걸리면, 남은 페이지 공간에 다 안 들어갈 때
               섹션 전체가 통째로 다음 페이지로 밀려나서 앞 페이지에 큰 빈 공간이 생긴다. */
            .no-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            /* 근무표 같은 긴 표는 섹션 전체를 한 페이지에 욱여넣을 수 없으므로
               섹션 자체는 break-inside를 걸지 않고 자연스럽게 이어서 흐르게 하되,
               표의 각 행(하루치)만 페이지 중간에서 반으로 잘리지 않도록 한다. */
            .roster-table tr,
            .workload-table tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .roster-table thead,
            .workload-table thead {
              display: table-header-group; /* 페이지가 바뀌어도 헤더 행이 다시 보이도록 */
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
        <div class="no-print" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px;">
          💡 인쇄 대화상자에서 <strong>"추가 설정" → "머리글 및 바닥글"</strong> 체크를 해제하면, 페이지마다 뜨는 날짜/URL/페이지 번호 없이 표가 더 깔끔하게 이어져 보입니다.
        </div>
        <div class="header no-break">
          <h1>🏥 병원 간호사 근무표 시스템</h1>
          <h2>${selectedYear}년 ${monthName}</h2>
          <div class="meta">생성일: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <div class="section no-break">
          <h3>📊 근무표 설정</h3>
          <div class="config-grid">
            ${shiftTypes.map(s => {
              const cfg = rosterConfig.shifts[s];
              return `<div class="config-item"><strong>${shiftFullLabel(s)}:</strong> ${cfg.size}명 / 연속 ${cfg.shiftDays}일 근무 / 휴무 ${cfg.offDutyAfter}일</div>`;
            }).join('')}
          </div>
        </div>
        
        <div class="section">
          <h3>📅 일별 근무표</h3>
          <table class="roster-table">
            <thead>
              <tr>
                <th>일</th>
                <th>날짜</th>
                ${shiftTypes.map(s => `<th>${shiftFullLabel(s)} (${rosterConfig.shifts[s].size})</th>`).join('')}
                <th>비번 (OFF)</th>
              </tr>
            </thead>
            <tbody>
    `;

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
        `;

        shiftTypes.forEach(s => {
          tableRows += `<td>`;
          if (dayData?.[s]) {
            const badges = dayData[s].map(nurse =>
              `<span class="nurse-badge ${SHIFT_BADGE_CLASS[s] || ''}">${nurse.name} (${nurse.qualification})</span>`
            ).join(' ');
            tableRows += badges;
          }
          tableRows += `</td>`;
        });

        tableRows += `<td>`;
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
        
        <div class="section">
          <h3>👥 간호사 업무량 요약</h3>
          <table class="workload-table">
            <thead>
              <tr>
                <th>간호사 이름</th>
                <th>자격</th>
                ${shiftTypes.map(s => `<th>${shiftLabel(s)}</th>`).join('')}
                <th>총 근무일</th>
                <th>휴무일</th>
              </tr>
            </thead>
            <tbody>
    `;

    const workloadRows = workloadSummary.map(nurse => `
      <tr>
        <td><strong>${nurse.name}</strong></td>
        <td>${nurse.qualification}</td>
        ${shiftTypes.map(s => `<td>${nurse.daysByShift[s]}</td>`).join('')}
        <td><strong>${nurse.totalWorkDays}</strong></td>
        <td>${nurse.offDutyDays}</td>
      </tr>
    `).join('');

    htmlContent += workloadRows;

    const shiftTotals = {};
    shiftTypes.forEach(s => { shiftTotals[s] = 0; });
    let totalOffDutyDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      shiftTypes.forEach(s => { shiftTotals[s] += dayData?.[s]?.length || 0; });
      totalOffDutyDays += dayData?.offDuty?.length || 0;
    }

    const totalWorkDaysAll = shiftTypes.reduce((sum, s) => sum + shiftTotals[s], 0);
    const averageWorkDays = workloadSummary.length > 0 ?
      (totalWorkDaysAll / workloadSummary.length).toFixed(1) : 0;

    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>📈 월간 통계</h3>
          <div class="summary-stats">
            ${shiftTypes.map(s => `
            <div class="stat-card">
              <div class="stat-number">${shiftTotals[s]}</div>
              <div class="stat-label">총 ${shiftLabel(s)} 근무</div>
            </div>`).join('')}
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();

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
