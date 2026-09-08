import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth, getAuthRedirectUri } from '@/src/contexts/AuthContext';
import { colors, sharedStyles } from '@/src/theme';

export default function LoginScreen() {
  const { signInWithEmail, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) return;
    setSending(true);
    const { error } = await signInWithEmail(email);
    setSending(false);
    if (error) {
      Alert.alert('Sign in failed', error);
      return;
    }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={[sharedStyles.screen, { justifyContent: 'center', padding: 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={[sharedStyles.title, { fontSize: 32 }]}>Family</Text>
      <Text style={sharedStyles.subtitle}>One private place the household runs.</Text>

      {!configured && (
        <View style={sharedStyles.card}>
          <Text style={{ color: colors.warning }}>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env — see SETUP.md
          </Text>
        </View>
      )}

      {sent ? (
        <View style={sharedStyles.card}>
          <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
            Check your email for a magic link. Tap it on this device to sign in.
          </Text>
        </View>
      ) : (
        <>
          {__DEV__ && configured && (
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>
              Redirect URI (add to Supabase if needed): {getAuthRedirectUri()}
            </Text>
          )}
          <TextInput
            style={sharedStyles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Pressable style={sharedStyles.primaryButton} onPress={onSubmit} disabled={sending}>
            <Text style={sharedStyles.primaryButtonText}>{sending ? 'Sending…' : 'Send magic link'}</Text>
          </Pressable>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
