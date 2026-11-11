# Next, Please! development log

**Next, Please!** grew from a three-patient clinic prototype into a browser game about medical judgement, paperwork, money and political pressure. You examine workers, inspect their documents and decide whether to stamp their fitness-for-work certificates. The story begins on 3 November 1983 in an unnamed country.

Created by **[Robert Chaba](https://github.com/robertchaba)**. [Play the game](https://robertchaba.github.io/next-please/) on a computer with a keyboard and mouse or trackpad.

This retrospective follows the repository's commits from **23 October to 11 November 2026**, through **version 1.0.12**. Dates below are development dates, separate from the game's calendar. Each stage links to the changes that introduced or revised it.

## AI use

**All original project code was generated using OpenAI Codex under Robert Chaba's direction.** Robert confirmed this account of the development process on 11 November 2026. The attribution concerns the code written for this project; dependencies retain their own authorship.

The development history records repeated implementation and revision: adding a playable procedure, checking its consequences, refining the interface, and extending saves and tests as new systems arrived. The [README committed on 25 October](https://github.com/robertchaba/next-please/blob/1affc8d/README.md) already credited Codex and OpenAI models for programming, alongside Robert Chaba.

The artwork and music have their own retained production records:

- **OpenAI image generation:** clinic illustrations, patient portraits and illustrated props were generated for the project. The [early clinic artwork record](art-generation-2026-10-24.md) preserves exact prompts, source images and preparation recipes. The [story artwork record](art-story-1.0.md) links all 33 retained source images, individual prompts, and generation and preparation manifests for the first chapter.
- **Suno:** the soundtrack was generated with Suno. The [music provenance notes](../public/assets/audio/music/README.md) and [soundtrack manifest](soundtrack-metadata.json) retain generation information and individual source URLs. Sound effects use a separate [local synthesis script](../scripts/generate-effects.mjs).

AI was used during development and asset production. Playing the game does not require an AI account, API key or live generative-AI service.

## 23–24 October 2026: a playable clinic

The [first prototype](https://github.com/robertchaba/next-please/commit/4a77b36) established the 570 × 320 Canvas 2D viewport, original pixel lettering, Polish and English controls, audio preferences and creator credits. Later that day, [version 0.2](https://github.com/robertchaba/next-please/commit/4038737) introduced a playable three-patient shift: ring the bell, inspect a referral, perform checks, stamp a decision and finish the visit. The initial clock advanced through actions, and correct decisions earned points.

The next day's [artwork integration](https://github.com/robertchaba/next-please/commit/a817f3d) and [engine refinements](https://github.com/robertchaba/next-please/commit/59e88a4) developed the consulting room, patient movement and physical desk interactions. The retained artwork requests show how the dim corridor, worn surfaces and compact mechanical stamps were revised to remain readable at the game's small native resolution.

## 25–26 October 2026: paperwork becomes a working day

[Version 0.5](https://github.com/robertchaba/next-please/commit/f71be2e) separated employer referrals, medical notes and fitness certificates. Blank forms came from the document rack; paperclips joined papers; a drawer and wastebasket gave documents somewhere to go. Incorrect decisions could bring correspondence from an employer or the social-insurance institution. The stamp now belonged to a larger procedure with records and consequences.

The [mobile reception](https://github.com/robertchaba/next-please/commit/c1d0127) became a telephone vignette directing players to a computer. The [daily-life expansion](https://github.com/robertchaba/next-please/commit/1affc8d) added home scenes, household spending and weekends. [Continuous time](https://github.com/robertchaba/next-please/commit/3200c37) made reading and organizing papers consume part of the working day even between actions.

[Version 0.8](https://github.com/robertchaba/next-please/commit/78ea3aa) introduced duties that arrived over successive working days: checking dates, verifying seals, consulting specialists by telephone and dealing with bribes. A separate [bankruptcy ending](https://github.com/robertchaba/next-please/commit/4804bc7) made household finances part of the risk of continuing to practise.

## 27 October 2026: referrals and records have consequences

The [additional-examination update](https://github.com/robertchaba/next-please/commit/03aa948) introduced specialist tests and more occupations, including uniformed patients. Sending someone away for a test created an unfinished case that could return later. A [follow-up change](https://github.com/robertchaba/next-please/commit/6581b62) required the appropriate examination report to be clipped to an approval certificate.

[Records inspections](https://github.com/robertchaba/next-please/commit/8bf3d50) made the archive matter across working days. An inspector could request a particular patient's referral and medical note, with a fine for missing records. The same period included [weekend and bribe-accounting corrections](https://github.com/robertchaba/next-please/commit/0c23e84): money needed to be settled consistently when a visit or weekend crossed several stages.

## 28–30 October 2026: making the growing game readable

[Version 0.8.3](https://github.com/robertchaba/next-please/commit/0732752) improved paperwork and preserved additional-test findings in medical notes after the separate report left the desk. Document typography then went through several revisions: [larger type](https://github.com/robertchaba/next-please/commit/ab3ae54) was followed by [restoring the original compact font](https://github.com/robertchaba/next-please/commit/ab09e27) and [aligning rulebook numbers to the native pixel grid](https://github.com/robertchaba/next-please/commit/ff7ddc7).

A [beginner's guide](https://github.com/robertchaba/next-please/commit/6c4761d) explained carrying objects, completing a first appointment, filing records and saving progress. [Version 0.8.4](https://github.com/robertchaba/next-please/commit/b29cbee) expanded the ordinary cast to 188 portraits with 940 identities and tracked previously seen faces across days. [Seasonal weekend scenes](https://github.com/robertchaba/next-please/commit/c032a7f) made outings follow the calendar and prevented two resort trips in the same weekend.

## 31 October 2026: judgement and the world outside

[Version 0.8.5](https://github.com/robertchaba/next-please/commit/b812379) introduced discretionary medical decisions. Borderline findings and equivocal specialist reports could leave the final decision to the doctor, while clear contraindications and document duties still applied. [Version 0.8.6](https://github.com/robertchaba/next-please/commit/a9cbb3b) added a second independent drawer for the growing collection of records and objects.

[Version 0.8.7](https://github.com/robertchaba/next-please/commit/917daea) brought a daily newspaper and earlier morning arrivals. Newspapers became dated objects that could be read, kept, retrieved and discarded. [Version 0.8.8](https://github.com/robertchaba/next-please/commit/6426f9b) expanded the article catalog and made classified telephone calls available from the first working day. An [editorial audit](https://github.com/robertchaba/next-please/commit/b527174) revised the newspaper copy, while [English localization work](https://github.com/robertchaba/next-please/commit/0a7af43) adapted names and institutions consistently without assigning the setting a country.

## 1 November 2026: the first story chapter

[Version 1.0](https://github.com/robertchaba/next-please/commit/720cd78) connected the clinic simulation to a political story spanning 26 working days. Ten recurring characters brought eighteen possible scheduled visits. Their cases linked medical decisions to employment, official scrutiny, the opposition union and competing accounts in the press.

The chapter kept decisions inside the existing examination and paperwork process. Consequences appeared through later visits, letters and newspapers. Six narrative outcomes joined the existing hospital and bankruptcy endings; three chapter outcomes allowed work to continue. The [chapter documentation](story-1.0.md) records the implementation and contains story spoilers.

The releases that followed corrected [GitHub Pages publication](https://github.com/robertchaba/next-please/commit/5df4e45), supplied [dedicated ending art and music](https://github.com/robertchaba/next-please/commit/ae6ea5f), expanded [story newspaper articles](https://github.com/robertchaba/next-please/commit/e2567bf), and refined [identity-card handoffs and archive ordering](https://github.com/robertchaba/next-please/commit/6f28e01). Further work clarified [complaint letters](https://github.com/robertchaba/next-please/commit/b984445) and revised [patient portraits and identities](https://github.com/robertchaba/next-please/commit/0dad433).

## 2 November 2026: revising life after work

[Version 1.0.9](https://github.com/robertchaba/next-please/commit/1cc8ce3) expanded home and budget scenes. The next revision tried [minimal notebook illustrations](https://github.com/robertchaba/next-please/commit/3883eff). [Version 1.0.11](https://github.com/robertchaba/next-please/commit/295cc23) replaced the repeated notebook variations with distinct subjects: a used notebook, period cash, a savings book and a clasp purse. The [artwork record](art-budget-objects-2026-11-02.md) retains the selected scenes, prompts and reference material.

## 11 November 2026: version 1.0.12 distribution

[Version 1.0.12](https://github.com/robertchaba/next-please/commit/5e7234c) prepared the game for distribution with English screenshots and browser-language selection. English became the fallback; the first supported language in the browser's preference list selects English or Polish unless the player has saved a choice. The supplied screenshots show version 1.0.11. Gameplay and save format v36 stayed unchanged.

## Technical foundation and verification

The game uses **TypeScript, HTML5 Canvas 2D and Vite**, with **Howler.js** for local audio and **fflate** for compressed saves. It runs in the browser and is published as static files on GitHub Pages. The logical viewport remains 570 × 320 with nearest-neighbor rendering and whole-number scaling whenever at least 1× fits.

Gameplay state is separate from rendering. English and Polish share the same mechanics. Preferences use browser storage, while gameplay progress travels through validated, versioned `.npsave` imports and exports. These contracts are documented in the [technical guidelines](technical-guidelines.md), [localization guide](localization.md) and [save format](save-format.md).

The repository includes [Vitest tests](../tests), [Playwright gameplay checks](../tests/browser) and [static-deployment checks](../tests/deployment). The [README](../README.md#verify) lists the build and verification commands. The linked commits include both feature work and corrective changes, tracing the game's development through version 1.0.12.
