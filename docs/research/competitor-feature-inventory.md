# Competitor Feature Inventory — A Deduplicated Capability Taxonomy

**Task:** TASK-003 · **Workstream:** Research · **Stage:** Category intelligence (PRD §1)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22

---

## 1. Purpose

TASK-001 tore down twelve *direct* habit apps and TASK-002 audited eight *adjacent* products. Both were organized **by product** — the right lens for understanding each app as a coherent system, but the wrong lens for answering the questions concept generation actually asks:

- *What is the complete menu of capabilities the category has invented?*
- *Which capabilities are table-stakes vs. differentiators vs. anti-patterns?*
- *Where are the empty cells — capabilities no one has combined?*

This inventory **re-cuts the same evidence by capability instead of by product**. It normalizes every observed feature into a single deduplicated taxonomy of **42 features across the six required categories** — onboarding, action, progression, social, personalization, monetization — so that concept briefs (TASK-011–013) and the experience build (TASK-020–032) can shop from a canonical list rather than re-deriving it per app.

**Scope note.** This is a *capability* inventory (what the product can do), not a re-teardown (how a given app feels). Mechanism-level analysis lives in TASK-001/002; this doc points back to those for the "why it works." Guilt/pressure capabilities are included here deliberately and flagged — the full anti-pattern treatment (observed example + design guardrail) is TASK-004's job, and every 🚫/⚠️ row below carries a forward pointer to it.

## 2. Method

### 2.1 Sources
Every feature is grounded in an app already documented in TASK-001 or TASK-002 — no new apps are introduced, so this inventory is fully traceable to prior evidence. The 20-app evidence base:

- **Direct (12):** Finch, Habitica, Streaks, (Not Boring) Habits, Fabulous, Atoms, Way of Life, Productive, Habitify, HabitKit, Loop Habit Tracker, Routinery.
- **Adjacent (8):** Duolingo, Pokémon GO, Headspace, Apple Fitness (Activity Rings), Tiimo, BeReal, Ring Fit Adventure, Forest.

### 2.2 Deduplication rule
Capabilities that are the *same mechanism wearing different art* are collapsed into **one** feature with multiple exemplars. For example, Streaks' ring, Productive's progress ring and Apple Fitness's Activity Rings are all one feature (**F18 · Progress ring / radial completion**), not three. Conversely, a brittle **streak count** (F19) and a **resilient decaying strength score** (F21) are kept *separate* because they are behaviorally different mechanisms even though both are "a number that tracks consistency." Deduplication is by *mechanism*, never by *visual treatment*.

### 2.3 Six categories (the required taxonomy)

| Category | Definition — a feature belongs here if it primarily governs… | Feature IDs |
|---|---|---|
| **Onboarding** | …how a user gets from install to their first configured action | F01–F08 |
| **Action** | …the core repeated daily loop: cue → do → log → feedback | F09–F17 |
| **Progression** | …how effort accumulates, is visualized, and evolves over time | F18–F26 |
| **Social** | …any capability involving other people (real or parasocial) | F27–F31 |
| **Personalization** | …how the experience adapts to the individual | F32–F37 |
| **Monetization** | …how the product converts, charges, and gates value | F38–F42 |

### 2.4 Columns in every inventory row

| Column | Meaning |
|---|---|
| **ID / Feature** | Canonical, deduplicated capability name |
| **Observed in** | Representative exemplar apps (not exhaustive; the clearest cases) |
| **Prevalence** | **Table-stakes** (≈most of category), **Common**, or **Rare/signature** |
| **Mechanism (ptr)** | One-line "what it does"; deeper analysis → TASK-001/002 |
| **HerRays verdict** | ✅ adopt · ⚠️ adapt-with-care · 🚫 reject (→ TASK-004) · ⭕ open gap |

> **Verdict ≠ roadmap.** A ✅ here means "compatible with the constraints and worth considering," not "committed." Commitment happens at concept selection (TASK-019) and in the experience workstream. ⭕ marks a capability the category *underuses* and HerRays could own.

