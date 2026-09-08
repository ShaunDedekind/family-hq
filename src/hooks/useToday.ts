import { useEffect, useState } from 'react';
import { useFamily } from '@/src/contexts/FamilyContext';
import type { FamilyEvent } from '@/src/types/database';
import { getLastViewedAt } from '@/src/lib/storage';

export function useSinceLastChecked(): FamilyEvent[] {
  const { events } = useFamily();
  const [lastViewed, setLastViewed] = useState<string | null>(null);

  useEffect(() => {
    getLastViewedAt().then(setLastViewed);
  }, [events]);

  if (!lastViewed) return events;
  return events.filter((e) => e.occurred_at > lastViewed);
}

export function useTodayStatus() {
  const { events, sessions, child, measurements } = useFamily();

  const childEvents = events.filter((e) => e.person_id === child?.id);

  const lastFeed = childEvents.find((e) => e.type === 'feed');
  const lastNappy = childEvents.find((e) => e.type === 'nappy');
  const lastMed = childEvents.find((e) => e.type === 'medication');

  const lastSleepEnd = childEvents.find((e) => e.type === 'sleep');
  const openSleep = sessions.find((s) => s.type === 'sleep' && s.person_id === child?.id);
  const openFeed = sessions.find((s) => s.type === 'feed' && s.person_id === child?.id);

  const childMeasurements = measurements.filter((m) => m.person_id === child?.id);
  const lastWeight = childMeasurements[0] ?? null;

  return {
    lastFeed,
    lastNappy,
    lastMed,
    lastSleepEnd,
    openSleep,
    openFeed,
    lastWeight,
  };
}
