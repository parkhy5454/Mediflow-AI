// // src/constants/nurseData.js
// export const initialNurses = [
//   { id: 1, name: 'Zita Oluchi', qualification: 'RN', experience: 'Senior', department: 'ICU', status: 'active', lastShiftType: null },
//   { id: 2, name: 'Michael Chen', qualification: 'MW', experience: 'Junior', department: 'Maternity', status: 'active', lastShiftType: null },
//   { id: 3, name: 'Egwi Oluchi', qualification: 'RN-MW', experience: 'Senior', department: 'Emergency', status: 'active', lastShiftType: null },
//   { id: 4, name: 'James Wilson', qualification: 'RN', experience: 'Mid-level', department: 'Surgery', status: 'active', lastShiftType: null },
//   { id: 5, name: 'Lisa Brown', qualification: 'MW', experience: 'Senior', department: 'Maternity', status: 'active', lastShiftType: null },
//   { id: 6, name: 'Adaeze Nwaehie', qualification: 'RN', experience: 'Junior', department: 'ICU', status: 'active', lastShiftType: null },
//   { id: 7, name: 'Divine Mathew', qualification: 'RN-MW', experience: 'Mid-level', department: 'Emergency', status: 'active', lastShiftType: null },
//   { id: 8, name: 'Robert Garcia', qualification: 'RN', experience: 'Senior', department: 'Surgery', status: 'active', lastShiftType: null },
//   { id: 9, name: 'Jennifer Lopez', qualification: 'MW', experience: 'Mid-level', department: 'Maternity', status: 'active', lastShiftType: null },
//   { id: 10, name: 'Kevin Wang', qualification: 'RN', experience: 'Junior', department: 'ICU', status: 'active', lastShiftType: null },
//   { id: 11, name: 'Maria Rodriguez', qualification: 'RN-MW', experience: 'Senior', department: 'Emergency', status: 'active', lastShiftType: null },
//   { id: 12, name: 'Thomas Anderson', qualification: 'RN', experience: 'Mid-level', department: 'Surgery', status: 'active', lastShiftType: null },
//   { id: 13, name: 'Amanda White', qualification: 'MW', experience: 'Senior', department: 'Maternity', status: 'active', lastShiftType: null },
//   { id: 14, name: 'Christopher Lee', qualification: 'RN', experience: 'Junior', department: 'ICU', status: 'active', lastShiftType: null },
//   { id: 15, name: 'Rachel Green', qualification: 'RN-MW', experience: 'Mid-level', department: 'Emergency', status: 'active', lastShiftType: null },
//   { id: 16, name: 'Daniel Kim', qualification: 'RN', experience: 'Senior', department: 'Surgery', status: 'active', lastShiftType: null }
// ];

