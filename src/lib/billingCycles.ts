import { addMonths, endOfMonth, format, setDate, subDays } from 'date-fns';

export const safeDateForDay = (baseDate: Date, day: number) => {
  const lastDay = endOfMonth(baseDate).getDate();
  return setDate(baseDate, Math.min(Math.max(day, 1), lastDay));
};

export const getNextCycleStart = (startDate: Date, anchorDay: number) => {
  const sameMonthAnchor = safeDateForDay(startDate, anchorDay);
  return sameMonthAnchor >= startDate ? sameMonthAnchor : safeDateForDay(addMonths(startDate, 1), anchorDay);
};

export const getCyclePreview = (startDate: string, anchorDay: number) => {
  if (!startDate || !anchorDay) return null;
  const parsed = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const cycleStart = getNextCycleStart(parsed, anchorDay);
  const cycleEnd = subDays(safeDateForDay(addMonths(cycleStart, 1), anchorDay), 1);
  return {
    cycleStart,
    cycleEnd,
    label: `${format(cycleStart, 'd MMM yyyy')} → ${format(cycleEnd, 'd MMM yyyy')}`,
  };
};
