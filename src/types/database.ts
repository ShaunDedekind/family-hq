export type PersonKind = 'adult' | 'child';
export type CareSessionType = 'sleep' | 'feed';
export type FamilyEventType =
  | 'feed'
  | 'sleep'
  | 'nappy'
  | 'medication'
  | 'measurement'
  | 'appointment'
  | 'note'
  | 'task_completed';

export type FeedMode = 'breast_left' | 'breast_right' | 'bottle';
export type NappyType = 'wet' | 'dirty' | 'both';

export interface Family {
  id: string;
  name: string;
  invite_code: string;
}

export interface Person {
  id: string;
  family_id: string;
  kind: PersonKind;
  display_name: string;
  date_of_birth: string | null;
  user_id: string | null;
}

export interface CareSession {
  id: string;
  family_id: string;
  person_id: string;
  type: CareSessionType;
  started_at: string;
  started_by: string | null;
  ended_at: string | null;
  ended_by: string | null;
  payload: Record<string, unknown>;
}

export interface FamilyEvent {
  id: string;
  family_id: string;
  person_id: string | null;
  type: FamilyEventType;
  occurred_at: string;
  payload: Record<string, unknown>;
  care_session_id: string | null;
  created_by: string | null;
}

export interface CalendarEvent {
  id: string;
  family_id: string;
  person_id: string | null;
  going_person_id: string | null;
  title: string;
  starts_at: string;
  location: string | null;
  questions: string | null;
  bring: string | null;
  notes: string | null;
  outcome: string | null;
}

export interface Task {
  id: string;
  family_id: string;
  title: string;
  owner_person_id: string | null;
  owner_user_id: string | null;
  due_on: string | null;
  done: boolean;
}

export interface FamilyList {
  id: string;
  family_id: string;
  name: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  family_id: string;
  title: string;
  done: boolean;
}

export interface Measurement {
  id: string;
  family_id: string;
  person_id: string;
  weight_kg: number | null;
  length_cm: number | null;
  head_cm: number | null;
  measured_at: string;
  notes: string | null;
}

export interface ImmunisationRecord {
  id: string;
  family_id: string;
  person_id: string;
  code: string;
  label: string;
  due_on: string;
  given_on: string | null;
  provider: string | null;
  notes: string | null;
}

export interface FamilyMembership {
  id: string;
  family_id: string;
  user_id: string;
  role: 'owner' | 'parent';
}

export interface ImmunisationScheduleItem {
  code: string;
  label: string;
  weeksFromBirth: number;
}

export type OutboxOperation = 'insert' | 'update';

export interface OutboxItem {
  id: string;
  table: string;
  operation: OutboxOperation;
  payload: Record<string, unknown>;
  createdAt: string;
}
