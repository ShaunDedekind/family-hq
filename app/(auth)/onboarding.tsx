import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFamily } from '@/src/contexts/FamilyContext';
import { colors, sharedStyles } from '@/src/theme';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingScreen() {
  const router = useRouter();
  const { createFamily, joinFamily } = useFamily();
  const [mode, setMode] = useState<Mode>('choose');
  const [familyName, setFamilyName] = useState('Our Family');
  const [adultName, setAdultName] = useState('');
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!adultName.trim() || !childName.trim()) {
      Alert.alert('Missing info', 'Please enter your name and baby name.');
      return;
    }
    setLoading(true);
    const dob = childDob.trim() || null;
    const { error, inviteCode: code } = await createFamily(
      familyName,
      adultName,
      childName,
      dob
    );
    setLoading(false);
    if (error) {
      Alert.alert('Could not create family', error);
      return;
    }
    setCreatedCode(code ?? null);
  };

  const onJoin = async () => {
    if (!inviteCode.trim() || !adultName.trim()) {
      Alert.alert('Missing info', 'Enter invite code and your name.');
      return;
    }
    setLoading(true);
    const { error } = await joinFamily(inviteCode, adultName);
    setLoading(false);
    if (error) {
      Alert.alert('Could not join', error);
      return;
    }
    router.replace('/(tabs)');
  };

  if (createdCode) {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content, { justifyContent: 'center' }]}>
        <Text style={sharedStyles.title}>You&apos;re set up</Text>
        <Text style={sharedStyles.subtitle}>Share this code with your partner:</Text>
        <View style={[sharedStyles.card, { alignItems: 'center' }]}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: colors.accent, letterSpacing: 4 }}>
            {createdCode}
          </Text>
        </View>
        <Pressable style={sharedStyles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={sharedStyles.primaryButtonText}>Go to Today</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === 'choose') {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content, { justifyContent: 'center' }]}>
        <Text style={sharedStyles.title}>Welcome</Text>
        <Text style={sharedStyles.subtitle}>Create a new family or join with an invite code.</Text>
        <Pressable style={sharedStyles.primaryButton} onPress={() => setMode('create')}>
          <Text style={sharedStyles.primaryButtonText}>Create family</Text>
        </Pressable>
        <Pressable style={sharedStyles.secondaryButton} onPress={() => setMode('join')}>
          <Text style={sharedStyles.secondaryButtonText}>Join with code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={sharedStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={sharedStyles.content}>
        <Text style={sharedStyles.title}>{mode === 'create' ? 'Create family' : 'Join family'}</Text>

        {mode === 'create' && (
          <TextInput
            style={sharedStyles.input}
            placeholder="Family name"
            placeholderTextColor={colors.muted}
            value={familyName}
            onChangeText={setFamilyName}
          />
        )}

        <TextInput
          style={sharedStyles.input}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          value={adultName}
          onChangeText={setAdultName}
        />

        {mode === 'create' && (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Baby name"
              placeholderTextColor={colors.muted}
              value={childName}
              onChangeText={setChildName}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Baby DOB (YYYY-MM-DD) or leave blank"
              placeholderTextColor={colors.muted}
              value={childDob}
              onChangeText={setChildDob}
              autoCapitalize="none"
            />
          </>
        )}

        {mode === 'join' && (
          <TextInput
            style={sharedStyles.input}
            placeholder="Invite code"
            placeholderTextColor={colors.muted}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        )}

        <Pressable
          style={sharedStyles.primaryButton}
          onPress={mode === 'create' ? onCreate : onJoin}
          disabled={loading}>
          <Text style={sharedStyles.primaryButtonText}>
            {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Join'}
          </Text>
        </Pressable>

        <Pressable style={sharedStyles.secondaryButton} onPress={() => setMode('choose')}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
