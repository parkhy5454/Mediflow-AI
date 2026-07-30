// src/utils/dateUtils.js
export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthName = (month) => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월',
                 '7월', '8월', '9월', '10월', '11월', '12월'];
  return months[month];
};

export const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

