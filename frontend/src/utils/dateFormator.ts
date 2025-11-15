// utils/dateFormatter.ts
import { 
  format, 
  formatDistance, 
  isToday, 
  isYesterday,
  isThisYear 
} from 'date-fns';

export class DateFormatter {
  // For chat messages - shows time only for today, date for older
  static formatMessageTimestamp(date: Date | string): string {
    const messageDate = new Date(date)

    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a'); // 2:30 PM
    } else if (isYesterday(messageDate)) {
      return `Yesterday at ${format(messageDate, 'h:mm a')}`;
    } else if (isThisYear(messageDate)) {
      return format(messageDate, 'MMM d, h:mm a'); // Jan 15, 2:30 PM
    } else {
      return format(messageDate, 'MMM d, yyyy, h:mm a'); // Jan 15, 2024, 2:30 PM
    }
  }

  // Short time only (2:30 PM)
  static formatTime(date: Date | string): string {
    return format(new Date(date), 'h:mm a');
  }

  // 24-hour format (14:30)
  static formatTime24(date: Date | string): string {
    return format(new Date(date), 'HH:mm');
  }

  // Relative time (5 minutes ago)
  static formatRelativeTime(date: Date | string): string {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  }

  // For message headers (Today, Yesterday, January 15)
  static formatMessageGroup(date: Date | string): string {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return 'Today';
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else if (isThisYear(messageDate)) {
      return format(messageDate, 'MMMM d'); // January 15
    } else {
      return format(messageDate, 'MMMM d, yyyy'); // January 15, 2024
    }
  }

  // Full date with time
  static formatFullDateTime(date: Date | string): string {
    return format(new Date(date), 'PPpp'); // Jan 15, 2024 at 2:30 PM
  }
}