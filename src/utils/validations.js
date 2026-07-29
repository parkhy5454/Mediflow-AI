export const generateRoster = (nurses, lastDutyMap, monthDays = 30) => {
  const morning = [];
  const night = [];
  const off = [];
  const updatedDutyMap = { ...lastDutyMap };

  // Separate nurses based on last month's duty
  const offDutyFirst = nurses.filter(n => (lastDutyMap[n.id] || 'Off') === 'Off');
  const remaining = nurses.filter(n => (lastDutyMap[n.id] || 'Off') !== 'Off');
  const orderedNurses = [...offDutyFirst, ...remaining];

  // Assign shifts
  const totalNurses = orderedNurses.length;
  const perShift = Math.floor(totalNurses / 4); // 4 morning, 4 night if 16 nurses
  const doubleShift = perShift * 2;

  morning.push(...orderedNurses.slice(0, perShift));
  night.push(...orderedNurses.slice(perShift, doubleShift));
  off.push(...orderedNurses.slice(doubleShift));

  // Update duty state
  morning.forEach(n => updatedDutyMap[n.id] = 'Morning');
  night.forEach(n => updatedDutyMap[n.id] = 'Night');
  off.forEach(n => updatedDutyMap[n.id] = 'Off');

  const roster = Array.from({ length: monthDays }, (_, day) => ({
    day: day + 1,
    morning: morning.map(n => n.name),
    night: night.map(n => n.name),
    off: off.map(n => n.name)
  }));

  return { roster, updatedDutyMap };
};
