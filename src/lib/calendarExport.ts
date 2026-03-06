import { Subscription } from '../types';
import { format, parseISO } from 'date-fns';

export const generateICS = (subscriptions: Subscription[]): string => {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SubTrack//Subscription Calendar//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:订阅续费日历',
    'X-WR-TIMEZONE:Asia/Shanghai'
  ].join('\r\n');

  const footer = '\r\nEND:VCALENDAR';

  const events = subscriptions
    .filter(sub => sub.status === 'active' || sub.status === 'trial')
    .map(sub => {
      const nextDate = parseISO(sub.nextBillingDate);
      const stamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
      const start = format(nextDate, "yyyyMMdd");
      
      // Create a recurring rule based on cycle
      let rrule = '';
      switch (sub.cycle) {
        case 'monthly': rrule = 'RRULE:FREQ=MONTHLY'; break;
        case 'quarterly': rrule = 'RRULE:FREQ=MONTHLY;INTERVAL=3'; break;
        case 'semi-annually': rrule = 'RRULE:FREQ=MONTHLY;INTERVAL=6'; break;
        case 'yearly': rrule = 'RRULE:FREQ=YEARLY'; break;
      }

      return [
        'BEGIN:VEVENT',
        `UID:${sub.id}@subtrack.app`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${start}`,
        `SUMMARY:续费提醒: ${sub.name}`,
        `DESCRIPTION:订阅服务: ${sub.name}\\n金额: ${sub.currency} ${sub.price.toFixed(2)}\\n周期: ${sub.cycle}`,
        rrule,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:订阅续费提醒',
        'TRIGGER:-P1D', // Remind 1 day before
        'END:VALARM',
        'END:VEVENT'
      ].filter(Boolean).join('\r\n');
    })
    .join('\r\n');

  return `${header}\r\n${events}${footer}`;
};

export const downloadICS = (subscriptions: Subscription[]) => {
  const content = generateICS(subscriptions);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'subscriptions.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
