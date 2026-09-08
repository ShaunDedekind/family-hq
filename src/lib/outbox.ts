import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import type { OutboxItem } from '@/src/types/database';

const OUTBOX_KEY = 'family:outbox';

async function readOutbox(): Promise<OutboxItem[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxItem[];
  } catch {
    return [];
  }
}

async function writeOutbox(items: OutboxItem[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export async function enqueueOutbox(
  table: string,
  operation: OutboxItem['operation'],
  payload: Record<string, unknown>
): Promise<void> {
  const items = await readOutbox();
  items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    table,
    operation,
    payload,
    createdAt: new Date().toISOString(),
  });
  await writeOutbox(items);
}

export async function flushOutbox(): Promise<void> {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const items = await readOutbox();
  if (items.length === 0) return;

  const remaining: OutboxItem[] = [];

  for (const item of items) {
    try {
      if (item.operation === 'insert') {
        const { error } = await supabase.from(item.table).insert(item.payload);
        if (error) throw error;
      } else if (item.operation === 'update') {
        const { id, ...rest } = item.payload;
        const { error } = await supabase.from(item.table).update(rest).eq('id', id);
        if (error) throw error;
      }
    } catch {
      remaining.push(item);
    }
  }

  await writeOutbox(remaining);
}

export async function withOutbox<T extends Record<string, unknown>>(
  table: string,
  payload: T,
  onlineAction: () => Promise<void>
): Promise<void> {
  const net = await NetInfo.fetch();
  if (net.isConnected) {
    await onlineAction();
    return;
  }
  await enqueueOutbox(table, 'insert', payload);
}

export async function withOutboxUpdate(
  table: string,
  id: string,
  update: Record<string, unknown>,
  onlineAction: () => Promise<void>
): Promise<void> {
  const net = await NetInfo.fetch();
  if (net.isConnected) {
    await onlineAction();
    return;
  }
  await enqueueOutbox(table, 'update', { id, ...update });
}
