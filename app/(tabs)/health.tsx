import { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, Alert, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFamily } from '@/src/contexts/FamilyContext';
import { addWeight, toggleImmunisationGiven } from '@/src/services/care';
import { colors, sharedStyles } from '@/src/theme';

export default function HealthScreen() {
  const { user } = useAuth();
  const { family, child, measurements, immunisations, refresh } = useFamily();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const childMeasurements = measurements.filter((m) => m.person_id === child?.id);
  const childImmunisations = immunisations.filter((i) => i.person_id === child?.id);

  const onAddWeight = async () => {
    if (!family || !child || !user) return;
    const kg = parseFloat(weight);
    if (Number.isNaN(kg) || kg <= 0) {
      Alert.alert('Invalid weight', 'Enter weight in kg');
      return;
    }
    setSaving(true);
    try {
      await addWeight({ familyId: family.id, personId: child.id, userId: user.id, weightKg: kg });
      setWeight('');
      await refresh();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    }
    setSaving(false);
  };

  const onToggleVax = async (id: string, currentlyGiven: boolean) => {
    try {
      await toggleImmunisationGiven(id, !currentlyGiven);
      await refresh();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update');
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Health</Text>
      <Text style={sharedStyles.subtitle}>{child?.display_name ?? 'Baby'}</Text>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Weight</Text>
        {childMeasurements[0]?.weight_kg != null ? (
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
            {childMeasurements[0].weight_kg} kg
          </Text>
        ) : (
          <Text style={sharedStyles.empty}>No weight recorded</Text>
        )}
        <TextInput
          style={[sharedStyles.input, { marginTop: 12 }]}
          placeholder="Weight (kg)"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
        <Pressable style={sharedStyles.primaryButton} onPress={onAddWeight} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>{saving ? 'Saving…' : 'Record weight'}</Text>
        </Pressable>
      </View>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Immunisations (NZ schedule)</Text>
        {!child?.date_of_birth ? (
          <Text style={sharedStyles.empty}>Add baby DOB in onboarding to see due dates</Text>
        ) : childImmunisations.length === 0 ? (
          <Text style={sharedStyles.empty}>Loading schedule… pull to refresh on Today</Text>
        ) : (
          childImmunisations.map((v) => (
            <Pressable
              key={v.id}
              style={[sharedStyles.row, { alignItems: 'flex-start' }]}
              onPress={() => onToggleVax(v.id, !!v.given_on)}>
              <Text style={{ color: v.given_on ? colors.success : colors.text, flex: 1, fontSize: 15 }}>
                {v.given_on ? '✓' : '○'} {v.label}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                {v.given_on ? 'Given' : `Due ${format(parseISO(v.due_on), 'd MMM yyyy')}`}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
