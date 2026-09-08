import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { colors } from '@/src/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.cardBorder },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="health" options={{ title: 'Health' }} />
      <Tabs.Screen name="family" options={{ title: 'Family' }} />
      <Tabs.Screen
        name="log-button"
        options={{
          title: '+',
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/log')}
              style={{
                top: -8,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.accent,
                width: 56,
                height: 56,
                borderRadius: 28,
              }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#0f172a', marginTop: -2 }}>+</Text>
            </Pressable>
          ),
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
    </Tabs>
  );
}
