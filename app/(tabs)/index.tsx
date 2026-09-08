import { useCallback, useEffect } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useFamily } from '@/src/contexts/FamilyContext';
import { useSinceLastChecked, useTodayStatus } from '@/src/hooks/useToday';
import { setLastViewedAt } from '@/src/lib/storage';
import { eventLabel, formatTimeAgo, openSessionLabel, awakeMinutesSince } from '@/src/utils/dates';
import { colors, sharedStyles } from '@/src/theme';

export default function TodayScreen() {
  const router = useRouter();
  const { child, calendarEvents, tasks, refresh } = useFamily();
  const sinceLastChecked = useSinceLastChecked();
  const { lastFeed, lastNappy, lastMed, lastSleepEnd, openSleep, openFeed, lastWeight } =
    useTodayStatus();

  useEffect(() => {
    const mark = () => setLastViewedAt(new Date().toISOString());
    mark();
    const interval = setInterval(mark, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => refresh(), [refresh]);

  const awakeMins = lastSleepEnd && !openSleep
    ? awakeMinutesSince(lastSleepEnd.occurred_at)
    : openSleep
      ? null
      : null;

  const openTasks = tasks.filter((t) => !t.done).slice(0, 5);

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.content}>
        <Text style={sharedStyles.title}>Today</Text>
        <Text style={sharedStyles.subtitle}>{format(new Date(), 'EEEE d MMMM')}</Text>

        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardTitle}>{child?.display_name ?? 'Baby'}</Text>
          <StatusRow label="Last feed" value={lastFeed ? formatTimeAgo(lastFeed.occurred_at) : '—'} />
          <StatusRow
            label={openSleep ? 'Sleeping' : 'Awake for'}
            value={
              openSleep
                ? openSessionLabel(openSleep)
                : awakeMins != null
                  ? `${awakeMins} min`
                  : '—'
            }
          />
          <StatusRow label="Last nappy" value={lastNappy ? formatTimeAgo(lastNappy.occurred_at) : '—'} />
          <StatusRow label="Next medication" value={lastMed ? `Last: ${formatTimeAgo(lastMed.occurred_at)}` : '—'} />
          <StatusRow
            label="Last weight"
            value={lastWeight?.weight_kg != null ? `${lastWeight.weight_kg} kg` : '—'}
          />
          {openFeed && (
            <Text style={{ color: colors.accent, marginTop: 8 }}>{openSessionLabel(openFeed)}</Text>
          )}
        </View>

        <Pressable style={sharedStyles.primaryButton} onPress={() => router.push('/log')}>
          <Text style={sharedStyles.primaryButtonText}>+ Log activity</Text>
        </Pressable>

        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardTitle}>Coming up</Text>
          {calendarEvents.length === 0 ? (
            <Text style={sharedStyles.empty}>No upcoming appointments</Text>
          ) : (
            calendarEvents.slice(0, 3).map((e) => (
              <Text key={e.id} style={{ color: colors.text, marginBottom: 6 }}>
                {format(new Date(e.starts_at), 'EEE d MMM, h:mm a')} — {e.title}
              </Text>
            ))
          )}
        </View>

        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardTitle}>To do</Text>
          {openTasks.length === 0 ? (
            <Text style={sharedStyles.empty}>Nothing pending</Text>
          ) : (
            openTasks.map((t) => (
              <Text key={t.id} style={{ color: colors.text, marginBottom: 6 }}>
                ○ {t.title}
              </Text>
            ))
          )}
        </View>

        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardTitle}>Since you last checked</Text>
          {sinceLastChecked.length === 0 ? (
            <Text style={sharedStyles.empty}>All caught up</Text>
          ) : (
            sinceLastChecked.slice(0, 8).map((e) => (
              <Text key={e.id} style={{ color: colors.muted, marginBottom: 4, fontSize: 14 }}>
                {format(new Date(e.occurred_at), 'h:mm a')} — {eventLabel(e)}
              </Text>
            ))
          )}
        </View>

        <Pressable style={sharedStyles.secondaryButton} onPress={onRefresh}>
          <Text style={sharedStyles.secondaryButtonText}>Refresh</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={sharedStyles.row}>
      <Text style={sharedStyles.rowLabel}>{label}</Text>
      <Text style={sharedStyles.rowValue}>{value}</Text>
    </View>
  );
}
