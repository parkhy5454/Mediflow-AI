// // // src/services/rosterGenerator.js

// // // export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
// // //   const totalShiftSlots = rosterConfig.morningShiftSize + rosterConfig.nightShiftSize;
  
// // //   if (activeNurses.length < totalShiftSlots) {
// // //     return {
// // //       success: false,
// // //       message: `Need at least ${totalShiftSlots} active nurses to generate roster (${rosterConfig.morningShiftSize} morning + ${rosterConfig.nightShiftSize} night). Currently have ${activeNurses.length}.`
// // //     };
// // //   }

// // //   // Initialize roster structure
// // //   const newRoster = {};
  
// // //   // Calculate ideal workload distribution
// // //   const totalShiftDays = daysInMonth * (rosterConfig.morningShiftSize + rosterConfig.nightShiftSize);
// // //   const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
// // //   const idealMorningDays = Math.floor(averageWorkDaysPerNurse / 2);
// // //   const idealNightDays = Math.floor(averageWorkDaysPerNurse / 2);
  
// // //   // Enhanced nurse state tracking with work history and targets
// // //   const nurseStates = activeNurses.map(nurse => ({
// // //     id: nurse.id,
// // //     name: nurse.name,
// // //     qualification: nurse.qualification,
// // //     experience: nurse.experience,
// // //     // Current state
// // //     currentCycle: 'available',
// // //     cycleDay: 0,
// // //     offDutyDays: 0,
// // //     lastShiftType: nurse.lastShiftType,
// // //     // Work counters for this month
// // //     totalMorningDays: 0,
// // //     totalNightDays: 0,
// // //     totalOffDutyDays: 0,
// // //     totalWorkDays: 0,
// // //     // Targets for fair distribution
// // //     targetMorningDays: idealMorningDays,
// // //     targetNightDays: idealNightDays,
// // //     // Priority scores for assignment
// // //     morningPriority: 0,
// // //     nightPriority: 0,
// // //     // Carry-over from previous months (simulated)
// // //     historicalMorningDays: 0,
// // //     historicalNightDays: 0
// // //   }));

// // //   // Handle nurses continuing from previous month and set initial off-duty
// // //   nurseStates.forEach(nurse => {
// // //     if (nurse.lastShiftType === 'morning') {
// // //       nurse.currentCycle = 'off-duty';
// // //       nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
// // //     } else if (nurse.lastShiftType === 'night') {
// // //       nurse.currentCycle = 'off-duty';
// // //       nurse.offDutyDays = rosterConfig.offDutyAfterNight;
// // //     }
// // //   });

// // //   // Function to calculate assignment priority based on work balance
// // //   const updatePriorities = () => {
// // //     nurseStates.forEach(nurse => {
// // //       // Calculate how far behind/ahead they are from ideal distribution
// // //       const morningDeficit = nurse.targetMorningDays - nurse.totalMorningDays;
// // //       const nightDeficit = nurse.targetNightDays - nurse.totalNightDays;
      
// // //       // Higher priority for those who need more work
// // //       nurse.morningPriority = morningDeficit * 10 + (nurse.targetMorningDays - nurse.historicalMorningDays);
// // //       nurse.nightPriority = nightDeficit * 10 + (nurse.targetNightDays - nurse.historicalNightDays);
// // //     });
// // //   };

// // //   // Function to get nurses available for assignment, sorted by priority
// // //   const getAvailableForMorning = () => {
// // //     return nurseStates
// // //       .filter(nurse => nurse.currentCycle === 'available')
// // //       .sort((a, b) => b.morningPriority - a.morningPriority);
// // //   };

// // //   const getAvailableForNight = () => {
// // //     return nurseStates
// // //       .filter(nurse => nurse.currentCycle === 'available')
// // //       .sort((a, b) => b.nightPriority - a.nightPriority);
// // //   };

// // //   // Function to force assignment when no available nurses
// // //   const forceAssignmentFromOffDuty = (shiftType, needed) => {
// // //     const offDutyNurses = nurseStates
// // //       .filter(n => n.currentCycle === 'off-duty')
// // //       .sort((a, b) => {
// // //         // Prioritize by: 1) days remaining in off-duty, 2) work priority
// // //         const aDaysRemaining = a.offDutyDays;
// // //         const bDaysRemaining = b.offDutyDays;
// // //         if (aDaysRemaining !== bDaysRemaining) {
// // //           return aDaysRemaining - bDaysRemaining; // Fewer days remaining = higher priority
// // //         }
// // //         // If same off-duty days, use work priority
// // //         return shiftType === 'morning' ? 
// // //           (b.morningPriority - a.morningPriority) : 
// // //           (b.nightPriority - a.nightPriority);
// // //       });
    
// // //     const assigned = [];
// // //     for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
// // //       const nurse = offDutyNurses[i];
// // //       nurse.currentCycle = shiftType;
// // //       nurse.cycleDay = 1;
// // //       nurse.offDutyDays = 0;
// // //       assigned.push(nurse);
// // //     }
// // //     return assigned;
// // //   };

// // //   // Generate roster for each day
// // //   for (let day = 1; day <= daysInMonth; day++) {
// // //     newRoster[day] = {
// // //       morning: [],
// // //       night: [],
// // //       offDuty: []
// // //     };

// // //     // Update priorities based on current work distribution
// // //     updatePriorities();

// // //     // Process state transitions first
// // //     nurseStates.forEach(nurse => {
// // //       if (nurse.currentCycle === 'morning') {
// // //         if (nurse.cycleDay >= rosterConfig.morningShiftDays) {
// // //           nurse.currentCycle = 'off-duty';
// // //           nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
// // //           nurse.cycleDay = 0;
// // //           nurse.lastShiftType = 'morning';
// // //         } else {
// // //           nurse.cycleDay++;
// // //         }
// // //       } else if (nurse.currentCycle === 'night') {
// // //         if (nurse.cycleDay >= rosterConfig.nightShiftDays) {
// // //           nurse.currentCycle = 'off-duty';
// // //           nurse.offDutyDays = rosterConfig.offDutyAfterNight;
// // //           nurse.cycleDay = 0;
// // //           nurse.lastShiftType = 'night';
// // //         } else {
// // //           nurse.cycleDay++;
// // //         }
// // //       } else if (nurse.currentCycle === 'off-duty') {
// // //         if (nurse.offDutyDays > 1) {
// // //           nurse.offDutyDays--;
// // //         } else {
// // //           nurse.currentCycle = 'available';
// // //           nurse.offDutyDays = 0;
// // //         }
// // //       }
// // //     });

// // //     // Assign morning shift
// // //     const currentMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// // //     const morningGap = rosterConfig.morningShiftSize - currentMorning.length;
    
// // //     if (morningGap > 0) {
// // //       const availableForMorning = getAvailableForMorning();
      
// // //       // First try to fill from available nurses
// // //       let assigned = 0;
// // //       for (let i = 0; i < Math.min(morningGap, availableForMorning.length); i++) {
// // //         availableForMorning[i].currentCycle = 'morning';
// // //         availableForMorning[i].cycleDay = 1;
// // //         assigned++;
// // //       }
      
// // //       // If still gaps, force assignment from off-duty
// // //       const stillNeeded = morningGap - assigned;
// // //       if (stillNeeded > 0) {
// // //         forceAssignmentFromOffDuty('morning', stillNeeded);
// // //       }
// // //     }

// // //     // Assign night shift
// // //     const currentNight = nurseStates.filter(n => n.currentCycle === 'night');
// // //     const nightGap = rosterConfig.nightShiftSize - currentNight.length;
    
// // //     if (nightGap > 0) {
// // //       const availableForNight = getAvailableForNight();
      
// // //       // First try to fill from available nurses
// // //       let assigned = 0;
// // //       for (let i = 0; i < Math.min(nightGap, availableForNight.length); i++) {
// // //         availableForNight[i].currentCycle = 'night';
// // //         availableForNight[i].cycleDay = 1;
// // //         assigned++;
// // //       }
      
// // //       // If still gaps, force assignment from off-duty
// // //       const stillNeeded = nightGap - assigned;
// // //       if (stillNeeded > 0) {
// // //         forceAssignmentFromOffDuty('night', stillNeeded);
// // //       }
// // //     }

// // //     // Record final assignments for this day
// // //     const finalMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// // //     const finalNight = nurseStates.filter(n => n.currentCycle === 'night');
// // //     const finalOffDuty = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');

// // //     // Add to roster and update counters
// // //     finalMorning.forEach(nurse => {
// // //       newRoster[day].morning.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience
// // //       });
// // //       nurse.totalMorningDays++;
// // //       nurse.totalWorkDays++;
// // //     });

// // //     finalNight.forEach(nurse => {
// // //       newRoster[day].night.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience
// // //       });
// // //       nurse.totalNightDays++;
// // //       nurse.totalWorkDays++;
// // //     });

// // //     finalOffDuty.forEach(nurse => {
// // //       newRoster[day].offDuty.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience,
// // //         daysRemaining: nurse.offDutyDays,
// // //         status: nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty'
// // //       });
// // //       nurse.totalOffDutyDays++;
// // //     });
// // //   }

// // //   // Calculate workload balance and identify imbalances
// // //   const workloadSummary = nurseStates.map(nurse => {
// // //     const morningDifference = nurse.totalMorningDays - idealMorningDays;
// // //     const nightDifference = nurse.totalNightDays - idealNightDays;
// // //     const totalDifference = Math.abs(morningDifference) + Math.abs(nightDifference);
    
// // //     return {
// // //       name: nurse.name,
// // //       morning: nurse.totalMorningDays,
// // //       night: nurse.totalNightDays,
// // //       offDuty: nurse.totalOffDutyDays,
// // //       morningTarget: idealMorningDays,
// // //       nightTarget: idealNightDays,
// // //       morningDiff: morningDifference,
// // //       nightDiff: nightDifference,
// // //       balance: totalDifference <= 2 ? 'Balanced' : 'Needs Adjustment'
// // //     };
// // //   });

// // //   // Update nurse lastShiftType and carry-over information
// // //   const updatedNurses = activeNurses.map(nurse => {
// // //     const nurseState = nurseStates.find(ns => ns.id === nurse.id);
// // //     if (nurseState) {
// // //       let finalShiftType = nurseState.lastShiftType;
// // //       if (nurseState.currentCycle === 'morning') {
// // //         finalShiftType = 'morning';
// // //       } else if (nurseState.currentCycle === 'night') {
// // //         finalShiftType = 'night';
// // //       } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
// // //         finalShiftType = nurseState.lastShiftType;
// // //       } else {
// // //         finalShiftType = null;
// // //       }
      
// // //       // Store workload info for next month's balancing
// // //       return { 
// // //         ...nurse, 
// // //         lastShiftType: finalShiftType,
// // //         // Store work history for next month's calculations
// // //         lastMonthMorning: nurseState.totalMorningDays,
// // //         lastMonthNight: nurseState.totalNightDays
// // //       };
// // //     }
// // //     return nurse;
// // //   });
  
// // //   // Comprehensive validation
// // //   let hasEmptyShifts = false;
// // //   let totalEmptyShifts = 0;
// // //   for (let day = 1; day <= daysInMonth; day++) {
// // //     const morningShort = rosterConfig.morningShiftSize - newRoster[day].morning.length;
// // //     const nightShort = rosterConfig.nightShiftSize - newRoster[day].night.length;
    
// // //     if (morningShort > 0 || nightShort > 0) {
// // //       hasEmptyShifts = true;
// // //       totalEmptyShifts += morningShort + nightShort;
// // //       console.warn(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
// // //     }
// // //   }
  
// // //   // Display results
// // //   console.log('Detailed Workload Distribution:', workloadSummary);
  
// // //   const imbalancedNurses = workloadSummary.filter(n => n.balance === 'Needs Adjustment');
  
// // //   const summaryMessage = hasEmptyShifts 
// // //     ? `⚠️ ROSTER ISSUE: ${totalEmptyShifts} unfilled shift slots! Check console for details.\n\nWorkload Summary:\n${workloadSummary.map(n => 
// // //         `${n.name}: ${n.morning}M (target ${n.morningTarget}), ${n.night}N (target ${n.nightTarget}) - ${n.balance}`
// // //       ).join('\n')}`
// // //     : `✅ Roster generated successfully! All shifts filled.\n\n${imbalancedNurses.length > 0 ? 
// // //         `⚖️ Workload Imbalances (to be corrected next month):\n${imbalancedNurses.map(n => 
// // //           `${n.name}: ${n.morningDiff >= 0 ? '+' : ''}${n.morningDiff}M, ${n.nightDiff >= 0 ? '+' : ''}${n.nightDiff}N`
// // //         ).join('\n')}\n\n` : '⚖️ Perfect workload balance achieved!\n\n'
// // //       }Full Summary:\n${workloadSummary.map(n => 
// // //         `${n.name}: ${n.morning}M/${n.night}N/${n.offDuty}Off`
// // //       ).join('\n')}`;

// // //   return {
// // //     success: true,
// // //     roster: newRoster,
// // //     updatedNurses,
// // //     message: summaryMessage,
// // //     workloadSummary
// // //   };
// // // };

// // // src/services/rosterGenerator.js (Enhanced with Month Continuity Logic)

// // // export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
// // //   const totalShiftSlots = rosterConfig.morningShiftSize + rosterConfig.nightShiftSize;
  
// // //   if (activeNurses.length < totalShiftSlots) {
// // //     return {
// // //       success: false,
// // //       message: `Need at least ${totalShiftSlots} active nurses to generate roster (${rosterConfig.morningShiftSize} morning + ${rosterConfig.nightShiftSize} night). Currently have ${activeNurses.length}.`
// // //     };
// // //   }

// // //   // Initialize roster structure
// // //   const newRoster = {};
  
