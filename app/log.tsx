import { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFamily } from '@/src/contexts/FamilyContext';
import {
  endCareSession,
  logFeed,
  logMedication,
  logNappy,
  startCareSession,
} from '@/src/services/care';
import { colors, sharedStyles } from '@/src/theme';

type LogView = 'menu' | 'feed' | 'nappy' | 'meds';

export default function LogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { family, child, sessions, refresh } = useFamily();
  const [view, setView] = useState<LogView>('menu');
  const [medName, setMedName] = useState('Paracetamol');
  const [medDose, setMedDose] = useState('');
  const [bottleMl, setBottleMl] = useState('80');
  const [saving, setSaving] = useState(false);

  const openSleep = sessions.find((s) => s.type === 'sleep' && s.person_id === child?.id);
  const openFeed = sessions.find((s) => s.type === 'feed' && s.person_id === child?.id);

  const guard = () => {
    if (!family || !child || !user) {
      Alert.alert('Not ready', 'Complete onboarding first.');
      return false;
    }
    return true;
  };

  const done = async () => {
    await refresh();
    router.back();
  };

  const onBreast = async (side: 'breast_left' | 'breast_right') => {
    if (!guard()) return;
    setSaving(true);
    try {
      await logFeed({
        familyId: family!.id,
        personId: child!.id,
        userId: user!.id,
        mode: side,
      });
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  const onBottle = async () => {
    if (!guard()) return;
    const ml = parseInt(bottleMl, 10);
    setSaving(true);
    try {
      await logFeed({
        familyId: family!.id,
        personId: child!.id,
        userId: user!.id,
        mode: 'bottle',
        amountMl: Number.isNaN(ml) ? undefined : ml,
      });
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  const onNappy = async (type: 'wet' | 'dirty' | 'both') => {
    if (!guard()) return;
    setSaving(true);
    try {
      await logNappy({ familyId: family!.id, personId: child!.id, userId: user!.id, nappyType: type });
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  const onMeds = async () => {
    if (!guard() || !medName.trim()) return;
    setSaving(true);
    try {
      await logMedication({
        familyId: family!.id,
        personId: child!.id,
        userId: user!.id,
        name: medName.trim(),
        dose: medDose.trim() || undefined,
      });
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  const onSleepToggle = async () => {
    if (!guard()) return;
    setSaving(true);
    try {
      if (openSleep) {
        await endCareSession({ sessionId: openSleep.id, userId: user!.id });
      } else {
        await startCareSession({
          familyId: family!.id,
          personId: child!.id,
          userId: user!.id,
          type: 'sleep',
        });
      }
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  const onFeedTimerToggle = async () => {
    if (!guard()) return;
    setSaving(true);
    try {
      if (openFeed) {
        await endCareSession({
          sessionId: openFeed.id,
          userId: user!.id,
          payload: { mode: 'breast_timer' },
        });
      } else {
        await startCareSession({
          familyId: family!.id,
          personId: child!.id,
          userId: user!.id,
          type: 'feed',
        });
      }
      await done();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
    setSaving(false);
  };

  if (view === 'feed') {
    return (
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
        <Text style={sharedStyles.title}>Feed</Text>
        <Pressable style={sharedStyles.primaryButton} onPress={() => onBreast('breast_left')} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>Breast — left</Text>
        </Pressable>
        <Pressable style={sharedStyles.primaryButton} onPress={() => onBreast('breast_right')} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>Breast — right</Text>
        </Pressable>
        <TextInput
          style={sharedStyles.input}
          placeholder="Bottle ml"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          value={bottleMl}
          onChangeText={setBottleMl}
        />
        <Pressable style={sharedStyles.primaryButton} onPress={onBottle} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>Bottle</Text>
        </Pressable>
        <Pressable style={sharedStyles.secondaryButton} onPress={() => setView('menu')}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (view === 'nappy') {
    return (
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
        <Text style={sharedStyles.title}>Nappy</Text>
        {(['wet', 'dirty', 'both'] as const).map((t) => (
          <Pressable key={t} style={sharedStyles.primaryButton} onPress={() => onNappy(t)} disabled={saving}>
            <Text style={sharedStyles.primaryButtonText}>{t}</Text>
          </Pressable>
        ))}
        <Pressable style={sharedStyles.secondaryButton} onPress={() => setView('menu')}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (view === 'meds') {
    return (
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
        <Text style={sharedStyles.title}>Medicine</Text>
        <TextInput style={sharedStyles.input} value={medName} onChangeText={setMedName} placeholderTextColor={colors.muted} />
        <TextInput
          style={sharedStyles.input}
          value={medDose}
          onChangeText={setMedDose}
          placeholder="Dose (optional)"
          placeholderTextColor={colors.muted}
        />
        <Pressable style={sharedStyles.primaryButton} onPress={onMeds} disabled={saving}>
          <Text style={sharedStyles.primaryButtonText}>Log dose</Text>
        </Pressable>
        <Pressable style={sharedStyles.secondaryButton} onPress={() => setView('menu')}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Log</Text>
      <Pressable style={sharedStyles.primaryButton} onPress={() => setView('feed')}>
        <Text style={sharedStyles.primaryButtonText}>Feed</Text>
      </Pressable>
      <Pressable style={sharedStyles.primaryButton} onPress={onSleepToggle} disabled={saving}>
        <Text style={sharedStyles.primaryButtonText}>
          {openSleep ? 'End sleep' : 'Start sleep'}
        </Text>
      </Pressable>
      <Pressable style={sharedStyles.primaryButton} onPress={onFeedTimerToggle} disabled={saving}>
        <Text style={sharedStyles.primaryButtonText}>
          {openFeed ? 'End feed timer' : 'Start feed timer'}
        </Text>
      </Pressable>
      <Pressable style={sharedStyles.primaryButton} onPress={() => setView('nappy')}>
        <Text style={sharedStyles.primaryButtonText}>Nappy</Text>
      </Pressable>
      <Pressable style={sharedStyles.primaryButton} onPress={() => setView('meds')}>
        <Text style={sharedStyles.primaryButtonText}>Medicine</Text>
      </Pressable>
    </ScrollView>
  );
}
