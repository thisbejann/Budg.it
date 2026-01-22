import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  addMonths,
  isToday,
  isYesterday,
  isSameYear,
  differenceInDays,
} from 'date-fns';

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}

/**
 * Format a date string for display
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @param includeYear - Whether to include the year
 */
export function formatDate(dateStr: string, includeYear: boolean = false): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (includeYear || !isSameYear(date, new Date())) {
    return format(date, 'MMM d, yyyy');
  }

  return format(date, 'MMM d');
}

/**
 * Format a date for the calendar header
 */
export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy');
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return format(date, 'h:mm a');
}

/**
 * Format date and time together
 */
export function formatDateTime(dateStr: string, timeStr: string | null): string {
  const dateFormatted = formatDate(dateStr);
  if (!timeStr) return dateFormatted;
  return `${dateFormatted} at ${formatTime(timeStr)}`;
}

/**
 * Get the start of the current month in ISO format
 */
export function getMonthStart(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Get the end of the current month in ISO format
 */
export function getMonthEnd(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(endOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Get the start of the week (Monday) in ISO format
 */
export function getWeekStart(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/**
 * Get the end of the week (Sunday) in ISO format
 */
export function getWeekEnd(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/**
 * Get the previous month's start date
 */
export function getPreviousMonthStart(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(startOfMonth(subMonths(date, 1)), 'yyyy-MM-dd');
}

/**
 * Get the next month's start date
 */
export function getNextMonthStart(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(startOfMonth(addMonths(date, 1)), 'yyyy-MM-dd');
}

/**
 * Get month in YYYY-MM format
 */
export function getMonthKey(dateStr?: string): string {
  const date = dateStr ? parseISO(dateStr) : new Date();
  return format(date, 'yyyy-MM');
}

/**
 * Parse month key (YYYY-MM) to display format
 */
export function formatMonthKey(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMM yyyy');
}

/**
 * Get relative date description
 */
export function getRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr);
  const days = differenceInDays(new Date(), date);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Generate an array of dates for a month calendar
 */
export function getCalendarDates(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: string[] = [];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(format(new Date(year, month, day), 'yyyy-MM-dd'));
  }

  return dates;
}
