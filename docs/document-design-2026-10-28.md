# Document design revision — 2026-10-28

This replaces the rejected decorative-border proposal in 0.8.3. Referrals, certificates, specialist reports and opened letters now use the original plain cream paper. The former colored and ornamental sheets and tiny militia/LOT seals are absent from the runtime artwork manifest. Their source images and recipes remain an explicitly superseded production archive.

The font experiments were reverted at the user’s request to the exact original glyphs from `0732752^` (`def5d7f`). Current visual identity comes from **letterheads, numbered fields, ink impressions and wording**:

- An uppercase title identifies the document. Titles, body and metadata share the restored compact document alphabet.
- Uppercase institutional names identify the militia; the LOT mark uses the same original letters at integer 2×. Ordinary employers show their actual names as a compact typewritten letterhead.
- Numbered printed field labels are quieter than dark typewritten values. The referral formula states initial or periodic examination; employer, name, birth date, sex, job, supervision, examination requirements, work and exposures all remain visible.
- Generated transparent violet, round blue and aviation-office ink impressions carry localized readable words. Clear, unclear and missing seals keep their existing gameplay meanings.
- Clinical forms separate the institutional header, patient, requested test, result and scope note. Blue handwriting remains distinct from printed or typed text. The certificate keeps its blank identity fields until written, then its generated decision impression.
- Letters use institutional letterheads, a notice/circular title, addressee or subject, formal prose, signatory and stamp. Revised directives keep the established thresholds, exceptions and working-day rules.
- The rulebook uses native 1× provision numbers and one- or two-line headings, using the restored document alphabet throughout all seventeen spreads.

Both dictionaries contain every added visible word and accessible description. The simulated dates, record references and telephone controls are preserved. All assets and glyphs are local and original; no font download, new dependency, backend or runtime service was introduced. The country remains unspecified and no real official logo was copied.

## Implementation

`src/render/document-copy.ts` derives complete localized field rows from immutable patient data. `document-style.ts` composites letterheads and stamp artwork. `paperwork.ts` draws all forms on plain paper and supplies the full accessible descriptions. Drawing changes neither game state nor randomness.

The glyph tables and base drawing code in `font.ts` come from `0732752^`. `drawReadingText`/`measureReadingText` alias the original document renderer and measurement. Heading adapters use the same glyphs in uppercase with integer scaling; role names no longer select alternate alphabets. The document font has seven-row cells, five-pixel capitals, four-pixel lowercase, three-pixel spaces and eight-pixel multiline advance. Full sheets remain 212 × 176 with a 190-pixel body width. Referrals retain twelve-pixel field leading. Names, dates, references, words and gameplay content remain intact. Signature text occupies at most 100 pixels, leaving the 62 × 24 stamp area clear.

The new generated ink assets, untouched sources, exact prompts and reproducible nearest-neighbor/alpha-preserving preparation are recorded in [the stamp production record](art-stamps-revision-2026-10-28.md). Runtime files are `public/assets/art/stamps-revision/{employer,militia,lot}.png`. The militia source is 50 × 30, composited at 50 × 24 in the shared footer. The original generated plain sheet, signatures, decision impressions, ZUS/Medical Chamber/clinic marks, kraft envelope and book artwork are reused. All new raster generation used the built-in image generator, without a CLI/API fallback.

The existing additional-examination journal, note pagination, save v28 and newer civilian identities remain intact. This is a correction to release 0.8.3, not a new save schema.

## Earlier design previews

[Ordinary employer](paperwork-v083-employer-pl-screen.png) · [Militia](paperwork-v083-militia-pl-screen.png) · [LOT](paperwork-v083-lot-en-screen.png) · [Certificate](paperwork-v083-certificate-pl-screen.png) · [Additional report](paperwork-v083-additional-result-pl-screen.png) · [Correspondence](paperwork-revision-letter-pl-screen.png) · [Rulebook](manual-v083-pl-screen.png).

The earlier layout revision’s verification included glyph accents/metrics, the complete patient catalog in both languages, field retention, body/signature/stamp bounds, seal accessibility, additional results, keyboard/mouse handling and browser visual inspection. The production build and all 474 Vitest tests passed. The 51 relevant Playwright scenarios passed, including revised paper/book geometry, mouse and keyboard handling, touch placement, telephone controls, additional results, pagination and PL/EN visual previews. Obsolete dimension assertions were updated to the larger reading footprints.

## Font rollback and retained layout corrections

The enlarged, cursive, serif and condensed font experiments are superseded. Both original alphabets—title screen and compact mixed-case document text—now match the version immediately before `0732752`, including every Polish diacritic, glyph width and inter-character gap. Printed and handwritten roles share the original upright document glyphs, with blue ink distinguishing the doctor’s entries. The mobile note also remains upright.

Layout fixes remain: referral labels and values share a size and baseline; notes use nine body rows at fourteen-pixel leading and retain all entries through pagination. The rulebook keeps 22-pixel outer margins, 14-pixel binding margins, 114-pixel columns and centered footers above the ornament. Full text remains available in both languages. Existing paper, binding, seals, signatures, controls, game state and save v28 remain intact.

The [current rulebook preview](typography-manual-2026-10-28.png) shows the restored font and retained layout fixes.

Rollback verification: rendered glyph pixels and widths match `0732752^` for the original title font, every document role, reading text and uppercase headings, including Polish accents. The production build, all 474 Vitest tests and 24 relevant Playwright scenarios passed. The rulebook was inspected at native 1×, 2× and 3× display scales.


## Unified clinical documents

Referrals, certificates, specialist certificates and patient notes now share a 176 × 157 native-pixel format. Its width is the retained intermediate clinical width; its height is halfway between the previous 168-pixel referral and 146-pixel clinical forms. Correspondence, supplementary-test forms/reports and inspection documents remain 200 × 168. Existing generated artwork is composited at these sizes with nearest-neighbor sampling; no font scaling or new artwork is used.

Referrals reflow all six numbered fields within 154 pixels, with ten-pixel row spacing and eight rows at most, above the signature, seal and telephone. Certificate fields use an inline job position and a wrapped decision statement, with a 98 × 27 generated decision impression anchored directly below the last line of the statement, rather than to the bottom of the sheet. Notes keep identity and age, followed by eight rows at fourteen-pixel spacing in a 154-pixel column. Additional entries continue through the existing page corners. The renderer, controls, accessible descriptions and controller use matching dimensions and pagination.

Attaching a second sheet has a twelve-pixel tolerance around the existing clip (34 × 43 target); empty-handed unclipping retains the 10 × 19 sprite bounds. A medical note lies aligned above its equally sized referral, regardless of joining order, without deliberately exposing the lower sheet. Both move, cancel, file and return together. Temporary per-item sizes are derived from paper kinds after import; all contents and save v28 remain unchanged.
