# Portable save format

Saves are local `.npsave` files containing a single gzip member with UTF-8 JSON. They are neither encrypted nor uploaded. Export uses `next-please-day-N.npsave`; import identifies the bytes rather than trusting the filename or MIME type.

The version 3 envelope is:

```json
{
  "game": "next-please",
  "version": 3,
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

`clockMinutes` is the simulated minute of the day, from 477 (07:57 arrival) to 840 (14:00 end of shift). Time advances through actions rather than real elapsed time: calling the first patient moves the clock to 08:00; taking the document adds ten minutes; each first test adds thirty-five; the first stamp adds ten. Repeating a completed action or correcting a stamp adds no time. Returning a document moves the clock to the end of that appointment's two-hour slot: 10:00, 12:00, then 14:00. This deliberately condenses the six-hour shift into three cases. The next day starts at 07:57 again. Save validation requires the exact clock value implied by the current appointment stage, including 14:00 after the third returned document. Decorative actions do not advance the clock.

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

Visits exist only in the cabinet. Patient IDs are deterministic indices 0–2 and must equal `shiftCompleted`. `document` is `tray` or `desk`; documents in the tray cannot have test results or a decision. Both test flags must be booleans, and both tests must be complete before a decision can be `fit` or `unfit`. Otherwise the decision is `null`. Every object has exactly the documented keys. The saved visit resumes at the same stage, including an applied stamp that has not yet been returned. The tests and fitness decisions are simplified fictional game rules, not medical thresholds.

Desktop coordinates, item stacking order, selected/carried tools, and patient entry/exit frames are temporary presentation state and are not save fields. Moving items alone does not change gameplay progress or simulated time. Taking a document from the tray, dropping a stamp onto it, and returning it to the tray invoke the same validated gameplay transitions as their click/keyboard actions. The draggable desktop and patient animations therefore retain save version 3 without a migration. After a successful import, restore the saved appointment with the default desktop layout and no active animation; a failed import preserves the live appointment, desktop layout, and motion.

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

Version 2 also remains importable with its original strict state invariants: it accepts introduction indices 0–5 and requires cabinet states to use `introStep: 5`. Migration retains introduction cards 0–3, moves removed cards 4 and 5 directly into the cabinet, and changes the cabinet sentinel to `introStep: 3`. It preserves counters, appointment progress, clock, lamp, and decoration. Validation runs before migration, so malformed legacy fields are never repaired into valid saves. Version 3 keeps all other version 2 fields and invariants; it reduces the introduction bounds to four cards. Exports always write version 3.

When gameplay expands, introduce a new envelope version and an explicit, tested migration from supported older versions. Keep old-version validators intact; do not silently reinterpret old fields. Unknown versions must continue to fail without changing live state.
