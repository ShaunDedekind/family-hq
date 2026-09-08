import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '@/src/lib/supabase';
import { flushOutbox } from '@/src/lib/outbox';
import { ensureImmunisationRecords } from '@/src/services/immunisation';
import type {
  CalendarEvent,
  CareSession,
  Family,
  FamilyEvent,
  FamilyList,
  ImmunisationRecord,
  ListItem,
  Measurement,
  Person,
  Task,
} from '@/src/types/database';
import { useAuth } from '@/src/contexts/AuthContext';

type FamilyContextValue = {
  loading: boolean;
  family: Family | null;
  people: Person[];
  child: Person | null;
  adults: Person[];
  events: FamilyEvent[];
  sessions: CareSession[];
  calendarEvents: CalendarEvent[];
  tasks: Task[];
  groceryList: FamilyList | null;
  groceryItems: ListItem[];
  measurements: Measurement[];
  immunisations: ImmunisationRecord[];
  refresh: () => Promise<void>;
  createFamily: (
    familyName: string,
    adultName: string,
    childName: string,
    childDob: string | null
  ) => Promise<{ error: string | null; inviteCode?: string }>;
  joinFamily: (code: string, adultName: string) => Promise<{ error: string | null }>;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [sessions, setSessions] = useState<CareSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groceryList, setGroceryList] = useState<FamilyList | null>(null);
  const [groceryItems, setGroceryItems] = useState<ListItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [immunisations, setImmunisations] = useState<ImmunisationRecord[]>([]);

  const child = useMemo(() => people.find((p) => p.kind === 'child') ?? null, [people]);
  const adults = useMemo(() => people.filter((p) => p.kind === 'adult'), [people]);

  const refresh = useCallback(async () => {
    if (!user) {
      setFamily(null);
      setPeople([]);
      setEvents([]);
      setSessions([]);
      setCalendarEvents([]);
      setTasks([]);
      setGroceryList(null);
      setGroceryItems([]);
      setMeasurements([]);
      setImmunisations([]);
      setLoading(false);
      return;
    }

    await flushOutbox();

    const { data: membership } = await supabase
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership?.family_id) {
      setFamily(null);
      setPeople([]);
      setLoading(false);
      return;
    }

    const familyId = membership.family_id;

    const [
      familyRes,
      peopleRes,
      eventsRes,
      sessionsRes,
      calendarRes,
      tasksRes,
      listsRes,
      measurementsRes,
      immunisationsRes,
    ] = await Promise.all([
      supabase.from('families').select('*').eq('id', familyId).single(),
      supabase.from('people').select('*').eq('family_id', familyId).order('kind'),
      supabase
        .from('family_events')
        .select('*')
        .eq('family_id', familyId)
        .gte('occurred_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .order('occurred_at', { ascending: false }),
      supabase
        .from('care_sessions')
        .select('*')
        .eq('family_id', familyId)
        .is('ended_at', null),
      supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', familyId)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(20),
      supabase.from('tasks').select('*').eq('family_id', familyId).order('created_at'),
      supabase.from('lists').select('*').eq('family_id', familyId).eq('name', 'Groceries').maybeSingle(),
      supabase
        .from('measurements')
        .select('*')
        .eq('family_id', familyId)
        .order('measured_at', { ascending: false })
        .limit(20),
      supabase
        .from('immunisation_records')
        .select('*')
        .eq('family_id', familyId)
        .order('due_on'),
    ]);

    setFamily(familyRes.data as Family | null);
    setPeople((peopleRes.data as Person[]) ?? []);
    setEvents((eventsRes.data as FamilyEvent[]) ?? []);
    setSessions((sessionsRes.data as CareSession[]) ?? []);
    setCalendarEvents((calendarRes.data as CalendarEvent[]) ?? []);
    setTasks((tasksRes.data as Task[]) ?? []);
    setGroceryList((listsRes.data as FamilyList | null) ?? null);

    const listId = listsRes.data?.id;
    if (listId) {
      const { data: items } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at');
      setGroceryItems((items as ListItem[]) ?? []);
    } else {
      setGroceryItems([]);
    }

    setMeasurements((measurementsRes.data as Measurement[]) ?? []);
    setImmunisations((immunisationsRes.data as ImmunisationRecord[]) ?? []);
    setLoading(false);

    const childPerson = (peopleRes.data as Person[] | null)?.find((p) => p.kind === 'child');
    if (childPerson?.date_of_birth) {
      await ensureImmunisationRecords(familyId, childPerson.id, childPerson.date_of_birth);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!family?.id) return;

    const channel = supabase
      .channel(`family-${family.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_events', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'care_sessions', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_items', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'measurements', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'immunisation_records', filter: `family_id=eq.${family.id}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [family?.id, refresh]);

  const createFamily = useCallback(
    async (
      familyName: string,
      adultName: string,
      childName: string,
      childDob: string | null
    ) => {
      const { data, error } = await supabase.rpc('create_family_with_child', {
        p_family_name: familyName,
        p_adult_name: adultName,
        p_child_name: childName,
        p_child_dob: childDob,
      });
      if (error) return { error: error.message };
      const result = data as { invite_code: string; child_id: string; family_id: string };
      if (childDob) {
        await ensureImmunisationRecords(result.family_id, result.child_id, childDob);
      }
      await refresh();
      return { error: null, inviteCode: result.invite_code };
    },
    [refresh]
  );

  const joinFamily = useCallback(
    async (code: string, adultName: string) => {
      const { error } = await supabase.rpc('join_family_by_code', {
        p_invite_code: code,
        p_adult_name: adultName,
      });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      loading,
      family,
      people,
      child,
      adults,
      events,
      sessions,
      calendarEvents,
      tasks,
      groceryList,
      groceryItems,
      measurements,
      immunisations,
      refresh,
      createFamily,
      joinFamily,
    }),
    [
      loading,
      family,
      people,
      child,
      adults,
      events,
      sessions,
      calendarEvents,
      tasks,
      groceryList,
      groceryItems,
      measurements,
      immunisations,
      refresh,
      createFamily,
      joinFamily,
    ]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