// // //   // Calculate ideal workload distribution
// // //   const totalShiftDays = daysInMonth * (rosterConfig.morningShiftSize + rosterConfig.nightShiftSize);
// // //   const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
// // //   const idealMorningDays = Math.floor(averageWorkDaysPerNurse / 2);
// // //   const idealNightDays = Math.floor(averageWorkDaysPerNurse / 2);
  
// // //   // Enhanced nurse state tracking with work history and targets
// // //   const nurseStates = activeNurses.map(nurse => {
// // //     // Initialize basic nurse state
// // //     const nurseState = {
// // //       id: nurse.id,
// // //       name: nurse.name,
// // //       qualification: nurse.qualification,
// // //       experience: nurse.experience,
// // //       // Current state - will be set based on previous month data
// // //       currentCycle: 'available',
// // //       cycleDay: 0,
// // //       offDutyDays: 0,
// // //       lastShiftType: nurse.lastShiftType,
// // //       // Work counters for this month
// // //       totalMorningDays: 0,
// // //       totalNightDays: 0,
// // //       totalOffDutyDays: 0,
// // //       totalWorkDays: 0,
// // //       // Targets for fair distribution
// // //       targetMorningDays: idealMorningDays,
// // //       targetNightDays: idealNightDays,
// // //       // Priority scores for assignment
// // //       morningPriority: 0,
// // //       nightPriority: 0,
// // //       // Carry-over from previous months
// // //       historicalMorningDays: nurse.lastMonthMorning || 0,
// // //       historicalNightDays: nurse.lastMonthNight || 0,
// // //       // New fields for cycle continuity
// // //       remainingCycleDays: 0,
// // //       remainingOffDutyDays: 0
// // //     };

// // //     // CRITICAL: Handle continuation from previous month based on nurse's last state
// // //     if (nurse.lastShiftType && nurse.lastShiftCycleDay && nurse.lastOffDutyRemaining !== undefined) {
// // //       // Nurse was in a specific state at the end of last month
// // //       if (nurse.lastOffDutyRemaining > 0) {
// // //         // Nurse is continuing off-duty period from previous month
// // //         nurseState.currentCycle = 'off-duty';
// // //         nurseState.offDutyDays = nurse.lastOffDutyRemaining;
// // //         nurseState.remainingOffDutyDays = nurse.lastOffDutyRemaining;
// // //       } else if (nurse.lastShiftType === 'morning' && nurse.lastShiftCycleDay < rosterConfig.morningShiftDays) {
// // //         // Nurse was in middle of morning shift cycle
// // //         nurseState.currentCycle = 'morning';
// // //         nurseState.cycleDay = nurse.lastShiftCycleDay;
// // //         nurseState.remainingCycleDays = rosterConfig.morningShiftDays - nurse.lastShiftCycleDay;
// // //       } else if (nurse.lastShiftType === 'night' && nurse.lastShiftCycleDay < rosterConfig.nightShiftDays) {
// // //         // Nurse was in middle of night shift cycle
// // //         nurseState.currentCycle = 'night';
// // //         nurseState.cycleDay = nurse.lastShiftCycleDay;
// // //         nurseState.remainingCycleDays = rosterConfig.nightShiftDays - nurse.lastShiftCycleDay;
// // //       } else {
// // //         // Nurse completed their cycle and should start off-duty
// // //         if (nurse.lastShiftType === 'morning') {
// // //           nurseState.currentCycle = 'off-duty';
// // //           nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
// // //           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// // //         } else if (nurse.lastShiftType === 'night') {
// // //           nurseState.currentCycle = 'off-duty';
// // //           nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
// // //           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// // //         }
// // //       }
// // //     } else {
// // //       // Handle legacy data or nurses without detailed cycle information
// // //       if (nurse.lastShiftType === 'morning') {
// // //         nurseState.currentCycle = 'off-duty';
// // //         nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
// // //         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// // //       } else if (nurse.lastShiftType === 'night') {
// // //         nurseState.currentCycle = 'off-duty';
// // //         nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
// // //         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// // //       } else {
// // //         // New nurse or no previous data - start as available
// // //         nurseState.currentCycle = 'available';
// // //       }
// // //     }

// // //     return nurseState;
// // //   });

// // //   console.log('Initial nurse states for new month:', nurseStates.map(n => ({
// // //     name: n.name,
// // //     currentCycle: n.currentCycle,
// // //     cycleDay: n.cycleDay,
// // //     offDutyDays: n.offDutyDays,
// // //     lastShiftType: n.lastShiftType,
// // //     remainingCycleDays: n.remainingCycleDays,
// // //     remainingOffDutyDays: n.remainingOffDutyDays
// // //   })));

// // //   // Function to calculate assignment priority based on work balance
// // //   const updatePriorities = () => {
// // //     nurseStates.forEach(nurse => {
// // //       // Calculate how far behind/ahead they are from ideal distribution
// // //       const morningDeficit = nurse.targetMorningDays - nurse.totalMorningDays;
// // //       const nightDeficit = nurse.targetNightDays - nurse.totalNightDays;
      
// // //       // Higher priority for those who need more work, adjusted for historical data
// // //       nurse.morningPriority = morningDeficit * 10 + (nurse.targetMorningDays - nurse.historicalMorningDays);
// // //       nurse.nightPriority = nightDeficit * 10 + (nurse.targetNightDays - nurse.historicalNightDays);
// // //     });
// // //   };

// // //   // Function to get nurses available for assignment, sorted by priority
// // //   const getAvailableForMorning = () => {
// // //     return nurseStates
// // //       .filter(nurse => nurse.currentCycle === 'available')
// // //       .sort((a, b) => b.morningPriority - a.morningPriority);
// // //   };

// // //   const getAvailableForNight = () => {
// // //     return nurseStates
// // //       .filter(nurse => nurse.currentCycle === 'available')
// // //       .sort((a, b) => b.nightPriority - a.nightPriority);
// // //   };

// // //   // Function to force assignment when no available nurses (emergency override)
// // //   const forceAssignmentFromOffDuty = (shiftType, needed) => {
// // //     const offDutyNurses = nurseStates
// // //       .filter(n => n.currentCycle === 'off-duty')
// // //       .sort((a, b) => {
// // //         // Prioritize by: 1) days remaining in off-duty, 2) work priority
// // //         const aDaysRemaining = a.offDutyDays;
// // //         const bDaysRemaining = b.offDutyDays;
// // //         if (aDaysRemaining !== bDaysRemaining) {
// // //           return aDaysRemaining - bDaysRemaining; // Fewer days remaining = higher priority
// // //         }
// // //         // If same off-duty days, use work priority
// // //         return shiftType === 'morning' ? 
// // //           (b.morningPriority - a.morningPriority) : 
// // //           (b.nightPriority - a.nightPriority);
// // //       });
    
// // //     const assigned = [];
// // //     for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
// // //       const nurse = offDutyNurses[i];
// // //       console.warn(`EMERGENCY ASSIGNMENT: ${nurse.name} forced from off-duty (${nurse.offDutyDays} days remaining) to ${shiftType} shift`);
// // //       nurse.currentCycle = shiftType;
// // //       nurse.cycleDay = 1;
// // //       nurse.offDutyDays = 0;
// // //       nurse.remainingOffDutyDays = 0;
// // //       assigned.push(nurse);
// // //     }
// // //     return assigned;
// // //   };

// // //   // Generate roster for each day
// // //   for (let day = 1; day <= daysInMonth; day++) {
// // //     newRoster[day] = {
// // //       morning: [],
// // //       night: [],
// // //       offDuty: []
// // //     };

// // //     // Update priorities based on current work distribution
// // //     updatePriorities();

// // //     // Process state transitions first - CRITICAL for cycle continuity
// // //     nurseStates.forEach(nurse => {
// // //       if (nurse.currentCycle === 'morning') {
// // //         if (nurse.cycleDay >= rosterConfig.morningShiftDays) {
// // //           // Complete morning shift cycle, start off-duty
// // //           nurse.currentCycle = 'off-duty';
// // //           nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
// // //           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// // //           nurse.cycleDay = 0;
// // //           nurse.lastShiftType = 'morning';
// // //           nurse.remainingCycleDays = 0;
// // //         } else {
// // //           // Continue morning shift cycle
// // //           nurse.cycleDay++;
// // //           nurse.remainingCycleDays = Math.max(0, rosterConfig.morningShiftDays - nurse.cycleDay);
// // //         }
// // //       } else if (nurse.currentCycle === 'night') {
// // //         if (nurse.cycleDay >= rosterConfig.nightShiftDays) {
// // //           // Complete night shift cycle, start off-duty
// // //           nurse.currentCycle = 'off-duty';
// // //           nurse.offDutyDays = rosterConfig.offDutyAfterNight;
// // //           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// // //           nurse.cycleDay = 0;
// // //           nurse.lastShiftType = 'night';
// // //           nurse.remainingCycleDays = 0;
// // //         } else {
// // //           // Continue night shift cycle
// // //           nurse.cycleDay++;
// // //           nurse.remainingCycleDays = Math.max(0, rosterConfig.nightShiftDays - nurse.cycleDay);
// // //         }
// // //       } else if (nurse.currentCycle === 'off-duty') {
// // //         if (nurse.offDutyDays > 1) {
// // //           // Continue off-duty period
// // //           nurse.offDutyDays--;
// // //           nurse.remainingOffDutyDays = nurse.offDutyDays;
// // //         } else {
// // //           // Complete off-duty period, become available
// // //           nurse.currentCycle = 'available';
// // //           nurse.offDutyDays = 0;
// // //           nurse.remainingOffDutyDays = 0;
// // //         }
// // //       }
// // //     });

// // //     // Assign morning shift
// // //     const currentMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// // //     const morningGap = rosterConfig.morningShiftSize - currentMorning.length;
    
// // //     if (morningGap > 0) {
// // //       const availableForMorning = getAvailableForMorning();
      
// // //       // First try to fill from available nurses
// // //       let assigned = 0;
// // //       for (let i = 0; i < Math.min(morningGap, availableForMorning.length); i++) {
// // //         availableForMorning[i].currentCycle = 'morning';
// // //         availableForMorning[i].cycleDay = 1;
// // //         availableForMorning[i].remainingCycleDays = rosterConfig.morningShiftDays - 1;
// // //         assigned++;
// // //       }
      
// // //       // If still gaps, force assignment from off-duty (emergency measure)
// // //       const stillNeeded = morningGap - assigned;
// // //       if (stillNeeded > 0) {
// // //         forceAssignmentFromOffDuty('morning', stillNeeded);
// // //       }
// // //     }

// // //     // Assign night shift
// // //     const currentNight = nurseStates.filter(n => n.currentCycle === 'night');
// // //     const nightGap = rosterConfig.nightShiftSize - currentNight.length;
    
// // //     if (nightGap > 0) {
// // //       const availableForNight = getAvailableForNight();
      
// // //       // First try to fill from available nurses
// // //       let assigned = 0;
// // //       for (let i = 0; i < Math.min(nightGap, availableForNight.length); i++) {
// // //         availableForNight[i].currentCycle = 'night';
// // //         availableForNight[i].cycleDay = 1;
// // //         availableForNight[i].remainingCycleDays = rosterConfig.nightShiftDays - 1;
// // //         assigned++;
// // //       }
      
// // //       // If still gaps, force assignment from off-duty (emergency measure)
// // //       const stillNeeded = nightGap - assigned;
// // //       if (stillNeeded > 0) {
// // //         forceAssignmentFromOffDuty('night', stillNeeded);
// // //       }
// // //     }

// // //     // Record final assignments for this day
// // //     const finalMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// // //     const finalNight = nurseStates.filter(n => n.currentCycle === 'night');
// // //     const finalOffDuty = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');

// // //     // Add to roster and update counters
// // //     finalMorning.forEach(nurse => {
// // //       newRoster[day].morning.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience
// // //       });
// // //       nurse.totalMorningDays++;
// // //       nurse.totalWorkDays++;
// // //     });

// // //     finalNight.forEach(nurse => {
// // //       newRoster[day].night.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience
// // //       });
// // //       nurse.totalNightDays++;
// // //       nurse.totalWorkDays++;
// // //     });

// // //     finalOffDuty.forEach(nurse => {
// // //       const statusText = nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty';
// // //       const daysRemaining = nurse.currentCycle === 'off-duty' ? nurse.offDutyDays : 0;
      
// // //       newRoster[day].offDuty.push({
// // //         id: nurse.id,
// // //         name: nurse.name,
// // //         qualification: nurse.qualification,
// // //         experience: nurse.experience,
// // //         daysRemaining: daysRemaining,
// // //         status: statusText,
// // //         // Additional info for debugging
// // //         cycleInfo: nurse.currentCycle === 'off-duty' ? 
// // //           `Off-duty (${daysRemaining} days remaining)` : 
// // //           'Available for assignment'
// // //       });
// // //       nurse.totalOffDutyDays++;
// // //     });
// // //   }

// // //   // Calculate workload balance and identify imbalances
// // //   const workloadSummary = nurseStates.map(nurse => {
// // //     const morningDifference = nurse.totalMorningDays - idealMorningDays;
// // //     const nightDifference = nurse.totalNightDays - idealNightDays;
// // //     const totalDifference = Math.abs(morningDifference) + Math.abs(nightDifference);
    
// // //     return {
// // //       name: nurse.name,
// // //       morning: nurse.totalMorningDays,
// // //       night: nurse.totalNightDays,
// // //       offDuty: nurse.totalOffDutyDays,
// // //       morningTarget: idealMorningDays,
// // //       nightTarget: idealNightDays,
// // //       morningDiff: morningDifference,
// // //       nightDiff: nightDifference,
// // //       balance: totalDifference <= 2 ? 'Balanced' : 'Needs Adjustment',
// // //       // Include cycle continuation info
// // //       endState: {
// // //         currentCycle: nurse.currentCycle,
// // //         cycleDay: nurse.cycleDay,
// // //         offDutyDays: nurse.offDutyDays,
// // //         remainingCycleDays: nurse.remainingCycleDays,
// // //         remainingOffDutyDays: nurse.remainingOffDutyDays
// // //       }
// // //     };
// // //   });

