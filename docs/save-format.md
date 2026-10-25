# Portable save format

Saves are local `.npsave` files containing one gzip member with UTF-8 JSON. They are neither encrypted nor uploaded. Export uses `next-please-day-N.npsave`; import checks bytes rather than trusting filenames or MIME types. Only locale and audio preferences use localStorage. Import replaces live state only after validation succeeds, preserving all live gameplay and presentation on failure.

## Version 11

The envelope contains exactly `game: "next-please"`, `version: 11`, a canonical ISO `savedAt` timestamp, and `state`:

```json
{
  "game": "next-please",
  "version": 11,
  "savedAt": "2026-10-25T12:00:00.000Z",
  "state": {
    "day": 1,
    "money": 0,
    "previousMonthBalance": 0,
    "patientsProcessed": 0,
    "phase": "cabinet",
    "introStep": 3,
    "shiftCompleted": 0,
    "clockMinutes": 477,
    "visit": null,
    "lampOn": true,
    "decoration": "plant",
    "papers": [],
    "nextPaperId": 1,
    "paperClips": [],
    "drawerItems": { "manual": false, "clips": 0 },
    "rngState": 3694606495,
    "roster": [21, 149, 1, 296, 135, 160, 202, 116, 74, 224, 2, 177, 31, 30, 82, 196, 99, 49, 14, 85, 275, 158, 23, 68, 255, 66, 16, 51, 110, 216, 128, 0, 233, 56, 279, 167, 91, 95, 90, 249, 212, 35, 41, 288, 45, 266, 123, 76, 3, 186, 244, 10, 62],
    "insuranceRate": 300,
    "daily": { "zusCases": 0, "refusals": 0, "fines": 0, "insuranceIncrease": 0 },
    "settlement": null
  }
}
```

All documented objects have exact keys; missing, additional, mistyped and out-of-range values fail validation. Integer guardrails are day 1–1,000,000, money −1,000,000,000–1,000,000,000, lifetime patients 0–1,000,000,000, and paper IDs 1–1,000,000,000. Actions stop at these bounds instead of producing invalid saves. Negative balances are allowed. Day 1 is 3 November 1983; the civil date advances one calendar day at a time, including rest days, and is derived rather than stored separately. `previousMonthBalance` is a signed integer within the money guardrail. It begins at zero and captures the actual closing balance when `next-day` crosses into a new calendar month; it stays fixed for that month, including negative balances. It is separate from the daily opening balance.

`phase` is `intro`, `cabinet` or `home`. `introStep` is 0–3 in the introduction and 3 afterwards. The introduction has no visit, completed appointments, paperwork, clips, drawer inventory or daily consequences; its insurance is 300 and clock is 477. Historical day/money/lifetime counters remain compatible with old imports. `shiftCompleted` is 0–53 and cannot exceed the current roster length or lifetime patients. `lampOn` is boolean; `decoration` is `plant` or `certificate`.

## Patients, randomness and time

`src/core/patients.ts` defines a stable catalog of 328 fictional cases: the original 303 cases retain their immutable identities, legacy examination categories and expected decisions. IDs 103–302 provide eight variants for each of 25 added characters; IDs 303–327 append one general-examination finding for each of those characters. These additions reuse existing portraits. Each case supplies a `characterId`, portrait, demographics, employer/job, managerial responsibility, examination kind, requirement profile and test results. Profiles distinguish vision, pressure, and combined requirements; general examination and measurements accompany every profile. Each case also supplies stable numeric `visionValues` (`left`, `right`) and `pressureValues` (`systolic`, `diastolic`), and a `general` finding (`pass` or `refer`). Any general finding requires refusal. Only substantial vision defects disqualify under a vision requirement; small defects remain compatible with approval. Legacy `vision`/`pressure` categories are retained internally for validation of older formats. Stored paper and visit `patientId` values identify cases, not portrait indices. Static case IDs preserve historical results across later days without storing duplicate patient snapshots. The game uses simplified fictional examination rules rather than clinical thresholds.

