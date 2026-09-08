import { ScrollView, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useFamily } from '@/src/contexts/FamilyContext';
import { eventLabel } from '@/src/utils/dates';
import { colors, sharedStyles } from '@/src/theme';

export default function TimelineScreen() {
  const { events } = useFamily();

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Timeline</Text>
      <Text style={sharedStyles.subtitle}>Last 48 hours</Text>

      {events.length === 0 ? (
        <Text style={sharedStyles.empty}>No activity yet — tap + to log</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={sharedStyles.card}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>
              {format(new Date(event.occurred_at), 'EEE d MMM, h:mm a')}
            </Text>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>
              {eventLabel(event)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