// // //   // Update nurse data with detailed cycle information for next month continuity
// // //   const updatedNurses = activeNurses.map(nurse => {
// // //     const nurseState = nurseStates.find(ns => ns.id === nurse.id);
// // //     if (nurseState) {
// // //       let finalShiftType = nurseState.lastShiftType;
      
// // //       // Determine the shift type based on current cycle
// // //       if (nurseState.currentCycle === 'morning') {
// // //         finalShiftType = 'morning';
// // //       } else if (nurseState.currentCycle === 'night') {
// // //         finalShiftType = 'night';
// // //       } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
// // //         // Maintain the last shift type during off-duty
// // //         finalShiftType = nurseState.lastShiftType;
// // //       } else {
// // //         // Available state
// // //         finalShiftType = null;
// // //       }
      
// // //       return { 
// // //         ...nurse, 
// // //         lastShiftType: finalShiftType,
// // //         // CRITICAL: Store detailed cycle information for next month
// // //         lastShiftCycleDay: nurseState.currentCycle === 'morning' || nurseState.currentCycle === 'night' ? 
// // //           nurseState.cycleDay : 0,
// // //         lastOffDutyRemaining: nurseState.currentCycle === 'off-duty' ? 
// // //           nurseState.offDutyDays : 0,
// // //         lastCycleState: nurseState.currentCycle,
// // //         // Store work history for next month's calculations
// // //         lastMonthMorning: nurseState.totalMorningDays,
// // //         lastMonthNight: nurseState.totalNightDays,
// // //         // Additional metadata for debugging
// // //         cycleTransitionInfo: {
// // //           startedAs: nurse.lastShiftType,
// // //           endingAs: finalShiftType,
// // //           completedCycles: {
// // //             morningDays: nurseState.totalMorningDays,
// // //             nightDays: nurseState.totalNightDays
// // //           },
// // //           nextMonthStart: {
// // //             cycle: nurseState.currentCycle,
// // //             remainingDays: nurseState.currentCycle === 'off-duty' ? 
// // //               nurseState.offDutyDays : nurseState.remainingCycleDays
// // //           }
// // //         }
// // //       };
// // //     }
// // //     return nurse;
// // //   });
  
// // //   // Comprehensive validation
// // //   let hasEmptyShifts = false;
// // //   let totalEmptyShifts = 0;
// // //   let continuityIssues = [];
  
// // //   for (let day = 1; day <= daysInMonth; day++) {
// // //     const morningShort = rosterConfig.morningShiftSize - newRoster[day].morning.length;
// // //     const nightShort = rosterConfig.nightShiftSize - newRoster[day].night.length;
    
// // //     if (morningShort > 0 || nightShort > 0) {
// // //       hasEmptyShifts = true;
// // //       totalEmptyShifts += morningShort + nightShort;
// // //       continuityIssues.push(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
// // //       console.warn(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
// // //     }
// // //   }
  
// // //   // Display results with continuity information
// // //   console.log('Detailed Workload Distribution:', workloadSummary);
// // //   console.log('Nurses ending states for next month:', updatedNurses.map(n => ({
// // //     name: n.name,
// // //     endingCycle: n.lastCycleState,
// // //     shiftCycleDay: n.lastShiftCycleDay,
// // //     offDutyRemaining: n.lastOffDutyRemaining
// // //   })));
  
// // //   const imbalancedNurses = workloadSummary.filter(n => n.balance === 'Needs Adjustment');
// // //   const nursesInTransition = workloadSummary.filter(n => 
// // //     n.endState.currentCycle !== 'available' && 
// // //     (n.endState.remainingCycleDays > 0 || n.endState.remainingOffDutyDays > 0)
// // //   );
  
// // //   const summaryMessage = hasEmptyShifts 
// // //     ? `⚠️ ROSTER ISSUE: ${totalEmptyShifts} unfilled shift slots! 

// // // ${continuityIssues.join('\n')}

// // // This may be due to cycle continuity requirements. Check console for details.

// // // Workload Summary:
// // // ${workloadSummary.map(n => 
// // //         `${n.name}: ${n.morning}M (target ${n.morningTarget}), ${n.night}N (target ${n.nightTarget}) - ${n.balance}`
// // //       ).join('\n')}`
// // //     : `✅ Roster generated successfully with cycle continuity! All shifts filled.

// // // 🔄 Month Transition Summary:
// // // ${nursesInTransition.length > 0 ? 
// // //         `Nurses continuing cycles into next month:\n${nursesInTransition.map(n => 
// // //           `${n.name}: ${n.endState.currentCycle}${n.endState.remainingCycleDays > 0 ? ` (${n.endState.remainingCycleDays} days left)` : n.endState.remainingOffDutyDays > 0 ? ` (${n.endState.remainingOffDutyDays} off-duty days left)` : ''}`
// // //         ).join('\n')}\n\n` : 'All nurses will be available at start of next month.\n\n'
// // //       }${imbalancedNurses.length > 0 ? 
// // //         `⚖️ Workload Imbalances (to be corrected next month):\n${imbalancedNurses.map(n => 
// // //           `${n.name}: ${n.morningDiff >= 0 ? '+' : ''}${n.morningDiff}M, ${n.nightDiff >= 0 ? '+' : ''}${n.nightDiff}N`
// // //         ).join('\n')}\n\n` : '⚖️ Perfect workload balance achieved!\n\n'
// // //       }Full Summary:
// // // ${workloadSummary.map(n => 
// // //         `${n.name}: ${n.morning}M/${n.night}N/${n.offDuty}Off`
// // //       ).join('\n')}`;

// // //   return {
// // //     success: true,
// // //     roster: newRoster,
// // //     updatedNurses,
// // //     message: summaryMessage,
// // //     workloadSummary,
// // //     continuityInfo: {
// // //       nursesInTransition: nursesInTransition.length,
// // //       hasEmptyShifts,
// // //       totalEmptyShifts,
// // //       continuityIssues: hasEmptyShifts ? continuityIssues : []
// // //     }
// // //   };
// // // };


// // // src/services/rosterGenerator.js (Enhanced with Monthly Balance & Alternation)

// // export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
// //   const totalShiftSlots = rosterConfig.morningShiftSize + rosterConfig.nightShiftSize;
  
// //   if (activeNurses.length < totalShiftSlots) {
// //     return {
// //       success: false,
// //       message: `Need at least ${totalShiftSlots} active nurses to generate roster (${rosterConfig.morningShiftSize} morning + ${rosterConfig.nightShiftSize} night). Currently have ${activeNurses.length}.`
// //     };
// //   }

// //   // Initialize roster structure
// //   const newRoster = {};
  
// //   // Calculate ideal workload distribution with monthly balancing
// //   const totalShiftDays = daysInMonth * (rosterConfig.morningShiftSize + rosterConfig.nightShiftSize);
// //   const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
// //   const extraWorkDays = totalShiftDays % activeNurses.length;
  
// //   // More precise workload targets
// //   const baseTargetWorkDays = Math.floor(averageWorkDaysPerNurse);
// //   const idealMorningDays = Math.floor(baseTargetWorkDays / 2);
// //   const idealNightDays = Math.ceil(baseTargetWorkDays / 2);
  
// //   console.log(`Monthly Balance Calculation:
// //     - Total shift days: ${totalShiftDays}
// //     - Active nurses: ${activeNurses.length}
// //     - Base work days per nurse: ${baseTargetWorkDays}
// //     - Extra work days to distribute: ${extraWorkDays}
// //     - Target morning days: ${idealMorningDays}
// //     - Target night days: ${idealNightDays}`);

// //   // Enhanced nurse state tracking with historical balance
// //   const nurseStates = activeNurses.map((nurse, index) => {
// //     // Calculate cumulative historical workload for better balance
// //     const historicalMorningDays = nurse.lastMonthMorning || 0;
// //     const historicalNightDays = nurse.lastMonthNight || 0;
// //     const totalHistoricalDays = historicalMorningDays + historicalNightDays;
    
// //     // Calculate balance debt/credit from previous months
// //     const expectedHistoricalDays = baseTargetWorkDays; // Assuming same target each month
// //     const workloadDebt = Math.max(0, expectedHistoricalDays - totalHistoricalDays);
// //     const workloadCredit = Math.max(0, totalHistoricalDays - expectedHistoricalDays);
    
// //     // Determine if this nurse should get extra work days this month
// //     const shouldGetExtraDay = index < extraWorkDays;
// //     const thisMonthTargetWorkDays = baseTargetWorkDays + (shouldGetExtraDay ? 1 : 0) + workloadDebt;
    
// //     // Calculate morning/night distribution based on historical bias
// //     const historicalMorningBias = historicalMorningDays - historicalNightDays;
// //     let thisMonthMorningTarget, thisMonthNightTarget;
    
// //     if (historicalMorningBias > 1) {
// //       // Had more morning shifts historically, favor nights this month
// //       thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
// //       thisMonthMorningTarget = thisMonthTargetWorkDays - thisMonthNightTarget;
// //     } else if (historicalMorningBias < -1) {
// //       // Had more night shifts historically, favor mornings this month
// //       thisMonthMorningTarget = Math.ceil(thisMonthTargetWorkDays / 2);
// //       thisMonthNightTarget = thisMonthTargetWorkDays - thisMonthMorningTarget;
// //     } else {
// //       // Balanced historically, distribute evenly
// //       thisMonthMorningTarget = Math.floor(thisMonthTargetWorkDays / 2);
// //       thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
// //     }

// //     const nurseState = {
// //       id: nurse.id,
// //       name: nurse.name,
// //       qualification: nurse.qualification,
// //       experience: nurse.experience,
// //       // Current state - will be set based on previous month data
// //       currentCycle: 'available',
// //       cycleDay: 0,
// //       offDutyDays: 0,
// //       lastShiftType: nurse.lastShiftType,
      
// //       // Work counters for this month
// //       totalMorningDays: 0,
// //       totalNightDays: 0,
// //       totalOffDutyDays: 0,
// //       totalWorkDays: 0,
      
// //       // Enhanced targets for fair distribution
// //       targetMorningDays: thisMonthMorningTarget,
// //       targetNightDays: thisMonthNightTarget,
// //       targetTotalWorkDays: thisMonthTargetWorkDays,
      
// //       // Priority scores for assignment (higher = more priority)
// //       morningPriority: 0,
// //       nightPriority: 0,
// //       workloadPriority: workloadDebt, // Higher debt = higher priority
      
// //       // Historical balance tracking
// //       historicalMorningDays: historicalMorningDays,
// //       historicalNightDays: historicalNightDays,
// //       historicalTotalDays: totalHistoricalDays,
// //       workloadDebt: workloadDebt,
// //       workloadCredit: workloadCredit,
// //       historicalMorningBias: historicalMorningBias,
      
// //       // Cycle continuity fields
// //       remainingCycleDays: 0,
// //       remainingOffDutyDays: 0,
      
// //       // Balance alternation tracking
// //       lastShiftPreference: nurse.lastShiftPreference || 'none', // 'morning', 'night', 'none'
// //       monthlyRotation: nurse.monthlyRotation || 0 // Rotation counter for alternation
// //     };

// //     // Handle continuation from previous month based on nurse's last state
// //     if (nurse.lastShiftType && nurse.lastShiftCycleDay && nurse.lastOffDutyRemaining !== undefined) {
// //       if (nurse.lastOffDutyRemaining > 0) {
// //         nurseState.currentCycle = 'off-duty';
// //         nurseState.offDutyDays = nurse.lastOffDutyRemaining;
// //         nurseState.remainingOffDutyDays = nurse.lastOffDutyRemaining;
// //       } else if (nurse.lastShiftType === 'morning' && nurse.lastShiftCycleDay < rosterConfig.morningShiftDays) {
// //         nurseState.currentCycle = 'morning';
// //         nurseState.cycleDay = nurse.lastShiftCycleDay;
// //         nurseState.remainingCycleDays = rosterConfig.morningShiftDays - nurse.lastShiftCycleDay;
// //       } else if (nurse.lastShiftType === 'night' && nurse.lastShiftCycleDay < rosterConfig.nightShiftDays) {
// //         nurseState.currentCycle = 'night';
// //         nurseState.cycleDay = nurse.lastShiftCycleDay;
// //         nurseState.remainingCycleDays = rosterConfig.nightShiftDays - nurse.lastShiftCycleDay;
// //       } else {
// //         if (nurse.lastShiftType === 'morning') {
// //           nurseState.currentCycle = 'off-duty';
// //           nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
// //           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// //         } else if (nurse.lastShiftType === 'night') {
// //           nurseState.currentCycle = 'off-duty';
// //           nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
// //           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// //         }
// //       }
// //     } else {
// //       // Handle legacy data or nurses without detailed cycle information
// //       if (nurse.lastShiftType === 'morning') {
// //         nurseState.currentCycle = 'off-duty';
// //         nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
// //         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// //       } else if (nurse.lastShiftType === 'night') {
// //         nurseState.currentCycle = 'off-duty';
// //         nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
// //         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// //       } else {
// //         nurseState.currentCycle = 'available';
// //       }
// //     }

// //     return nurseState;
// //   });

// //   console.log('Enhanced nurse states with balance tracking:', nurseStates.map(n => ({
// //     name: n.name,
// //     currentCycle: n.currentCycle,
// //     targetMorning: n.targetMorningDays,
// //     targetNight: n.targetNightDays,
// //     historicalMorning: n.historicalMorningDays,
// //     historicalNight: n.historicalNightDays,
// //     bias: n.historicalMorningBias,
// //     debt: n.workloadDebt,
// //     lastPreference: n.lastShiftPreference
// //   })));

