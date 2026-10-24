# Portable save format

Saves are local `.npsave` files containing a single gzip member with UTF-8 JSON. They are neither encrypted nor uploaded. Export uses `next-please-day-N.npsave`; import identifies the bytes rather than trusting the filename or MIME type.

The version 7 envelope is:

```json
{
  "game": "next-please",
  "version": 7,
  "savedAt": "2026-10-23T12:00:00.000Z",
  "state": {
    "day": 1,
    "money": 0,
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
    "paperClips": []
  }
}
```

Money is an integer game currency amount; negative balances are allowed. Day is an integer from 1 to 1,000,000, money from −1,000,000,000 to 1,000,000,000, and patients processed from 0 to 1,000,000,000. These are format guardrails, not gameplay rules. Actions stop at these limits instead of producing an invalid save. Locale and audio preferences belong to local settings, not to a player's progress.

`phase` is `intro` or `cabinet`. `introStep` is an integer slide index from 0 to 3; cabinet states keep it at 3. `shiftCompleted` counts returned documents in the current three-patient shift and is an integer from 0 to 3, never greater than the lifetime `patientsProcessed` count. The introduction has no active visit or completed appointments. `lampOn` is a boolean and `decoration` is `plant` or `certificate`.

`clockMinutes` is the simulated minute of the day, from 477 (07:57 arrival) to 840 (14:00 closing). Time advances through completed actions, independently of animation or wall-clock time. Calling a patient, taking the referral, fetching, naming or returning the certificate, stamping, handling an object, turning a manual page, switching the lamp, or changing the decoration costs one minute. An eye examination costs three minutes, a pressure examination costs four, and measuring weight and height together costs two; repeated examinations and corrected stamps cost the same as their first use. Calling the first patient advances to at least 08:00. Unavailable actions, pointer movement, menus, and canceled placement do not add time on their own. All costs cap at 14:00; an active appointment can still be completed at closing.

Returning the certificate no longer jumps to a two-hour appointment boundary. The prototype still contains three cases, so finishing those cases can occur before 14:00. Starting the next day resets the clock to 07:57. Current saves accept any integer clock within the bounds and at or above the minimum work represented by their appointment: with `n` completed cases, an empty cabinet needs at least `480 + 4n − 1` minutes (or 477 before the first case); an active visit needs at least `480 + 4n`, plus one minute for a desk document, three for a recorded eye test, four for a recorded pressure test, two for weight/height measurements, and one for a decision. Fetching a certificate in version 6 spends one additional minute, but these import lower bounds deliberately remain compatible with earlier saves, in which referral intake already supplied the certificate. No provenance field or artificial clock adjustment is required. Introduction saves remain exactly at 477. These lower bounds allow time spent on handling, reading, and repeated work while rejecting impossible earlier clocks. Displayed hand interpolation is temporary presentation state and never changes the persisted value.

The current appointment and its paperwork are stored in `visit`:

```json
{
  "patientId": 0,
  "document": "desk",
  "certificateTaken": false,
  "certificateNamed": false,
  "visionTested": true,
  "pressureTested": false,
  "measurementsTaken": false,
  "decision": null
}
```

Visits exist only in the cabinet. Patient IDs are deterministic indices 0–2 and must equal `shiftCompleted`. `document` is `tray` or `desk` and records referral intake only. Taking the referral creates its paper without supplying a certificate. A tray visit cannot have test results, a certificate, or a decision. All three examination flags, `certificateTaken`, and `certificateNamed` must be booleans. A new certificate starts unnamed. The pen action writes the patient’s name and sets `certificateNamed: true`; it costs one minute and is a no-op if already written. An absent certificate cannot be named. Handing it back requires both a stamp and a written name. The player fetches the certificate separately from the right document rack after taking the referral; repeat fetching is a no-op. Examinations and writing notes are available before this fetch. A decision is `null`, `fit`, or `unfit`; applying or returning a decision requires `certificateTaken: true`. A fetched certificate can be stamped before any examinations. Players may then complete the examinations and correct the stamp, or name and return it without completing the examinations. Returning a stamped document with any missing examination counts as a mistake and earns no bonus, even if its decision matches the patient's expected outcome. Every object has exactly the documented keys. The saved visit resumes at the same stage, including an early stamp that has not yet been returned. The tests and fitness decisions are simplified fictional game rules, not medical thresholds.

Desktop coordinates, carried document footprint, item stacking order, selected/carried tools, manual cover/page, patient entry/exit frames and short speech balloons are temporary presentation state and are not save fields. Item handling can advance the saved clock, but pointer movement alone does not. Placing the rulebook leaves its cover closed; opening the cover and turning a page use the existing reading cost. Taking a document from the tray, using a carried stamp, and handing the certificate to the patient invoke the same validated gameplay transitions as their keyboard actions. After a successful import, restore the saved appointment with the default desktop layout, closed book, and no active animation or speech; a failed import preserves the live appointment, desktop layout, motion and speech. These presentation details remain outside the version 7 envelope.