// src/constants/nurseData.js (Updated with Cycle Continuity Fields)
export const initialNurses = [
  { 
    id: 1, 
    name: 'ZIta Oluchi', 
    qualification: 'RN', 
    experience: 'Senior', 
    department: 'ICU', 
    status: 'active', 
    lastShiftType: null,
    // NEW: Cycle continuity fields
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 2, 
    name: 'Anowa Blessing', 
    qualification: 'MW', 
    experience: 'Junior', 
    department: 'Maternity', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 3, 
    name: 'Nwaehie Adaezie', 
    qualification: 'RN-MW', 
    experience: 'Senior', 
    department: 'Emergency', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 4, 
    name: 'Emeka Ndionyenma', 
    qualification: 'RN', 
    experience: 'Mid-level', 
    department: 'Surgery', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 5, 
    name: 'Rebecca Micheal', 
    qualification: 'MW', 
    experience: 'Senior', 
    department: 'Maternity', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 6, 
    name: 'Cynthia Demian', 
    qualification: 'RN', 
    experience: 'Junior', 
    department: 'ICU', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 7, 
    name: 'Agatha Uche', 
    qualification: 'RN-MW', 
    experience: 'Mid-level', 
    department: 'Emergency', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 8, 
    name: 'Tochi Okeke', 
    qualification: 'RN', 
    experience: 'Senior', 
    department: 'Surgery', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 9, 
    name: 'Ada Okoro', 
    qualification: 'MW', 
    experience: 'Mid-level', 
    department: 'Maternity', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 10, 
    name: 'Kevin Nwangele', 
    qualification: 'RN', 
    experience: 'Junior', 
    department: 'ICU', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 11, 
    name: 'Nnamdi Herbert', 
    qualification: 'RN-MW', 
    experience: 'Senior', 
    department: 'Emergency', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 12, 
    name: 'Sportless Ifesinachi', 
    qualification: 'RN', 
    experience: 'Mid-level', 
    department: 'Surgery', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 13, 
    name: 'Ogechukwu Favor', 
    qualification: 'MW', 
    experience: 'Senior', 
    department: 'Maternity', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 14, 
    name: 'Sabina Elewechi', 
    qualification: 'RN', 
    experience: 'Junior', 
    department: 'ICU', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 15, 
    name: 'Lilian Navy', 
    qualification: 'RN-MW', 
    experience: 'Mid-level', 
    department: 'Emergency', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  },
  { 
    id: 16, 
    name: 'Daniel Akintayo', 
    qualification: 'RN', 
    experience: 'Senior', 
    department: 'Surgery', 
    status: 'active', 
    lastShiftType: null,
    lastShiftCycleDay: 0,
    lastOffDutyRemaining: 0,
    lastCycleState: 'available',
    lastMonthMorning: 0,
    lastMonthNight: 0
  }
];

/**
 * Nurse Data Structure Documentation:
 * 
 * BASIC FIELDS:
 * - id: Unique identifier
 * - name: Nurse's full name
 * - qualification: 'RN' | 'MW' | 'RN-MW'
 * - experience: 'Junior' | 'Mid-level' | 'Senior'
 * - department: 'ICU' | 'Emergency' | 'Surgery' | 'Maternity'
 * - status: 'active' | 'disabled' | 'archived'
 * 
 * CYCLE CONTINUITY FIELDS (NEW):
 * - lastShiftType: 'morning' | 'night' | null (what shift they last worked)
 * - lastShiftCycleDay: number (which day in their shift cycle they ended on)
 * - lastOffDutyRemaining: number (how many off-duty days remain)
 * - lastCycleState: 'morning' | 'night' | 'off-duty' | 'available' (their state at month end)
 * - lastMonthMorning: number (morning shifts worked last month)
 * - lastMonthNight: number (night shifts worked last month)
 * 
 * EXAMPLE SCENARIOS FOR NEXT MONTH:
 * 
 * 1. Nurse finishing 2nd day of 4-day morning shift:
 *    lastShiftType: 'morning'
 *    lastShiftCycleDay: 2
 *    lastOffDutyRemaining: 0
 *    lastCycleState: 'morning'
 *    → Next month: Continue morning shift for 2 more days
 * 
 * 2. Nurse just completed night shift, starting off-duty:
 *    lastShiftType: 'night'
 *    lastShiftCycleDay: 4 (completed)
 *    lastOffDutyRemaining: 3
 *    lastCycleState: 'off-duty'
 *    → Next month: Off-duty for 3 days, then available
 * 
 * 3. Nurse in middle of off-duty period:
 *    lastShiftType: 'morning'
 *    lastShiftCycleDay: 0
 *    lastOffDutyRemaining: 1
 *    lastCycleState: 'off-duty'
 *    → Next month: Off-duty for 1 day, then available
 * 
 * 4. Nurse available for new assignment:
 *    lastShiftType: null
 *    lastShiftCycleDay: 0
 *    lastOffDutyRemaining: 0
 *    lastCycleState: 'available'
 *    → Next month: Available immediately
 */