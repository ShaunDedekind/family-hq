import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';
import type { FamilyEvent, CareSession } from '@/src/types/database';

export function formatTimeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a');
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'EEE d MMM');
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'EEE d MMM, h:mm a');
}

export function minutesBetween(start: string, end: string): number {
  return Math.max(0, differenceInMinutes(parseISO(end), parseISO(start)));
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function eventLabel(event: FamilyEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'feed': {
      const mode = p.mode as string | undefined;
      if (mode === 'breast_left') return 'Breastfeed (left)';
      if (mode === 'breast_right') return 'Breastfeed (right)';
      if (mode === 'bottle') return `Bottle ${p.amount_ml ?? ''}ml`.trim();
      return 'Feed';
    }
    case 'sleep':
      return `Sleep ${p.duration_minutes ? formatDurationMinutes(p.duration_minutes as number) : ''}`.trim();
    case 'nappy':
      return `Nappy (${p.nappy_type ?? 'changed'})`;
    case 'medication':
      return `${p.name ?? 'Medicine'}${p.dose ? ` — ${p.dose}` : ''}`;
    case 'measurement':
      return `Weight ${p.weight_kg ?? ''} kg`.trim();
    default:
      return event.type;
  }
}

export function openSessionLabel(session: CareSession): string {
  const elapsed = minutesBetween(session.started_at, new Date().toISOString());
  return `${session.type === 'sleep' ? 'Sleeping' : 'Feeding'} — ${formatDurationMinutes(elapsed)}`;
}

export function awakeMinutesSince(lastSleepEnd: string | null): number | null {
  if (!lastSleepEnd) return null;
  return minutesBetween(lastSleepEnd, new Date().toISOString());
}