`roster` contains 53 valid case IDs on newly generated workdays, one per distinct character. Every identity is shuffled from the first day; no fixed introductory patients lead the queue. Its order and chosen variants are persisted. A migrated queue of exactly 28 original characters remains valid until the next workday, with case IDs limited to 0–102. Rest days have an empty roster and require the home phase, a Saturday/Sunday date, zero completed patients and zero salary/bonus. `rngState` is an unsigned 32-bit integer; the pure LCG transition is `next = (1664525 * seed + 1013904223) mod 2^32`, with result `next / 2^32`. Explicit updates consume draws for queues, detection and the household budget. Renderers consume no randomness. `createInitialState(seed)` accepts a caller-supplied seed for reproducible fixtures; omitting it obtains a fresh unsigned seed through browser `crypto.getRandomValues`, outside drawing. Saving and loading cannot reroll an existing queue, detected mistake or settled expense.

Time advances only through actions. The clock is an integer from 477 (07:57 arrival) to 840 (14:00 closing). Calling a patient, taking a referral, fetching/naming/returning a certificate, stamping, handling an object, turning a manual page and decorative interactions cost one minute. General and vision examinations each cost three, blood pressure four, and measurements two; repeated procedures retain these costs. Calling the first patient advances to at least 08:00. Waiting, animation, pointer movement and unavailable actions do not spend simulated time. Time caps at 14:00, but a patient admitted before closing can complete all examinations, paperwork and corrections afterwards. No new patient can be called at or after 14:00. Returning the last certificate at closing, or exhausting the queue, settles the day automatically. The view completes the patient departure before presenting home. `end-day` remains available for an empty closed cabinet, including imported older saves.

Imports retain the minimum action-time bounds compatible with earlier saves: an empty cabinet after `n` completed visits requires at least `480 + 4n − 1` (477 before the first visit); an active visit requires `480 + 4n`, plus one for referral intake, three for general examination, three for vision, four for pressure, two for measurements and one for an applied stamp. Bounds cap at 840. Migration does not invent time for certificates that were already supplied or named by older rules.

A visit exists only in the cabinet and must use `roster[shiftCompleted]`:

```json
{
  "patientId": 0,
  "document": "desk",
  "certificateTaken": false,
  "certificateNamed": false,
  "generalTested": false,
  "examinationOrder": ["vision"],
  "visionTested": true,
  "pressureTested": false,
  "measurementsTaken": false,
  "decision": null
}
```

`document` is `tray` or `desk`. A tray visit has no examinations, certificate or decision. The player takes the referral separately from fetching a certificate. Naming requires a fetched certificate. A decision is null, `fit` or `unfit`, and requires a fetched certificate; returning requires a written name and stamp. Examinations may happen before or after stamping. `examinationOrder` contains each completed examination exactly once in order of its first completion, using `general`, `vision`, `pressure`, and `measurements`. Repeated tests keep their original position. Its membership must exactly match the visit flags. Completion feedback checks the case’s required examination profile; missing required examinations use neutral feedback. Every returned certificate counts toward the 50 zł patient bonus. No per-patient money is credited during work.

## Consequences and home settlement

`daily` stores detected unsafe approvals (`zusCases`), detected refusals of healthy workers (`refusals`), cumulative `fines`, and `insuranceIncrease`. Counts cannot exceed completed patients, and their sum cannot exceed that count. An unsafe approval is unnoticed with probability 35%; a healthy refusal is unnoticed with probability 25%, or 3% for managers. Only detected mistakes generate complaint letters and financial consequences. Correct decisions consume no detection draw. A hidden mistake neither escalates fines nor increases insurance.

`fines` is exactly zero without a detected unsafe approval, otherwise `100 + 400 * (zusCases - 1)`. `insuranceRate` starts at 300, persists across days, stays in steps of 50 and is bounded by the money guardrail. Each detected healthy refusal increases it by 50 when it is 300, otherwise by 100. The recorded increase must match the refusal count and resulting rate. If no increase occurred that day, settlement first reduces the rate by 50, with a minimum of 300, then charges that reduced rate for the current day.

