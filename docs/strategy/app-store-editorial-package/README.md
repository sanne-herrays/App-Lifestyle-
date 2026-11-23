# HerRays — App Store Editorial Package

**Task:** TASK-042 · **Workstream:** Validation & Growth · **Stage:** Apple editorial readiness (PRD §9) + Launch (PRD §8)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-23
**Status:** `in_review` — assembled from real, built artifacts; the empirical "winner" copy lock stays gated on TASK-017/019/039 (see §9).

---

## 0. What this package is, and the one honest caveat up front

This is the complete **App Store editorial and submission package** for HerRays: the product story, the real screenshots, the exact US-English store copy, the Apple **App Privacy** disclosures, the App Review demo walkthrough, the accessibility evidence, and the claims-review sign-off sheet. It is the acceptance deliverable for TASK-042:

> *"Package includes tested US English copy, real screenshots, privacy disclosures, demo and claims review."*

Every element is built from something real in this repository — not a mockup:

| Acceptance element | Where it is, and what makes it real |
|---|---|
| **Real screenshots** | §4 — nine PNGs in [`screenshots/`](./screenshots), captured by [`capture-screenshots.mjs`](./capture-screenshots.mjs) driving Google Chrome over the DevTools Protocol against the **production build** of `prototype/`. No frames were drawn by hand; re-run the script to regenerate them. |
| **Tested US English copy** | §3 — every string passes two gates that actually run in this repo: the Zero-Guilt `isGuiltFree` guard (`prototype/src/lib/restart.ts`) and the TASK-006 claim-limit ladder. See §0.1 for exactly what "tested" does and does **not** claim here. |
| **Privacy disclosures** | §5 — the Apple *App Privacy* ("nutrition label") answers, derived line-by-line from the real consent registry in `prototype/src/lib/privacy.ts`. |
| **Demo** | §6 — a scripted App Review / editorial demo walkthrough bound to the real prototype views and the <2-second core action. |
| **Claims review** | §7 — every health-adjacent string mapped to its Action Evidence & Safety Record (`prototype/src/lib/actionCatalog.ts`) and scanned against the TASK-006 §5.2 forbidden-framings list, with a named sign-off line. |

### 0.1 What "tested US English copy" means here — and what it does not

CLAUDE.md §3 forbids fabricated data, and the honest-work precedent set across this backlog (PROGRESS.md, 2026-11-22) forbids advancing un-run empirical results through a gate as if they happened. So this package is precise about the word *tested*:

- **What the copy has passed (real, repeatable, in-repo):**
  1. **Zero-Guilt gate** — every user-facing and store string clears the non-trivial `isGuiltFree` guard (no shame, loss-frame, streak-penalty, or fear language). This is the same guard the component test-suites run.
  2. **Claims gate** — every health-adjacent phrase maps to an approved pattern **at or below** its action's evidence grade and survives the §5.2 forbidden-framings scan (§7).
  3. **US-English editorial pass** — American spelling, idiom, date and number formatting; reading level kept plain; voice consistent with the in-product copy that is already built and approved.
- **What it has NOT passed (and is not claimed to):** a live, counterbalanced **App Store proposition test** (TASK-017) and a moderated **comprehension/usability test** (TASK-039). Those are blocked human/traffic-dependent tasks. This copy is therefore delivered as the **pre-registered candidate set for those tests**, not as their winner. §3 marks each variant group with the test that will select the final lock, and §9 lists the open dependencies. **No click-through, preference, or comprehension number appears anywhere in this document**, because none has been measured.

This is the strongest honest form of the deliverable: production-ready copy that has cleared every gate that can be run without users, explicitly staged for the two gates that need them.

---

## 1. The editorial narrative — why HerRays, why now, why iPhone

*The story Apple editorial reads first. One claim, defensible; one feeling, specific.*

### 1.1 The one-line pitch

**HerRays makes the smallest healthy action the most satisfying part of your day.**

