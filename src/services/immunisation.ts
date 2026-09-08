import { addWeeks, format } from 'date-fns';
import immunisationPack from '@/src/content/nz/immunisation_v1.json';
import { supabase } from '@/src/lib/supabase';
import type { ImmunisationScheduleItem } from '@/src/types/database';

const schedule = immunisationPack.schedule as ImmunisationScheduleItem[];

export function immunisationDueDates(dateOfBirth: string): Array<{
  code: string;
  label: string;
  due_on: string;
}> {
  const dob = new Date(dateOfBirth);
  return schedule.map((item) => ({
    code: item.code,
    label: item.label,
    due_on: format(addWeeks(dob, item.weeksFromBirth), 'yyyy-MM-dd'),
  }));
}

export async function ensureImmunisationRecords(
  familyId: string,
  personId: string,
  dateOfBirth: string | null
): Promise<void> {
  if (!dateOfBirth) return;

  const dueDates = immunisationDueDates(dateOfBirth);
  const rows = dueDates.map((item) => ({
    family_id: familyId,
    person_id: personId,
    code: item.code,
    label: item.label,
    due_on: item.due_on,
  }));

  await supabase.from('immunisation_records').upsert(rows, {
    onConflict: 'person_id,code',
    ignoreDuplicates: true,
  });
}
