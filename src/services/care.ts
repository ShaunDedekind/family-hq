import { supabase } from '@/src/lib/supabase';
import { withOutbox, withOutboxUpdate, enqueueOutbox } from '@/src/lib/outbox';
import NetInfo from '@react-native-community/netinfo';
import type { FeedMode, NappyType } from '@/src/types/database';

export async function logFeed(params: {
  familyId: string;
  personId: string;
  userId: string;
  mode: FeedMode;
  amountMl?: number;
  durationMinutes?: number;
}) {
  const payload = {
    family_id: params.familyId,
    person_id: params.personId,
    type: 'feed',
    occurred_at: new Date().toISOString(),
    payload: {
      mode: params.mode,
      amount_ml: params.amountMl ?? null,
      duration_minutes: params.durationMinutes ?? null,
    },
    created_by: params.userId,
  };

  await withOutbox('family_events', payload, async () => {
    const { error } = await supabase.from('family_events').insert(payload);
    if (error) throw error;
  });
}

export async function logNappy(params: {
  familyId: string;
  personId: string;
  userId: string;
  nappyType: NappyType;
}) {
  const payload = {
    family_id: params.familyId,
    person_id: params.personId,
    type: 'nappy',
    occurred_at: new Date().toISOString(),
    payload: { nappy_type: params.nappyType },
    created_by: params.userId,
  };

  await withOutbox('family_events', payload, async () => {
    const { error } = await supabase.from('family_events').insert(payload);
    if (error) throw error;
  });
}

export async function logMedication(params: {
  familyId: string;
  personId: string;
  userId: string;
  name: string;
  dose?: string;
}) {
  const payload = {
    family_id: params.familyId,
    person_id: params.personId,
    type: 'medication',
    occurred_at: new Date().toISOString(),
    payload: { name: params.name, dose: params.dose ?? null },
    created_by: params.userId,
  };

  await withOutbox('family_events', payload, async () => {
    const { error } = await supabase.from('family_events').insert(payload);
    if (error) throw error;
  });
}

export async function startCareSession(params: {
  familyId: string;
  personId: string;
  userId: string;
  type: 'sleep' | 'feed';
  sessionPayload?: Record<string, unknown>;
}) {
  const row = {
    family_id: params.familyId,
    person_id: params.personId,
    type: params.type,
    started_at: new Date().toISOString(),
    started_by: params.userId,
    payload: params.sessionPayload ?? {},
  };

  await withOutbox('care_sessions', row, async () => {
    const { error } = await supabase.from('care_sessions').insert(row);
    if (error) throw error;
  });
}

export async function endCareSession(params: {
  sessionId: string;
  userId: string;
  payload?: Record<string, unknown>;
}) {
  const update = {
    ended_at: new Date().toISOString(),
    ended_by: params.userId,
    payload: params.payload ?? {},
  };

  const netPayload = { id: params.sessionId, ...update };

  const net = await NetInfo.fetch();
  if (net.isConnected) {
    const { error } = await supabase.from('care_sessions').update(update).eq('id', params.sessionId);
    if (error) throw error;
  } else {
    await enqueueOutbox('care_sessions', 'update', netPayload);
  }
}

export async function addWeight(params: {
  familyId: string;
  personId: string;
  userId: string;
  weightKg: number;
}) {
  const measurement = {
    family_id: params.familyId,
    person_id: params.personId,
    weight_kg: params.weightKg,
    measured_at: new Date().toISOString(),
    measured_by: params.userId,
  };

  await withOutbox('measurements', measurement, async () => {
    const { error: mErr } = await supabase.from('measurements').insert(measurement);
    if (mErr) throw mErr;

    const event = {
      family_id: params.familyId,
      person_id: params.personId,
      type: 'measurement',
      occurred_at: new Date().toISOString(),
      payload: { weight_kg: params.weightKg },
      created_by: params.userId,
    };
    const { error: eErr } = await supabase.from('family_events').insert(event);
    if (eErr) throw eErr;
  });
}

export async function toggleImmunisationGiven(id: string, given: boolean) {
  const given_on = given ? new Date().toISOString().slice(0, 10) : null;
  await withOutboxUpdate('immunisation_records', id, { given_on }, async () => {
    const { error } = await supabase.from('immunisation_records').update({ given_on }).eq('id', id);
    if (error) throw error;
  });
}

export async function addCalendarEvent(params: {
  familyId: string;
  userId: string;
  title: string;
  startsAt: string;
  personId?: string;
  questions?: string;
  notes?: string;
}) {
  const row = {
    family_id: params.familyId,
    title: params.title,
    starts_at: params.startsAt,
    person_id: params.personId ?? null,
    questions: params.questions ?? null,
    notes: params.notes ?? null,
    created_by: params.userId,
  };

  await withOutbox('calendar_events', row, async () => {
    const { error } = await supabase.from('calendar_events').insert(row);
    if (error) throw error;
  });
}

export async function addTask(params: {
  familyId: string;
  userId: string;
  title: string;
  dueOn?: string;
}) {
  const row = {
    family_id: params.familyId,
    title: params.title,
    due_on: params.dueOn ?? null,
    owner_user_id: params.userId,
    created_by: params.userId,
  };

  await withOutbox('tasks', row, async () => {
    const { error } = await supabase.from('tasks').insert(row);
    if (error) throw error;
  });
}

export async function toggleTaskDone(id: string, done: boolean) {
  await withOutboxUpdate('tasks', id, { done }, async () => {
    const { error } = await supabase.from('tasks').update({ done }).eq('id', id);
    if (error) throw error;
  });
}

export async function addGroceryItem(params: {
  familyId: string;
  listId: string;
  title: string;
}) {
  const row = {
    family_id: params.familyId,
    list_id: params.listId,
    title: params.title,
  };

  await withOutbox('list_items', row, async () => {
    const { error } = await supabase.from('list_items').insert(row);
    if (error) throw error;
  });
}

export async function toggleGroceryItem(id: string, done: boolean) {
  await withOutboxUpdate('list_items', id, { done }, async () => {
    const { error } = await supabase.from('list_items').update({ done }).eq('id', id);
    if (error) throw error;
  });
}