### 1.2 The story

Most health apps are built around a quiet accusation: a streak you broke, a ring you didn't close, a dashboard of everything you haven't done. They treat a missed day as a failure to be punished, and they measure *app engagement* when what matters is *the thing you actually did in the real world*.

HerRays starts from the opposite belief. You don't need to overhaul your life. You need one small, real action — *two minutes outside, a glass of water, one slow breath* — to feel easy, finishable in a single gesture, and quietly good. So the entire product is one warm card: **your little win today.** Press and hold for less than two seconds, feel a single gentle buzz, and you're done. There is no streak to protect. Miss a day — or a week — and the app doesn't flinch; it simply offers you a smaller way back in.

Underneath that calm surface is real rigor: a library of evidence-graded actions that never over-promises (it will say "stepping outside is widely recommended," never "this prevents disease"), a privacy model where nothing optional — health data included — is ever collected until you choose it, and an accessibility system checked against WCAG 2.2 AA by a real contrast engine, not by eye.

### 1.3 Why this is a meaningful new way to improve daily life

- **It rewards behavior, not taps.** A completion is a record of something done in the world, stored on the device, not a vanity metric (PRD Principle 3; the ledger, `prototype/src/lib/ledger.ts`).
- **It removes the work of *starting*, not just tracking.** The differentiation thesis (PRD): most apps help you *track* habits; HerRays helps the first action cost almost nothing — one tap to an easier variant on a hard day, never a penalty.
- **It designs for the restart, not just the streak.** The gentle-restart flow treats a gap as ordinary and offers a *smaller* step after a longer absence — the opposite of the shame loop that drives abandonment.
- **It is honest about health.** Every health line is graded and claim-limited; the app stays firmly inside *generally-recommended, low-risk everyday actions* and out of individual disease-risk claims.

### 1.4 Why iPhone is the right medium

The core interaction *is* a physical gesture with a single, precise haptic confirmation — a press-and-hold that resolves in under two seconds and buzzes once on success (and silently degrades where haptics are unavailable). That tactile, immediate, one-handed moment is native to iPhone. The experience is tuned for one thumb, visible focus states, reduced-motion support, and Dynamic-Type-friendly scale — Apple-platform craft in service of a calm daily ritual, not spectacle.

### 1.5 Positioning guardrails (what we will never say)

Consistent with the claims rubric (TASK-006) and Zero-Guilt (CLAUDE.md §1), the editorial story never claims disease prevention, never quantifies a health outcome, never implies personalized medical assessment, and never uses fear or loss framing. "Better habits" is framed as *easier, kinder, more consistent* — not *medically transformed*.

---

## 2. Product facts sheet (for the editorial pitch and App Review)

| Field | Value |
|---|---|
| **App name** | HerRays |
| **Subtitle (candidate)** | Tiny healthy habits, zero guilt |
| **Category** | Health & Fitness (primary) · Lifestyle (secondary) |
| **Core interaction** | Press-and-hold "little win" card, completes in < 2s (CLAUDE.md §2), one success-only haptic (TASK-021) |
| **Free tier** | One active habit, the full daily loop, basic progress, essential accessibility (PRD §7) |
| **Premium (candidate prices)** | Multiple journeys, adaptive personalization, advanced insights — annual at $29.99 / $39.99 / $59.99, *to be selected by the TASK-018 willingness-to-pay test* |
| **Platforms** | iPhone (iOS); widgets / Apple Watch / HealthKit evaluated **only where they improve the experience**, not assumed (PRD §9) |
| **Data collection by default** | None beyond on-device essential habit data; all optional data (including any health data) is opt-in and off by default (§5) |
| **Accessibility** | WCAG 2.2 AA contrast (machine-checked), visible focus rings, full keyboard operation, `prefers-reduced-motion` support, screen-reader summaries (§8) |
| **Content advisory / claims** | No medical, disease-prevention, or diagnostic claims; evidence-graded action library (§7) |

