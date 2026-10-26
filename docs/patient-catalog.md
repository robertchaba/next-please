# Patient and occupation catalog

The client-side catalog in `src/core/patients.ts` contains 53 identities and 328 cases. Three original patients have one fixed case each; the next 25 identities retain four cases each; the latest 25 have nine cases each. A case combines an identity, employer, occupation, examination type, work pattern and findings. It is not an additional portrait. New portraits are `patient-26.png` through `patient-50.png`; their character IDs are 28–52.

## Stable records and saved paperwork

Patient case IDs are array indices and are append-only. IDs 0–102 preserve their existing employer, job, sex, measurements, findings and expected decision. The new profiles do not reinterpret those historical cases. IDs 103–302 supply the first eight variants of the newest identities. IDs 303–327 append a general-examination concern for each of those 25 identities. Existing cases retain their prior expected decisions; numeric vision and pressure values are deterministic representations consistent with their original pass/refer outcomes. A character's birth date, sex and portrait remain consistent across its cases; the latest identities also keep fixed measurements. Names, occupations, employers, duty descriptions, exposure descriptions and supplementary notes are localized in both dictionaries in `src/i18n.ts` and indexed by the saved case ID.

Birth dates agree with the portrait's intended age on 3 November 1983. The two 25-portrait batches retain the ages recorded in their original [first](art-economy-2026-10-25.md) and [second](art-patients-expansion-2026-10-25.md) generation records. The original three birth years were corrected on 26 October 2026 to match their middle-aged/middle-aged/older art direction: 1942-04-18 (41), 1937-11-06 (45), and 1925-08-23 (58). This user-requested demographic correction preserves case IDs and clinical findings; dates were never stored independently in saves. `patientAge` counts completed years from the birth date and a supplied civil date, including whether the birthday has occurred. The note header writes the age calculated for its saved `paper.day`, so a filed note never gains years merely because a later visit is open. Blank sheets remain blank. No host clock is consulted and no redundant age field is persisted.

Do not reorder or remove a case, character, occupation or employer already used by a save. Append records instead. If historical case facts must change, introduce a new case and an explicit versioned migration with evidence that stored findings and decisions remain meaningful.

## Occupations and requirements

There are 32 occupations and 20 employers. The new occupations include typesetting, watch repair, tailoring, baking, cooking, cleaning, gardening, postal delivery, electrical work, welding, furnace work, lathe operation, laboratory work, proofreading, bookbinding, laundry, boiler tending, railway track work, signalling, forklift operation, luggage handling, quality inspection, shift supervision and surveying assistance.

`JOBS` supplies stable IDs and machine-readable keys, a requirement profile, exposure tags, suitable employers and managerial responsibility. The 15 exposure tags describe paper/textile dust, noise, heights, traffic, oil, lifting, stress, fine detail, heat, chemicals, outdoor work, night work, standing and food work. Six work patterns describe daytime, early, shift, night, split and seasonal work. These are structured authoring data for future rules and story. Exposure tags and work patterns do not themselves impose hidden penalties or unlock unimplemented examinations.

The three implemented profiles use intentionally simplified fictional game rules:

| Referral code | Required examinations | Findings that affect the decision |
| --- | --- | --- |
| WC | General, vision, pressure, weight and height | General concerns, significant vision defect and pressure |
| W | General, vision, weight and height | General concerns and significant vision defect |
| C | General, pressure, weight and height | General concerns and pressure |

The codes are identical in both interface languages. Their meanings and the common requirement for general examination, weight and height are explained in the rulebook. Any general-examination concern requires refusal, regardless of occupation. No pilots or specialist consultations are currently implemented. A `refer` result in a required decision-making test yields `unfit`; all required results passing yields `fit`. Optional vision/pressure tests outside the profile do not change the decision. Body measurements are required documentation, without a numerical fitness threshold. Completing the required examinations is distinct from having made the correct decision; the doctor can still stamp and hand over a certificate early under the existing gameplay rules.

`decisionForFindings` derives the expected decision for a new case. `requiredExaminations` and `hasRequiredExaminations` expose the same profile to game transitions. Numeric vision uses left/right diopters; absolute values of at least 6 in either eye are significant. Numeric blood pressure requires refusal for relevant profiles at systolic 160 or diastolic 100. Values at systolic 180 or diastolic 110 are highlighted red. These tuning values are fictional game parameters, not clinical diagnostic criteria; changing them requires keeping case outcomes, save migration and both rulebooks consistent. Rendering reads the catalog and draws the localized profile code and recorded numeric findings; it does not assess cases or mutate state. Original cases retain the WC profile and their prior decisions.