Closing certificate handoff, or `end-day` with no active visit and either 14:00 or an exhausted queue, computes the budget once, sets `phase: "home"`, sets clock 840 and credits the closing balance to `money`. `settlement` is null outside home. At home it contains exactly:

```json
{
  "day": 1,
  "patients": 20,
  "basePay": 1000,
  "patientBonus": 1000,
  "income": 2000,
  "livingCost": 600,
  "insuranceCost": 300,
  "fines": 0,
  "event": null,
  "expenses": 900,
  "openingBalance": 0,
  "closingBalance": 1100
}
```

On paid workdays, salary is 1000 zł and the bonus is 50 zł for each completed patient, including mistakes. On Saturday/Sunday rest days both are zero. Living cost is drawn uniformly from all integers 400–800 inclusive, including the first day. After income, living cost, insurance and fines, savings at or below 2000 trigger no event. Above 2000, event probability is `min(0.85, 0.10 + (savings - 2000) / 10000)`. This balancing curve is an implementation parameter, not an additional fixed story rule. At most one random expense is generated per day: `medicine`, `car-repair`, `home-repair` or `fur-coat`. On rest days the same eligible pool also includes `mountain-trip` and `seaside-trip`, with no named destination; trips use the same savings threshold, probability and cost bounds. Event cost is a uniform integer from 200 to `min(savings, 700 + floor((savings - 2000) * 0.75))`, reducing available savings without creating event-induced debt. The fur bill leaves its recipient unspecified. Story, bribes and family/relationship details are reserved for later.

`event` is null or exactly `{ "kind": "car-repair", "cost": 450 }` with a valid kind/cost. Validation checks all ledger values, event bounds, matching day/patient counts/premium/fines, `income = basePay + patientBonus`, `expenses = livingCost + insuranceCost + fines + eventCost`, and `closingBalance = openingBalance + income − expenses = money`. Saved home screens cannot settle again. `next-day` is available only from home. It preserves lifetime patients and stored belongings, resets daily consequences and checks for a month boundary. When the next date is Saturday/Sunday, it immediately settles that rest day once, retains home phase, uses an empty roster, charges living costs and insurance (including the normal daily premium decay), and saves any optional event. It creates no workday or patient income. When the next date is a weekday, it preserves money and insurance, clears the ledger, generates the 53-character queue and starts the cabinet at 07:57. Guardrail failure leaves the old state intact. The UI’s page and typewriter positions remain temporary. Paid weekend shifts imported from older formats retain their salary and remain resumable; newly advanced weekend dates use the rest-day flow.

## Paperwork and presentation

`papers` contains at most 4096 sheets. Every paper has a unique integer `id`, originating `day` no later than the current day, `patientId` and `location` (`desk` or `drawer`). IDs remain below `nextPaperId` (1–1,000,000,001), are allocated monotonically and are not reused. Shapes are:

```json
[
  { "id": 1, "kind": "referral", "day": 1, "patientId": 0, "location": "desk" },
  { "id": 2, "kind": "note", "day": 1, "patientId": 0, "location": "drawer", "additionalWritten": true,
    "examinationOrder": ["general", "pressure", "measurements", "vision"],
    "results": { "general": "pass", "vision": { "left": 0, "right": 0 },
      "pressure": { "systolic": 108, "diastolic": 62 }, "weight": 62, "height": 164 } },
  { "id": 3, "kind": "letter", "day": 1, "patientId": 0, "location": "desk", "sender": "employer", "opened": true }
]
```

