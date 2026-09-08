import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFamily } from '@/src/contexts/FamilyContext';
import { colors } from '@/src/theme';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { family, loading: familyLoading } = useFamily();

  if (authLoading || (user && familyLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!family) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
