const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

export function toLocalDate(value: string): Date | null {
  const match = DATE_TIME_PATTERN.exec(String(value || ''));
  if (!match) return null;

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
}

export function formatTime(value: string): string {
  const date = toLocalDate(value);
  if (!date) return '--:--';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDay(value: string): string {
  const date = toLocalDate(value);
  if (!date) return 'Unscheduled';

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  }).format(date);
}