Abnormal general examinations name one of 18 specific findings in both languages, rather than only stating that an abnormality exists. The findings include heart murmur, irregular pulse, wheezing, crackles at lung bases, lower-leg swelling, hand tremor, impaired balance, weak hand grip, restricted shoulder movement, left-leg weakness, reduced finger sensation, tenderness under the right ribs, enlarged liver, enlarged neck lymph nodes, breathlessness on light exertion, bluish lips, marked hoarseness and a swollen knee joint. All retain the existing unconditional refusal rule for every occupation; healthy results remain “bez uwag” / “no concerns”. `generalFindingIndex` derives the stable variant from the immutable abnormal case ID modulo the fixed `GENERAL_FINDING_COUNT` of 18. Keep this mapping and dictionary order stable when extending the catalog. `generalReading` supplies the localized text to notes and accessible examination descriptions. Repeating a test, filing a note, changing language or importing a save cannot reroll it; no new random draw or save field is required.

## Queue construction

`createRoster(seed)` uses the persisted unsigned pseudorandom sequence to shuffle every identity, including the original three, and initially selects one case from each identity's actual case group. Each identity appears once in the resulting 53-entry daily queue. The queue supports different numbers of cases per identity without encoding a fixed case-count assumption.

New queues cap unfit cases at **33%**, rounding down: at most **17 of 53 (32.08%)**. If the initial draw exceeds this limit, seeded draws select excess unfit slots and replace them with existing fit variants of the same characters. The two original patients with no fit variant retain their cases. No case facts, examination thresholds or expected decisions change. All 328 cases, including general-examination concerns, remain eligible for selection.

The limit also holds for every prefix: among the first `n` patients, at most `floor(33 * n / 100)` are unfit. When an unfit patient would exceed that limit, the next fit patient moves ahead of them; the remaining order is preserved. This protects the portion actually seen before admissions close, rather than only the full queue. In particular, the first three patients are fit, but their identities and cases remain random; exactly one in three would be 33.33%, exceeding the requested limit. The same input seed reproduces the final queue and updated random state. The legacy second argument remains accepted for call compatibility and does not reserve particular introductory identities.

Before this balance change, 218 of the 328 catalog cases were unfit (66.46%). The actual expected daily share was higher: **68.71%**, or 36.4167 of 53, calculated by summing each identity's unfit-case fraction because identities have different numbers of variants. A simulation of seeds 0–9999 produced 68.6953%. These are game-balance figures, not population health statistics.

The game creates a fresh seed for a new game, and its save contract persists the exact roster and random state. An imported historical queue remains intact until the next queue is created. The caller owns random seeding; no renderer accesses browser randomness.

## Adding content

1. Append the identity's name in both locale tables. Generate its portrait with the built-in image generator, retain its source and prompt, and prepare its runtime sprite using the project art workflow.
2. Append any new occupation and employer IDs; provide every visible field in both dictionaries. Keep occupations and names within the existing native document width.
3. Add cases with stable IDs, appropriate employer/job pairings, consistent identity fields, and an explicit requirement profile. Use `decisionForFindings` for the expected decision.
4. For a new implemented requirement, extend the shared profile data, examinations and save validation as needed; explain it in both rulebooks before enabling its consequences. Data-only future exposures must remain mechanically inactive until then.
5. Run the catalog, paperwork and font tests, then the project build and relevant gameplay/save/browser checks. The referral has at most ten wrapped lines at its native 166-pixel text width; the profile shares its existing managerial row so seals and signatures remain clear.

`tests/patients.test.ts` verifies catalog coverage, stable historical outcomes, compatible new employers, profile-dependent decisions and examinations, seeded replay, unique identities and the 33% cap for every queue prefix across 4098 seeds. The sampled queues also cover every existing case. Save tests preserve an old queue above the cap and verify that the next workday receives a balanced queue without changing import validation. `tests/paperwork.test.ts` and `tests/font.test.ts` check both dictionaries, Polish glyphs and native document/rulebook bounds.
