# Product Vision — Family

> Family is a private household OS. Root entity is the family. People have events. Today answers “what just happened / what do I tap / what’s next.” A single `FamilyEvent` stream powers timeline, handover, and later briefing. NZ immunisation and Well Child are versioned care pathways. Logging is a life stage. We do not diagnose, socialise, or predict sleep. We ship for two exhausted parents before we ship for a market.

**Working name:** Family  
**Tagline:** One private place the household actually runs.

This document is the source of truth for product direction. Build against it. Do not expand scope without updating it.

---

## 1. What we are building

A **private family operating system** that starts with pregnancy/newborn care and evolves with the family over the next 5–15 years.

The **family is the primary entity**, not the baby. Our son is simply the first child profile inside it.

This is not “yet another baby tracker.” Most of those die by 18 months. We are building a household system of record that happens to start in the fourth trimester.

### One paragraph

Family is a private household operating system. The family is the root. People, events, and responsibilities live under it. It starts as the place two parents stop being the other person’s memory — last feed, last dose, next Well Child, questions for the midwife, nappies on the list — and it is designed so that when logging fades, the same home still holds calendar, health history, tasks, lists, and memories. It is not a social network, not a doctor, and not a better Google Calendar. It is the shared brain of the household.

---

## 2. The core problem

In the first few months, information is scattered everywhere:

- When did he last feed?
- Which side was the last breastfeed?
- How long did he sleep?
- When was his last wet nappy?
- What did the midwife say?
- What did he weigh last appointment?
- When is his 6-week vaccination?
- What questions did we want to ask the doctor?
- Did you give him the medicine or was I supposed to?
- What size nappies do we need?
- What did he do today while I was at work?
- Has he always had that rash?
- When did he first smile?
- Where did we save his birth certificate?
- Who is taking him to Plunket / Well Child?
- What do we need to do this week?

A good app answers those questions in seconds, **without one parent becoming the keeper of all the information**.

### Fundamental product goal

**Reduce family mental load.**

Not: collect as much baby data as possible.

---

## 3. Positioning

The market is crowded in two piles. Almost nothing does both well, privately, and in NZ terms.

```
                BABY CARE
                   ↑
     Huckleberry   │   Nara (3am UX)
     Baby Connect  │   Onoco (share care)
                   │   Bountiful (NZ content)
                   │
 GENERAL ──────────┼──────── DEEP CHILD DATA
 FAMILY            │
     Cozi          │        ★ Family: household OS
     FamilyWall    │          + NZ care pathway
                   │          + handover / mental load
                   ↓
             FAMILY ADMIN
```

The differentiator is not “we track feeds too.” It is: **one private place where our family runs.**

We win if **handover + appointment-as-history + NZ pathway + private household** beat Onoco’s nanny/EYFS product and Bountiful’s content tracker. We lose if we become a worse Huckleberry.

### Competitive homework (use before inventing UX)

