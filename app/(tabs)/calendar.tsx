import { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, Alert, View } from 'react-native';
import { format } from 'date-fns';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFamily } from '@/src/contexts/FamilyContext';
import { addCalendarEvent } from '@/src/services/care';
import { colors, sharedStyles } from '@/src/theme';

export default function CalendarScreen() {
  const { user } = useAuth();
  const { family, child, calendarEvents, refresh } = useFamily();
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [questions, setQuestions] = useState('');
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!family || !user || !title.trim() || !dateStr.trim()) {
      Alert.alert('Missing info', 'Enter title and date/time (YYYY-MM-DD HH:mm)');
      return;
    }
    const parsed = new Date(dateStr.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
      Alert.alert('Invalid date', 'Use format YYYY-MM-DD HH:mm');
      return;
    }
    setSaving(true);
    try {
      await addCalendarEvent({
        familyId: family.id,
        userId: user.id,
        title: title.trim(),
        startsAt: parsed.toISOString(),
        personId: child?.id,
        questions: questions.trim() || undefined,
      });
      setTitle('');
      setDateStr('');
      setQuestions('');
      await refresh();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    }
    setSaving(false);
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Calendar</Text>
      <Text style={sharedStyles.subtitle}>Appointments with context</Text>

      {calendarEvents.length === 0 ? (
        <Text style={sharedStyles.empty}>No upcoming events</Text>
      ) : (
        calendarEvents.map((e) => (
          <View key={e.id} style={sharedStyles.card}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>{e.title}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {format(new Date(e.starts_at), 'EEE d MMM, h:mm a')}
            </Text>
            {e.questions ? (
              <Text style={{ color: colors.muted, marginTop: 8, fontStyle: 'italic' }}>
                Questions: {e.questions}
              </Text>
            ) : null}
          </View>
        ))
      )}

      <View style={[sharedStyles.card, { marginTop: 16 }]}>
        <Text style={sharedStyles.cardTitle}>Add appointment</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder="Title (e.g. Well Child visit)"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={sharedStyles.input}
          placeholder="When (YYYY-MM-DD HH:mm)"
          placeholderTextColor={colors.muted}
          value={dateStr}
          onChangeText={setDateStr}
        />
        <TextInput
          style={sharedStyles.input}
          placeholder="Questions to ask"
          placeholderTextColor={colors.muted}
          value={questions}
          onChangeText={setQuestions}
          multiline
        />
        <Pressable style={sharedStyles.primaryButton} onPress={onAdd} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>{saving ? 'Saving…' : 'Add'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
