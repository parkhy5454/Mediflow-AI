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

import { shiftLabel } from '../constants/shiftTypes';

// [수정] 2교대(주간/야간) 전용이던 로직을 4교대(D/E/N/M)에 대해 일반화했다.
// 교대 종류가 몇 개든(설정에 있는 만큼) 동일한 로직으로 처리된다.
export const generateRoster = (activeNurses, daysInMonth, rosterConfig) => {
  const shiftTypes = Object.keys(rosterConfig.shifts);
  const totalShiftSlots = shiftTypes.reduce((sum, s) => sum + rosterConfig.shifts[s].size, 0);

  if (activeNurses.length < totalShiftSlots) {
    return {
      success: false,
      message: `근무표를 생성하려면 최소 ${totalShiftSlots}명의 근무 가능한 간호사가 필요합니다 (${shiftTypes.map(s => `${shiftLabel(s)} ${rosterConfig.shifts[s].size}명`).join(' + ')}). 현재 ${activeNurses.length}명입니다.`
    };
  }

  const newRoster = {};

  // 이번 달 전체 목표 근무일수 계산 (교대 종류에 상관없이 공정하게 분배)
  const totalShiftDays = daysInMonth * totalShiftSlots;
  const averageWorkDaysPerNurse = Math.floor(totalShiftDays / activeNurses.length);
  const extraWorkDays = totalShiftDays % activeNurses.length;

  // 각 교대가 전체에서 차지하는 비중 (개인별 목표를 교대별로 나눌 때 사용)
  const shiftProportion = {};
  shiftTypes.forEach(s => {
    shiftProportion[s] = rosterConfig.shifts[s].size / totalShiftSlots;
  });

  console.log('4교대 월간 균형 계산:', {
    전체근무일: totalShiftDays,
    활성간호사: activeNurses.length,
    '1인당기본목표': averageWorkDaysPerNurse,
    추가배정대상: extraWorkDays
  });

  const nurseStates = activeNurses.map((nurse, index) => {
    // 과거(누적) 교대별 근무일수. 없으면 전부 0으로 시작.
    const historical = { ...(nurse.historicalDaysByShift || {}) };
    shiftTypes.forEach(s => { if (typeof historical[s] !== 'number') historical[s] = 0; });
    const historicalTotalDays = shiftTypes.reduce((sum, s) => sum + historical[s], 0);

    const shouldGetExtraDay = index < extraWorkDays;
    const thisMonthTargetWorkDays = averageWorkDaysPerNurse + (shouldGetExtraDay ? 1 : 0);

    // 개인 목표를 교대 비중대로 배분
    const targetByShift = {};
    shiftTypes.forEach(s => {
      targetByShift[s] = Math.round(thisMonthTargetWorkDays * shiftProportion[s]);
    });

    const nurseState = {
      id: nurse.id,
      name: nurse.name,
      qualification: nurse.qualification,
      experience: nurse.experience,

      currentCycle: 'available', // 교대 코드(D/E/N/M) | 'off-duty' | 'available'
      cycleDay: 0,
      offDutyDays: 0,
      remainingCycleDays: 0,
      remainingOffDutyDays: 0,

      lastShiftType: nurse.lastShiftType || null,
      lastShiftPreference: nurse.lastShiftPreference || null,

      totalDaysByShift: Object.fromEntries(shiftTypes.map(s => [s, 0])),
      totalWorkDays: 0,
      totalOffDutyDays: 0,

      targetByShift,
      targetTotalWorkDays: thisMonthTargetWorkDays,

      priorityByShift: Object.fromEntries(shiftTypes.map(s => [s, 0])),

      historicalDaysByShift: historical,
      historicalTotalDays
    };

    // 이전 달에서 이어지는 근무/휴무 사이클 반영
    if (nurse.lastShiftType && shiftTypes.includes(nurse.lastShiftType) && nurse.lastShiftCycleDay && nurse.lastOffDutyRemaining !== undefined) {
      const cfg = rosterConfig.shifts[nurse.lastShiftType];
      if (nurse.lastOffDutyRemaining > 0) {
        nurseState.currentCycle = 'off-duty';
        nurseState.offDutyDays = nurse.lastOffDutyRemaining;
        nurseState.remainingOffDutyDays = nurse.lastOffDutyRemaining;
      } else if (nurse.lastShiftCycleDay < cfg.shiftDays) {
        nurseState.currentCycle = nurse.lastShiftType;
        nurseState.cycleDay = nurse.lastShiftCycleDay;
        nurseState.remainingCycleDays = cfg.shiftDays - nurse.lastShiftCycleDay;
      } else {
        nurseState.currentCycle = 'off-duty';
        nurseState.offDutyDays = cfg.offDutyAfter;
        nurseState.remainingOffDutyDays = cfg.offDutyAfter;
      }
    } else if (nurse.lastShiftType && shiftTypes.includes(nurse.lastShiftType)) {
      const cfg = rosterConfig.shifts[nurse.lastShiftType];
      nurseState.currentCycle = 'off-duty';
      nurseState.offDutyDays = cfg.offDutyAfter;
      nurseState.remainingOffDutyDays = cfg.offDutyAfter;
    } else {
      nurseState.currentCycle = 'available';
    }

    return nurseState;
  });

  // 우선순위 재계산: 이번 달 부족분 + 과거(누적) 편중 보정 + 직전 근무와 다른 교대로 유도(로테이션)
  const updatePriorities = () => {
    nurseStates.forEach(nurse => {
      shiftTypes.forEach(s => {
        const deficit = nurse.targetByShift[s] - nurse.totalDaysByShift[s];
        let priority = deficit * 10;

        const avgHistoricalPerShift = nurse.historicalTotalDays / shiftTypes.length;
        const historicalBias = nurse.historicalDaysByShift[s] - avgHistoricalPerShift;
        if (historicalBias > 1) {
          priority -= 15; // 이 교대를 과거에 많이 했으면 우선순위 낮춤
        } else if (historicalBias < -1) {
          priority += 15; // 적게 했으면 우선순위 높임
        }

        if (nurse.lastShiftPreference === s) {
          priority -= 15; // 바로 직전과 같은 교대는 비선호 (교대 다양성 유도)
        } else if (nurse.lastShiftPreference) {
          priority += 5;
        }

        nurse.priorityByShift[s] = priority;
      });
    });
  };

  const getAvailableForShift = (shiftType) => {
    return nurseStates
      .filter(n => n.currentCycle === 'available')
      .sort((a, b) => {
        if (b.priorityByShift[shiftType] !== a.priorityByShift[shiftType]) {
          return b.priorityByShift[shiftType] - a.priorityByShift[shiftType];
        }
        const aDeficit = a.targetTotalWorkDays - a.totalWorkDays;
        const bDeficit = b.targetTotalWorkDays - b.totalWorkDays;
        if (bDeficit !== aDeficit) return bDeficit - aDeficit;
        return a.historicalTotalDays - b.historicalTotalDays;
      });
  };

  // 그래도 자리가 안 채워지면 휴무 중인 사람을 비상으로 앞당겨 배정.
  // [수정] 예전에는 "휴무 며칠 남았는지"만 보고 골랐는데, 그러면 한 번 앞당겨진 사람이
  // 휴무가 짧게 남은 상태가 되어 다음 비상 배정에서도 또 뽑히는 눈덩이 효과가 생겼다
  // (실제로 특정 2명에게 미들 근무가 몰리는 문제가 발생함).
  // → 이제는 "이번 달 목표 근무일 대비 얼마나 부족한지"를 최우선으로 보고,
  //   이미 많이 일한 사람은 비상 배정에서 뒤로 밀려나도록 한다.
  const forceAssignmentFromOffDuty = (shiftType, needed) => {
    const offDutyNurses = nurseStates
      .filter(n => n.currentCycle === 'off-duty')
      .sort((a, b) => {
        // 공정성 최우선: 목표 대비 아직 근무가 부족한 사람을 먼저 앞당긴다
        const aDeficit = a.targetTotalWorkDays - a.totalWorkDays;
        const bDeficit = b.targetTotalWorkDays - b.totalWorkDays;
        if (bDeficit !== aDeficit) return bDeficit - aDeficit;
        if (a.offDutyDays !== b.offDutyDays) return a.offDutyDays - b.offDutyDays;
        return (b.priorityByShift[shiftType] || 0) - (a.priorityByShift[shiftType] || 0);
      });

    const assigned = [];
    for (let i = 0; i < Math.min(needed, offDutyNurses.length); i++) {
      const nurse = offDutyNurses[i];
      console.warn(`비상 배정: ${nurse.name}을(를) 휴무에서 앞당겨 ${shiftLabel(shiftType)} 근무로 배정`);
      nurse.currentCycle = shiftType;
      nurse.cycleDay = 1;
      nurse.offDutyDays = 0;
      nurse.remainingOffDutyDays = 0;
      assigned.push(nurse);
    }
    return assigned;
  };

  const continuityIssues = [];
  let hasEmptyShifts = false;
  let totalEmptyShifts = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    newRoster[day] = { offDuty: [] };
    shiftTypes.forEach(s => { newRoster[day][s] = []; });

    updatePriorities();

    // 상태 전이: 근무/휴무 하루 진행, 사이클 끝나면 자동 전환
    nurseStates.forEach(nurse => {
      if (shiftTypes.includes(nurse.currentCycle)) {
        const cfg = rosterConfig.shifts[nurse.currentCycle];
        if (nurse.cycleDay >= cfg.shiftDays) {
          const finishedShift = nurse.currentCycle;
          nurse.currentCycle = 'off-duty';
          nurse.offDutyDays = cfg.offDutyAfter;
          nurse.remainingOffDutyDays = cfg.offDutyAfter;
          nurse.cycleDay = 0;
          nurse.lastShiftType = finishedShift;
          nurse.lastShiftPreference = finishedShift;
          nurse.remainingCycleDays = 0;
        } else {
          nurse.cycleDay++;
          nurse.remainingCycleDays = Math.max(0, cfg.shiftDays - nurse.cycleDay);
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

    // 교대별로 부족한 자리 채우기
    shiftTypes.forEach(shiftType => {
      const cfg = rosterConfig.shifts[shiftType];
      const current = nurseStates.filter(n => n.currentCycle === shiftType);
      const gap = cfg.size - current.length;

      if (gap > 0) {
        const available = getAvailableForShift(shiftType);
        let assignedCount = 0;
        for (let i = 0; i < Math.min(gap, available.length); i++) {
          const nurse = available[i];
          nurse.currentCycle = shiftType;
          nurse.cycleDay = 1;
          nurse.remainingCycleDays = cfg.shiftDays - 1;
          nurse.lastShiftPreference = shiftType;
          assignedCount++;
        }
        const stillNeeded = gap - assignedCount;
        if (stillNeeded > 0) {
          forceAssignmentFromOffDuty(shiftType, stillNeeded);
        }
      }
    });

    // 오늘 배정 결과 기록 + 부족 인원 체크
    shiftTypes.forEach(shiftType => {
      const cfg = rosterConfig.shifts[shiftType];
      const assignedNurses = nurseStates.filter(n => n.currentCycle === shiftType);
      const shortfall = cfg.size - assignedNurses.length;

      if (shortfall > 0) {
        hasEmptyShifts = true;
        totalEmptyShifts += shortfall;
        continuityIssues.push(`${day}일차: ${shiftLabel(shiftType)} ${assignedNurses.length}/${cfg.size}명 (${shortfall}명 부족)`);
      }

      assignedNurses.forEach(nurse => {
        newRoster[day][shiftType].push({
          id: nurse.id,
          name: nurse.name,
          qualification: nurse.qualification,
          experience: nurse.experience
        });
        nurse.totalDaysByShift[shiftType]++;
        nurse.totalWorkDays++;
      });
    });

    const offDutyOrAvailable = nurseStates.filter(n => n.currentCycle === 'off-duty' || n.currentCycle === 'available');
    offDutyOrAvailable.forEach(nurse => {
      const statusText = nurse.currentCycle === 'available' ? 'Available' : 'Off-Duty';
      const daysRemaining = nurse.currentCycle === 'off-duty' ? nurse.offDutyDays : 0;

      newRoster[day].offDuty.push({
        id: nurse.id,
        name: nurse.name,
        qualification: nurse.qualification,
        experience: nurse.experience,
        daysRemaining,
        status: statusText,
        cycleInfo: nurse.currentCycle === 'off-duty' ? `휴무 (${daysRemaining}일 남음)` : '배정 가능'
      });
      nurse.totalOffDutyDays++;
    });
  }

  // 다음 달로 이어질 사이클 연속성 정보 계산
  const nursesInTransition = nurseStates.filter(n =>
    n.currentCycle !== 'available' && (n.remainingCycleDays > 0 || n.remainingOffDutyDays > 0)
  );

  // 다음 달 계산을 위해 간호사별 최신 상태를 업데이트
  const updatedNurses = activeNurses.map(originalNurse => {
    const nurseState = nurseStates.find(n => n.id === originalNurse.id);
    const historicalDaysByShift = {};
    shiftTypes.forEach(s => {
      historicalDaysByShift[s] = (nurseState.historicalDaysByShift[s] || 0) + nurseState.totalDaysByShift[s];
    });

    let lastShiftType = nurseState.lastShiftType;
    let lastShiftCycleDay = 0;
    let lastOffDutyRemaining = 0;

    if (shiftTypes.includes(nurseState.currentCycle)) {
      lastShiftType = nurseState.currentCycle;
      lastShiftCycleDay = nurseState.cycleDay;
    } else if (nurseState.currentCycle === 'off-duty' && nurseState.offDutyDays > 0) {
      lastOffDutyRemaining = nurseState.offDutyDays;
    }

    return {
      ...originalNurse,
      lastShiftType,
      lastShiftCycleDay,
      lastOffDutyRemaining,
      lastShiftPreference: nurseState.lastShiftPreference,
      historicalDaysByShift,
      // 과거 방식과의 호환을 위해 남겨두되, 더 이상 로직에서 사용하지 않음
      lastMonthMorning: undefined,
      lastMonthNight: undefined
    };
  });

  // 균형 분석 리포트 (교대 종류 수에 맞게 자동으로 구성)
  const workloadSummary = nurseStates
    .map(n => {
      const cumulativeByShift = {};
      shiftTypes.forEach(s => {
        cumulativeByShift[s] = (n.historicalDaysByShift[s] || 0) + n.totalDaysByShift[s];
      });
      // 균형 점수: 이번 달 각 교대의 목표 대비 편차 절대값 합
      const balanceScore = shiftTypes.reduce((sum, s) => sum + Math.abs(n.targetByShift[s] - n.totalDaysByShift[s]), 0);
      // 누적 균형: 누적 근무일이 교대별로 얼마나 고르게 퍼져있는지 (표준편차 느낌의 단순 버전)
      const cumulativeValues = shiftTypes.map(s => cumulativeByShift[s]);
      const cumulativeAvg = cumulativeValues.reduce((a, b) => a + b, 0) / shiftTypes.length;
      const cumulativeBalance = Math.max(...cumulativeValues.map(v => Math.abs(v - cumulativeAvg)));

      return {
        name: n.name,
        qualification: n.qualification,
        totalWorkDays: n.totalWorkDays,
        offDutyDays: n.totalOffDutyDays,
        daysByShift: n.totalDaysByShift,
        targetByShift: n.targetByShift,
        cumulativeByShift,
        balanceScore,
        cumulativeBalance,
        endState: {
          currentCycle: n.currentCycle,
          remainingCycleDays: n.remainingCycleDays,
          remainingOffDutyDays: n.remainingOffDutyDays
        }
      };
    })
    .sort((a, b) => a.balanceScore - b.balanceScore);

  const balancedNurses = workloadSummary.filter(n => n.balanceScore <= 1);
  const perfectCumulativeBalance = workloadSummary.filter(n => n.cumulativeBalance <= 1);
  const avgBalanceScore = workloadSummary.reduce((sum, n) => sum + n.balanceScore, 0) / workloadSummary.length;

  const cycleLabel = (cycle) => shiftTypes.includes(cycle) ? `${shiftLabel(cycle)} 근무` : cycle === 'off-duty' ? '휴무' : '근무 가능';

  const shiftBreakdownLine = (n) => shiftTypes.map(s => `${shiftLabel(s)} ${n.daysByShift[s]}`).join(' / ');

  const balanceReport = `📊 균형 분석:
이번 달: 전체 ${workloadSummary.length}명 중 ${balancedNurses.length}명 균형 달성
누적: 전체 ${workloadSummary.length}명 중 ${perfectCumulativeBalance.length}명 완벽한 전체 균형
평균 균형 점수: ${avgBalanceScore.toFixed(1)}

📋 업무량 분포:
${workloadSummary.map(n =>
  `${n.name}: ${shiftBreakdownLine(n)} / 비번 (OFF) ${n.offDutyDays} | 균형: ${n.balanceScore <= 1 ? '✅' : '⚖️'}`
).join('\n')}`;

  const summaryMessage = hasEmptyShifts
    ? `⚠️ 근무표 문제: 채워지지 않은 근무 ${totalEmptyShifts}건!\n\n${continuityIssues.join('\n')}\n\n${balanceReport}`
    : `✅ 균형 잡힌 근무표가 생성되었습니다!\n\n${balanceReport}${nursesInTransition.length > 0 ?
        `\n\n🔄 다음 달로 근무 주기가 이어지는 간호사:\n${nursesInTransition.map(n =>
          `${n.name}: ${cycleLabel(n.currentCycle)}${n.remainingCycleDays > 0 ? ` (${n.remainingCycleDays}일 남음)` : n.remainingOffDutyDays > 0 ? ` (휴무 ${n.remainingOffDutyDays}일 남음)` : ''}`
        ).join('\n')}` : ''
      }`;

  return {
    success: true,
    roster: newRoster,
    updatedNurses,
    message: summaryMessage,
    workloadSummary,
    shiftTypes,
    continuityInfo: {
      nursesInTransition: nursesInTransition.length,
      hasEmptyShifts,
      totalEmptyShifts
    }
  };
};

// ------------------------------------------------------------------
// [추가] 승인된 휴가를 근무표에 반영 — 이미 생성된 근무표에서, 휴가 기간과 겹치는 날짜에
// 배정되어 있던 휴가자를 빼고 그날 쉬고 있던(offDuty) 다른 간호사로 대체한다.
// generateRoster()가 끝난 뒤 결과물(roster, updatedNurses)에 대해 후처리로 적용하는 방식이라,
// 기존의 복잡한 근무 주기 배정 로직 자체는 건드리지 않는다.
//
// approvedLeaves: [{ nurseId, startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }, ...]
// ------------------------------------------------------------------
export const applyApprovedLeaveToRoster = ({
  roster, updatedNurses, activeNurses, approvedLeaves, daysInMonth, selectedYear, selectedMonth, shiftTypes
}) => {
  const notes = [];
  if (!approvedLeaves || approvedLeaves.length === 0) {
    return { roster, updatedNurses, notes };
  }

  const nurseById = new Map(activeNurses.map(n => [n.id, n]));
  const histByNurseId = new Map(updatedNurses.map(n => [n.id, { ...(n.historicalDaysByShift || {}) }]));

  const dateForDay = (day) => {
    const d = new Date(selectedYear, selectedMonth, day);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  approvedLeaves.forEach(leave => {
    if (!leave.nurseId) return;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dateForDay(day);
      if (dateStr < leave.startDate || dateStr > leave.endDate) continue;

      const dayData = roster[day];
      if (!dayData) continue;
      if (!Array.isArray(dayData.offDuty)) dayData.offDuty = [];

      // 이미 그날 휴무였으면(원래도 안 일하던 날) 별도 처리 불필요 — offDuty 항목에 휴가 표시만 추가
      const alreadyOffIdx = dayData.offDuty.findIndex(n => n.id === leave.nurseId);
      if (alreadyOffIdx !== -1) {
        dayData.offDuty[alreadyOffIdx] = {
          ...dayData.offDuty[alreadyOffIdx],
          status: 'Leave',
          cycleInfo: '휴가'
        };
      }

      shiftTypes.forEach(shiftType => {
        const arr = dayData[shiftType];
        if (!Array.isArray(arr)) return;
        const idx = arr.findIndex(n => n.id === leave.nurseId);
        if (idx === -1) return; // 이 교대엔 배정 안 되어 있었음

        const leaveNurse = arr[idx];

        // 대체자 후보: 그날 이미 쉬고 있는 사람 중, 이 교대 누적이 가장 적은 사람
        const candidates = dayData.offDuty.filter(n => n.id !== leave.nurseId);
        if (candidates.length === 0) {
          notes.push(`${dateStr} ${shiftLabel(shiftType)}: ${leaveNurse.name} 휴가지만 대체 인력을 찾지 못해 인원이 부족합니다`);
          return;
        }
        candidates.sort((a, b) => {
          const ah = (histByNurseId.get(a.id) || {})[shiftType] || 0;
          const bh = (histByNurseId.get(b.id) || {})[shiftType] || 0;
          return ah - bh;
        });
        const replacement = candidates[0];
        const replacementFull = nurseById.get(replacement.id) || replacement;

        // 근무 배열에서 교체
        arr.splice(idx, 1, {
          id: replacementFull.id,
          name: replacementFull.name,
          qualification: replacementFull.qualification,
          experience: replacementFull.experience
        });

        // offDuty에서 대체자 빼고, 휴가자를 넣음
        const offIdx = dayData.offDuty.findIndex(n => n.id === replacement.id);
        if (offIdx !== -1) dayData.offDuty.splice(offIdx, 1);
        dayData.offDuty.push({
          id: leaveNurse.id,
          name: leaveNurse.name,
          qualification: leaveNurse.qualification,
          experience: leaveNurse.experience,
          daysRemaining: 0,
          status: 'Leave',
          cycleInfo: '휴가'
        });

        // 누적 통계 보정 (대시보드 정확도 유지)
        const leaveHist = histByNurseId.get(leaveNurse.id) || {};
        leaveHist[shiftType] = Math.max(0, (leaveHist[shiftType] || 0) - 1);
        histByNurseId.set(leaveNurse.id, leaveHist);
        const replHist = histByNurseId.get(replacementFull.id) || {};
        replHist[shiftType] = (replHist[shiftType] || 0) + 1;
        histByNurseId.set(replacementFull.id, replHist);

        notes.push(`${dateStr} ${shiftLabel(shiftType)}: ${leaveNurse.name}(휴가) → ${replacementFull.name} 대체`);
      });
    }
  });

  const finalUpdatedNurses = updatedNurses.map(n => ({
    ...n,
    historicalDaysByShift: histByNurseId.get(n.id) || n.historicalDaysByShift
  }));

  return { roster, updatedNurses: finalUpdatedNurses, notes };
};