`src/core/game.ts` defines game state, the initial introduction, deterministic patient cases, and pure action transitions. `src/core/save.ts` re-exports `createInitialState()` and exposes `encodeSave(state)`, `decodeSave(bytes)`, `downloadSave(state)`, and asynchronous `importSave(file)`. Download must run from a user action. Import returns an independently copied, validated state; the caller should replace its live state only after that promise succeeds. No progress is automatically persisted by these functions.

Imports allow at most 1 MiB compressed and 2 MiB expanded. The streaming decoder checks actual expanded size even if the gzip trailer lies. It checks gzip headers, CRC32, length, UTF-8, the envelope, exact state fields, safe integer bounds, and a canonical ISO timestamp. Multiple gzip members are rejected. CRC32 catches accidental corruption; it is not an authenticity or anti-cheat mechanism.

Stable `SaveError.code` values for localized messages:

| Code | Meaning |
| --- | --- |
| `file-too-large` | Compressed or expanded size exceeds its limit. |
| `invalid-file` | Invalid gzip, checksum, JSON, envelope, or timestamp. |
| `unsupported-version` | Valid game identifier, but an unsupported integer format version. |
| `invalid-state` | Missing, extra, mistyped, or out-of-range state fields. |
| `read-failed` | The browser could not read the selected file. |

Version 1 remains importable with its original strict validator. Its state contains only `day`, `money`, and `patientsProcessed`, with the bounds above. Migration preserves these counters and enters an empty cabinet with `introStep: 3`, `shiftCompleted: 0`, `clockMinutes: 477`, `visit: null`, `lampOn: true`, and `decoration: "plant"`. The legacy counters do not imply a position in the three-patient shift.

Version 2 remains importable with its original strict state invariants: it accepts introduction indices 0–5, requires cabinet states to use `introStep: 5`, and requires both examinations before a decision. Migration retains introduction cards 0–3, moves removed cards 4 and 5 directly into the cabinet, and changes the cabinet sentinel to `introStep: 3`. Version 3 uses the same state fields with four introduction cards and also permits decisions before examinations.

Both version 2 and version 3 are validated against their original exact clock schedule before migration: 07:57 before the first patient, two-hour appointment slots beginning at 08:00/10:00/12:00, ten minutes for taking the document, thirty-five per completed test, ten for a decision, and the next slot boundary after return. Incorrect legacy clocks remain invalid. Migration preserves the validated clock, counters, appointment, lamp, and decoration; it never rewinds existing progress. Subsequent actions follow the short action costs. Version 4 remains importable with its original exact state keys and minimum action-time validator, before migration to version 5.

Version 5 adds `visit.measurementsTaken`, `papers`, and `nextPaperId`. Migration from versions 1–4 preserves counters, flags, the applied stamp, and the validated clock. Measurements begin pending, so completing an old active appointment for a bonus now requires the additional measurement. A legacy desk visit receives one separate referral (`id: 1`), while a legacy tray visit or empty cabinet starts without papers. No notes, historical letters, or measurement results are invented. Version 5 keeps its exact visit keys (without `certificateTaken`), paper validation, and minimum clock rules during import.

Version 6 adds `visit.certificateTaken` to distinguish referral intake from taking a blank certificate. After strict version 5 validation, migration sets this flag to `true` for an existing desk visit and `false` for an existing tray visit. This preserves the certificate and any applied stamp that were already available under the old rules. Counters, papers, filing order, flags, and the validated clock remain unchanged. Versions 1–4 reach the same migration after their existing validation and earlier migration steps. An empty visit stays null. Version 6 rejects a certificate before referral intake and rejects any decision without a taken certificate. Version 6 retains its exact old keys, `clipped` paper flags, note snapshot rules and clock validation before migration.

Version 7 adds `visit.certificateNamed`, `note.additionalWritten`, and top-level `paperClips`, and removes the individual `paper.clipped` flag. Migration from a strictly validated version 6 preserves clock, counters, results and filing order. Existing taken certificates become named, preserving the identity already printed on them under the old rules; unavailable certificates remain unnamed. Existing notes gain `additionalWritten: false` without inventing observations or filling previously missing results. Each legacy clipped paper becomes a singleton clip group. Versions 1–5 pass through the same migration after their original validators. Every export writes version 7. The minimum clock bounds remain compatible with old named certificates and do not add fictitious writing time during migration.