// //   // Enhanced priority calculation function
// //   const updatePriorities = () => {
// //     nurseStates.forEach(nurse => {
// //       // Calculate work deficits
// //       const morningDeficit = nurse.targetMorningDays - nurse.totalMorningDays;
// //       const nightDeficit = nurse.targetNightDays - nurse.totalNightDays;
// //       const totalWorkDeficit = nurse.targetTotalWorkDays - nurse.totalWorkDays;
      
// //       // Base priority on current month deficit
// //       let baseMorningPriority = morningDeficit * 10;
// //       let baseNightPriority = nightDeficit * 10;
      
// //       // Adjust for historical bias (encourage alternation)
// //       if (nurse.historicalMorningBias > 1) {
// //         // Had more morning shifts historically, boost night priority
// //         baseNightPriority += 20;
// //         baseMorningPriority -= 10;
// //       } else if (nurse.historicalMorningBias < -1) {
// //         // Had more night shifts historically, boost morning priority
// //         baseMorningPriority += 20;
// //         baseNightPriority -= 10;
// //       }
      
// //       // Adjust for workload debt
// //       baseMorningPriority += nurse.workloadDebt * 5;
// //       baseNightPriority += nurse.workloadDebt * 5;
      
// //       // Adjust for last shift preference (encourage alternation)
// //       if (nurse.lastShiftPreference === 'morning') {
// //         baseNightPriority += 15; // Favor night shifts after morning preference
// //         baseMorningPriority -= 5;
// //       } else if (nurse.lastShiftPreference === 'night') {
// //         baseMorningPriority += 15; // Favor morning shifts after night preference
// //         baseNightPriority -= 5;
// //       }
      
// //       // Monthly rotation bonus (ensure everyone gets different patterns)
// //       const rotationBonus = (nurse.monthlyRotation % 4) * 2;
// //       if (nurse.monthlyRotation % 2 === 0) {
// //         baseMorningPriority += rotationBonus;
// //       } else {
// //         baseNightPriority += rotationBonus;
// //       }
      
// //       nurse.morningPriority = baseMorningPriority;
// //       nurse.nightPriority = baseNightPriority;
// //     });
// //   };

// //   // Enhanced assignment functions with balance consideration
// //   const getAvailableForMorning = () => {
// //     return nurseStates
// //       .filter(nurse => nurse.currentCycle === 'available')
// //       .sort((a, b) => {
// //         // Primary sort: Morning priority
// //         if (b.morningPriority !== a.morningPriority) {
// //           return b.morningPriority - a.morningPriority;
// //         }
// //         // Secondary sort: Total work deficit
// //         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
// //         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
// //         if (bWorkDeficit !== aWorkDeficit) {
// //           return bWorkDeficit - aWorkDeficit;
// //         }
// //         // Tertiary sort: Historical balance
// //         return a.historicalTotalDays - b.historicalTotalDays;
// //       });
// //   };

// //   const getAvailableForNight = () => {
// //     return nurseStates
// //       .filter(nurse => nurse.currentCycle === 'available')
// //       .sort((a, b) => {
// //         // Primary sort: Night priority
// //         if (b.nightPriority !== a.nightPriority) {
// //           return b.nightPriority - a.nightPriority;
// //         }
// //         // Secondary sort: Total work deficit
// //         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
// //         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
// //         if (bWorkDeficit !== aWorkDeficit) {
// //           return bWorkDeficit - aWorkDeficit;
// //         }
// //         // Tertiary sort: Historical balance
// //         return a.historicalTotalDays - b.historicalTotalDays;
// //       });
// //   };

// //   // Enhanced emergency assignment with balance consideration
// //   const forceAssignmentFromOffDuty = (shiftType, needed) => {
// //     const offDutyNurses = nurseStates
// //       .filter(n => n.currentCycle === 'off-duty')
// //       .sort((a, b) => {
// //         // Primary: Days remaining in off-duty (fewer = higher priority)
// //         if (a.offDutyDays !== b.offDutyDays) {
// //           return a.offDutyDays - b.offDutyDays;
// //         }
// //         // Secondary: Work priority for this shift type
// //         const aPriority = shiftType === 'morning' ? a.morningPriority : a.nightPriority;
// //         const bPriority = shiftType === 'morning' ? b.morningPriority : b.nightPriority;
// //         if (bPriority !== aPriority) {
// //           return bPriority - aPriority;
// //         }
// //         // Tertiary: Total work deficit
// //         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
// //         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
// //         return bWorkDeficit - aWorkDeficit;
// //       });
    
// //     const assigned = [];
// //     for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
// //       const nurse = offDutyNurses[i];
// //       console.warn(`EMERGENCY BALANCED ASSIGNMENT: ${nurse.name} (debt: ${nurse.workloadDebt}, bias: ${nurse.historicalMorningBias}) forced from off-duty to ${shiftType} shift`);
// //       nurse.currentCycle = shiftType;
// //       nurse.cycleDay = 1;
// //       nurse.offDutyDays = 0;
// //       nurse.remainingOffDutyDays = 0;
// //       assigned.push(nurse);
// //     }
// //     return assigned;
// //   };

// //   // Generate roster for each day with enhanced balance tracking
// //   for (let day = 1; day <= daysInMonth; day++) {
// //     newRoster[day] = {
// //       morning: [],
// //       night: [],
// //       offDuty: []
// //     };

// //     // Update priorities based on current work distribution and balance
// //     updatePriorities();

// //     // Process state transitions
// //     nurseStates.forEach(nurse => {
// //       if (nurse.currentCycle === 'morning') {
// //         if (nurse.cycleDay >= rosterConfig.morningShiftDays) {
// //           nurse.currentCycle = 'off-duty';
// //           nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
// //           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
// //           nurse.cycleDay = 0;
// //           nurse.lastShiftType = 'morning';
// //           nurse.lastShiftPreference = 'morning'; // Track preference for alternation
// //           nurse.remainingCycleDays = 0;
// //         } else {
// //           nurse.cycleDay++;
// //           nurse.remainingCycleDays = Math.max(0, rosterConfig.morningShiftDays - nurse.cycleDay);
// //         }
// //       } else if (nurse.currentCycle === 'night') {
// //         if (nurse.cycleDay >= rosterConfig.nightShiftDays) {
// //           nurse.currentCycle = 'off-duty';
// //           nurse.offDutyDays = rosterConfig.offDutyAfterNight;
// //           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
// //           nurse.cycleDay = 0;
// //           nurse.lastShiftType = 'night';
// //           nurse.lastShiftPreference = 'night'; // Track preference for alternation
// //           nurse.remainingCycleDays = 0;
// //         } else {
// //           nurse.cycleDay++;
// //           nurse.remainingCycleDays = Math.max(0, rosterConfig.nightShiftDays - nurse.cycleDay);
// //         }
// //       } else if (nurse.currentCycle === 'off-duty') {
// //         if (nurse.offDutyDays > 1) {
// //           nurse.offDutyDays--;
// //           nurse.remainingOffDutyDays = nurse.offDutyDays;
// //         } else {
// //           nurse.currentCycle = 'available';
// //           nurse.offDutyDays = 0;
// //           nurse.remainingOffDutyDays = 0;
// //         }
// //       }
// //     });

// //     // Assign morning shift with balance consideration
// //     const currentMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// //     const morningGap = rosterConfig.morningShiftSize - currentMorning.length;
    
// //     if (morningGap > 0) {
// //       const availableForMorning = getAvailableForMorning();
      
// //       let assigned = 0;
// //       for (let i = 0; i < Math.min(morningGap, availableForMorning.length); i++) {
// //         const nurse = availableForMorning[i];
// //         nurse.currentCycle = 'morning';
// //         nurse.cycleDay = 1;
// //         nurse.remainingCycleDays = rosterConfig.morningShiftDays - 1;
// //         nurse.lastShiftPreference = 'morning';
// //         assigned++;
// //       }
      
// //       const stillNeeded = morningGap - assigned;
// //       if (stillNeeded > 0) {
// //         forceAssignmentFromOffDuty('morning', stillNeeded);
// //       }
// //     }

// //     // Assign night shift with balance consideration
// //     const currentNight = nurseStates.filter(n => n.currentCycle === 'night');
// //     const nightGap = rosterConfig.nightShiftSize - currentNight.length;
    
// //     if (nightGap > 0) {
// //       const availableForNight = getAvailableForNight();
      
// //       let assigned = 0;
// //       for (let i = 0; i < Math.min(nightGap, availableForNight.length); i++) {
// //         const nurse = availableForNight[i];
// //         nurse.currentCycle = 'night';
// //         nurse.cycleDay = 1;
// //         nurse.remainingCycleDays = rosterConfig.nightShiftDays - 1;
// //         nurse.lastShiftPreference = 'night';
// //         assigned++;
// //       }
      
// //       const stillNeeded = nightGap - assigned;
// //       if (stillNeeded > 0) {
// //         forceAssignmentFromOffDuty('night', stillNeeded);
// //       }
// //     }

// //     // Record assignments and update counters
// //     const finalMorning = nurseStates.filter(n => n.currentCycle === 'morning');
// //     const finalNight = nurseStates.filter(n => n.currentCycle === 'night');
// //     const finalOffDuty = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');

// //     finalMorning.forEach(nurse => {
// //       newRoster[day].morning.push({
// //         id: nurse.id,
// //         name: nurse.name,
// //         qualification: nurse.qualification,
// //         experience: nurse.experience
// //       });
// //       nurse.totalMorningDays++;
// //       nurse.totalWorkDays++;
// //     });

// //     finalNight.forEach(nurse => {
// //       newRoster[day].night.push({
// //         id: nurse.id,
// //         name: nurse.name,
// //         qualification: nurse.qualification,
// //         experience: nurse.experience
// //       });
// //       nurse.totalNightDays++;
// //       nurse.totalWorkDays++;
// //     });

// //     finalOffDuty.forEach(nurse => {
// //       const statusText = nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty';
// //       const daysRemaining = nurse.currentCycle === 'off-duty' ? nurse.offDutyDays : 0;
      
// //       newRoster[day].offDuty.push({
// //         id: nurse.id,
// //         name: nurse.name,
// //         qualification: nurse.qualification,
// //         experience: nurse.experience,
// //         daysRemaining: daysRemaining,
// //         status: statusText,
// //         cycleInfo: nurse.currentCycle === 'off-duty' ? 
// //           `Off-duty (${daysRemaining} days remaining)` : 
// //           'Available for assignment'
// //       });
// //       nurse.totalOffDutyDays++;
// //     });
// //   }

// //   // Enhanced workload summary with balance analysis
// //   const workloadSummary = nurseStates.map(nurse => {
// //     const morningDifference = nurse.totalMorningDays - nurse.targetMorningDays;
// //     const nightDifference = nurse.totalNightDays - nurse.targetNightDays;
// //     const totalWorkDifference = nurse.totalWorkDays - nurse.targetTotalWorkDays;
    
// //     // Calculate balance score (lower = better balance)
// //     const balanceScore = Math.abs(morningDifference) + Math.abs(nightDifference) + Math.abs(totalWorkDifference);
    
// //     // Determine if nurse is balanced this month
// //     const isBalanced = balanceScore <= 2;
    
// //     // Calculate cumulative balance including history
// //     const cumulativeMorning = nurse.totalMorningDays + nurse.historicalMorningDays;
// //     const cumulativeNight = nurse.totalNightDays + nurse.historicalNightDays;
// //     const cumulativeBalance = Math.abs(cumulativeMorning - cumulativeNight);
    
// //     return {
// //       name: nurse.name,
// //       morning: nurse.totalMorningDays,
// //       night: nurse.totalNightDays,
// //       offDuty: nurse.totalOffDutyDays,
// //       morningTarget: nurse.targetMorningDays,
// //       nightTarget: nurse.targetNightDays,
// //       morningDiff: morningDifference,
// //       nightDiff: nightDifference,
// //       totalWorkDiff: totalWorkDifference,
// //       balance: isBalanced ? 'Balanced' : 'Needs Adjustment',
// //       balanceScore: balanceScore,
      
// //       // Historical context
// //       historicalMorning: nurse.historicalMorningDays,
// //       historicalNight: nurse.historicalNightDays,
// //       cumulativeMorning: cumulativeMorning,
// //       cumulativeNight: cumulativeNight,
// //       cumulativeBalance: cumulativeBalance,
      
// //       // End state for next month
// //       endState: {
// //         currentCycle: nurse.currentCycle,
// //         cycleDay: nurse.cycleDay,
// //         offDutyDays: nurse.offDutyDays,
// //         remainingCycleDays: nurse.remainingCycleDays,
// //         remainingOffDutyDays: nurse.remainingOffDutyDays,
// //         lastShiftPreference: nurse.lastShiftPreference,
// //         monthlyRotation: nurse.monthlyRotation + 1
// //       }
// //     };
// //   });

// //   // Update nurse data with enhanced balance tracking
// //   const updatedNurses = activeNurses.map(nurse => {
// //     const nurseState = nurseStates.find(ns => ns.id === nurse.id);
// //     if (nurseState) {
// //       let finalShiftType = nurseState.lastShiftType;
      
// //       if (nurseState.currentCycle === 'morning') {
// //         finalShiftType = 'morning';
// //       } else if (nurseState.currentCycle === 'night') {
// //         finalShiftType = 'night';
// //       } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
// //         finalShiftType = nurseState.lastShiftType;
// //       } else {
// //         finalShiftType = null;
// //       }
      
// //       return { 
// //         ...nurse, 
// //         lastShiftType: finalShiftType,
// //         // Enhanced cycle continuity tracking
// //         lastShiftCycleDay: nurseState.currentCycle === 'morning' || nurseState.currentCycle === 'night' ? 
// //           nurseState.cycleDay : 0,
// //         lastOffDutyRemaining: nurseState.currentCycle === 'off-duty' ? 
// //           nurseState.offDutyDays : 0,
// //         lastCycleState: nurseState.currentCycle,
        
