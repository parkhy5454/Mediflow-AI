// // src/components/Roster/ExportButtons.jsx
// import React, { useState } from 'react';
// import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
// import { exportToPDF, exportToExcel } from '../../services/exportService';

// const ExportButtons = ({ 
//   monthRoster, 
//   selectedMonth, 
//   selectedYear, 
//   rosterConfig, 
//   nurses,
//   disabled = false 
// }) => {
//   const [isExporting, setIsExporting] = useState(false);
//   const [exportType, setExportType] = useState('');

//   const handlePDFExport = async () => {
//     if (Object.keys(monthRoster).length === 0) {
//       alert('No roster data to export. Please generate a roster first.');
//       return;
//     }

//     setIsExporting(true);
//     setExportType('pdf');
    
//     try {
//       exportToPDF(monthRoster, selectedMonth, selectedYear, rosterConfig, nurses);
      
//       // Show success message after a short delay
//       setTimeout(() => {
//         setIsExporting(false);
//         setExportType('');
//       }, 2000);
//     } catch (error) {
//       console.error('PDF export failed:', error);
//       alert('Failed to export PDF. Please try again.');
//       setIsExporting(false);
//       setExportType('');
//     }
//   };

//   const handleExcelExport = async () => {
//     if (Object.keys(monthRoster).length === 0) {
//       alert('No roster data to export. Please generate a roster first.');
//       return;
//     }

//     setIsExporting(true);
//     setExportType('excel');
    
//     try {
//       exportToExcel(monthRoster, selectedMonth, selectedYear, rosterConfig);
      
//       // Show success message after a short delay
//       setTimeout(() => {
//         setIsExporting(false);
//         setExportType('');
//       }, 1500);
//     } catch (error) {
//       console.error('Excel export failed:', error);
//       alert('Failed to export Excel file. Please try again.');
//       setIsExporting(false);
//       setExportType('');
//     }
//   };

//   const buttonStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '10px 16px',
//     border: 'none',
//     borderRadius: '6px',
//     cursor: disabled || isExporting ? 'not-allowed' : 'pointer',
//     fontSize: '14px',
//     fontWeight: '500',
//     transition: 'all 0.2s ease-in-out',
//     opacity: disabled ? 0.6 : 1
//   };

//   const pdfButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: isExporting && exportType === 'pdf' ? '#dc2626' : '#ef4444',
//     color: 'white'
//   };

//   const excelButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: isExporting && exportType === 'excel' ? '#059669' : '#10b981',
//     color: 'white'
//   };

//   return (
//     <div style={{ 
//       display: 'flex', 
//       gap: '10px', 
//       alignItems: 'center',
//       flexWrap: 'wrap'
//     }}>
//       <div style={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         gap: '8px',
//         padding: '8px 12px',
//         backgroundColor: '#f3f4f6',
//         borderRadius: '6px',
//         fontSize: '14px',
//         color: '#6b7280',
//         fontWeight: '500'
//       }}>
//         <Download size={16} />
//         Export Roster:
//       </div>
      
//       <button
//         onClick={handlePDFExport}
//         disabled={disabled || isExporting}
//         style={pdfButtonStyle}
//         title="Export roster as PDF for printing"
//       >
//         {isExporting && exportType === 'pdf' ? (
//           <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
//         ) : (
//           <FileText size={16} />
//         )}
//         {isExporting && exportType === 'pdf' ? 'Generating PDF...' : 'Export PDF'}
//       </button>
      
//       <button
//         onClick={handleExcelExport}
//         disabled={disabled || isExporting}
//         style={excelButtonStyle}
//         title="Export roster as Excel/CSV file"
//       >
//         {isExporting && exportType === 'excel' ? (
//           <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
//         ) : (
//           <FileSpreadsheet size={16} />
//         )}
//         {isExporting && exportType === 'excel' ? 'Generating Excel...' : 'Export Excel'}
//       </button>
//     </div>
//   );
// };

// export default ExportButtons;

// src/components/Roster/ExportButtons.jsx (Fixed ESLint Issues)
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../services/exportService';

const ExportButtons = ({ 
  monthRoster, 
  selectedMonth, 
  selectedYear, 
  rosterConfig, 
  nurses,
  disabled = false 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');

  const handlePDFExport = async () => {
    if (Object.keys(monthRoster).length === 0) {
      alert('No roster data to export. Please generate a roster first.');
      return;
    }

    setIsExporting(true);
    setExportType('pdf');
    
    try {
      exportToPDF(monthRoster, selectedMonth, selectedYear, rosterConfig, nurses);
      
      // Show success message after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportType('');
      }, 2000);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
      setIsExporting(false);
      setExportType('');
    }
  };

  const handleExcelExport = async () => {
    if (Object.keys(monthRoster).length === 0) {
      alert('No roster data to export. Please generate a roster first.');
      return;
    }

    setIsExporting(true);
    setExportType('excel');
    
    try {
      exportToExcel(monthRoster, selectedMonth, selectedYear, rosterConfig);
      
      // Show success message after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportType('');
      }, 1500);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel file. Please try again.');
      setIsExporting(false);
      setExportType('');
    }
  };

  const getButtonClass = (type) => {
    return `export-button ${isExporting && exportType === type ? 'loading-button' : ''}`;
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || isExporting ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    opacity: disabled ? 0.6 : 1
  };

  const pdfButtonStyle = {
    ...buttonStyle,
    backgroundColor: isExporting && exportType === 'pdf' ? '#dc2626' : '#ef4444',
    color: 'white'
  };

  const excelButtonStyle = {
    ...buttonStyle,
    backgroundColor: isExporting && exportType === 'excel' ? '#059669' : '#10b981',
    color: 'white'
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }}>
        <Download size={16} />
        Export Roster:
      </div>
      
      <button
        onClick={handlePDFExport}
        disabled={disabled || isExporting}
        className={getButtonClass('pdf')}
        style={pdfButtonStyle}
        title="Export roster as PDF for printing"
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        {isExporting && exportType === 'pdf' ? 'Generating PDF...' : 'Export PDF'}
      </button>
      
      <button
        onClick={handleExcelExport}
        disabled={disabled || isExporting}
        className={getButtonClass('excel')}
        style={excelButtonStyle}
        title="Export roster as Excel/CSV file"
      >
        {isExporting && exportType === 'excel' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={16} />
        )}
        {isExporting && exportType === 'excel' ? 'Generating Excel...' : 'Export Excel'}
      </button>
    </div>
  );
};

export default ExportButtons;