## Paperwork

`papers` is a bounded array of up to 4096 independent documents. This is an import and storage guardrail; supplies have no per-shift stock count. Every paper has an integer `id` from 1 to 1,000,000,000, an originating `day` no later than the current day, a `patientId`, and `location` (`desk` or `drawer`). IDs are unique and smaller than `nextPaperId`, an integer from 1 to 1,000,000,001. IDs are allocated monotonically and never reused after disposal. Taking a new paper stops at these limits rather than generating a save that cannot be imported.

The three exact paper shapes are:

```json
[
  { "id": 1, "kind": "referral", "day": 1, "patientId": 0, "location": "desk" },
  { "id": 2, "kind": "note", "day": 1, "patientId": 0, "location": "drawer", "additionalWritten": true,
    "results": { "vision": "pass", "pressure": "pass", "weight": 62, "height": 164 } },
  { "id": 3, "kind": "letter", "day": 1, "patientId": 0, "location": "desk",
    "sender": "employer", "opened": true }
]
```

Taking the patient's referral creates a `referral` paper once. The `visit.document` field describes referral intake only; the referral is independent afterwards. Certificate availability is stored separately in `visit.certificateTaken`. Fetching a certificate does not create another `Paper` or allocate a paper ID; the certificate belongs to the active visit until handed back. The referral's employer, date of birth, sex, examination type, job and managerial details come from the deterministic patient fixtures and localized content. The certificate contains the fitness decision rather than examination results.

Taking a clean sheet creates a `note` with `patientId: null`, `additionalWritten: false`, and all four results null, then immediately records any examinations already completed for the active patient. Examination transitions update results automatically, without using the pen or spending a separate writing minute. Blank sheets on the desk bind to the active patient as findings arrive; existing notes for that same patient and day update even in the drawer. Blank sheets stored in the drawer and historical notes remain unchanged. Retrieving a blank sheet to the desk also records findings already available for the active patient. The pen writes deterministic supplementary patient information and sets `additionalWritten: true`; it is available before any test and does not repeat or charge time once written. Vision and pressure snapshots are `pass`, `refer`, or null; weight and height are integer kilograms and centimeters from that patient's fixture, or both null. A nonblank note binds to its patient and day and cannot be overwritten for another case. The values must match the fixture, and results recorded for the active visit cannot claim an examination that has not happened. A bound note must contain at least one finding or a supplementary annotation. A blank note cannot claim an annotation. Blank notes can be kept for a later day; their day updates when first bound to a case.

Returning a decision that contradicts the scripted patient's fitness creates a sealed `letter`: `zus` after accepting an unfit patient, `employer` after rejecting a fit patient. A correct decision with incomplete examinations earns no bonus but does not create a false complaint. Opening the envelope persists `opened: true`. The letter retains the original patient and day, so later visits do not change its contents. Referrals and letters are unique by kind, patient and day.

`paperClips` is an array of nonempty groups, for example `[[1, 2, "certificate"], [3]]`. Numeric members refer to existing paper IDs; `"certificate"` refers to the active taken certificate. Each document occurs in at most one group, including within a group. All members share one location; the active certificate is always on the desk. A singleton group represents a clip attached to one sheet. Dropping a sheet or bundle onto another sheet’s clip merges the whole groups. Clicking any group member’s clip removes the group, leaving independent sheets. These changes are pure game actions; temporary item coordinates remain outside saves.

Storing or retrieving changes the location of the whole clipped group. Storing moves its papers to the end of the array, preserving their internal filing order so the drawer retrieves the most recently stored group; retrieving preserves that order. Disposal removes the whole held group and its clip record without changing completed examinations. A group containing the active certificate cannot be stored or discarded: the player must unclip it first. Handing the certificate to the patient removes only its membership, retaining any remaining clipped papers. Paperwork remains across shifts. Each completed paper action, taking a blank sheet, or using the unavailable telephone costs one minute; rejected actions do not consume time. Opening an already open envelope or reattaching a clip is a no-op. The empty introduction has no papers or clip groups and `nextPaperId: 1`. Import checks exact nested keys, types, fixture results, unique identities, sender consistency, and current-day progress before copying any data into live state. Temporary positions, unbound loose clips, drawer presentation and held objects remain outside the save.

When gameplay expands the state schema, introduce a new envelope version and an explicit, tested migration from supported older versions. Keep old-version validators intact; do not silently reinterpret old fields. Unknown versions must continue to fail without changing live state.

The staff-room menu pauses the current visit and its presentation in memory without changing save data. Confirming Start over replaces it with the initial first-day introduction, clears temporary presentation state and invalidates any older pending file read. Locale and audio preferences remain unchanged; existing exported files are untouched.