Referrals are created once at intake. Certificate availability belongs to the active visit rather than an independent Paper. Blank notes have null patient/results, an empty `examinationOrder`, and `additionalWritten: false`; their sheet remains visually blank. Examination actions automatically bind blank desk notes and update same-day notes for that case, including notes in the drawer. Retrieving a blank note records existing examinations. The pen adds supplementary information once. Bound notes require a finding or supplementary annotation; results must match their immutable case, and weight/height are both present or both null. Numeric vision and pressure result objects have exact keys and must match the case values. `general` is null until examined, then matches the case’s `pass`/`refer` value. Every note’s `examinationOrder` contains exactly its non-null examinations, with no duplicates; current-visit notes also preserve their relative order from the visit and cannot claim an examination that has not occurred. The renderer writes only existing entries consecutively after the patient name, without empty examination slots; it uses the stored order rather than reconstructing chronology while drawing. Historical and other-patient notes remain unchanged. Referrals and letters are unique by kind/day/case; current-day paperwork must correspond to an admitted/completed position in the saved roster. Letter sender is `zus` for unfit cases, `employer` for fit cases; letters require a completed visit. Deleting a letter never removes recorded financial consequences.

`paperClips` contains nonempty groups, e.g. `[[1, 2, "certificate"], [3]]`. Each member refers to an existing sheet or the active taken certificate, occurs only once, and shares its group’s location. Singleton groups represent one clipped sheet. Joining merges groups; unclipping removes the group record. Storing/retrieving/discarding operates on whole groups. Certificate groups cannot be stored or discarded; handoff removes only certificate membership. Storing moves papers to the end of the array in filing order. Papers, bundles and stored objects survive day transitions.

`drawerItems` contains exactly boolean `manual` and integer `clips` (0–4096), independently of paper bundles. Each store/retrieve costs one handling minute capped at closing; duplicate manual storage, empty retrieval and excess clips leave state/time unchanged.

Coordinates, carried footprints, loose desk clips, stacking order, selected tools, book pages, patient animations, speech and typewriter positions are presentation state. Import restores default layout and no active movement; failure preserves the existing layout, animation and state. Menus pause presentation without changing saved progress. Start over resets gameplay and invalidates pending old imports, preserving preferences and exported files.

## Validation and legacy migrations

`src/core/game.ts` owns pure gameplay transitions; `src/core/economy.ts` owns deterministic budget rules. `src/core/save.ts` exposes `encodeSave`, `decodeSave`, `downloadSave` and asynchronous `importSave`. Export/download is initiated by a user action. Import copies validated objects rather than adopting untrusted input references.

The decoder accepts at most 1 MiB compressed and 2 MiB expanded, verifies gzip headers, single-member structure, CRC32, actual expanded length, UTF-8, envelope and timestamp, and checks actual expansion even when the trailer lies. CRC32 detects corruption and is not anti-cheat authentication. Stable localized error codes are `file-too-large`, `invalid-file`, `unsupported-version`, `invalid-state` and `read-failed`.

Version 11 adds `visit.generalTested`, `examinationOrder` to visits and notes, `results.general`, and numerical vision/pressure result objects. Version 10 retains its exact old keys and case-ID bound 302. Versions 1–10 first pass their existing strict validators. Migration preserves the clock, certificates, decisions, queue, money, ledger, paper locations and clips. The general examination remains pending (`false`/`null`). Existing vision/pressure categories map to the immutable case’s numeric values. Earlier formats did not retain chronology, so migrated visits and notes use their former display order (`vision`, `pressure`, `measurements`), filtered to examinations already present; later examinations append normally. No tests, additional annotation, time or money are invented. Nested result objects and order arrays are copied during import/export validation.

Version 10 adds `previousMonthBalance`, the 53-character queue and rest-day settlements/trips. Version 9 retains its exact schema, original 28-character roster and case-ID bound 102 during validation. Migration copies its queue, RNG, papers, money, insurance and existing settlement unchanged; historical monthly carryover is unavailable and initializes to zero, without inventing a prior balance. Versions 1–8 likewise initialize that field to zero. The next month boundary records the actual current closing balance.

Version 9 adds `rngState`, `roster`, `insuranceRate`, `daily`, `settlement`, and the home phase. Versions 1–8 retain their original strict validators, including their original three-patient limit and immutable first-three case fixtures. Migration keeps counters, clock, active visit, papers, clips and inventory; it initializes insurance to 300 and daily consequences to zero, adds a deterministic queue beginning with the original three cases, and leaves settlement null. It does not invent historical penalties or automatically pay a past day. An already completed legacy three-case shift before 14:00 may continue with the remaining queue; one already at 14:00 may go home. Current exports always use version 11.