> **Confidence.** Inherited from TASK-001/002 (product knowledge current to late-2025/early-2026). Features are stable abstractions, so confidence here is **High** for the *existence* of each capability; specific app attributions carry the source docs' per-app confidence and verification flags.

---

## 3. Master feature inventory (42 features)

### 3.1 Onboarding (F01–F08)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F01** | Template / preset habit picker | Productive, Habitify, Fabulous, Routinery | Table-stakes | Offer ready-made habits so users don't start from a blank page | ✅ |
| **F02** | Goal / intention framing ("why") | Atoms, Fabulous, Finch | Common | Capture the user's motivation up front to anchor later actions | ✅ |
| **F03** | Identity-based setup ("I am the kind of person who…") | Atoms | Rare/signature | Frame the habit as identity, not task (implementation-intention adjacent) | ✅ |
| **F04** | Habit stacking / routine anchoring at setup | Atoms, Routinery, Tiimo | Common | Attach the new action to an existing cue or sequence | ✅ |
| **F05** | Schedule / time-of-day assignment | Productive, Habitify, Streaks, Tiimo | Table-stakes | Pick when the action recurs (clock-based) | ⚠️ |
| **F06** | Science / coaching framing during onboarding | Fabulous, Atoms, Headspace | Common | Build credibility & buy-in via expert narrative before first action | ⚠️ |
| **F07** | Avatar / companion creation | Habitica, Finch | Common | Create a character the user will act for or as | ✅ |
| **F08** | No-account / zero-setup quick start | HabitKit, Streaks, (Not Boring) Habits | Common | Reach first action with near-zero configuration friction | ✅ |

### 3.2 Action — the daily loop (F09–F17)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F09** | One-tap / tap-and-hold completion | Streaks, Habitify, HabitKit, Productive | Table-stakes | Record "done" in a single gesture | ✅ |
| **F10** | Sensory completion feedback (animation + sound + haptic) | (Not Boring) Habits, Streaks | Rare/signature | Make the *act* of completing intrinsically delightful | ✅ |
| **F11** | Skip / not-today as a first-class non-failing state | Way of Life | Rare/signature | Let users mark "skip" without it counting as failure | ✅ |
| **F12** | Easier-variant / scalable action ("do less today") | Finch (soft), PRD intent | Rare/signature | Offer a reduced version of the action on hard days | ⭕ |
| **F13** | Guided step-by-step / timed sequence | Routinery, Fabulous, Headspace | Common | Walk the user through a multi-step action with timers/audio | ⚠️ |
| **F14** | Mood / reflection check-in attached to action | Finch, Habitify (notes) | Common | Capture a feeling or note alongside completion | ⚠️ |
| **F15** | Real-world action as the input (not a checkbox) | Pokémon GO, Ring Fit Adventure | Rare/signature | The physical behavior itself drives the reward, not a self-report tap | ⭕ |
| **F16** | Single salient daily prompt ("one clear thing") | BeReal, Apple Fitness (Move) | Common | Present exactly one thing to do today, reducing choice load | ✅ |
| **F17** | Time-boxed availability window | BeReal | Rare/signature | The action is only completable within a limited window | 🚫 |

