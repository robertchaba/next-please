# Portable save format

Saves are local `.npsave` files containing a single gzip member with UTF-8 JSON. They are neither encrypted nor uploaded. Export uses `next-please-day-N.npsave`; import identifies the bytes rather than trusting the filename or MIME type.

The version 1 envelope is:

```json
{
  "game": "next-please",
  "version": 1,
  "savedAt": "2026-10-23T12:00:00.000Z",
  "state": {
    "day": 1,
    "money": 0,
    "patientsProcessed": 0
  }
}
```

The current state is deliberately small scaffolding for future gameplay. Money is an integer game currency amount; negative balances are allowed. Day is an integer from 1 to 1,000,000, money from −1,000,000,000 to 1,000,000,000, and patients processed from 0 to 1,000,000,000. These are format guardrails, not gameplay rules. Locale and audio preferences belong to local settings, not to a player's progress.

`src/core/save.ts` exposes `createInitialState()`, `encodeSave(state)`, `decodeSave(bytes)`, `downloadSave(state)`, and asynchronous `importSave(file)`. Download must run from a user action. Import returns validated state; the caller should replace its live state only after that promise succeeds. No progress is automatically persisted by these functions.

Imports allow at most 1 MiB compressed and 2 MiB expanded. The streaming decoder checks actual expanded size even if the gzip trailer lies. It checks gzip headers, CRC32, length, UTF-8, the envelope, exact state fields, safe integer bounds, and a canonical ISO timestamp. Multiple gzip members are rejected. CRC32 catches accidental corruption; it is not an authenticity or anti-cheat mechanism.

Stable `SaveError.code` values for localized messages:

| Code | Meaning |
| --- | --- |
| `file-too-large` | Compressed or expanded size exceeds its limit. |
| `invalid-file` | Invalid gzip, checksum, JSON, envelope, or timestamp. |
| `unsupported-version` | Valid game identifier, but an unsupported integer format version. |
| `invalid-state` | Missing, extra, mistyped, or out-of-range state fields. |
| `read-failed` | The browser could not read the selected file. |

When gameplay expands, introduce a new envelope version and an explicit, tested migration from supported older versions. Keep old-version validators intact; do not silently reinterpret old fields. Unknown versions must continue to fail without changing live state.
