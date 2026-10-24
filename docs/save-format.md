# Portable save format

Saves are local `.npsave` files containing a single gzip member with UTF-8 JSON. They are neither encrypted nor uploaded. Export uses `next-please-day-N.npsave`; import identifies the bytes rather than trusting the filename or MIME type.

The version 4 envelope is:

```json
{
  "game": "next-please",
  "version": 4,
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
    "decoration": "plant"
  }
}
```

Money is an integer game currency amount; negative balances are allowed. Day is an integer from 1 to 1,000,000, money from −1,000,000,000 to 1,000,000,000, and patients processed from 0 to 1,000,000,000. These are format guardrails, not gameplay rules. Actions stop at these limits instead of producing an invalid save. Locale and audio preferences belong to local settings, not to a player's progress.

`phase` is `intro` or `cabinet`. `introStep` is an integer slide index from 0 to 3; cabinet states keep it at 3. `shiftCompleted` counts returned documents in the current three-patient shift and is an integer from 0 to 3, never greater than the lifetime `patientsProcessed` count. The introduction has no active visit or completed appointments. `lampOn` is a boolean and `decoration` is `plant` or `certificate`.

`clockMinutes` is the simulated minute of the day, from 477 (07:57 arrival) to 840 (14:00 closing). Time advances through completed actions, independently of animation or wall-clock time. Calling a patient, taking or returning the certificate, stamping, handling an object, turning a manual page, switching the lamp, or changing the decoration costs one minute. An eye examination costs three minutes and a pressure examination costs four; repeated examinations and corrected stamps cost the same as their first use. Calling the first patient advances to at least 08:00. Unavailable actions, pointer movement, menus, and canceled placement do not add time on their own. All costs cap at 14:00; an active appointment can still be completed at closing.

Returning the certificate no longer jumps to a two-hour appointment boundary. The prototype still contains three cases, so finishing those cases can occur before 14:00. Starting the next day resets the clock to 07:57. Current saves accept any integer clock within the bounds and at or above the minimum work represented by their appointment: with `n` completed cases, an empty cabinet needs at least `480 + 4n − 1` minutes (or 477 before the first case); an active visit needs at least `480 + 4n`, plus one minute for a desk document, three for a recorded eye test, four for a recorded pressure test, and one for a decision. Introduction saves remain exactly at 477. These lower bounds allow time spent on handling, reading, and repeated work while rejecting impossible earlier clocks. Displayed hand interpolation is temporary presentation state and never changes the persisted value.

The current appointment and its paperwork are stored in `visit`:

```json
{
  "patientId": 0,
  "document": "desk",
  "visionTested": true,
  "pressureTested": false,
  "decision": null
}
```

Visits exist only in the cabinet. Patient IDs are deterministic indices 0–2 and must equal `shiftCompleted`. `document` is `tray` or `desk`; documents in the tray cannot have test results or a decision. Both test flags must be booleans. A decision is `null`, `fit`, or `unfit`, and a desk document can be stamped before either or both examinations. Players may then complete the examinations and correct the stamp, or return it immediately. Returning a stamped document with any missing examination counts as a mistake and earns no bonus, even if its decision matches the patient's expected outcome. Every object has exactly the documented keys. The saved visit resumes at the same stage, including an early stamp that has not yet been returned. The tests and fitness decisions are simplified fictional game rules, not medical thresholds.

Desktop coordinates, item stacking order, selected/carried tools, manual cover/page, patient entry/exit frames and short speech balloons are temporary presentation state and are not save fields. Item handling can advance the saved clock, but pointer movement alone does not. Placing the rulebook leaves its cover closed; opening the cover and turning a page use the existing reading cost. Taking a document from the tray, using a carried stamp, and handing the certificate to the patient invoke the same validated gameplay transitions as their keyboard actions. After a successful import, restore the saved appointment with the default desktop layout, closed book, and no active animation or speech; a failed import preserves the live appointment, desktop layout, motion and speech. These presentation changes do not change the version 4 envelope.

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

Both version 2 and version 3 are validated against their original exact clock schedule before migration: 07:57 before the first patient, two-hour appointment slots beginning at 08:00/10:00/12:00, ten minutes for taking the document, thirty-five per completed test, ten for a decision, and the next slot boundary after return. Incorrect legacy clocks remain invalid. Migration preserves the validated clock, counters, appointment, lamp, and decoration; it never rewinds existing progress. Subsequent actions follow version 4's short costs. All exports write version 4, including after importing a supported older file. This explicit version change records the new interpretation of the clock even though the JSON field names remain the same.

When gameplay expands the state schema, introduce a new envelope version and an explicit, tested migration from supported older versions. Keep old-version validators intact; do not silently reinterpret old fields. Unknown versions must continue to fail without changing live state.