// //         // Enhanced balance tracking
// //         lastMonthMorning: nurseState.totalMorningDays,
// //         lastMonthNight: nurseState.totalNightDays,
// //         lastShiftPreference: nurseState.lastShiftPreference,
// //         monthlyRotation: (nurse.monthlyRotation || 0) + 1,
        
// //         // Cumulative balance tracking
// //         totalCumulativeMorning: nurseState.totalMorningDays + nurseState.historicalMorningDays,
// //         totalCumulativeNight: nurseState.totalNightDays + nurseState.historicalNightDays,
        
// //         // Balance metadata
// //         balanceMetadata: {
// //           thisMonthBalance: Math.abs(nurseState.totalMorningDays - nurseState.totalNightDays),
// //           cumulativeBalance: Math.abs((nurseState.totalMorningDays + nurseState.historicalMorningDays) - 
// //                                      (nurseState.totalNightDays + nurseState.historicalNightDays)),
// //           workloadDebt: Math.max(0, nurseState.targetTotalWorkDays - nurseState.totalWorkDays),
// //           balanceScore: Math.abs(nurseState.totalMorningDays - nurseState.targetMorningDays) + 
// //                        Math.abs(nurseState.totalNightDays - nurseState.targetNightDays)
// //         }
// //       };
// //     }
// //     return nurse;
// //   });
  
// //   // Enhanced validation and reporting
// //   let hasEmptyShifts = false;
// //   let totalEmptyShifts = 0;
// //   let continuityIssues = [];
  
// //   for (let day = 1; day <= daysInMonth; day++) {
// //     const morningShort = rosterConfig.morningShiftSize - newRoster[day].morning.length;
// //     const nightShort = rosterConfig.nightShiftSize - newRoster[day].night.length;
    
// //     if (morningShort > 0 || nightShort > 0) {
// //       hasEmptyShifts = true;
// //       totalEmptyShifts += morningShort + nightShort;
// //       continuityIssues.push(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
// //     }
// //   }
  
// //   // Balance analysis
// //   const balancedNurses = workloadSummary.filter(n => n.balance === 'Balanced');
// //   const imbalancedNurses = workloadSummary.filter(n => n.balance === 'Needs Adjustment');
// //   const perfectCumulativeBalance = workloadSummary.filter(n => n.cumulativeBalance <= 1);
// //   const nursesInTransition = workloadSummary.filter(n => 
// //     n.endState.currentCycle !== 'available' && 
// //     (n.endState.remainingCycleDays > 0 || n.endState.remainingOffDutyDays > 0)
// //   );
  
// //   console.log('Enhanced Balance Analysis:', {
// //     balancedThisMonth: balancedNurses.length,
// //     imbalancedThisMonth: imbalancedNurses.length,
// //     perfectCumulativeBalance: perfectCumulativeBalance.length,
// //     avgBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length
// //   });

// //   // Enhanced summary message
// //   const balanceReport = `📊 BALANCE ANALYSIS:
// // This Month: ${balancedNurses.length}/${workloadSummary.length} nurses balanced
// // Cumulative: ${perfectCumulativeBalance.length}/${workloadSummary.length} nurses with perfect overall balance
// // Average balance score: ${(workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length).toFixed(1)}

// // 📋 WORKLOAD DISTRIBUTION:
// // ${workloadSummary.sort((a, b) => a.balanceScore - b.balanceScore).map(n => 
// //   `${n.name}: ${n.morning}M/${n.night}N/${n.offDuty}Off (targets: ${n.morningTarget}M/${n.nightTarget}N) | Cumulative: ${n.cumulativeMorning}M/${n.cumulativeNight}N | Balance: ${n.cumulativeBalance <= 1 ? '✅' : '⚖️'}`
// // ).join('\n')}`;

// //   const summaryMessage = hasEmptyShifts 
// //     ? `⚠️ ROSTER ISSUE: ${totalEmptyShifts} unfilled shift slots!\n\n${continuityIssues.join('\n')}\n\n${balanceReport}`
// //     : `✅ BALANCED ROSTER GENERATED with enhanced alternation!\n\n${balanceReport}${nursesInTransition.length > 0 ? 
// //         `\n\n🔄 Nurses continuing cycles into next month:\n${nursesInTransition.map(n => 
// //           `${n.name}: ${n.endState.currentCycle}${n.endState.remainingCycleDays > 0 ? ` (${n.endState.remainingCycleDays} days left)` : n.endState.remainingOffDutyDays > 0 ? ` (${n.endState.remainingOffDutyDays} off-duty days left)` : ''}`
// //         ).join('\n')}` : ''
// //       }`;

// //   return {
// //     success: true,
// //     roster: newRoster,
// //     updatedNurses,
// //     message: summaryMessage,
// //     workloadSummary,
// //     continuityInfo: {
// //       nursesInTransition: nursesInTransition.length,
// //       hasEmptyShifts,
// //       totalEmptyShifts,
// //       continuityIssues: hasEmptyShifts ? continuityIssues : []
// //     },
// //     balanceInfo: {
// //       balancedThisMonth: balancedNurses.length,
// //       imbalancedThisMonth: imbalancedNurses.length,
// //       perfectCumulativeBalance: perfectCumulativeBalance.length,
// //       averageBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length,
// //       workloadDetails: workloadSummary
// //     }
// //   };
// // };

// // src/services/rosterGenerator.js (Enhanced with Monthly Balance & Alternation)

// export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
//   const totalShiftSlots = rosterConfig.morningShiftSize + rosterConfig.nightShiftSize;
  
//   if (activeNurses.length < totalShiftSlots) {
//     return {
//       success: false,
//       message: `Need at least ${totalShiftSlots} active nurses to generate roster (${rosterConfig.morningShiftSize} morning + ${rosterConfig.nightShiftSize} night). Currently have ${activeNurses.length}.`
//     };
//   }

//   // Initialize roster structure
//   const newRoster = {};
  
//   // Calculate ideal workload distribution with monthly balancing
//   const totalShiftDays = daysInMonth * (rosterConfig.morningShiftSize + rosterConfig.nightShiftSize);
//   const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
//   const extraWorkDays = totalShiftDays % activeNurses.length;
  
//   // More precise workload targets
//   const baseTargetWorkDays = Math.floor(averageWorkDaysPerNurse);
//   const idealMorningDays = Math.floor(baseTargetWorkDays / 2);
//   const idealNightDays = Math.ceil(baseTargetWorkDays / 2);
  
//   console.log(`Monthly Balance Calculation:
//     - Total shift days: ${totalShiftDays}
//     - Active nurses: ${activeNurses.length}
//     - Base work days per nurse: ${baseTargetWorkDays}
//     - Extra work days to distribute: ${extraWorkDays}
//     - Target morning days: ${idealMorningDays}
//     - Target night days: ${idealNightDays}`);

//   // Enhanced nurse state tracking with historical balance
//   const nurseStates = activeNurses.map((nurse, index) => {
//     // Calculate cumulative historical workload for better balance
//     const historicalMorningDays = nurse.lastMonthMorning || 0;
//     const historicalNightDays = nurse.lastMonthNight || 0;
//     const totalHistoricalDays = historicalMorningDays + historicalNightDays;
    
//     // Calculate balance debt/credit from previous months
//     const expectedHistoricalDays = baseTargetWorkDays; // Assuming same target each month
//     const workloadDebt = Math.max(0, expectedHistoricalDays - totalHistoricalDays);
//     const workloadCredit = Math.max(0, totalHistoricalDays - expectedHistoricalDays);
    
//     // Determine if this nurse should get extra work days this month
//     const shouldGetExtraDay = index < extraWorkDays;
//     const thisMonthTargetWorkDays = baseTargetWorkDays + (shouldGetExtraDay ? 1 : 0) + workloadDebt;
    
//     // Calculate morning/night distribution based on historical bias
//     const historicalMorningBias = historicalMorningDays - historicalNightDays;
//     let thisMonthMorningTarget, thisMonthNightTarget;
    
//     if (historicalMorningBias > 1) {
//       // Had more morning shifts historically, favor nights this month
//       thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
//       thisMonthMorningTarget = thisMonthTargetWorkDays - thisMonthNightTarget;
//     } else if (historicalMorningBias < -1) {
//       // Had more night shifts historically, favor mornings this month
//       thisMonthMorningTarget = Math.ceil(thisMonthTargetWorkDays / 2);
//       thisMonthNightTarget = thisMonthTargetWorkDays - thisMonthMorningTarget;
//     } else {
//       // Balanced historically, distribute evenly
//       thisMonthMorningTarget = Math.floor(thisMonthTargetWorkDays / 2);
//       thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
//     }

//     const nurseState = {
//       id: nurse.id,
//       name: nurse.name,
//       qualification: nurse.qualification,
//       experience: nurse.experience,
//       // Current state - will be set based on previous month data
//       currentCycle: 'available',
//       cycleDay: 0,
//       offDutyDays: 0,
//       lastShiftType: nurse.lastShiftType,
      
//       // Work counters for this month
//       totalMorningDays: 0,
//       totalNightDays: 0,
//       totalOffDutyDays: 0,
//       totalWorkDays: 0,
      
//       // Enhanced targets for fair distribution
//       targetMorningDays: thisMonthMorningTarget,
//       targetNightDays: thisMonthNightTarget,
//       targetTotalWorkDays: thisMonthTargetWorkDays,
      
//       // Priority scores for assignment (higher = more priority)
//       morningPriority: 0,
//       nightPriority: 0,
//       workloadPriority: workloadDebt, // Higher debt = higher priority
      
//       // Historical balance tracking
//       historicalMorningDays: historicalMorningDays,
//       historicalNightDays: historicalNightDays,
//       historicalTotalDays: totalHistoricalDays,
//       workloadDebt: workloadDebt,
//       workloadCredit: workloadCredit,
//       historicalMorningBias: historicalMorningBias,
      
//       // Cycle continuity fields
//       remainingCycleDays: 0,
//       remainingOffDutyDays: 0,
      
//       // Balance alternation tracking
//       lastShiftPreference: nurse.lastShiftPreference || 'none', // 'morning', 'night', 'none'
//       monthlyRotation: nurse.monthlyRotation || 0 // Rotation counter for alternation
//     };

//     // Handle continuation from previous month based on nurse's last state
//     if (nurse.lastShiftType && nurse.lastShiftCycleDay && nurse.lastOffDutyRemaining !== undefined) {
//       if (nurse.lastOffDutyRemaining > 0) {
//         nurseState.currentCycle = 'off-duty';
//         nurseState.offDutyDays = nurse.lastOffDutyRemaining;
//         nurseState.remainingOffDutyDays = nurse.lastOffDutyRemaining;
//       } else if (nurse.lastShiftType === 'morning' && nurse.lastShiftCycleDay < rosterConfig.morningShiftDays) {
//         nurseState.currentCycle = 'morning';
//         nurseState.cycleDay = nurse.lastShiftCycleDay;
//         nurseState.remainingCycleDays = rosterConfig.morningShiftDays - nurse.lastShiftCycleDay;
//       } else if (nurse.lastShiftType === 'night' && nurse.lastShiftCycleDay < rosterConfig.nightShiftDays) {
//         nurseState.currentCycle = 'night';
//         nurseState.cycleDay = nurse.lastShiftCycleDay;
//         nurseState.remainingCycleDays = rosterConfig.nightShiftDays - nurse.lastShiftCycleDay;
//       } else {
//         if (nurse.lastShiftType === 'morning') {
//           nurseState.currentCycle = 'off-duty';
//           nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
//           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
//         } else if (nurse.lastShiftType === 'night') {
//           nurseState.currentCycle = 'off-duty';
//           nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
//           nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
//         }
//       }
//     } else {
//       // Handle legacy data or nurses without detailed cycle information
//       if (nurse.lastShiftType === 'morning') {
//         nurseState.currentCycle = 'off-duty';
//         nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
//         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
//       } else if (nurse.lastShiftType === 'night') {
//         nurseState.currentCycle = 'off-duty';
//         nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
//         nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
//       } else {
//         nurseState.currentCycle = 'available';
//       }
//     }

//     return nurseState;
//   });

//   console.log('Enhanced nurse states with balance tracking:', nurseStates.map(n => ({
//     name: n.name,
//     currentCycle: n.currentCycle,
//     targetMorning: n.targetMorningDays,
//     targetNight: n.targetNightDays,
//     historicalMorning: n.historicalMorningDays,
//     historicalNight: n.historicalNightDays,
//     bias: n.historicalMorningBias,
//     debt: n.workloadDebt,
//     lastPreference: n.lastShiftPreference
//   })));

//   // Enhanced priority calculation function
//   const updatePriorities = () => {
//     nurseStates.forEach(nurse => {
//       // Calculate work deficits
//       const morningDeficit = nurse.targetMorningDays - nurse.totalMorningDays;
//       const nightDeficit = nurse.targetNightDays - nurse.totalNightDays;
//       const totalWorkDeficit = nurse.targetTotalWorkDays - nurse.totalWorkDays;
      
//       // Base priority on current month deficit
//       let baseMorningPriority = morningDeficit * 10;
//       let baseNightPriority = nightDeficit * 10;
      
//       // Adjust for historical bias (encourage alternation)
//       if (nurse.historicalMorningBias > 1) {
//         // Had more morning shifts historically, boost night priority
//         baseNightPriority += 20;
//         baseMorningPriority -= 10;
//       } else if (nurse.historicalMorningBias < -1) {
//         // Had more night shifts historically, boost morning priority
//         baseMorningPriority += 20;
//         baseNightPriority -= 10;
//       }
      
//       // Adjust for workload debt
//       baseMorningPriority += nurse.workloadDebt * 5;
//       baseNightPriority += nurse.workloadDebt * 5;
      
//       // Adjust for last shift preference (encourage alternation)
//       if (nurse.lastShiftPreference === 'morning') {
//         baseNightPriority += 15; // Favor night shifts after morning preference
//         baseMorningPriority -= 5;
//       } else if (nurse.lastShiftPreference === 'night') {
//         baseMorningPriority += 15; // Favor morning shifts after night preference
//         baseNightPriority -= 5;
//       }
      
