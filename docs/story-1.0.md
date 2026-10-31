# First chapter — version 1.0

The chapter is based on the accepted [Polish narrative specification](../external-docs/next-please-specyfikacja-fabuly-codex.md). [FACTS.md](../FACTS.md) records agreed world facts; [technical guidelines](technical-guidelines.md), [save format](save-format.md) and [art direction](art-direction.md) define the implementation contracts. This document summarizes the released chapter and its boundaries. The place remains unnamed, and whether the country is fictional remains undecided.

## Playing the chapter

A new game begins on 3 November 1983. Eighteen possible appointments involving ten recurring people appear among ordinary patients over the first 26 working days. Papers arrive on the exchange shelf or with the morning correspondence. Carry each sheet onto the right desk to read it; longer texts have page corners. Newspapers can be unfolded, read, filed in either drawer and retrieved without changing their contents.

The choices are the existing approval and refusal stamps, committed when the doctor hands back a completed certificate. Reading documents, checking findings and calling printed numbers supply context. There are no additional dialogue choices, visible faction meters or score notifications. Both Polish and English include the entire chapter. Existing formal duties, clinical judgements, insurance, fines and household costs continue to apply.

Extra story papers can be kept or discarded without a new filing penalty. Referrals and medical notes still require archiving. The printer's supplied audiometry remains a clinical report: approval requires handing it back attached to the certificate under the established additional-examination rule. A story document that resembles a certificate does not become a stampable blank.

The regional daily and the union weekly offer different accounts of the same events. Published facts depend on completed earlier appointments. An unfinished visit does not count as a refusal. Later appointments may disappear when an earlier condition is unmet; a real medical return can still finish its clinical business without rewriting a missed narrative appointment.

## Fixed cast and appointment windows

`W` denotes a working day; `K` is the saved calendar-day number, with K1 on 3 November. Weekend days count toward K but not W. Names below are Polish; the English dictionary uses consistent adapted names for the same identities.

| Visit | W | K | Person and role | Appointment condition |
| --- | ---: | ---: | --- | --- |
| A1 | 2 | 2 | Roman Kurek, maintenance worker | Always |
| A2 | 5 | 7 | Kurek, another employer | A1 approved |
| B1 | 5 | 7 | Stefan Wolszak, union organizer | Always |
| A3 | 8 | 12 | Kurek, another employer | A2 approved |
| C1 | 8 | 12 | Jerzy Borkowski, offset printer | Always |
| J1 | 10 | 14 | Henryk Malec, sports manager | Always |
| A4 | 11 | 15 | Kurek, forged Chamber opinion | A3 approved |
| E1-VISIT | 12 | 16 | Marek Czarnecki, militia sergeant | Always |
| A5 | 14 | 20 | Kurek, another employer | A4 approved |
| D1 | 15 | 21 | Antoni Rybak, heat dispatcher | Always |
| G1 | 17 | 23 | Tadeusz Karski, delegated crane operator | Always |
| C2 | 18 | 26 | Borkowski, control examination | C1 approved |
| H1 | 18 | 26 | Edward Król, storekeeper and forklift operator | Always |
| J2 | 19 | 27 | Malec, provincial promotion | J1 approved |
| A6 | 20 | 28 | Kurek, unequivocal hypertension | A5 approved |
| F1 | 21 | 29 | Zofia Witek, newspaper proofreader | Always |
| I1 | 21 | 29 | Andrzej Lis under the name Jan Sikora | Always |
| A7 | 24 | 34 | Kurek, final request | A6 approved and its warning actually delivered |

Scheduled visits normally reserve the first and third ordinary slots. If one does not qualify, the remaining appointment uses the first slot. Actual additional-examination returns and inspectors retain their existing priority. Ordinary random generation cannot select the ten story portraits. The existing second-patient bribe on W6 remains in place.