### 3.3 Progression (F18–F26)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F18** | Progress ring / radial completion | Streaks, Productive, Apple Fitness | Table-stakes | A ring that fills/closes to signal completion | ✅ |
| **F19** | Streak count (consecutive-days number) | Streaks, Duolingo, Productive, Habitify | Table-stakes | A number that increments daily and **resets to zero on a miss** | 🚫 |
| **F20** | Streak-freeze / insurance | Duolingo | Common | A consumable that protects a streak from one miss | ⚠️ |
| **F21** | Decaying strength score (resilient metric) | Loop Habit Tracker | Rare/signature | A moving average where one miss dents but never destroys | ✅ |
| **F22** | Accruing permanent artifact (grid / forest / world) | HabitKit, Forest, (Growing World concept) | Common | A visual that *grows and never resets* with each completion | ✅ |
| **F23** | Trend charts / analytics & insights | Way of Life, Habitify, Loop | Table-stakes | Graphs of completion rate over time | ⚠️ |
| **F24** | XP / levels / points economy | Habitica, Duolingo | Common | Extrinsic currency earned per action, spent on progression | 🚫 |
| **F25** | Narrative / world progression tied to action | Habitica, Ring Fit Adventure, Pokémon GO | Rare/signature | A story/world advances *only* through real actions | ⭕ |
| **F26** | Habit graduation / taper (reduce prompting when automatic) | — (PRD §7 only) | **Absent in category** | Celebrate automaticity and *reduce* app dependence | ⭕ |

### 3.4 Social (F27–F31)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F27** | Parasocial companion that reacts to you | Finch, Forest (tree), Duolingo (mascot) | Common | A character responds emotionally to your actions | ✅ |
| **F28** | Group accountability / parties / co-op quests | Habitica | Rare/signature | Shared goals create peer obligation | ⚠️ |
| **F29** | Leaderboards / leagues / competitive ranking | Duolingo | Common | Rank users against each other to drive return | 🚫 |
| **F30** | Social feed / sharing a completion moment | BeReal, Duolingo | Common | Post or share proof of the action | ⚠️ |
| **F31** | Friend presence / gentle co-presence (no ranking) | Finch (plant friends), BeReal (close friends) | Rare/signature | See that others are doing their thing, without competition | ⭕ |

### 3.5 Personalization (F32–F37)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F32** | Cosmetic customization (icons, colors, themes) | HabitKit, Streaks, Habitica | Table-stakes | Let users style their habits/avatar | ✅ |
| **F33** | Reminder / notification configuration | Habitify, Productive, Duolingo | Table-stakes | Schedule prompts for an action | ⚠️ |
| **F34** | Contextual / situational cueing ("the world as cue") | Pokémon GO, Tiimo, Atoms | Rare/signature | Trigger the action from real-world context, not just a clock | ⭕ |
| **F35** | Adaptive difficulty / progressive challenge | Ring Fit Adventure, Duolingo | Common | Escalate the action as the user demonstrates readiness | ⚠️ |
| **F36** | Rule-based action recommendation from preferences | Fabulous (light), PRD differentiation thesis | Rare/signature | Suggest the *right* small action given goal + constraints | ⭕ |
| **F37** | Accessibility-first / inclusive design options | Tiimo, Apple Fitness | Rare/signature | Design for time-blindness, low vision, reduced motion from day one | ✅ |

### 3.6 Monetization (F38–F42)

| ID | Feature | Observed in | Prevalence | Mechanism (ptr) | Verdict |
|---|---|---|---|---|---|
| **F38** | Freemium with feature gating (habit caps, locked stats) | Habitify, Way of Life, Productive | Table-stakes | Free tier limited; premium unlocks breadth | ✅ |
| **F39** | Subscription (monthly / annual) | Finch, Fabulous, Habitica, most | Table-stakes | Recurring revenue, usually annual-discounted | ✅ |
| **F40** | One-time purchase / lifetime unlock | Streaks, HabitKit, Habitify (option) | Common | Pay once, own forever | ⚠️ |
| **F41** | Early / hard paywall before first value | Fabulous, Productive | Common | Interrupt onboarding to force an upgrade decision | 🚫 |
| **F42** | Soft currency / collectibles / gacha-adjacent store | Finch, Habitica | Common | Earnable/buyable cosmetic economy | ⚠️ |

> **Count check:** 8 (onboarding) + 9 (action) + 9 (progression) + 5 (social) + 6 (personalization) + 5 (monetization) = **42 features** across all six required categories — satisfying the TASK-003 acceptance criterion (≥30, categorized across the six dimensions).

---

## 4. Cross-cutting synthesis