//       // Monthly rotation bonus (ensure everyone gets different patterns)
//       const rotationBonus = (nurse.monthlyRotation % 4) * 2;
//       if (nurse.monthlyRotation % 2 === 0) {
//         baseMorningPriority += rotationBonus;
//       } else {
//         baseNightPriority += rotationBonus;
//       }
      
//       nurse.morningPriority = baseMorningPriority;
//       nurse.nightPriority = baseNightPriority;
//     });
//   };

//   // Enhanced assignment functions with balance consideration
//   const getAvailableForMorning = () => {
//     return nurseStates
//       .filter(nurse => nurse.currentCycle === 'available')
//       .sort((a, b) => {
//         // Primary sort: Morning priority
//         if (b.morningPriority !== a.morningPriority) {
//           return b.morningPriority - a.morningPriority;
//         }
//         // Secondary sort: Total work deficit
//         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
//         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
//         if (bWorkDeficit !== aWorkDeficit) {
//           return bWorkDeficit - aWorkDeficit;
//         }
//         // Tertiary sort: Historical balance
//         return a.historicalTotalDays - b.historicalTotalDays;
//       });
//   };

//   const getAvailableForNight = () => {
//     return nurseStates
//       .filter(nurse => nurse.currentCycle === 'available')
//       .sort((a, b) => {
//         // Primary sort: Night priority
//         if (b.nightPriority !== a.nightPriority) {
//           return b.nightPriority - a.nightPriority;
//         }
//         // Secondary sort: Total work deficit
//         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
//         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
//         if (bWorkDeficit !== aWorkDeficit) {
//           return bWorkDeficit - aWorkDeficit;
//         }
//         // Tertiary sort: Historical balance
//         return a.historicalTotalDays - b.historicalTotalDays;
//       });
//   };

//   // Enhanced emergency assignment with balance consideration
//   const forceAssignmentFromOffDuty = (shiftType, needed) => {
//     const offDutyNurses = nurseStates
//       .filter(n => n.currentCycle === 'off-duty')
//       .sort((a, b) => {
//         // Primary: Days remaining in off-duty (fewer = higher priority)
//         if (a.offDutyDays !== b.offDutyDays) {
//           return a.offDutyDays - b.offDutyDays;
//         }
//         // Secondary: Work priority for this shift type
//         const aPriority = shiftType === 'morning' ? a.morningPriority : a.nightPriority;
//         const bPriority = shiftType === 'morning' ? b.morningPriority : b.nightPriority;
//         if (bPriority !== aPriority) {
//           return bPriority - aPriority;
//         }
//         // Tertiary: Total work deficit
//         const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
//         const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
//         return bWorkDeficit - aWorkDeficit;
//       });
    
//     const assigned = [];
//     for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
//       const nurse = offDutyNurses[i];
//       console.warn(`EMERGENCY BALANCED ASSIGNMENT: ${nurse.name} (debt: ${nurse.workloadDebt}, bias: ${nurse.historicalMorningBias}) forced from off-duty to ${shiftType} shift`);
//       nurse.currentCycle = shiftType;
//       nurse.cycleDay = 1;
//       nurse.offDutyDays = 0;
//       nurse.remainingOffDutyDays = 0;
//       assigned.push(nurse);
//     }
//     return assigned;
//   };

//   // Generate roster for each day with enhanced balance tracking
//   for (let day = 1; day <= daysInMonth; day++) {
//     newRoster[day] = {
//       morning: [],
//       night: [],
//       offDuty: []
//     };

//     // Update priorities based on current work distribution and balance
//     updatePriorities();

//     // Process state transitions
//     nurseStates.forEach(nurse => {
//       if (nurse.currentCycle === 'morning') {
//         if (nurse.cycleDay >= rosterConfig.morningShiftDays) {
//           nurse.currentCycle = 'off-duty';
//           nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
//           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
//           nurse.cycleDay = 0;
//           nurse.lastShiftType = 'morning';
//           nurse.lastShiftPreference = 'morning'; // Track preference for alternation
//           nurse.remainingCycleDays = 0;
//         } else {
//           nurse.cycleDay++;
//           nurse.remainingCycleDays = Math.max(0, rosterConfig.morningShiftDays - nurse.cycleDay);
//         }
//       } else if (nurse.currentCycle === 'night') {
//         if (nurse.cycleDay >= rosterConfig.nightShiftDays) {
//           nurse.currentCycle = 'off-duty';
//           nurse.offDutyDays = rosterConfig.offDutyAfterNight;
//           nurse.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
//           nurse.cycleDay = 0;
//           nurse.lastShiftType = 'night';
//           nurse.lastShiftPreference = 'night'; // Track preference for alternation
//           nurse.remainingCycleDays = 0;
//         } else {
//           nurse.cycleDay++;
//           nurse.remainingCycleDays = Math.max(0, rosterConfig.nightShiftDays - nurse.cycleDay);
//         }
//       } else if (nurse.currentCycle === 'off-duty') {
//         if (nurse.offDutyDays > 1) {
//           nurse.offDutyDays--;
//           nurse.remainingOffDutyDays = nurse.offDutyDays;
//         } else {
//           nurse.currentCycle = 'available';
//           nurse.offDutyDays = 0;
//           nurse.remainingOffDutyDays = 0;
//         }
//       }
//     });

//     // Assign morning shift with balance consideration
//     const currentMorning = nurseStates.filter(n => n.currentCycle === 'morning');
//     const morningGap = rosterConfig.morningShiftSize - currentMorning.length;
    
//     if (morningGap > 0) {
//       const availableForMorning = getAvailableForMorning();
      
//       let assigned = 0;
//       for (let i = 0; i < Math.min(morningGap, availableForMorning.length); i++) {
//         const nurse = availableForMorning[i];
//         nurse.currentCycle = 'morning';
//         nurse.cycleDay = 1;
//         nurse.remainingCycleDays = rosterConfig.morningShiftDays - 1;
//         nurse.lastShiftPreference = 'morning';
//         assigned++;
//       }
      
//       const stillNeeded = morningGap - assigned;
//       if (stillNeeded > 0) {
//         forceAssignmentFromOffDuty('morning', stillNeeded);
//       }
//     }

//     // Assign night shift with balance consideration
//     const currentNight = nurseStates.filter(n => n.currentCycle === 'night');
//     const nightGap = rosterConfig.nightShiftSize - currentNight.length;
    
//     if (nightGap > 0) {
//       const availableForNight = getAvailableForNight();
      
//       let assigned = 0;
//       for (let i = 0; i < Math.min(nightGap, availableForNight.length); i++) {
//         const nurse = availableForNight[i];
//         nurse.currentCycle = 'night';
//         nurse.cycleDay = 1;
//         nurse.remainingCycleDays = rosterConfig.nightShiftDays - 1;
//         nurse.lastShiftPreference = 'night';
//         assigned++;
//       }
      
//       const stillNeeded = nightGap - assigned;
//       if (stillNeeded > 0) {
//         forceAssignmentFromOffDuty('night', stillNeeded);
//       }
//     }

//     // Record assignments and update counters
//     const finalMorning = nurseStates.filter(n => n.currentCycle === 'morning');
//     const finalNight = nurseStates.filter(n => n.currentCycle === 'night');
//     const finalOffDuty = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');

//     finalMorning.forEach(nurse => {
//       newRoster[day].morning.push({
//         id: nurse.id,
//         name: nurse.name,
//         qualification: nurse.qualification,
//         experience: nurse.experience
//       });
//       nurse.totalMorningDays++;
//       nurse.totalWorkDays++;
//     });

//     finalNight.forEach(nurse => {
//       newRoster[day].night.push({
//         id: nurse.id,
//         name: nurse.name,
//         qualification: nurse.qualification,
//         experience: nurse.experience
//       });
//       nurse.totalNightDays++;
//       nurse.totalWorkDays++;
//     });

//     finalOffDuty.forEach(nurse => {
//       const statusText = nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty';
//       const daysRemaining = nurse.currentCycle === 'off-duty' ? nurse.offDutyDays : 0;
      
//       newRoster[day].offDuty.push({
//         id: nurse.id,
//         name: nurse.name,
//         qualification: nurse.qualification,
//         experience: nurse.experience,
//         daysRemaining: daysRemaining,
//         status: statusText,
//         cycleInfo: nurse.currentCycle === 'off-duty' ? 
//           `Off-duty (${daysRemaining} days remaining)` : 
//           'Available for assignment'
//       });
//       nurse.totalOffDutyDays++;
//     });
//   }

//   // Enhanced workload summary with balance analysis
//   const workloadSummary = nurseStates.map(nurse => {
//     const morningDifference = nurse.totalMorningDays - nurse.targetMorningDays;
//     const nightDifference = nurse.totalNightDays - nurse.targetNightDays;
    
//     // Calculate balance score (lower = better balance)
//     const balanceScore = Math.abs(morningDifference) + Math.abs(nightDifference);
    
//     // Determine if nurse is balanced this month
//     const isBalanced = balanceScore <= 2;
    
//     // Calculate cumulative balance including history
//     const cumulativeMorning = nurse.totalMorningDays + nurse.historicalMorningDays;
//     const cumulativeNight = nurse.totalNightDays + nurse.historicalNightDays;
//     const cumulativeBalance = Math.abs(cumulativeMorning - cumulativeNight);
    
//     return {
//       name: nurse.name,
//       morning: nurse.totalMorningDays,
//       night: nurse.totalNightDays,
//       offDuty: nurse.totalOffDutyDays,
//       morningTarget: nurse.targetMorningDays,
//       nightTarget: nurse.targetNightDays,
//       morningDiff: morningDifference,
//       nightDiff: nightDifference,
//       totalWorkDiff: totalWorkDifference,
//       balance: isBalanced ? 'Balanced' : 'Needs Adjustment',
//       balanceScore: balanceScore,
      
//       // Historical context
//       historicalMorning: nurse.historicalMorningDays,
//       historicalNight: nurse.historicalNightDays,
//       cumulativeMorning: cumulativeMorning,
//       cumulativeNight: cumulativeNight,
//       cumulativeBalance: cumulativeBalance,
      
//       // End state for next month
//       endState: {
//         currentCycle: nurse.currentCycle,
//         cycleDay: nurse.cycleDay,
//         offDutyDays: nurse.offDutyDays,
//         remainingCycleDays: nurse.remainingCycleDays,
//         remainingOffDutyDays: nurse.remainingOffDutyDays,
//         lastShiftPreference: nurse.lastShiftPreference,
//         monthlyRotation: nurse.monthlyRotation + 1
//       }
//     };
//   });

//   // Update nurse data with enhanced balance tracking
//   const updatedNurses = activeNurses.map(nurse => {
//     const nurseState = nurseStates.find(ns => ns.id === nurse.id);
//     if (nurseState) {
//       let finalShiftType = nurseState.lastShiftType;
      
//       if (nurseState.currentCycle === 'morning') {
//         finalShiftType = 'morning';
//       } else if (nurseState.currentCycle === 'night') {
//         finalShiftType = 'night';
//       } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
//         finalShiftType = nurseState.lastShiftType;
//       } else {
//         finalShiftType = null;
//       }
      
//       return { 
//         ...nurse, 
//         lastShiftType: finalShiftType,
//         // Enhanced cycle continuity tracking
//         lastShiftCycleDay: nurseState.currentCycle === 'morning' || nurseState.currentCycle === 'night' ? 
//           nurseState.cycleDay : 0,
//         lastOffDutyRemaining: nurseState.currentCycle === 'off-duty' ? 
//           nurseState.offDutyDays : 0,
//         lastCycleState: nurseState.currentCycle,
        
//         // Enhanced balance tracking
//         lastMonthMorning: nurseState.totalMorningDays,
//         lastMonthNight: nurseState.totalNightDays,
//         lastShiftPreference: nurseState.lastShiftPreference,
//         monthlyRotation: (nurse.monthlyRotation || 0) + 1,
        
//         // Cumulative balance tracking
//         totalCumulativeMorning: nurseState.totalMorningDays + nurseState.historicalMorningDays,
//         totalCumulativeNight: nurseState.totalNightDays + nurseState.historicalNightDays,
        
//         // Balance metadata
//         balanceMetadata: {
//           thisMonthBalance: Math.abs(nurseState.totalMorningDays - nurseState.totalNightDays),
//           cumulativeBalance: Math.abs((nurseState.totalMorningDays + nurseState.historicalMorningDays) - 
//                                      (nurseState.totalNightDays + nurseState.historicalNightDays)),
//           workloadDebt: Math.max(0, nurseState.targetTotalWorkDays - nurseState.totalWorkDays),
//           balanceScore: Math.abs(nurseState.totalMorningDays - nurseState.targetMorningDays) + 
//                        Math.abs(nurseState.totalNightDays - nurseState.targetNightDays)
//         }
//       };
//     }
//     return nurse;
//   });
  
//   // Enhanced validation and reporting
//   let hasEmptyShifts = false;
//   let totalEmptyShifts = 0;
//   let continuityIssues = [];
  
//   for (let day = 1; day <= daysInMonth; day++) {
//     const morningShort = rosterConfig.morningShiftSize - newRoster[day].morning.length;
//     const nightShort = rosterConfig.nightShiftSize - newRoster[day].night.length;
    
//     if (morningShort > 0 || nightShort > 0) {
//       hasEmptyShifts = true;
//       totalEmptyShifts += morningShort + nightShort;
//       continuityIssues.push(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
//     }
//   }
  
//   // Balance analysis
//   const balancedNurses = workloadSummary.filter(n => n.balance === 'Balanced');
//   const imbalancedNurses = workloadSummary.filter(n => n.balance === 'Needs Adjustment');
//   const perfectCumulativeBalance = workloadSummary.filter(n => n.cumulativeBalance <= 1);
//   const nursesInTransition = workloadSummary.filter(n => 
//     n.endState.currentCycle !== 'available' && 
//     (n.endState.remainingCycleDays > 0 || n.endState.remainingOffDutyDays > 0)
//   );
  