---

## 3. Store copy — the exact US-English listing

*All copy below has passed the Zero-Guilt and claims gates (§0.1). Character budgets follow current App Store fields; verify against the live App Store Connect limits at submission (PRD §9 verification note).*

### 3.1 App name & subtitle
> **Candidate set for the TASK-017 proposition test.** Three subtitle variants are pre-registered; the final lock is the proposition-test winner, not an internal pick.

- **App name:** `HerRays` (7 chars)
- **Subtitle A — benefit-first:** `Tiny healthy habits, zero guilt` (31 chars)
- **Subtitle B — action-first:** `Your little win, every day` (26 chars)
- **Subtitle C — feeling-first:** `Small healthy habits made easy` (30 chars)

### 3.2 Promotional text (editable post-launch, ≤170 chars)
`Start ridiculously small. One real action a day — two minutes outside, a glass of water — done in a single tap. Miss a day? Just a gentle way back in. No streaks.` (162 chars)

### 3.3 Keywords (≤100 chars, comma-separated, no spaces)
`habit,habits,healthy,routine,wellbeing,calm,gentle,micro,tiny,mindful,daily,streak free,easy` (92 chars, within Apple's 100-char keyword field)

> Rationale: covers category intent (habit/routine/healthy), the distinctive angle (tiny/micro/gentle/streak free), and adjacent wellbeing intent (calm/mindful) without competitor brand terms. "streak free" is deliberately claimed — it is the product's clearest differentiator.

### 3.4 Description (full listing body)

**Candidate copy for the TASK-017 proposition test. Reads as natural US English; every line cleared the claims gate (§7).**

```
You don't need to change your life. Just a little piece of today.

HerRays is a gentle habit app built on one idea: the smallest healthy
action should be the most satisfying part of your day. No streaks to
protect. No red badges. No dashboard full of everything you haven't done.

HOW IT WORKS
• Open the app to one card: your little win today.
• Press and hold for a second. That's the whole thing.
• Feel a single gentle buzz. Done.

Two minutes outside. A glass of water. One slow breath. Each little win is
a real-world action — not a box to tick, not a tap to farm. Hard day?
Switch to an easier version in one tap. It never counts against you.

KIND BY DESIGN
• Miss a day, or a week? There's no penalty — just a smaller, warmer way
  back in whenever you're ready.
• Your past wins are always exactly where you left them.
• Reminders are always opt-in, and gentle when you choose them.

HONEST ABOUT HEALTH
Every action in HerRays is reviewed and evidence-graded. We'll tell you
when something is broadly good for wellbeing — and we'll never pretend a
tiny habit prevents disease or fixes anything. Small, real, and honest.

YOURS, AND PRIVATE
Your little wins live on your device. Nothing optional — health data
included — is ever collected unless you turn it on. Leaving with a full
copy of your data, or deleting all of it, is one calm tap away.

FREE TO START
Build one habit, free, with the full daily loop and the accessibility
features everyone deserves. Premium adds more journeys and deeper insight
when you're ready for it.

A little win is still a win. See you tomorrow.
```

### 3.5 "What's New" (first release)
```
Hello. This is HerRays — the gentlest way we know to build a healthy
habit. One little win a day, done in a tap, with no streak to keep and no
guilt if you miss one. We'd love to hear what feels good and what doesn't.
```

### 3.6 In-product copy already shipped (approved, for consistency)
The store copy reuses the voice already built and tested-against-the-guards in the prototype — e.g. the card's *"That's the whole thing."* and *"That's your little win today — we'll be here tomorrow. No streak to keep."* (`LittleWinCard.tsx`), and the restart's *"Nothing to rebuild. Every win you've ever logged is still exactly where you left it."* (`GentleRestart.tsx`). The listing and the product speak in one voice.

---

## 4. Real screenshots

*Captured from the production build of `prototype/` by [`capture-screenshots.mjs`](./capture-screenshots.mjs) (Chrome headless over the DevTools Protocol, iPhone-class 402×874 @3× viewport). The prototype's own navigation bar is cropped; everything inside each shot is the real rendered surface. These are true product captures — the raw material for the final device-framed App Store images, which still need the standard store frames and localized overlays before submission (§9).*

| # | File | Surface | Suggested App Store caption |
|:--:|---|---|---|
| 1 | [`01-little-win-today.png`](./screenshots/01-little-win-today.png) | The hero: "Your little win today" card, resting state | **One card. One little win.** |
| 2 | [`02-little-win-complete.png`](./screenshots/02-little-win-complete.png) | The real completion state — *"That felt good."* | **Done in a tap. That felt good.** |
| 3 | [`03-seven-day-journey.png`](./screenshots/03-seven-day-journey.png) | Seven-day journey preview | **See how a week could feel.** |
| 4 | [`04-gentle-restart.png`](./screenshots/04-gentle-restart.png) | Gentle restart after a gap | **Miss a day? Just a gentle way back.** |
| 5 | [`05-progress.png`](./screenshots/05-progress.png) | Progress without broken streaks | **Progress that never punishes you.** |
| 6 | [`06-cue-scheduler.png`](./screenshots/06-cue-scheduler.png) | Opt-in gentle cues | **A gentle nudge, only if you want one.** |
| 7 | [`07-action-catalog.png`](./screenshots/07-action-catalog.png) | Evidence-reviewed action library | **Honest about health. Every action reviewed.** |
| 8 | [`08-privacy-consent.png`](./screenshots/08-privacy-consent.png) | Privacy & consent controls | **Your data stays yours.** |
| 9 | [`09-first-session-onboarding.png`](./screenshots/09-first-session-onboarding.png) | First-session onboarding flow | **Up and running in under a minute.** |

**Recommended App Store screenshot order (first three carry the pitch):** 1 → 2 → 4 → 3 → 7 → 8 (lead with the hero card, the completion payoff, and the no-shame restart — the three things nothing else in the category does). Captions above are candidate copy and inherit the §0.1 gates; final caption lock is the TASK-017 proposition-test winner.

---

## 5. App Privacy disclosures (Apple "nutrition label")

*Derived directly from the real consent registry in `prototype/src/lib/privacy.ts`. The prototype keeps all data **on-device** and collects nothing optional by default; the answers below describe that model. Confirm the final mapping in App Store Connect against the shipping build, and re-confirm if any server-side collection is ever added (PRD §9 verification note).*

### 5.1 Headline answer

**Data used to track you:** None.
**Data collected and linked to you:** None by default.
**Data collected and not linked to you:** None by default; **only** if the user explicitly opts in to *Anonymous insights* (see §5.3).

A brand-new install runs the entire core loop while collecting only **on-device, non-health, essential** habit data. This is enforced structurally: `collectsOptionalHealthByDefault()` returns `false` by construction, and the privacy test-suite asserts it.

### 5.2 Essential (on-device) data — intrinsic to the app, non-health, never sold or shared

| Data | Apple data type | Purpose | Linked to identity? | Tracking? | Leaves device? |
|---|---|---|---|:--:|:--:|
| Completed little wins (`habit_actions`) | Health & Fitness → *user-entered activity*, on-device | App functionality | On-device only | No | No |
| Gentle cues you set (`habit_cues`) | User Content → *other* | App functionality | On-device only | No | No |
| Preferences — haptics, plan, challenge state (`app_preferences`) | Usage Data → *app settings*, on-device | App functionality | On-device only | No | No |

> These have no on/off switch because the switch is "use the app, or delete it" — but they are always fully **exportable** and **deletable** (§6 demo; `buildExport` / `eraseAll`).

### 5.3 Optional data — opt-in, **off by default**, withdrawable (off means gone)

| Data | Apple data type | Collected when | Default | On withdrawal |
|---|---|---|:--:|---|
| Anonymous insights (`anonymous_insights`) | Usage Data → *product interaction*, **not linked to identity** | Only after explicit opt-in | **Off** | Grant flips off **and** the data is erased in the same step |
| Reflection check-ins (`reflection_surveys`) | User Content → *other* | Only after explicit opt-in | **Off** | Erased on withdrawal |
| Connected health data (`connected_health`) | Health & Fitness | **Only** after explicit opt-in; never by default | **Off** | Erased on withdrawal |

### 5.4 User rights, built and tested (TASK-041)
- **Consent is withdrawable**, and withdrawal is total: the grant flips off and the purpose's data is erased in the same step (data minimization — "off means gone").
- **Export:** one tap assembles a complete, honest JSON copy of everything the app holds (empty categories listed too), on the device.
- **Deletion:** one calm, two-step control removes every app key and the consent record and nothing else — no alarms, no guilt.
- **Privacy Policy / support URL:** _[REQUIRED AT SUBMISSION — host the policy and support page and insert the live URLs here; the prototype implements the controls, the hosted policy text is an operational task.]_

> This is the only intentionally-unfilled slot in the package, and it is an operational hosting step, not a product gap. It is flagged, not faked.

---

## 6. App Review & editorial demo walkthrough

*A reviewer should reach the product's whole point in under a minute. Every step maps to a real, built view in `prototype/src/App.tsx`. No login, no server, no paywall blocks the core loop.*

### 6.1 Demo account
None required. HerRays' core loop is fully functional with no account and no network — open and use. (If a demo note field is required in App Store Connect: *"No account needed. The full daily loop works offline, on-device, with nothing to sign in to."*)

### 6.2 The 60-second core-loop demo (the one that matters)
1. **Open to the hero card** (default view). You see *"Your little win today,"* today's date, and one action — *"Two minutes outside. That's the whole thing."* (screenshot 1).
2. **Press and hold the circle.** In under two seconds it completes with a single gentle buzz and shows *"That felt good."* and *"No streak to keep."* (screenshot 2). **This is the < 2-second, one-gesture completion (CLAUDE.md §2).**
3. **Tap "Switch to the easier version."** The same action becomes a 20-second variant — one tap, no penalty. This is the hard-day path.

### 6.3 The differentiator demo (90 seconds more)
4. **Gentle restart** — open the *Gentle restart* view and use the honest "Preview a return after… 3 days away" control. Note the welcome-back copy offers a *smaller* step and never scolds (screenshot 4).
5. **Progress** — open *Progress*: completed opportunities and recovery are shown; missing days never erase past progress; a screen-reader summary is present (screenshot 5).
6. **Honesty about health** — open *Action catalog*: every action carries an evidence grade (A/B/C), a plain "we may say" claim limit, and gentle contraindications (screenshot 7).
7. **Privacy** — open *Privacy & consent*: everything optional is off; export and delete are one tap (screenshot 8).

### 6.4 Accessibility demo (for the editorial accessibility story)
- Operate the entire core loop by **keyboard**: Tab to the hold control and hold **Space/Enter** to complete (this is exactly how screenshot 2 was captured — note the visible focus ring).
- Toggle **Reduce Motion** at the OS level; animations collapse to instant, the gesture shortens, and nothing breaks.
- Turn **VoiceOver** on; the card announces *"Today's little win: Two minutes outside, 2 min,"* and variant switches are announced via `aria-live`.

---

## 7. Claims review & sign-off (TASK-006 gate)

*This is the launch claims gate the rubric names (`prevention-action-evidence-rubric.md` §3.4, §7). Every health-adjacent public claim is mapped to an Action Evidence & Safety Record (`actionCatalog.ts`) and scanned against the §5.2 forbidden-framings list.*

### 7.1 Catalog basis
The store and in-product health language draws **only** from the 24 approved records in the evidence-reviewed catalog (7 grade-A, 10 grade-B, 7 grade-C across 8 categories). No shipped health claim exceeds its action's grade.

### 7.2 Public-claim review table

| Public claim (store / product) | Backing action (AESR) | Grade | Ladder test | Verdict |
|---|---|:--:|---|:--:|
| "Two minutes outside" | `outside-two-min` — "Stepping outside is widely recommended and a nice reset." | A | Plain general-benefit; no disease/individual claim | ✅ Pass |
| "A glass of water" | `water-glass` — "many people feel a little fresher." | B | Softened "many people"; no "flushes toxins / boosts metabolism" | ✅ Pass |
| "One slow breath" / "breathe out slowly" | `calm-breathing` / `calm-hand-heart` — "Lots of people find… feel calmer." | C | Experiential only ("lots of people find"); no "reduces anxiety / lowers cortisol" | ✅ Pass |
| "broadly good for wellbeing" (catalog framing, description) | category-level, grades A–B only | A/B | General, non-individual, non-disease | ✅ Pass |
| "we'll never pretend a tiny habit prevents disease or fixes anything" (description) | — (disavowal) | n/a | Explicitly refuses the forbidden frame | ✅ Pass |
| "evidence-graded / reviewed" (description, screenshot 7 caption) | the catalog itself (every record has an AESR) | n/a | Process claim, true by construction | ✅ Pass |

### 7.3 Forbidden-framings scan (§5.2) — must all be ABSENT, and are

- ❌ Individual disease-risk reduction ("reduces *your* risk of…", "prevents", "protects you from") — **absent** from all store and product copy.
- ❌ Quantified outcome ("cuts risk 30%", "burns N calories", "adds years") — **absent**.
- ❌ Cure / treatment ("treats", "heals", "boosts immunity") — **absent**.
- ❌ Diagnostic / personalized-medical framing — **absent** (no "based on your health…").
- ❌ Fear / scarcity / loss health framing — **absent** (also a Zero-Guilt violation; the whole package is loss-frame-free).
- ❌ Timeline promises ("in 21 days you'll be healthier") — **absent**.

### 7.4 Sign-off block (to be countersigned before submission)

| Gate | Owner (role, per rubric §3.4) | Status |
|---|---|---|
| Evidence grades & safety tiers of every cited action | **Preventive-health specialist** | Grades set in the catalog; **working grades carry a verify-against-guidance flag** (rubric §8) — confirm against current public-health guidance before go-live |
| Claim-limit wording of every public string | **Preventive-health specialist + Editorial storytelling** (joint) | Table §7.2 passes; awaiting named countersignature |
| Store-market claims classification | **Preventive-health specialist** | Confirm the ladder against current App Store health-claim and advertising-standards guidance in each launch market (rubric §8 note 2) |
| Zero-Guilt copy gate | **Editorial** | All strings clear `isGuiltFree`; see §8.3 |

> No claim in this package asserts individual disease-risk reduction under any grade — the categorical boundary the rubric exists to hold (§5.2 / rubric §8 note 4).

---

## 8. Accessibility evidence (for the editorial accessibility story)

*Apple editorial weighs accessibility heavily. HerRays treats it as built-and-checked, not aspirational. Evidence is drawn from the real design-token system (`prototype/src/lib/designTokens.ts`) and the component implementations.*

### 8.1 Contrast — machine-checked against WCAG 2.2 AA
The design system ships a real WCAG relative-luminance **contrast engine** (`contrastRatio` / `meetsAA`) and an `INTERACTIVE_CONTRACTS` table pairing each interactive element with the AA ratio it must clear (4.5:1 normal text, 3:1 large text, 3:1 non-text / focus indicators). The `designTokens.test.ts` suite asserts every contract passes — this is the executable form of the TASK-030 acceptance criterion *"all interactive elements meet WCAG 2.2 AA target."* Text colors (`goldInk`, `greenInk`, `berryInk`, `greenDeep`) are specifically darkened to clear 4.5:1; fill/glow tints are explicitly documented as *not* contrast-safe for text and never used as essential text.

### 8.2 Motion, input, and screen readers
- **Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` rule collapses every transition to `REDUCED_MOTION_DURATION = 0`; the completion gesture also shortens. Verified live in the demo (§6.4).
- **Full keyboard operation:** the core completion works by holding **Space/Enter** on a real `<button>` with a visible focus ring (`focus` hue tuned to ≥3:1 vs paper and card — WCAG §1.4.11 / §2.4.13). Screenshot 2 was produced via this keyboard path.
- **Screen-reader support:** `aria-live` regions announce variant switches and completion; the card exposes an `aria-label` summary; the progress view ships a dedicated screen-reader summary (TASK-032 acceptance).
- **Touch ergonomics:** one-thumb reach; the primary action is a large hold target, not a precise tap.

### 8.3 Zero-Guilt as an accessibility-of-emotion standard
Every surfaced string in the package and the product clears the non-trivial `isGuiltFree` guard: no red/danger/penalty chrome, no broken-streak language, no shaming copy. A missed day routes to a warm, two-tap restart (CLAUDE.md §1).

---

## 9. Open dependencies before submission (honest status)

This package is **assembled and internally gated** but is not a submit-today artifact, because four upstream gates are genuinely blocked on real users / traffic / a longitudinal run and **must not be fabricated** (CLAUDE.md §3; PROGRESS.md 2026-11-22 precedent). What remains:

| Dependency | Task | What it locks here | Status |
|---|---|---|:--:|
| Concept selection decision record | **TASK-019** | Confirms the Little Win direction this package realizes is the launched one | Blocked (awaits desirability evidence) |
| App Store proposition variant test | **TASK-017** | Selects the final subtitle (§3.1), description (§3.4), and screenshot captions (§4) from the pre-registered candidates | Blocked (needs live traffic) |
| Onboarding usability test | **TASK-039** | Confirms first-session comprehension and time-to-first-action before the "easy" claims lock | Blocked (needs ≥12 moderated sessions) |
| Willingness-to-pay test | **TASK-018** | Selects the premium price shown in §2 | Blocked (needs a real honest checkout run) |
| 30-day behavioral pilot | **TASK-040** | Any "works / tested" outcome language (deliberately **absent** from this package) | Blocked (needs a real 30-day cohort) |

**Operational (non-blocked) items to complete at submission:**
1. Host the Privacy Policy and support pages; insert live URLs in §5.4.
2. Wrap the §4 captures in the required App Store device frames and localized caption overlays.
3. Obtain the §7.4 countersignatures and the rubric §8 guidance verification.
4. Confirm all field character limits against the live App Store Connect form.

### 9.1 Definition of done (when this package becomes submit-ready)
This package is **complete as the editorial-readiness assembly**: real screenshots, gated US-English copy, accurate privacy disclosures, a working demo script, and a passing claims review. It flips from *ready-to-finalize* to *submitted* when (a) TASK-019 confirms the direction, (b) TASK-017 selects the copy/caption lock, (c) TASK-039 confirms comprehension, (d) the four operational items above are closed, and (e) the §7.4 claims sign-off is countersigned. None of those can be honestly produced in an autonomous build, so they are listed, not invented.

---

## 10. Reproducing the screenshots

```bash
cd prototype && npm run build        # produces the production dist/ this package shoots
cd .. && node docs/strategy/app-store-editorial-package/capture-screenshots.mjs
```

The script serves `prototype/dist` with `vite preview`, launches Google Chrome headless, drives the real `App.tsx` views over the DevTools Protocol, and writes the nine PNGs into `screenshots/`. Requires Google Chrome (macOS default path) and a built prototype. It changes no `prototype/src` file and leaves no server running.

---

*Research/editorial deliverable with a reproducible capture tool. No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).*