Version 1 remains importable with its original strict validator. Its state contains only `day`, `money`, and `patientsProcessed`, with the bounds above. Migration preserves these counters and enters an empty cabinet with `introStep: 3`, `shiftCompleted: 0`, `clockMinutes: 477`, `visit: null`, `lampOn: true`, and `decoration: "plant"`. The legacy counters do not imply a position in the three-patient shift.

Version 2 remains importable with its original strict state invariants: it accepts introduction indices 0–5, requires cabinet states to use `introStep: 5`, and requires both examinations before a decision. Migration retains introduction cards 0–3, moves removed cards 4 and 5 directly into the cabinet, and changes the cabinet sentinel to `introStep: 3`. Version 3 uses the same state fields with four introduction cards and also permits decisions before examinations.

Both version 2 and version 3 are validated against their original exact clock schedule before migration: 07:57 before the first patient, two-hour appointment slots beginning at 08:00/10:00/12:00, ten minutes for taking the document, thirty-five per completed test, ten for a decision, and the next slot boundary after return. Incorrect legacy clocks remain invalid. Migration preserves the validated clock, counters, appointment, lamp, and decoration; it never rewinds existing progress. Subsequent actions follow the short action costs. Version 4 remains importable with its original exact state keys and minimum action-time validator, before migration to version 5.

Version 5 adds `visit.measurementsTaken`, `papers`, and `nextPaperId`. Migration from versions 1–4 preserves counters, flags, the applied stamp, and the validated clock. Measurements begin pending, so completing an old active appointment for a bonus now requires the additional measurement. A legacy desk visit receives one separate referral (`id: 1`), while a legacy tray visit or empty cabinet starts without papers. No notes, historical letters, or measurement results are invented. Version 5 keeps its exact visit keys (without `certificateTaken`), paper validation, and minimum clock rules during import.

Version 6 adds `visit.certificateTaken` to distinguish referral intake from taking a blank certificate. After strict version 5 validation, migration sets this flag to `true` for an existing desk visit and `false` for an existing tray visit. This preserves the certificate and any applied stamp that were already available under the old rules. Counters, papers, filing order, flags, and the validated clock remain unchanged. Versions 1–4 reach the same migration after their existing validation and earlier migration steps. An empty visit stays null. Version 6 rejects a certificate before referral intake and rejects any decision without a taken certificate. Version 6 retains its exact old keys, `clipped` paper flags, note snapshot rules and clock validation before migration.

Version 7 adds `visit.certificateNamed`, `note.additionalWritten`, and top-level `paperClips`, and removes the individual `paper.clipped` flag. Migration from a strictly validated version 6 preserves clock, counters, results and filing order. Existing taken certificates become named, preserving the identity already printed on them under the old rules; unavailable certificates remain unnamed. Existing notes gain `additionalWritten: false` without inventing observations or filling previously missing results. Each legacy clipped paper becomes a singleton clip group. Versions 1–5 pass through the same migration after their original validators. Exports now write version 11. The minimum clock bounds remain compatible with old named certificates and do not add fictitious writing time during migration.

Version 8 adds top-level `drawerItems`, with exactly `manual` (a boolean) and `clips` (an integer from 0 to 4096). This inventory represents the rulebook and loose paperclips kept separately from the documents. Migration from a strictly validated version 7 initializes `{ "manual": false, "clips": 0 }`; papers, their filing order, bundles, visits and clock values are preserved. Versions 1–6 retain their original validation and migrate through the same empty inventory. Introduction saves require an empty inventory. Storing or retrieving one object costs one handling minute, capped at closing; a duplicate stored rulebook, an empty retrieval or a clip beyond the limit leaves state and time unchanged. Inventory remains across shifts. Loose clips currently on the desktop and all object coordinates remain temporary; only clips actually stored in the drawer are persisted.