//   console.log('Enhanced Balance Analysis:', {
//     balancedThisMonth: balancedNurses.length,
//     imbalancedThisMonth: imbalancedNurses.length,
//     perfectCumulativeBalance: perfectCumulativeBalance.length,
//     avgBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length
//   });

//   // Enhanced summary message
//   const balanceReport = `📊 BALANCE ANALYSIS:
// This Month: ${balancedNurses.length}/${workloadSummary.length} nurses balanced
// Cumulative: ${perfectCumulativeBalance.length}/${workloadSummary.length} nurses with perfect overall balance
// Average balance score: ${(workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length).toFixed(1)}

// 📋 WORKLOAD DISTRIBUTION:
// ${workloadSummary.sort((a, b) => a.balanceScore - b.balanceScore).map(n => 
//   `${n.name}: ${n.morning}M/${n.night}N/${n.offDuty}Off (targets: ${n.morningTarget}M/${n.nightTarget}N) | Cumulative: ${n.cumulativeMorning}M/${n.cumulativeNight}N | Balance: ${n.cumulativeBalance <= 1 ? '✅' : '⚖️'}`
// ).join('\n')}`;

//   const summaryMessage = hasEmptyShifts 
//     ? `⚠️ ROSTER ISSUE: ${totalEmptyShifts} unfilled shift slots!\n\n${continuityIssues.join('\n')}\n\n${balanceReport}`
//     : `✅ BALANCED ROSTER GENERATED with enhanced alternation!\n\n${balanceReport}${nursesInTransition.length > 0 ? 
//         `\n\n🔄 Nurses continuing cycles into next month:\n${nursesInTransition.map(n => 
//           `${n.name}: ${n.endState.currentCycle}${n.endState.remainingCycleDays > 0 ? ` (${n.endState.remainingCycleDays} days left)` : n.endState.remainingOffDutyDays > 0 ? ` (${n.endState.remainingOffDutyDays} off-duty days left)` : ''}`
//         ).join('\n')}` : ''
//       }`;

//   return {
//     success: true,
//     roster: newRoster,
//     updatedNurses,
//     message: summaryMessage,
//     workloadSummary,
//     continuityInfo: {
//       nursesInTransition: nursesInTransition.length,
//       hasEmptyShifts,
//       totalEmptyShifts,
//       continuityIssues: hasEmptyShifts ? continuityIssues : []
//     },
//     balanceInfo: {
//       balancedThisMonth: balancedNurses.length,
//       imbalancedThisMonth: imbalancedNurses.length,
//       perfectCumulativeBalance: perfectCumulativeBalance.length,
//       averageBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length,
//       workloadDetails: workloadSummary
//     }
//   };
// };

// src/services/rosterGenerator.js (Enhanced with Monthly Balance & Alternation)

