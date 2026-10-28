# Document design revision — 2026-10-28

This replaces the rejected decorative-border proposal in 0.8.3. Referrals, certificates, specialist reports and opened letters now use the original plain cream paper. The former colored and ornamental sheets and tiny militia/LOT seals are absent from the runtime artwork manifest. Their source images and recipes remain an explicitly superseded production archive.

The revision puts visual identity in **letterheads, real typographic hierarchy, readable ink impressions and wording**:

- A large original serif title identifies the document. Nine-row capitals contrast with seven-row form text.
- Narrow original sans capitals identify the militia; a larger LOT wordmark identifies aviation personnel. Ordinary employers show their actual names as a compact typewritten letterhead.
- Numbered printed field labels are quieter than dark typewritten values. The referral formula states initial or periodic examination; employer, name, birth date, sex, job, supervision, examination requirements, work and exposures all remain visible.
- Generated transparent violet, round blue and aviation-office ink impressions carry localized readable words. Clear, unclear and missing seals keep their existing gameplay meanings.
- Clinical forms separate the institutional header, patient, requested test, result and scope note. Blue handwriting remains distinct from printed or typed text. The certificate keeps its blank identity fields until written, then its generated decision impression.
- Letters use institutional letterheads, a notice/circular title, addressee or subject, formal prose, signatory and stamp. Revised directives keep the established thresholds, exceptions and working-day rules.
- The rulebook uses large provision numbers and one- or two-line condensed headings. Ordinary paragraphs use the compact print face; numeric rules use the typewriter face.

Both dictionaries contain every added visible word and accessible description. The simulated dates, record references and telephone controls are preserved. All assets and glyphs are local and original; no font download, new dependency, backend or runtime service was introduced. The country remains unspecified and no real official logo was copied.

## Implementation

`src/render/document-copy.ts` derives complete localized field rows from immutable patient data. `document-style.ts` composites letterheads and stamp artwork. `paperwork.ts` draws all forms on plain paper and supplies the full accessible descriptions. Drawing changes neither game state nor randomness.

`drawDocumentHeading` and `measureDocumentHeading` in `font.ts` expose serif and sans faces with nine-row cells, Polish accents and integer scaling. Their metrics are distinct from the existing seven-row document faces. All body wrapping uses native pixel measurements. Referrals fit at most nine body rows (including their instruction); directives fit six, ordinary letters five. Signature text occupies at most 100 pixels, leaving the 62 × 24 stamp area clear.

The new generated ink assets, untouched sources, exact prompts and reproducible nearest-neighbor/alpha-preserving preparation are recorded in [the stamp production record](art-stamps-revision-2026-10-28.md). Runtime files are `public/assets/art/stamps-revision/{employer,militia,lot}.png`. The militia source is 50 × 30, composited at 50 × 24 in the shared footer. The original generated plain sheet, signatures, decision impressions, ZUS/Medical Chamber/clinic marks, kraft envelope and book artwork are reused. All new raster generation used the built-in image generator, without a CLI/API fallback.

The existing additional-examination journal, note pagination, save v28 and newer civilian identities remain intact. This is a correction to release 0.8.3, not a new save schema.

## Verified previews

[Ordinary employer](paperwork-v083-employer-pl-screen.png) · [Militia](paperwork-v083-militia-pl-screen.png) · [LOT](paperwork-v083-lot-en-screen.png) · [Certificate](paperwork-v083-certificate-pl-screen.png) · [Additional report](paperwork-v083-additional-result-pl-screen.png) · [Correspondence](paperwork-revision-letter-pl-screen.png) · [Rulebook](manual-v083-pl-screen.png).

Verification includes glyph accents/metrics, the complete patient catalog in both languages, field retention, body/signature/stamp bounds, seal accessibility, additional results, keyboard/mouse handling and browser visual inspection. The production build and all 469 Vitest tests passed. The 31 relevant Playwright scenarios passed after updating three obsolete wording assertions; all three directive scenarios were also rerun successfully after the final accessible-description punctuation correction.
