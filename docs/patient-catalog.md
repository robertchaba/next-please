# Patient and occupation catalog

The client-side catalog in `src/core/patients.ts` contains 53 identities and 303 cases. Three original patients have one fixed case each; the next 25 identities retain four cases each; the latest 25 have eight cases each. A case combines an identity, employer, occupation, examination type, work pattern and findings. It is not an additional portrait. New portraits are `patient-26.png` through `patient-50.png`; their character IDs are 28–52.

## Stable records and saved paperwork

Patient case IDs are array indices and are append-only. IDs 0–102 preserve their existing employer, job, demographic details, measurements, findings and expected decision. The new profiles do not reinterpret those historical cases. New cases occupy IDs 103–302. A character's birth date, sex and portrait remain consistent across its cases; the latest identities also keep fixed measurements. Names, occupations, employers, duty descriptions, exposure descriptions and supplementary notes are localized in both dictionaries in `src/i18n.ts` and indexed by the saved case ID.

Do not reorder or remove a case, character, occupation or employer already used by a save. Append records instead. If historical case facts must change, introduce a new case and an explicit versioned migration with evidence that stored findings and decisions remain meaningful.

## Occupations and requirements

There are 32 occupations and 20 employers. The new occupations include typesetting, watch repair, tailoring, baking, cooking, cleaning, gardening, postal delivery, electrical work, welding, furnace work, lathe operation, laboratory work, proofreading, bookbinding, laundry, boiler tending, railway track work, signalling, forklift operation, luggage handling, quality inspection, shift supervision and surveying assistance.

`JOBS` supplies stable IDs and machine-readable keys, a requirement profile, exposure tags, suitable employers and managerial responsibility. The 15 exposure tags describe paper/textile dust, noise, heights, traffic, oil, lifting, stress, fine detail, heat, chemicals, outdoor work, night work, standing and food work. Six work patterns describe daytime, early, shift, night, split and seasonal work. These are structured authoring data for future rules and story. Exposure tags and work patterns do not themselves impose hidden penalties or unlock unimplemented examinations.

The three implemented profiles are intentionally fictional game rules, without medical thresholds:

| Referral code | Required examinations | Findings that affect the decision |
| --- | --- | --- |
| WC | Vision, pressure, weight and height | Vision and pressure |
| W | Vision, weight and height | Vision |
| C | Pressure, weight and height | Pressure |

The codes are identical in both interface languages. Their meanings and the common requirement to record weight and height are explained in the rulebook. A `refer` result in a required decision-making test yields `unfit`; all required results passing yields `fit`. An optional test outside the profile does not change the decision. Body measurements are required documentation, without a numerical fitness threshold. Completing the required examinations is distinct from having made the correct decision; the doctor can still stamp and hand over a certificate early under the existing gameplay rules.

`decisionForFindings` derives the expected decision for a new case. `requiredExaminations` and `hasRequiredExaminations` expose the same profile to game transitions. Rendering reads the catalog and draws the localized profile code; it does not assess cases or mutate state. Original cases retain the WC profile and their prior decisions.

## Queue construction

`createRoster(seed)` uses the persisted unsigned pseudorandom sequence to shuffle every identity, including the original three. Each identity appears once in the resulting 53-entry daily queue; one of that identity's cases is selected from its actual case group. The queue therefore supports different numbers of cases per identity without encoding a fixed case-count assumption. The same input seed reproduces the same order and selected variants. The legacy second argument remains accepted for call compatibility, but no longer reserves a tutorial prefix.

The game creates a fresh seed for a new game, and its save contract persists the exact roster and random state. An imported historical queue remains intact until the next queue is created. The caller owns random seeding; no renderer accesses browser randomness.

## Adding content

1. Append the identity's name in both locale tables. Generate its portrait with the built-in image generator, retain its source and prompt, and prepare its runtime sprite using the project art workflow.
2. Append any new occupation and employer IDs; provide every visible field in both dictionaries. Keep occupations and names within the existing native document width.
3. Add cases with stable IDs, appropriate employer/job pairings, consistent identity fields, and an explicit requirement profile. Use `decisionForFindings` for the expected decision.
4. For a new implemented requirement, extend the shared profile data, examinations and save validation as needed; explain it in both rulebooks before enabling its consequences. Data-only future exposures must remain mechanically inactive until then.
5. Run the catalog, paperwork and font tests, then the project build and relevant gameplay/save/browser checks. The referral has at most ten wrapped lines at its native 166-pixel text width; the profile shares its existing managerial row so seals and signatures remain clear.

`tests/patients.test.ts` verifies catalog coverage, stable historical outcomes, compatible new employers, profile-dependent decisions and examinations, seeded replay and full-identity shuffling. `tests/paperwork.test.ts` and `tests/font.test.ts` check both dictionaries, Polish glyphs and native document/rulebook bounds.