### 4.1 The three-tier map (table-stakes · differentiator · anti-pattern)

Collapsing the 42 features by strategic role:

**Table-stakes — users will expect these; omitting them reads as "unfinished," but they don't differentiate.**
F01 templates · F05 scheduling · F08 quick start · F09 one-tap completion · F18 progress ring · F23 trend charts · F32 cosmetic customization · F33 reminders · F38 freemium gating · F39 subscription.
→ *HerRays must do these competently and invisibly, then spend its craft budget elsewhere.*

**Differentiators — rare/signature capabilities that, combined, could define HerRays.**
F03 identity framing · F10 sensory completion · F11 first-class Skip · F12 easier-variant · F15 real-action-as-input · F16 one clear thing · F21 decaying strength · F22 accruing artifact · F27 parasocial companion · F34 contextual cueing · F36 rule-based recommendation · F37 accessibility-first.
→ *This is the shopping list for concept generation (TASK-011–013).*

**Anti-patterns — capabilities that conflict with CLAUDE.md §1 (Zero-Guilt) and are routed to TASK-004 for a guardrail.**
F17 time-window · F19 brittle streak · F24 XP/points economy · F29 leaderboards · F41 early hard paywall. (Plus ⚠️ hazards: F20 streak-freeze, F28 group pressure, F30 public sharing, F42 gacha.)
→ *Each gets an observed example + design guardrail in TASK-004.*

### 4.2 The open gaps (⭕) — where the category is thin

Seven features scored ⭕ "open gap" — capabilities the category *underuses* and HerRays could own:

| Gap | Why it's open | HerRays home |
|---|---|---|
| **F12 · Easier-variant action** | Apps add habits but rarely let you *shrink* one on a hard day; the dominant model is all-or-nothing | TASK-022 tiny-action fallback |
| **F15 · Real action as input** | Only hardware/AR games do this; no tiny-health app rewards the *behavior* over the tap | TASK-020/021 completion + haptics |
| **F25 · Narrative/world progression** | Exists in games, absent from gentle health apps | TASK-012 Growing World concept |
| **F26 · Habit graduation/taper** | **No competitor does this at all** — every app optimizes *more* engagement, never *less* | TASK-028 graduation state machine |
| **F31 · Co-presence without ranking** | Social = competition in this category; gentle co-presence is unclaimed | Deferred; flag for concept phase |
| **F34 · Contextual cueing** | Most "cues" are clock reminders; anchoring to real routines is rare | TASK-023 habit cue scheduler |
| **F36 · Rule-based recommendation** | Apps let you *track* habits; almost none *choose the right small action for you* | TASK-025 recommendation rules |

> **F26 is the single most strategically important finding of this inventory.** Habit graduation — deliberately *reducing* the app's role once a behavior is automatic — appears in **zero** of the 20 products studied. Every competitor's incentive is to maximize engagement; PRD Principle 5 ("help habits become independent of the app") inverts that. This is both HerRays' clearest ethical differentiator and its hardest commercial question (it caps the LTV of a successful user), to be modeled honestly in TASK-038.

### 4.3 Prevalence × verdict distribution

| | ✅ adopt | ⚠️ adapt | 🚫 reject | ⭕ open | Total |
|---|---:|---:|---:|---:|---:|
| **Table-stakes** | 7 | 3 | 2 | 0 | 12 |
| **Common** | 4 | 7 | 3 | 0 | 14 |
| **Rare/signature** | 6 | 3 | 1 | 7 | 17 |
| **Total** | **17** | **13** | **6** | **7** | **42** |

**Reading the distribution:**
- **Reject rate is concentrated** — of 6 outright rejects, 5 are pure pressure/guilt mechanics (F17, F19, F24, F29, F41). The category's most *common* retention tools are the ones HerRays must refuse. That's the central tension the product bets against (hypothesis, to validate in TASK-016/040).
- **Every ⭕ open gap is Rare/signature or Absent** — confirming the gaps are genuinely under-built, not just unfashionable.
- **17 ✅-adopt features** are enough to build a complete, competitive product *without touching a single reject* — evidence the Zero-Guilt constraint is a design discipline, not a feature deficit.