| App | Study for |
|---|---|
| [Nara](https://nara.baby) | 3am UX; parent/postpartum as real people |
| [Onoco](https://www.onoco.com) | Shared care, calendar, shared timers, nanny/handover — closest conceptual cousin |
| [Bountiful](https://bountifulpacks.co.nz/pages/app) | NZ localisation: LMC, Plunket, immunisation, safe sleep — content companion, not a family OS |
| [Huckleberry](https://huckleberrycare.com) | Sleep logging/predictions — do not compete on SweetSpot; fine to use alongside |
| [Baby Connect](https://www.baby-connect.com) | Breadth of medical logs, multi-caregiver, reports |
| [Baby Tracker (Nighp)](https://nighp.com) | Straightforward feed/sleep/nappy + sync |
| [Cozi](https://www.cozi.com) / [FamilyWall](https://www.familywall.com) | Family logistics: calendar, lists, tasks — almost no baby health |
| [Tinybeans](https://tinybeans.com) | Private photo journal — memories later, private-first |

**Sleep AI:** if nights go badly, use Huckleberry for predictions. This app owns handover, meds sync, appointment history, vaccines, documents. Sleep *logging* yes; nap prediction no.

**Pregnancy encyclopaedia:** Bountiful’s job. For the last month of pregnancy, hospital bag + birth-admin checklist is enough.

---

## 4. Principles

1. **Mental load over metrics.** If a field doesn’t prevent a 3am argument or a missed appointment, it is optional or gone.
2. **Two taps or it doesn’t ship.** Giant `+`. Last-used actions first.
3. **Family → Person → Event.** No `baby_id` as the centre of the schema.
4. **One timeline backbone.** Everything important is a `FamilyEvent`.
5. **Clinician interprets; app records.** Trends and “differs from last time,” never “abnormal.”
6. **Content is data.** Immunisation and Well Child packs are versioned, jurisdiction `NZ`.
7. **Logging is a life stage.** The OS outlives the nappy button.
8. **Sync is a safety feature.** Meds and sleep timers are correctness problems, not nice-to-haves.
9. **Privacy by construction.** RLS, audit fields, export/delete, no ad SDKs, biometric lock.
10. **Dogfood the three of us.** Market abstraction comes after buttons we actually hit.

### Three speeds of information

| Speed | Screen | Question |
|---|---|---|
| **Now** | Today + Log | What just happened / what do I tap |
| **Soon** | Calendar + To do | What this week |
| **Story** | Health + Timeline + Memories | What do we tell the nurse / remember |

If Story leaks into Now, the app dies at 3am.

### Sunset rule for care logs

Daily feed/nappy logging is a **phase**, not the product. After ~4–6 months the Today stack must still work when those buttons recede: calendar, tasks, growth, vaccines, appointments, lists, documents. Architect the UI to collapse logging without a rewrite.

### Two patients in month one

Mum’s 6-week postnatal check, recovery notes, and “who is on nights” sit next to baby. **Night roster** is who is responsible next. **Handover** is what happened. Both stay small. Everyone in the family can have things happening to them — that is architectural, not a wellness tracker.

### Offline equals realtime

Realtime is non-negotiable (Dad logs a nappy; Mum’s phone updates). Offline writes are equally non-negotiable (hospital Wi‑Fi, 3am). Optimistic local queue, then sync. Device clock skew, duplicate taps, and timer ownership are v0 bugs, not v1.

---

## 5. Today — the home screen

Call it **Today**. It must be ridiculously useful. At 3am nobody navigates six screens.

It should answer:

- What just happened?
- What needs doing?
- What’s happening today?
- What’s next?
- Is there anything important I should know?

### Layout (newborn)

```
┌─────────────────────────────────┐
│ Good morning                    │
│ Wednesday, 2 September          │
├─────────────────────────────────┤
│ 👶 OLIVER                       │
│                                 │
│ 🍼 Feed       1h 12m ago        │
│ 😴 Awake      38 min            │
│ 🚼 Nappy      52 min ago        │
│ 💊 Next med   —                 │
│ ⚖️ Last weight 3.84 kg          │
│                                 │
│       + LOG ACTIVITY            │
├─────────────────────────────────┤
│ TODAY                           │
│ 10:30  Midwife                  │
│ 17:30  Dad home                 │
├─────────────────────────────────┤
│ COMING UP                       │
│ Well Child — 14 Oct             │
│ Immunisations — due from 6 wks  │
├─────────────────────────────────┤
│ TO DO                           │
│ ○ Buy nappies                   │
│ ○ Register birth                │
│ ○ Add baby to GP                │
├─────────────────────────────────┤
│ SINCE YOU LAST CHECKED          │
│ 3 new events →                  │
└─────────────────────────────────┘

 Today  Timeline  Calendar  Health  Family
```

### Killer feature: “Since you last checked”

Shift-change, not graphs.

```
Since 10:15pm
11:02pm — 90ml bottle
11:45pm — wet nappy
12:10–2:04am — slept 1h 54m
2:14am — breastfeeding started

Next scheduled event: GP at 10:30am.
```

---

## 6. Information architecture

**Tabs:** `Today · Timeline · Calendar · Health · Family`  
**Persistent:** `+`

| Tab | Role |
|---|---|
| **Today** | Now: status, coming up, to do, since last checked, hand over |
| **Timeline** | Chrono spine of the last 48h (filterable) — author on every row |
| **Calendar** | Soon: family-context events |
| **Health** | Growth, meds, vaccines, Well Child pathway, allergies, visit history; filter by person (includes Mum postnatal) |
| **Family** | People, tasks, lists, contacts; later documents / emergency card |

### Persistent `+` sheet (age-ordered)

Feed · Sleep · Nappy · Medicine · Measurement · Appointment · Task · Note  
(Memory later.)

When he is 8, Nappy is not at the top. Dynamically order by age and recent use.

Every event has **Who / What / When / optional notes**. Keep it incredibly quick.

---

## 7. Hero loops

Design these on paper before extra screens.

1. **3am log** — unlock → `+` → Feed left → done. Partner’s Today updates.
2. **Shift change** — Since you last checked + optional **Hand over** with a note.
3. **Clinic loop** — add questions all week → appointment pack → log weight/outcome → next visit appears on Health and Calendar.
4. **Meds safety** — dose logged once; other phone shows last given / next due immediately. Avoids accidental double-dosing.
5. **Admin week** — register birth, GP, nappies — shared tasks, not a group chat.

### Handover

Named first-class feature. One parent taps **Hand over to Mum**. The app generates:

```
Last 6 hours
Slept: 3h 42m
Feeds: 3
Last feed: 80ml at 2:14pm
Nappies: 4 wet / 1 dirty
Medication: paracetamol 1:30pm
Mood: generally settled

Coming up
Medicine — 5:30pm
Bath — around 6:30pm

Dad's note
“Didn't want much of the 2pm bottle. Otherwise happy.”
```

Far more human than graphs. Onoco sells “share care”; we make the **moment of handover** the object.

### Shared timers

Mum starts `Sleep — 8:03pm`. Dad taps `End sleep — 10:22pm` on his phone. Design this in v0 or fight it forever.

---

## 8. Feature domains

### 8.1 Care log (phase, not identity)

Two taps, not a form.

- Feeds: breast L/R + duration, bottle (breastmilk/formula + ml), later solids
- Sleep: start/stop, location (bassinet/bed/pram)
- Nappies: wet / dirty / both (colour/consistency optional)
- Pumping if relevant
- Medicine, temperature, bath, tummy time, solids, teeth, potty, custom event
- Dashboard: last feed, awake for, 24h totals

### 8.2 Shared baby / family timeline

Nearly everything appears in one chronological timeline. Support all care types above. Every row: logged by whom.

### 8.3 Family calendar

Different from generic Google Calendar. An event understands family context.

**Example: Well Child appointment**

- For: Baby
- Going: Mum
- Location: Clinic
- Provider: Jane Smith
- Time: 10:30am
- **Questions to ask:** Is weight gain okay? Check dry skin. Ask about vitamin D.
- **Bring:** My Health Book, change of clothes
- **Outcome (after):** Weight 5.72kg, length 58cm, follow-up in 6 weeks

An appointment is not just a calendar event. It is part of the child’s history. Optional later: sync *out* to Google/Apple; this app remains source of truth for health.

### 8.4 Health profile

Track weight, length/height, head circumference, eventually BMI where appropriate.

Each measurement stores: value, date/time, age, who measured, location/provider, notes. Then graph the trend.

Use Health NZ / WHO charts as **reference only**. Never:

> “Your baby's growth is abnormal.”

Instead:

> “This measurement differs from the previous trend. Consider discussing it with your healthcare provider.”

Clinical interpretation belongs with the clinician. This is **not a medical device**.

### 8.5 Medical record (lightweight)

- Conditions, allergies, intolerances, diagnoses, ongoing concerns
- Medications: name, dose, instructions, reason, start/end, prescriber, last administered, next dose
- Illness episodes: fever, rash photo, start/end, what you tried
- **Dad gave medication at 2:03pm** must instantly sync to Mum’s phone

One **Health** tab, two layers: *current status* (growth, due vaccines, active meds) and *record* (allergies, past visits). Don’t split navigation.

### 8.6 Vaccinations (NZ)

Calculate recommended dates from date of birth. Health NZ infant schedule includes routine vaccinations at **6 weeks, 3 months, 5 months, 12 months, 15 months, and 4 years** (plus flu / MenB as relevant).

Show due / booked / given, provider, notes (e.g. mild temperature afterwards).

**Schedule must be versioned and jurisdiction-specific**, not baked permanently into app code. Official schedules change. Content pack: `jurisdiction=NZ`.

### 8.7 Well Child / Tamariki Ora

Companion to **My Health Book**, not a replacement.

Visit ladder (indicative): 4–6 weeks, 8–10 weeks, 3–4 months, 5–7 months, 9–12 months, 15–18 months, 2–3 years, **B4 School Check**. Plus **Mum’s 6-week postnatal check**.

For an upcoming visit, show what the provider may discuss (feeding, weight/head, hips, vision, hearing, development, immunisations) and a running **Questions for next visit** list parents add as things occur.

Contacts / numbers as content, not medical advice: Healthline `0800 611 116`, PlunketLine `0800 933 922`.

Watch-fors by age are short, sourced (Health NZ / Plunket), never a chatbot pretending to be a doctor.

### 8.8 Developmental milestones

Not: “YOUR BABY SHOULD BE DOING X BY 4 MONTHS.”

Instead: **observations** — recently noticed, add a note, photo optional. Categories: gross motor, fine motor, communication, social/emotional, cognition, hearing, vision. Properly sourced guidance, not AI-generated medical claims. No scores.

### 8.9 Memories

Utility → something we will treasure. Firsts (smile, bath, Christmas, tooth, steps, word, swim): picture/video, date, note, location, who was there. Later: generate a private Year One journal / printable baby book. Private-first; Tinybeans already wins at social sharing.

### 8.10 Shared family tasks

Invisible task queue with owner, due date, recurring, category, reminder.

Newborn: register birth, add to GP, passport, order nappies, wash bottles, book 6-week check. Later naturally: school forms, swimming, dentist, permission slips, chores.

### 8.11 Lists

Mundane, and why the app stays useful after baby tracking stops: groceries, baby bag, holiday packing, nappy size / next size waiting.

### 8.12 Family documents (eventually)

Secure vault: birth certificate, health docs, immunisation records, passport, insurance, GP letters; household insurance, wills, warranties, emergency information. Access control is mandatory. Treat NHI and similar IDs as sensitive — encrypted, not a random notes dump.

### 8.13 Family directory

Healthcare: GP, midwife/LMC, Well Child nurse, dentist, pharmacy. Childcare: daycare, babysitter, grandparents. Phone, address, email, notes, related child, emergency status. **Call GP** is one tap from Health.

### 8.14 Emergency card

Essential information available **offline**: DOB, allergies, medication, conditions, GP, parents, emergency contacts. Later: lock-screen / time-limited share link rather than a permanent extra account in v0. Babysitter mode: one screen + time-limited link, not full access.

### 8.15 Parents as people

Each adult is a real `Person`: appointments, medication, recovery notes, sleep, important health. Inspired by Nara. Not an obsessive wellness tracker.

### 8.16 Coordination extras (keep small)

Night roster, visitor rules, hospital bag / going-home checklist, handover note, optional parent check-in (sleep, mood) for postpartum mental health — not a gimmick.

---

## 9. Long-term product: life stages

Do not architect **Baby App**. Architect **Family → People → Events**.

The child ages through the same system. Functionality changes with life stage; underlying family data survives.

```
Pregnancy     Appointments, birth plan, hospital bag, contacts
     ↓
Newborn       Feeds, sleep, nappies, growth
     ↓
Infant        Solids, teeth, development, immunisations
     ↓
Toddler       Potty, milestones, daycare, illness
     ↓
Child         School, sports, chores, pocket money, homework, medical
     ↓
Teenager      Own login, schedule, tasks, school, medical permissions
```

**Vision is 15 years. Ship is 6 weeks.** Schema must not paint us into `BabyApp`. UI can be newborn-only at first.

---

## 10. Permissions

Do not make everyone simply an “account user.”

```
Family → Members → Roles
```

| Role | Access |
|---|---|
| Parent / Owner | Full |
| Grandparent | Calendar + memories + basic care logging |
| Nanny | Baby routine + emergency info + feeding + nappies |
| Babysitter | Temporary / time-boxed |
| Doctor / export | Generated report, not a permanent account |
| Child (later) | Age-appropriate access to their own information |

Granular domains: Health · Calendar · Care · Documents · Photos · Location · Tasks.

**Model `FamilyMembership.role` now. Ship only Owner/Parent in v0.** Invite codes later.

---

## 11. Data architecture

```
User
 └── FamilyMembership (role, permissions)
      └── Family
           ├── Person                  // adult or child; life_stage
           │    ├── CareProfile        // child: feeds/nappies relevant?
           │    ├── Measurements
           │    ├── Conditions / Allergies
           │    ├── Medications (+ DoseEvents)
           │    └── Observations       // milestones, not scores
           ├── CareSession             // open timer: sleep/feed; started_by, ended_by
           ├── FamilyEvent             // the backbone
           ├── CalendarEvent  ──► AppointmentDetail (questions, bring, outcome)
           ├── Tasks / Lists
           ├── Contacts
           ├── Documents               // later
           └── ContentPack             // NZ immunisation + Well Child, versioned
```

Every important record:

- `family_id`
- `person_id` (optional)
- `created_by` / `created_at`
- `updated_by` / `updated_at`

That yields “Bottle logged by Dad at 14:32” and a proper audit trail. Care sessions must survive two devices. Closing a timer writes a `FamilyEvent`.

### Timeline as backbone

`FamilyEvent` types include:

`FEED` · `SLEEP` · `NAPPY` · `MEDICATION` · `MEASUREMENT` · `APPOINTMENT` · `MILESTONE` · `MEMORY` · `NOTE` · `TASK_COMPLETED`

One stream constructs timeline, handovers, notifications, widgets, and later AI summaries.

Multi-caregiver realities to design early: realtime updates, offline writes, duplicate entries, conflict resolution, timer ownership, device clock differences.

---

## 12. Technology

Optimise for speed of shipping, not microservices. **Start as a modular monolith. Do not build microservices.**

| Layer | Choice |
|---|---|
| App | **React Native + Expo** (iOS + Android). Notifications, camera, widgets, biometrics, background. Flutter is reasonable; we are not debating it. |
| Backend | **Supabase**: PostgreSQL, auth, RLS, realtime, storage, edge functions |
| Sync | Local cache (SQLite / similar) + optimistic writes + realtime |
| Calendar | Our DB is source of truth; outbound CalDAV/Google later |
| Photos | Encrypted object storage, thumbnails, not in the DB |
| Content | Versioned JSON packs (immunisation, Well Child) updatable without a store release |

```
iOS / Android
      ↓
 React Native (Expo)
      ↓
 Application (modular monolith)
      ↓
 Supabase / PostgreSQL
      ├── Auth
      ├── Realtime
      ├── Storage
      └── Database (RLS)
```

Family membership and permissions are much nicer in Postgres than a document database.

**Export is a feature:** JSON + a PDF that looks like a health book. You must be able to leave the app.

---

## 13. Privacy

We may store children’s health information, photos, addresses, medical records, family relationships, locations. Extremely sensitive.

From day one:

- Encryption in transit and at rest
- MFA / passkeys
- Biometric app lock
- Strict row-level access controls (household A never sees household B)
- Audit trail
- Export all data / delete all data
- Short-lived sharing invitations
- Minimal analytics
- No ad tracking around health data
- Careful photo metadata handling
- No analytics SDKs that vacuum health events

If this becomes a public product in New Zealand, get proper privacy/legal advice. The **Health Information Privacy Code 2020** (and subsequent amendments) is not an area to copy from an old internet checklist. Aim higher than the legal minimum for children’s health information.

---

## 14. What we will not build (until we are addicted to v0)

- Social feeds / parenting forums
- AI medical diagnosis or “your baby is failing”
- Sleep prediction / SweetSpot clones
- Baby-monitor video
- GPS / location sharing
- Meal planning, budgeting, recipes
- In-app chat (we have iMessage)
- Smart-home integrations
- Complex third-party integrations
- Microservices
- Public signup (until we want a product)
- Watch / widgets until Today is boringly good
- Chore gamification
- Pregnancy week-by-week encyclopaedia

They explode scope. Two exhausted parents do not need another chat app.

---

## 15. AI — later, and only one job

Eventually AI makes sense **on the family’s own data**, not as a pretend doctor.

**Family Briefing** (morning / “What should I know?”):

```
Good morning

Oliver woke at 6:42am after 8h 12m total overnight sleep.
His last feed was at 7:03am.
You have a midwife appointment at 10:30am.
You previously added two questions to ask: dry skin, vitamin D.
Nappies are on the shopping list.
Dad is working until 5pm.
```

Compress family information. Do not dispense questionable parenting advice.

**Spec the `FamilyEvent` feed so briefing is possible. Do not ship an LLM in v0.**

---

## 16. Roadmap

Build initially for the **three of us**, not “the parenting market.” 2:37am button hits beat months of hypothetical planning. If it works brilliantly for this household, then abstract it.

### V0 — before / at birth (must exist)

The only ship that matters with a baby due in about a month.

- Two parents, one family, one child
- Today
- `+` for feed / sleep / nappy / meds
- Shared timers
- Timeline
- Since you last checked
- Calendar events with notes/questions
- Tasks + one grocery list
- Weight as a number (chart later)
- NZ vaccine **due dates** from DOB (tick given)
- Realtime + offline queue
- Biometric lock

That’s it.

### V0.2 — first Well Child / ~6 weeks

- Growth charts (Health NZ / WHO as reference)
- Appointment outcome → measurement
- Well Child visit packs
- Handover summary
- Mum postnatal check
- Data export
- Contacts (GP, LMC, Well Child)

### V0.3 — when we have sleep

- Milestones as observations
- Memories
- Emergency card (offline)
- Night roster
- Simple PDF for clinic

### V1 — only if V0 is daily

- Multiple children
- Caregiver permissions
- Document vault
- Calendar sync out
- Widgets / watch
- Family Briefing
- Age-adaptive chrome
- Babysitter time-box
- Daycare / school / chores as life stage demands

---

## 17. Suggested screens for V0

1. **Today** — last care events, who’s on, next appointment, since last checked
2. **Log (`+`)** — big buttons
3. **Timeline** — realtime shared activity
4. **Calendar** — appointments, reminders, questions
5. **Health** — weight, meds, vaccine ticks
6. **Family** — people, tasks, lists

---

## 18. How to use this document

- New features must map to a hero loop or an explicit roadmap slice.
- Schema changes must preserve **Family → Person → Event**.
- If a request is on the avoid list, it does not ship in that version.
- NZ health content lives in versioned packs, not UI copy sprinkled through screens.
- When in doubt: fewer fields, faster log, stronger sync.