The organizer uses **Stefan Wolszak** rather than the specification's provisional Wolski because the existing ordinary cast already contains Stefan Wolski. This follows the specification's requirement to avoid identity collisions. The crane operator similarly uses **Tadeusz Karski / Theodore Ireland** because Tadeusz Kania / Theodore Kite already identifies an ordinary patient. Other fixed identities remain distinct, including the deliberate Lis/Sikora discrepancy within one person's papers.

## Publications and contacts

The **Kurier Obywatelski / Civic Courier** remains the regional daily introduced by the clinic foundation. Its background article and classified catalogs retain their stable IDs and independent random sequence. Authored story reports replace background slots, keeping each issue to three or four articles. The guaranteed W6 printing-house advertisement similarly replaces an ordinary ad and keeps at least three ads on that page. It does not change the chance of advertising in unrelated issues.

The **Głos Wzajemności / Voice of Mutuality** is a separate dated object. Approval of C1 starts it on W9/K13; refusal or a missed C1 starts it on W14/K20. Thereafter it appears every seven calendar days. Refusing C2 skips only W19/K27, and publication resumes on W24/K34. Missing C2 does not create the refusal's interruption.

Each weekly has at most four articles. Its opening note occupies one slot in the first issue, and recurring background pieces bring small issues to at least three articles. Eligible unprinted comments are ordered by explicit priority, then availability date and ID; excess material remains queued. Reports about the proofreader take precedence over lower-priority earlier events. A morning weekly cannot know the daily printed beside it, so the W19 question mark cannot generate a W19 weekly response.

Only **K-J-CHIEF**, the W24 Malec promotion report, includes a photograph. The W29 **K-J-DIRECTOR** consequence can appear after continuation, without a photograph. Both publications preserve their own title, day, issue number and content in drawers and saves; discarding a copy does not erase its publication.

| Contact | Printed number | Source |
| --- | --- | --- |
| Printing-house porter | 46-0101 | W6 classified |
| Medical Chamber | 46-0102 | Genuine organizer's opinion and Kurek's forged opinion |
| Heating-plant duty office | 46-0103 | Dispatcher’s party letter |
| Warehouse personnel | 46-0104 | Storekeeper’s current referral |
| Municipal sports office | 46-0105 | Malec’s recommendation |

These contacts return case-specific answers without consuming random choices or changing political scores. Calls cost the existing three minutes. A conclusion is recorded once for the relevant case, including when its paperwork is retrieved later. The classified contact remains callable from a retained issue. Ordinary classified numbers retain their random generic replies. Every required clue also appears in the documents.

## Decisions, warnings and outcomes

