# Release numbers and codenames

The displayed game version comes directly from `package.json`. Keep the root package version in `package-lock.json` synchronized when releasing; no separate interface version needs editing. This release number is independent of the gameplay save-format version.

`src/core/release.ts` supplies `releaseLabel(locale)` for the title screen and its accessible description. Its Polish and English templates and codename lists live in `src/i18n.ts`. Version **0.8.8** is **ARCHIWUM / ARCHIVE**; **0.8.7** retains **REJESTRACJA / RECEPTION**; **0.8.6** retains **PARAFKA / INITIALS**; **0.8.5** retains **ODPIS / DUPLICATE**; **0.8.4** retains **TECZKA / FOLDER**; **0.8.3** retains **KOLEJKA / QUEUE**; **0.8.2** retains **PIECZĄTKA / STAMP**; **0.8.1** retains **KALKA / CARBON COPY**; **0.8.0** retains **PAPIEROLOGIA / PAPERWORK**.

For every character of the complete version string, calculate a polynomial hash:

```text
h₀ = 0
hᵢ₊₁ = (31 × hᵢ + ASCII(characterᵢ)) mod 17
codename = dictionary[hfinal]
```

The final zero-based index selects one of 17 clinic and paperwork names. All version characters participate, including major, minor, patch, prerelease identifiers and build metadata. The same full version always receives the same name, independently of date, random state, locale or device. Locales translate the selected name rather than choosing another one. The finite list deliberately allows names to recur; it is not a unique release identifier.

Keep the modulus, multiplier and list order stable so existing releases retain their names. The fixed order is:

| Index | Polish | English |
| --- | --- | --- |
| 0 | PAPIEROLOGIA | PAPERWORK |
| 1 | KALKA | CARBON COPY |
| 2 | PIECZĄTKA | STAMP |
| 3 | KOLEJKA | QUEUE |
| 4 | TECZKA | FOLDER |
| 5 | ODPIS | DUPLICATE |
| 6 | PARAFKA | INITIALS |
| 7 | REJESTRACJA | RECEPTION |
| 8 | ARCHIWUM | ARCHIVE |
| 9 | BIBUŁA | BLOTTER |
| 10 | FORMALNOŚĆ | FORMALITY |
| 11 | SPINACZ | PAPERCLIP |
| 12 | KARTOTEKA | CARD INDEX |
| 13 | BRUDNOPIS | ROUGH DRAFT |
| 14 | NUMEREK | QUEUE TICKET |
| 15 | DZIURKACZ | HOLE PUNCH |
| 16 | POCZEKALNIA | WAITING ROOM |

The footer uses the existing original bitmap font at 1×. Tests lock the release examples, verify that all version components participate and check every localized codename against the footer's available width.