export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
  const totalShiftSlots = rosterConfig.morningShiftSize + rosterConfig.nightShiftSize;
  
  if (activeNurses.length < totalShiftSlots) {
    return {
      success: false,
      message: `Need at least ${totalShiftSlots} active nurses to generate roster (${rosterConfig.morningShiftSize} morning + ${rosterConfig.nightShiftSize} night). Currently have ${activeNurses.length}.`
    };
  }

  // Initialize roster structure
  const newRoster = {};
  
  // Calculate ideal workload distribution with monthly balancing
  const totalShiftDays = daysInMonth * (rosterConfig.morningShiftSize + rosterConfig.nightShiftSize);
  const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
  const extraWorkDays = totalShiftDays % activeNurses.length;
  
  // More precise workload targets
  const baseTargetWorkDays = Math.floor(averageWorkDaysPerNurse);
  const idealMorningDays = Math.floor(baseTargetWorkDays / 2);
  const idealNightDays = Math.ceil(baseTargetWorkDays / 2);
  
  console.log(`Monthly Balance Calculation:
    - Total shift days: ${totalShiftDays}
    - Active nurses: ${activeNurses.length}
    - Base work days per nurse: ${baseTargetWorkDays}
    - Extra work days to distribute: ${extraWorkDays}
    - Target morning days: ${idealMorningDays}
    - Target night days: ${idealNightDays}`);

  // Enhanced nurse state tracking with historical balance
  const nurseStates = activeNurses.map((nurse, index) => {
    // Calculate cumulative historical workload for better balance
    const historicalMorningDays = nurse.lastMonthMorning || 0;
    const historicalNightDays = nurse.lastMonthNight || 0;
    const totalHistoricalDays = historicalMorningDays + historicalNightDays;
    
    // Calculate balance debt/credit from previous months
    const expectedHistoricalDays = baseTargetWorkDays; // Assuming same target each month
    const workloadDebt = Math.max(0, expectedHistoricalDays - totalHistoricalDays);
    const workloadCredit = Math.max(0, totalHistoricalDays - expectedHistoricalDays);
    
    // Determine if this nurse should get extra work days this month
    const shouldGetExtraDay = index < extraWorkDays;
    const thisMonthTargetWorkDays = baseTargetWorkDays + (shouldGetExtraDay ? 1 : 0) + workloadDebt;
    
    // Calculate morning/night distribution based on historical bias
    const historicalMorningBias = historicalMorningDays - historicalNightDays;
    let thisMonthMorningTarget, thisMonthNightTarget;
    
    if (historicalMorningBias > 1) {
      // Had more morning shifts historically, favor nights this month
      thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
      thisMonthMorningTarget = thisMonthTargetWorkDays - thisMonthNightTarget;
    } else if (historicalMorningBias < -1) {
      // Had more night shifts historically, favor mornings this month
      thisMonthMorningTarget = Math.ceil(thisMonthTargetWorkDays / 2);
      thisMonthNightTarget = thisMonthTargetWorkDays - thisMonthMorningTarget;
    } else {
      // Balanced historically, distribute evenly
      thisMonthMorningTarget = Math.floor(thisMonthTargetWorkDays / 2);
      thisMonthNightTarget = Math.ceil(thisMonthTargetWorkDays / 2);
    }

    const nurseState = {
      id: nurse.id,
      name: nurse.name,
      qualification: nurse.qualification,
      experience: nurse.experience,
      // Current state - will be set based on previous month data
      currentCycle: 'available',
      cycleDay: 0,
      offDutyDays: 0,
      lastShiftType: nurse.lastShiftType,
      
      // Work counters for this month
      totalMorningDays: 0,
      totalNightDays: 0,
      totalOffDutyDays: 0,
      totalWorkDays: 0,
      
      // Enhanced targets for fair distribution
      targetMorningDays: thisMonthMorningTarget,
      targetNightDays: thisMonthNightTarget,
      targetTotalWorkDays: thisMonthTargetWorkDays,
      
      // Priority scores for assignment (higher = more priority)
      morningPriority: 0,
      nightPriority: 0,
      workloadPriority: workloadDebt, // Higher debt = higher priority
      
      // Historical balance tracking
      historicalMorningDays: historicalMorningDays,
      historicalNightDays: historicalNightDays,
      historicalTotalDays: totalHistoricalDays,
      workloadDebt: workloadDebt,
      workloadCredit: workloadCredit,
      historicalMorningBias: historicalMorningBias,
      
      // Cycle continuity fields
      remainingCycleDays: 0,
      remainingOffDutyDays: 0,
      
      // Balance alternation tracking
      lastShiftPreference: nurse.lastShiftPreference || 'none', // 'morning', 'night', 'none'
      monthlyRotation: nurse.monthlyRotation || 0 // Rotation counter for alternation
    };

    // Handle continuation from previous month based on nurse's last state
    if (nurse.lastShiftType && nurse.lastShiftCycleDay && nurse.lastOffDutyRemaining !== undefined) {
      if (nurse.lastOffDutyRemaining > 0) {
        nurseState.currentCycle = 'off-duty';
        nurseState.offDutyDays = nurse.lastOffDutyRemaining;
        nurseState.remainingOffDutyDays = nurse.lastOffDutyRemaining;
      } else if (nurse.lastShiftType === 'morning' && nurse.lastShiftCycleDay < rosterConfig.morningShiftDays) {
        nurseState.currentCycle = 'morning';
        nurseState.cycleDay = nurse.lastShiftCycleDay;
        nurseState.remainingCycleDays = rosterConfig.morningShiftDays - nurse.lastShiftCycleDay;
      } else if (nurse.lastShiftType === 'night' && nurse.lastShiftCycleDay < rosterConfig.nightShiftDays) {
        nurseState.currentCycle = 'night';
        nurseState.cycleDay = nurse.lastShiftCycleDay;
        nurseState.remainingCycleDays = rosterConfig.nightShiftDays - nurse.lastShiftCycleDay;
      } else {
        if (nurse.lastShiftType === 'morning') {
          nurseState.currentCycle = 'off-duty';
          nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
          nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
        } else if (nurse.lastShiftType === 'night') {
          nurseState.currentCycle = 'off-duty';
          nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
          nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
        }
      }
    } else {
      // Handle legacy data or nurses without detailed cycle information
      if (nurse.lastShiftType === 'morning') {
        nurseState.currentCycle = 'off-duty';
        nurseState.offDutyDays = rosterConfig.offDutyAfterMorning;
        nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
      } else if (nurse.lastShiftType === 'night') {
        nurseState.currentCycle = 'off-duty';
        nurseState.offDutyDays = rosterConfig.offDutyAfterNight;
        nurseState.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
      } else {
        nurseState.currentCycle = 'available';
      }
    }

    return nurseState;
  });

  console.log('Enhanced nurse states with balance tracking:', nurseStates.map(n => ({
    name: n.name,
    currentCycle: n.currentCycle,
    targetMorning: n.targetMorningDays,
    targetNight: n.targetNightDays,
    historicalMorning: n.historicalMorningDays,
    historicalNight: n.historicalNightDays,
    bias: n.historicalMorningBias,
    debt: n.workloadDebt,
    lastPreference: n.lastShiftPreference
  })));

  // Enhanced priority calculation function
  const updatePriorities = () => {
    nurseStates.forEach(nurse => {
      // Calculate work deficits
      const morningDeficit = nurse.targetMorningDays - nurse.totalMorningDays;
      const nightDeficit = nurse.targetNightDays - nurse.totalNightDays;
      //const totalWorkDeficit = nurse.targetTotalWorkDays - nurse.totalWorkDays;
      
      // Base priority on current month deficit
      let baseMorningPriority = morningDeficit * 10;
      let baseNightPriority = nightDeficit * 10;
      
      // Adjust for historical bias (encourage alternation)
      if (nurse.historicalMorningBias > 1) {
        // Had more morning shifts historically, boost night priority
        baseNightPriority += 20;
        baseMorningPriority -= 10;
      } else if (nurse.historicalMorningBias < -1) {
        // Had more night shifts historically, boost morning priority
        baseMorningPriority += 20;
        baseNightPriority -= 10;
      }
      
      // Adjust for workload debt
      baseMorningPriority += nurse.workloadDebt * 5;
      baseNightPriority += nurse.workloadDebt * 5;
      
      // Adjust for last shift preference (encourage alternation)
      if (nurse.lastShiftPreference === 'morning') {
        baseNightPriority += 15; // Favor night shifts after morning preference
        baseMorningPriority -= 5;
      } else if (nurse.lastShiftPreference === 'night') {
        baseMorningPriority += 15; // Favor morning shifts after night preference
        baseNightPriority -= 5;
      }
      
      // Monthly rotation bonus (ensure everyone gets different patterns)
      const rotationBonus = (nurse.monthlyRotation % 4) * 2;
      if (nurse.monthlyRotation % 2 === 0) {
        baseMorningPriority += rotationBonus;
      } else {
        baseNightPriority += rotationBonus;
      }
      
      nurse.morningPriority = baseMorningPriority;
      nurse.nightPriority = baseNightPriority;
    });
  };

  // Enhanced assignment functions with balance consideration
  const getAvailableForMorning = () => {
    return nurseStates
      .filter(nurse => nurse.currentCycle === 'available')
      .sort((a, b) => {
        // Primary sort: Morning priority
        if (b.morningPriority !== a.morningPriority) {
          return b.morningPriority - a.morningPriority;
        }
        // Secondary sort: Total work deficit
        const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
        const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
        if (bWorkDeficit !== aWorkDeficit) {
          return bWorkDeficit - aWorkDeficit;
        }
        // Tertiary sort: Historical balance
        return a.historicalTotalDays - b.historicalTotalDays;
      });
  };

  const getAvailableForNight = () => {
    return nurseStates
      .filter(nurse => nurse.currentCycle === 'available')
      .sort((a, b) => {
        // Primary sort: Night priority
        if (b.nightPriority !== a.nightPriority) {
          return b.nightPriority - a.nightPriority;
        }
        // Secondary sort: Total work deficit
        const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
        const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
        if (bWorkDeficit !== aWorkDeficit) {
          return bWorkDeficit - aWorkDeficit;
        }
        // Tertiary sort: Historical balance
        return a.historicalTotalDays - b.historicalTotalDays;
      });
  };

  // Enhanced emergency assignment with balance consideration
  const forceAssignmentFromOffDuty = (shiftType, needed) => {
    const offDutyNurses = nurseStates
      .filter(n => n.currentCycle === 'off-duty')
      .sort((a, b) => {
        // Primary: Days remaining in off-duty (fewer = higher priority)
        if (a.offDutyDays !== b.offDutyDays) {
          return a.offDutyDays - b.offDutyDays;
        }
        // Secondary: Work priority for this shift type
        const aPriority = shiftType === 'morning' ? a.morningPriority : a.nightPriority;
        const bPriority = shiftType === 'morning' ? b.morningPriority : b.nightPriority;
        if (bPriority !== aPriority) {
          return bPriority - aPriority;
        }
        // Tertiary: Total work deficit
        const aWorkDeficit = a.targetTotalWorkDays - a.totalWorkDays;
        const bWorkDeficit = b.targetTotalWorkDays - b.totalWorkDays;
        return bWorkDeficit - aWorkDeficit;
      });
    
    const assigned = [];
    for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
      const nurse = offDutyNurses[i];
      console.warn(`EMERGENCY BALANCED ASSIGNMENT: ${nurse.name} (debt: ${nurse.workloadDebt}, bias: ${nurse.historicalMorningBias}) forced from off-duty to ${shiftType} shift`);
      nurse.currentCycle = shiftType;
      nurse.cycleDay = 1;
      nurse.offDutyDays = 0;
      nurse.remainingOffDutyDays = 0;
      assigned.push(nurse);
    }
    return assigned;
  };

  // Generate roster for each day with enhanced balance tracking
  for (let day = 1; day <= daysInMonth; day++) {
    newRoster[day] = {
      morning: [],
      night: [],
      offDuty: []
    };

    // Update priorities based on current work distribution and balance
    updatePriorities();

    // Process state transitions
    nurseStates.forEach(nurse => {
      if (nurse.currentCycle === 'morning') {
        if (nurse.cycleDay >= rosterConfig.morningShiftDays) {
          nurse.currentCycle = 'off-duty';
          nurse.offDutyDays = rosterConfig.offDutyAfterMorning;
          nurse.remainingOffDutyDays = rosterConfig.offDutyAfterMorning;
          nurse.cycleDay = 0;
          nurse.lastShiftType = 'morning';
          nurse.lastShiftPreference = 'morning'; // Track preference for alternation
          nurse.remainingCycleDays = 0;
        } else {
          nurse.cycleDay++;
          nurse.remainingCycleDays = Math.max(0, rosterConfig.morningShiftDays - nurse.cycleDay);
        }
      } else if (nurse.currentCycle === 'night') {
        if (nurse.cycleDay >= rosterConfig.nightShiftDays) {
          nurse.currentCycle = 'off-duty';
          nurse.offDutyDays = rosterConfig.offDutyAfterNight;
          nurse.remainingOffDutyDays = rosterConfig.offDutyAfterNight;
          nurse.cycleDay = 0;
          nurse.lastShiftType = 'night';
          nurse.lastShiftPreference = 'night'; // Track preference for alternation
          nurse.remainingCycleDays = 0;
        } else {
          nurse.cycleDay++;
          nurse.remainingCycleDays = Math.max(0, rosterConfig.nightShiftDays - nurse.cycleDay);
        }
      } else if (nurse.currentCycle === 'off-duty') {
        if (nurse.offDutyDays > 1) {
          nurse.offDutyDays--;
          nurse.remainingOffDutyDays = nurse.offDutyDays;
        } else {
          nurse.currentCycle = 'available';
          nurse.offDutyDays = 0;
          nurse.remainingOffDutyDays = 0;
        }
      }
    });

    // Assign morning shift with balance consideration
    const currentMorning = nurseStates.filter(n => n.currentCycle === 'morning');
    const morningGap = rosterConfig.morningShiftSize - currentMorning.length;
    
    if (morningGap > 0) {
      const availableForMorning = getAvailableForMorning();
      
      let assigned = 0;
      for (let i = 0; i < Math.min(morningGap, availableForMorning.length); i++) {
        const nurse = availableForMorning[i];
        nurse.currentCycle = 'morning';
        nurse.cycleDay = 1;
        nurse.remainingCycleDays = rosterConfig.morningShiftDays - 1;
        nurse.lastShiftPreference = 'morning';
        assigned++;
      }
      
      const stillNeeded = morningGap - assigned;
      if (stillNeeded > 0) {
        forceAssignmentFromOffDuty('morning', stillNeeded);
      }
    }

    // Assign night shift with balance consideration
    const currentNight = nurseStates.filter(n => n.currentCycle === 'night');
    const nightGap = rosterConfig.nightShiftSize - currentNight.length;
    
    if (nightGap > 0) {
      const availableForNight = getAvailableForNight();
      
      let assigned = 0;
      for (let i = 0; i < Math.min(nightGap, availableForNight.length); i++) {
        const nurse = availableForNight[i];
        nurse.currentCycle = 'night';
        nurse.cycleDay = 1;
        nurse.remainingCycleDays = rosterConfig.nightShiftDays - 1;
        nurse.lastShiftPreference = 'night';
        assigned++;
      }
      
      const stillNeeded = nightGap - assigned;
      if (stillNeeded > 0) {
        forceAssignmentFromOffDuty('night', stillNeeded);
      }
    }

    // Record assignments and update counters
    const finalMorning = nurseStates.filter(n => n.currentCycle === 'morning');
    const finalNight = nurseStates.filter(n => n.currentCycle === 'night');
    const finalOffDuty = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');

    finalMorning.forEach(nurse => {
      newRoster[day].morning.push({
        id: nurse.id,
        name: nurse.name,
        qualification: nurse.qualification,
        experience: nurse.experience
      });
      nurse.totalMorningDays++;
      nurse.totalWorkDays++;
    });

    finalNight.forEach(nurse => {
      newRoster[day].night.push({
        id: nurse.id,
        name: nurse.name,
        qualification: nurse.qualification,
        experience: nurse.experience
      });
      nurse.totalNightDays++;
      nurse.totalWorkDays++;
    });

    finalOffDuty.forEach(nurse => {
      const statusText = nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty';
      const daysRemaining = nurse.currentCycle === 'off-duty' ? nurse.offDutyDays : 0;
      
      newRoster[day].offDuty.push({
        id: nurse.id,
        name: nurse.name,
        qualification: nurse.qualification,
        experience: nurse.experience,
        daysRemaining: daysRemaining,
        status: statusText,
        cycleInfo: nurse.currentCycle === 'off-duty' ? 
          `Off-duty (${daysRemaining} days remaining)` : 
          'Available for assignment'
      });
      nurse.totalOffDutyDays++;
    });
  }

  // Enhanced workload summary with balance analysis
  const workloadSummary = nurseStates.map(nurse => {
    const morningDifference = nurse.totalMorningDays - nurse.targetMorningDays;
    const nightDifference = nurse.totalNightDays - nurse.targetNightDays;
    
    // Calculate balance score (lower = better balance)
    const balanceScore = Math.abs(morningDifference) + Math.abs(nightDifference);
    
    // Determine if nurse is balanced this month
    const isBalanced = balanceScore <= 2;
    
    // Calculate cumulative balance including history
    const cumulativeMorning = nurse.totalMorningDays + nurse.historicalMorningDays;
    const cumulativeNight = nurse.totalNightDays + nurse.historicalNightDays;
    const cumulativeBalance = Math.abs(cumulativeMorning - cumulativeNight);
    
    return {
      name: nurse.name,
      morning: nurse.totalMorningDays,
      night: nurse.totalNightDays,
      offDuty: nurse.totalOffDutyDays,
      morningTarget: nurse.targetMorningDays,
      nightTarget: nurse.targetNightDays,
      morningDiff: morningDifference,
      nightDiff: nightDifference,
      balance: isBalanced ? 'Balanced' : 'Needs Adjustment',
      balanceScore: balanceScore,
      
      // Historical context
      historicalMorning: nurse.historicalMorningDays,
      historicalNight: nurse.historicalNightDays,
      cumulativeMorning: cumulativeMorning,
      cumulativeNight: cumulativeNight,
      cumulativeBalance: cumulativeBalance,
      
      // End state for next month
      endState: {
        currentCycle: nurse.currentCycle,
        cycleDay: nurse.cycleDay,
        offDutyDays: nurse.offDutyDays,
        remainingCycleDays: nurse.remainingCycleDays,
        remainingOffDutyDays: nurse.remainingOffDutyDays,
        lastShiftPreference: nurse.lastShiftPreference,
        monthlyRotation: nurse.monthlyRotation + 1
      }
    };
  });

  // Update nurse data with enhanced balance tracking
  const updatedNurses = activeNurses.map(nurse => {
    const nurseState = nurseStates.find(ns => ns.id === nurse.id);
    if (nurseState) {
      let finalShiftType = nurseState.lastShiftType;
      
      if (nurseState.currentCycle === 'morning') {
        finalShiftType = 'morning';
      } else if (nurseState.currentCycle === 'night') {
        finalShiftType = 'night';
      } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
        finalShiftType = nurseState.lastShiftType;
      } else {
        finalShiftType = null;
      }
      
      return { 
        ...nurse, 
        lastShiftType: finalShiftType,
        // Enhanced cycle continuity tracking
        lastShiftCycleDay: nurseState.currentCycle === 'morning' || nurseState.currentCycle === 'night' ? 
          nurseState.cycleDay : 0,
        lastOffDutyRemaining: nurseState.currentCycle === 'off-duty' ? 
          nurseState.offDutyDays : 0,
        lastCycleState: nurseState.currentCycle,
        
        // Enhanced balance tracking
        lastMonthMorning: nurseState.totalMorningDays,
        lastMonthNight: nurseState.totalNightDays,
        lastShiftPreference: nurseState.lastShiftPreference,
        monthlyRotation: (nurse.monthlyRotation || 0) + 1,
        
        // Cumulative balance tracking
        totalCumulativeMorning: nurseState.totalMorningDays + nurseState.historicalMorningDays,
        totalCumulativeNight: nurseState.totalNightDays + nurseState.historicalNightDays,
        
        // Balance metadata
        balanceMetadata: {
          thisMonthBalance: Math.abs(nurseState.totalMorningDays - nurseState.totalNightDays),
          cumulativeBalance: Math.abs((nurseState.totalMorningDays + nurseState.historicalMorningDays) - 
                                     (nurseState.totalNightDays + nurseState.historicalNightDays)),
          workloadDebt: Math.max(0, nurseState.targetTotalWorkDays - nurseState.totalWorkDays),
          balanceScore: Math.abs(nurseState.totalMorningDays - nurseState.targetMorningDays) + 
                       Math.abs(nurseState.totalNightDays - nurseState.targetNightDays)
        }
      };
    }
    return nurse;
  });
  
  // Enhanced validation and reporting
  let hasEmptyShifts = false;
  let totalEmptyShifts = 0;
  let continuityIssues = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const morningShort = rosterConfig.morningShiftSize - newRoster[day].morning.length;
    const nightShort = rosterConfig.nightShiftSize - newRoster[day].night.length;
    
    if (morningShort > 0 || nightShort > 0) {
      hasEmptyShifts = true;
      totalEmptyShifts += morningShort + nightShort;
      continuityIssues.push(`Day ${day}: Morning ${newRoster[day].morning.length}/${rosterConfig.morningShiftSize} (${morningShort} short), Night ${newRoster[day].night.length}/${rosterConfig.nightShiftSize} (${nightShort} short)`);
    }
  }
  
  // Balance analysis
  const balancedNurses = workloadSummary.filter(n => n.balance === 'Balanced');
  const imbalancedNurses = workloadSummary.filter(n => n.balance === 'Needs Adjustment');
  const perfectCumulativeBalance = workloadSummary.filter(n => n.cumulativeBalance <= 1);
  const nursesInTransition = workloadSummary.filter(n => 
    n.endState.currentCycle !== 'available' && 
    (n.endState.remainingCycleDays > 0 || n.endState.remainingOffDutyDays > 0)
  );
  
  console.log('Enhanced Balance Analysis:', {
    balancedThisMonth: balancedNurses.length,
    imbalancedThisMonth: imbalancedNurses.length,
    perfectCumulativeBalance: perfectCumulativeBalance.length,
    avgBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length
  });

  // Enhanced summary message
  const balanceReport = `📊 BALANCE ANALYSIS:
This Month: ${balancedNurses.length}/${workloadSummary.length} nurses balanced
Cumulative: ${perfectCumulativeBalance.length}/${workloadSummary.length} nurses with perfect overall balance
Average balance score: ${(workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length).toFixed(1)}

📋 WORKLOAD DISTRIBUTION:
${workloadSummary.sort((a, b) => a.balanceScore - b.balanceScore).map(n => 
  `${n.name}: ${n.morning}M/${n.night}N/${n.offDuty}Off (targets: ${n.morningTarget}M/${n.nightTarget}N) | Cumulative: ${n.cumulativeMorning}M/${n.cumulativeNight}N | Balance: ${n.cumulativeBalance <= 1 ? '✅' : '⚖️'}`
).join('\n')}`;

  const summaryMessage = hasEmptyShifts 
    ? `⚠️ ROSTER ISSUE: ${totalEmptyShifts} unfilled shift slots!\n\n${continuityIssues.join('\n')}\n\n${balanceReport}`
    : `✅ BALANCED ROSTER GENERATED with enhanced alternation!\n\n${balanceReport}${nursesInTransition.length > 0 ? 
        `\n\n🔄 Nurses continuing cycles into next month:\n${nursesInTransition.map(n => 
          `${n.name}: ${n.endState.currentCycle}${n.endState.remainingCycleDays > 0 ? ` (${n.endState.remainingCycleDays} days left)` : n.endState.remainingOffDutyDays > 0 ? ` (${n.endState.remainingOffDutyDays} off-duty days left)` : ''}`
        ).join('\n')}` : ''
      }`;

  return {
    success: true,
    roster: newRoster,
    updatedNurses,
    message: summaryMessage,
    workloadSummary,
    continuityInfo: {
      nursesInTransition: nursesInTransition.length,
      hasEmptyShifts,
      totalEmptyShifts,
      continuityIssues: hasEmptyShifts ? continuityIssues : []
    },
    balanceInfo: {
      balancedThisMonth: balancedNurses.length,
      imbalancedThisMonth: imbalancedNurses.length,
      perfectCumulativeBalance: perfectCumulativeBalance.length,
      averageBalanceScore: workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length,
      workloadDetails: workloadSummary
    }
  };
};