Political trust and suspicion are derived from the ordered completed-decision ledger. Party and union trust each clamp to −30…30 after every event; suspicion clamps to 0…30. Documented misconduct, conscious assistance and changes of judgement under unchanged conditions are derived from their specified cases. The [source matrix](../external-docs/next-please-specyfikacja-fabuly-codex.md#43-pełna-macierz-decyzji) is the authoritative list of deltas and evidence categories. These internal values never appear in ordinary play.

Warnings are physical receipts, not assumed future events. The audit warning follows three documented violations, the security warning follows suspicion reaching nine, and the consistency warning follows the first qualifying reversal. Approving A6 schedules the separate warning required for A7. Each warning records its delivery day, sequence and paper instance, and quotes actual source decisions. An ending requiring a further decision after a warning cannot use an earlier decision or merely a scheduled letter. Discarding a delivered warning does not undo its receipt.

| Outcome | Resolution | Next action |
| --- | --- | --- |
| Existing assault/hospital ending | Existing mechanical rule; highest priority | Menu/new game |
| Existing bankruptcy ending | Existing settlement rule | Menu/new game |
| E1 — Spalona pieczątka | Exposure on the morning of W26 after the warned final approval | Menu/new game |
| E2 — Gabinet zamknięty | Qualifying repeated violations or inconsistency after the relevant warning | Menu/new game |
| E3 — Do wyjaśnienia | Qualifying suspicion and conscious assistance after the security warning | Menu/new game |
| E4 — Pod opieką Komitetu | Party trust at least 10 and at least 8 above union trust | Continue work or menu |
| E5 — Nasz lekarz | Union trust at least 10 and at least 8 above party trust | Continue work or menu |
| E6 — Jutro zwykły dyżur | Remaining nonterminal paths | Continue work or menu |

After mechanical endings, narrative outcomes resolve in the table's order. Except morning exposure, the chapter resolves after the normal W26 settlement. An ending has its own generated illustration, complete localized text and relevant readable final documents. Reopening or importing the epilogue does not repeat wages, decisions, warnings or publication.

Continuation advances to W27/K37, 9 December 1983. Money, insurance, patients, papers, drawers, rules and pending examinations remain. The completed story chains stay closed. The weekly may continue, queued comments remain available, and the prepared W29 promotion consequence can still appear.

## Persistence and ownership

Save v35 adds the validated chapter state and narrative paper/copy metadata. `story.ts` owns scoring, encounter status, warning delivery and outcomes; `story-patients.ts` owns the fixed clinical cases; `story-content.ts` owns document definitions, snapshots and contact rules; `story-publications.ts` owns dated selection and the weekly queue. `story-integration.ts` connects these pure helpers to existing patient completion, morning delivery and settlement. Renderers wrap and display saved facts without generating them.

Versions 1–34 retain their original validators before migration. They import with the story disabled rather than inventing missing decisions, publications or warnings. A fresh game starts an active chapter. No gameplay progress is stored in `localStorage`; players continue to export and import `.npsave` files explicitly.

The ordinary catalog remains 188 portraits and 940 authored alternative identities. Eighteen appended story cases use ten further fixed identities, for 198 portraits and 6,211 clinical cases in the full catalog. Existing case IDs stay unchanged. The story adds eleven job definitions and seventeen employers, bringing the full tables to 59 jobs and 44 employers.

## Verification and assets

Focused Vitest suites cover the story domain, fixed patients, complete bilingual content, publication causality, save validation and game integration. Ordinary-mechanics fixtures disable the chapter explicitly while retaining the current full random roster. Browser story scenarios use active production initialization and the real interface. Run the checks through the repository's existing commands:

```sh
npm test
npm run build
npm run test:browser
```

Release verification for 1.0.0:

- `npm run build` passed with strict TypeScript and the static production build.
- `npm test -- --maxWorkers=4` passed: 603 tests in 50 files. This includes all 9,216 domain decision combinations and seven complete routes through actual cabinet actions, with save round-trips at every checkpoint.
- The full Playwright run covered 211 scenarios: 208 passed initially; three stale assertions for the version, translated names and full newspaper title were corrected. A subsequent focused run of the story, newspaper, patient-expansion and welcome suites passed all 37 scenarios, including those three regressions. The final story rerun after the cast-name audit passed all 19 scenarios.
- Reviewed PL/EN screenshots of all six epilogues, final documents, the two newspapers, printer advertisement, telephone exemption, party card, full warehouse referral and conflicting identities, including the 570 × 320 view. Checked pagination, pointer targets and keyboard controls.

These checks also cover immutable saved copies, warning timing, rejected imports preserving the live game, overnight clinical returns, legacy migration and continuation without duplicate settlement. The existing audio chunk still produces Vite's advisory size warning; the build succeeds and all assets remain local.

Generated portrait, document, publication and ending sources are retained under `public/assets/art/story-source/`; prepared surfaces are under `public/assets/art/story/`, with portraits in `public/assets/art/sprites/`. Prompts and preparation records live under `docs/art-prompts/story/` and `scripts/prepare-story-art.mjs`. The supplied union logo reference remains in `external-docs/`; ordinary papers and clothing use its approved plain red W/M mark. See the [art direction](art-direction.md) for the detailed manifest, provenance and presentation constraints.

Created by **[Robert Chaba](https://github.com/robertchaba)**.