### 4.4 The composite recommendation ("HerRays bill of materials")

A concept assembled only from ✅/⭕ rows yields a coherent, constraint-compliant product:

- **Onboarding:** F08 quick start + F01 templates + F03 identity framing + F04 routine anchoring (skip F06 heavy coaching, defer F05 rigid scheduling in favor of F34).
- **Action:** F16 one clear thing → F09 one-tap / F15 real-action completion → F10 sensory delight, with F11 Skip and F12 easier-variant always available.
- **Progression:** F21 decaying strength + F22 accruing artifact (never F19 streak), F18 ring for glanceable state, and the signature F26 graduation.
- **Social:** F27 parasocial companion and (optionally) F31 co-presence; **no** F29 leaderboards, **no** F28 forced accountability.
- **Personalization:** F34 contextual cueing + F36 rule-based recommendation (the differentiation thesis engine) + F37 accessibility-first + F32 cosmetics.
- **Monetization:** F38 freemium (free = one habit, per PRD §7) + F39 subscription; **never** F41 early hard paywall.

This bill of materials is a *hypothesis for concept generation*, not a committed spec — the three concepts (TASK-011–013) will each emphasize a different subset, and selection (TASK-019) decides.

## 5. Handoffs

| Consumer task | What it takes from this inventory |
|---|---|
| **TASK-004** (anti-patterns) | Every 🚫 and ⚠️ row — each needs an observed example + design guardrail |
| **TASK-005** (evidence register) | ✅/⭕ features making a *behavior-change* claim (F03, F21, F34, F36) must be graded before adoption |
| **TASK-011–013** (concepts) | §4.4 bill of materials + §4.2 open gaps as the differentiator shopping list |
| **TASK-014** (scorecard) | "Differentiation" criterion can be scored against how many ⭕ gaps a concept fills |
| **TASK-020–032** (experience) | Per-feature home mapping in §4.2 (F12→022, F15→020/021, F26→028, F34→023, F36→025) |
| **TASK-038** (economics) | F26 graduation's LTV tension; F38/F39/F40 pricing-model options |

## 6. Open questions / verification before decisions

1. **Attribution spot-checks:** a handful of features are attributed to specific apps from memory (e.g., Finch's easier-variant as "soft," Duolingo's streak-freeze mechanics). Re-verify these specific attributions before any decision leans on them — the *capability* is real regardless, but the *exemplar* should be confirmed.
2. **F26 graduation genuinely absent?** Confirm no competitor has quietly shipped a taper/graduation feature since early 2026 before claiming category-first.
3. **Engagement vs. efficacy** (standing caution from TASK-002 §5.4): a feature being *common* is not evidence it *changes behavior*. Any adopted feature making a behavior-change claim routes through TASK-005.
4. **Prevalence labels are directional**, built from the 20-app sample, not a market-share-weighted census. Treat "table-stakes" as "clearly expected in this sample," not a measured universal.
5. **Constraint pre-check:** before any ⚠️ feature is promoted to a concept, confirm it can be rendered Zero-Guilt-compatible (TASK-004 guardrail) — several (F20, F30, F42) are only marginally salvageable.

## 7. Coverage checklist (acceptance criteria)

- [x] **≥30 features** — 42 deduplicated features inventoried (§3).
- [x] **Categorized across all six dimensions** — onboarding (8), action (9), progression (9), social (5), personalization (6), monetization (5).
- [x] **Deduplicated taxonomy** — same-mechanism capabilities collapsed with multiple exemplars; behaviorally-distinct metrics kept separate (method §2.2).
- [x] **Normalized from observed competitors** — every feature traced to an app in TASK-001/002; no new apps introduced.
- [x] No placeholder text; prevalence + Zero-Guilt verdict + forward handoff attached to every feature.
