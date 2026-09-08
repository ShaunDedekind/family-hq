import { useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, Switch, View } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useFamily } from '@/src/contexts/FamilyContext';
import { addGroceryItem, addTask, toggleGroceryItem, toggleTaskDone } from '@/src/services/care';
import { isAppLockEnabled, setAppLockEnabled } from '@/src/lib/storage';
import { useEffect } from 'react';
import { colors, sharedStyles } from '@/src/theme';

export default function FamilyScreen() {
  const { user, signOut } = useAuth();
  const { family, people, tasks, groceryList, groceryItems, refresh } = useFamily();
  const [taskTitle, setTaskTitle] = useState('');
  const [groceryTitle, setGroceryTitle] = useState('');
  const [appLock, setAppLock] = useState(false);

  useEffect(() => {
    isAppLockEnabled().then(setAppLock);
  }, []);

  const onAddTask = async () => {
    if (!family || !user || !taskTitle.trim()) return;
    await addTask({ familyId: family.id, userId: user.id, title: taskTitle.trim() });
    setTaskTitle('');
    await refresh();
  };

  const onAddGrocery = async () => {
    if (!family || !groceryList || !groceryTitle.trim()) return;
    await addGroceryItem({
      familyId: family.id,
      listId: groceryList.id,
      title: groceryTitle.trim(),
    });
    setGroceryTitle('');
    await refresh();
  };

  const onToggleAppLock = async (value: boolean) => {
    setAppLock(value);
    await setAppLockEnabled(value);
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <Text style={sharedStyles.title}>Family</Text>
      <Text style={sharedStyles.subtitle}>{family?.name}</Text>

      {family?.invite_code ? (
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardTitle}>Invite code</Text>
          <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800', letterSpacing: 3 }}>
            {family.invite_code}
          </Text>
        </View>
      ) : null}

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>People</Text>
        {people.map((p) => (
          <Text key={p.id} style={{ color: colors.text, marginBottom: 6 }}>
            {p.display_name} ({p.kind})
          </Text>
        ))}
      </View>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Tasks</Text>
        {tasks.map((t) => (
          <Pressable key={t.id} onPress={() => toggleTaskDone(t.id, !t.done).then(refresh)}>
            <Text
              style={{
                color: t.done ? colors.muted : colors.text,
                textDecorationLine: t.done ? 'line-through' : 'none',
                marginBottom: 6,
              }}>
              {t.done ? '✓' : '○'} {t.title}
            </Text>
          </Pressable>
        ))}
        <TextInput
          style={sharedStyles.input}
          placeholder="New task"
          placeholderTextColor={colors.muted}
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <Pressable style={sharedStyles.secondaryButton} onPress={onAddTask}>
          <Text style={sharedStyles.secondaryButtonText}>Add task</Text>
        </Pressable>
      </View>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Groceries</Text>
        {groceryItems.map((item) => (
          <Pressable key={item.id} onPress={() => toggleGroceryItem(item.id, !item.done).then(refresh)}>
            <Text
              style={{
                color: item.done ? colors.muted : colors.text,
                textDecorationLine: item.done ? 'line-through' : 'none',
                marginBottom: 6,
              }}>
              {item.done ? '✓' : '○'} {item.title}
            </Text>
          </Pressable>
        ))}
        <TextInput
          style={sharedStyles.input}
          placeholder="Add to list"
          placeholderTextColor={colors.muted}
          value={groceryTitle}
          onChangeText={setGroceryTitle}
        />
        <Pressable style={sharedStyles.secondaryButton} onPress={onAddGrocery}>
          <Text style={sharedStyles.secondaryButtonText}>Add item</Text>
        </Pressable>
      </View>

      <View style={[sharedStyles.card, sharedStyles.row]}>
        <Text style={sharedStyles.rowLabel}>Biometric app lock</Text>
        <Switch value={appLock} onValueChange={onToggleAppLock} />
      </View>

      <Pressable
        style={[sharedStyles.secondaryButton, { borderColor: colors.danger }]}
        onPress={() => signOut()}>
        <Text style={[sharedStyles.secondaryButtonText, { color: colors.danger }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
