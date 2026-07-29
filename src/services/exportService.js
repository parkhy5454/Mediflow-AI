// src/services/exportService.js (Enhanced with Error Handling and Features)
import { getDaysInMonth, getMonthName } from '../utils/dateUtils';

// Utility function to validate roster data
const validateRosterData = (monthRoster) => {
  if (!monthRoster || Object.keys(monthRoster).length === 0) {
    throw new Error('No roster data available for export');
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
    throw new Error('Roster data appears to be empty or invalid');
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
    csvContent += `Hospital Nurse Roster - ${monthName} ${selectedYear}\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Add configuration info
    csvContent += `ROSTER CONFIGURATION\n`;
    csvContent += `Morning Shift Size,${rosterConfig.morningShiftSize}\n`;
    csvContent += `Night Shift Size,${rosterConfig.nightShiftSize}\n`;
    csvContent += `Morning Shift Duration,${rosterConfig.morningShiftDays} days\n`;
    csvContent += `Night Shift Duration,${rosterConfig.nightShiftDays} days\n`;
    csvContent += `Off-Duty After Morning,${rosterConfig.offDutyAfterMorning} days\n`;
    csvContent += `Off-Duty After Night,${rosterConfig.offDutyAfterNight} days\n\n`;
    
    // Daily roster table
    csvContent += `DAILY ROSTER\n`;
    csvContent += `Day,Date,Day of Week,Morning Shift,Night Shift,Off Duty\n`;
    
    // Data rows
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString();
      const dayData = monthRoster[day];
      
      const morningNurses = dayData?.morning?.map(n => `${n.name} (${n.qualification})`).join('; ') || '';
      const nightNurses = dayData?.night?.map(n => `${n.name} (${n.qualification})`).join('; ') || '';
      const offDutyNurses = dayData?.offDuty?.map(n => {
        const status = n.daysRemaining > 0 ? `${n.daysRemaining} days remaining` : 
                     n.status === 'Available' ? 'Available' : '';
        return `${n.name}${status ? ` (${status})` : ''}`;
      }).join('; ') || '';
      
      csvContent += `${day},"${formattedDate}","${dayName}","${morningNurses}","${nightNurses}","${offDutyNurses}"\n`;
    }
    
    // Add workload summary
    csvContent += `\n\nWORKLOAD SUMMARY\n`;
    csvContent += `Nurse Name,Qualification,Morning Shifts,Night Shifts,Total Work Days,Off-Duty Days\n`;
    
    workloadSummary.forEach(nurse => {
      csvContent += `"${nurse.name}","${nurse.qualification}",${nurse.morningShifts},${nurse.nightShifts},${nurse.totalWorkDays},${nurse.offDutyDays}\n`;
    });
    
    // Add summary statistics
    csvContent += `\n\nMONTHLY STATISTICS\n`;
    let totalMorningShifts = 0;
    let totalNightShifts = 0;
    let totalOffDutyDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthRoster[day];
      totalMorningShifts += dayData?.morning?.length || 0;
      totalNightShifts += dayData?.night?.length || 0;
      totalOffDutyDays += dayData?.offDuty?.length || 0;
    }
    
    csvContent += `Total Morning Shifts,${totalMorningShifts}\n`;
    csvContent += `Total Night Shifts,${totalNightShifts}\n`;
    csvContent += `Total Off-Duty Days,${totalOffDutyDays}\n`;
    csvContent += `Total Nurses in Roster,${workloadSummary.length}\n`;
    csvContent += `Average Work Days per Nurse,${workloadSummary.length > 0 ? ((totalMorningShifts + totalNightShifts) / workloadSummary.length).toFixed(1) : 0}\n`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Hospital_Roster_${monthName}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: `Excel file exported successfully for ${monthName} ${selectedYear}` };

  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error(`Failed to export Excel file: ${error.message}`);
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
      throw new Error('Unable to open print window. Please check your browser popup settings.');
    }
    
    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hospital Nurse Roster - ${monthName} ${selectedYear}</title>
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
          <h1>🏥 Hospital Nurse Roster System</h1>
          <h2>${monthName} ${selectedYear}</h2>
          <div class="meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <div class="section no-break">
          <h3>📊 Roster Configuration</h3>
          <div class="config-grid">
            <div class="config-item"><strong>Morning Shift Size:</strong> ${rosterConfig.morningShiftSize} nurses</div>
            <div class="config-item"><strong>Night Shift Size:</strong> ${rosterConfig.nightShiftSize} nurses</div>
            <div class="config-item"><strong>Morning Shift Duration:</strong> ${rosterConfig.morningShiftDays} days</div>
            <div class="config-item"><strong>Night Shift Duration:</strong> ${rosterConfig.nightShiftDays} days</div>
            <div class="config-item"><strong>Off-Duty After Morning:</strong> ${rosterConfig.offDutyAfterMorning} days</div>
            <div class="config-item"><strong>Off-Duty After Night:</strong> ${rosterConfig.offDutyAfterNight} days</div>
          </div>
        </div>
        
        <div class="section">
          <h3>📅 Daily Roster Schedule</h3>
          <table class="roster-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Morning Shift (${rosterConfig.morningShiftSize})</th>
                <th>Night Shift (${rosterConfig.nightShiftSize})</th>
                <th>Off Duty</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Generate table rows
    const generateTableRows = () => {
      let tableRows = '';
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
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
            const status = nurse.daysRemaining > 0 ? ` (${nurse.daysRemaining}d)` : 
                         nurse.status === 'Available' ? ' (Avail)' : '';
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
          <h3>👥 Nurse Workload Summary</h3>
          <table class="workload-table">
            <thead>
              <tr>
                <th>Nurse Name</th>
                <th>Qualification</th>
                <th>Morning Shifts</th>
                <th>Night Shifts</th>
                <th>Total Work Days</th>
                <th>Off-Duty Days</th>
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
          <h3>📈 Monthly Statistics</h3>
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-number">${totalMorningShifts}</div>
              <div class="stat-label">Total Morning Shifts</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalNightShifts}</div>
              <div class="stat-label">Total Night Shifts</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalOffDutyDays}</div>
              <div class="stat-label">Total Off-Duty Days</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${workloadSummary.length}</div>
              <div class="stat-label">Active Nurses</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${averageWorkDays}</div>
              <div class="stat-label">Avg Work Days/Nurse</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${daysInMonth}</div>
              <div class="stat-label">Days in Month</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>This roster was automatically generated by the Hospital Nurse Roster System</p>
          <p>© ${new Date().getFullYear()} Hospital Management System | Generated: ${new Date().toLocaleString()}</p>
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

    return { success: true, message: `PDF export initiated for ${monthName} ${selectedYear}` };

  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
};