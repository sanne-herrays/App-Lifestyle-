# Competitor Anti-Pattern Library — 20 Patterns to Engineer Against

**Task:** TASK-004 · **Workstream:** Research · **Stage:** Category intelligence (PRD §1)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22

---

## 1. Purpose

TASK-001 (12 direct habit apps), TASK-002 (8 adjacent products) and TASK-003 (42-feature inventory) each surfaced patterns that *retain users by manufacturing a small, recurring anxiety* — streak loss, urgency windows, closure pressure, competitive comparison, guilt notifications, early paywalls. Every one of those docs deferred the full treatment to here:

- TASK-001 §6 — "Guilt & friction audit (feeds TASK-004)".
- TASK-002 §5.3 — "Four engines to explicitly engineer *against* (feeds TASK-004)".
- TASK-003 §4.1 — every 🚫/⚠️ feature row "routed to TASK-004 for a guardrail" (F17, F19, F20, F24, F28, F29, F30, F41, F42, plus hazards).

This document is that treatment. It is the **anti-pattern library**: a canonical list of **20 anti-patterns**, each with (a) a concretely **observed example** in a named product, (b) **why it harms** the user and which HerRays constraint it violates, and (c) a **proposed design guardrail** — a specific, buildable rule that lets HerRays get the same user benefit *without* the harm. It satisfies the TASK-004 acceptance criterion (≥15 anti-patterns, each with an observed example and a proposed design guardrail) and exceeds it with 20.

**Why an anti-pattern library matters as much as a feature list.** The feature inventory (TASK-003) answered "what *can* we build?" This doc answers the harder question — "what must we *refuse to* build, and what do we build *instead*?" For a Zero-Guilt product (CLAUDE.md §1), the refusals are not omissions; they are the positioning. Nearly every refusal below ships with a positive substitute, so the library doubles as a **design-guardrail spec** for the experience workstream (TASK-020–032) and a reusable **reviewer red-flag checklist** (§6.3) that every future feature and PR can be gated against.

**Scope.** Anti-patterns are grounded exclusively in the 20 apps already documented in TASK-001/002 — no new products are introduced, so the library is fully traceable. Where a harm is a general category convention rather than one app's signature, it is attributed to the clearest observed exemplar(s) and labeled as such.

## 2. Method

### 2.1 What counts as an anti-pattern here
A pattern earns a place in this library only if it meets **both** tests:
1. **It is observed** in at least one named product from TASK-001/002 (or is an explicit category convention exemplified there).
2. **It conflicts with a HerRays non-negotiable** — CLAUDE.md §1 (Zero-Guilt: no red warnings, no broken-streak penalties, no shaming copy), §2 (< 2-second, one-gesture completion), §3 (no unsupported health claims), or a PRD principle (start ridiculously small; reward real behavior not app engagement; pleasant restart; help habits graduate).

A pattern that is merely *suboptimal* (e.g., a utilitarian UI) is **not** an anti-pattern — it must actively cause guilt, friction-before-value, misleading claims, or engagement-over-efficacy. This keeps the library sharp and actionable rather than a catalog of taste.

### 2.2 Columns in every entry

| Field | Meaning |
|---|---|
| **ID** | AP01–AP20, grouped by harm family (A–G) |
| **Anti-pattern** | The harmful mechanism, stated as a mechanism (not a feature name) |
| **Observed example** | The named product(s) where it is seen, with the specific instance |
| **Why it harms** | The user harm + the exact HerRays constraint it violates |
| **Design guardrail** | The buildable rule HerRays adopts instead — keeps the benefit, drops the harm |
| **HerRays home** | The task that owns implementing the guardrail |

### 2.3 Harm families

| Family | Anti-patterns | Core violation |
|---|---|---|
| **A. Progression & streak guilt** | AP01–AP05 | Zero-Guilt (loss framing, punishment) |
| **B. Monetization dark patterns** | AP06–AP08 | Value-before-paywall; reward real behavior |
| **C. Onboarding & setup friction** | AP09–AP11 | < 2-second / ridiculously small; activation |
| **D. Notification & cueing pressure** | AP12–AP14 | Zero-Guilt (manufactured anxiety) |
| **E. Social pressure & comparison** | AP15–AP16 | Zero-Guilt (comparison, urgency, exposure) |
| **F. Visual & copy shaming** | AP17–AP18 | Zero-Guilt (shaming visuals/data) |
| **G. Health-integrity anti-patterns** | AP19–AP20 | No unsupported health claims |

> **Guardrail ≠ feature spec.** A guardrail is a *constraint and its positive substitute*, not a committed implementation. The owning task decides the exact build; this doc binds it to the rule it must satisfy.

---

## 3. Master anti-pattern library (20 patterns)

Each row has an observed example **and** a proposed design guardrail — the two fields the acceptance criterion requires. Deeper per-family commentary follows in §4–§5.

### A. Progression & streak guilt

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP01** | **Reset-to-zero streak** — a consecutive-day counter that collapses to 0 on a single miss | Streaks (long count → 0), Duolingo, Productive, Habitify | Loss aversion weaponized: one slip erases all felt progress → shame → the category's dominant churn cause (TASK-001 §5.3). Violates CLAUDE.md §1 (broken-streak penalty) | **Never display a zeroing counter.** Use a resilient decaying strength score (Loop-style, F21) *plus* an accruing artifact that never resets (F22). A missed day softens a soft signal; history is permanent; no "0" is ever shown | TASK-032, TASK-027 |
| **AP02** | **Punitive loss** — subtracting health/currency/progress for inaction (HP damage, "death") | Habitica — missed Dailies cost HP; the avatar can "die" | Explicit punishment turns a lapse into a loss event with sunk-cost dread. Violates CLAUDE.md §1 (penalties) | **No state may be *subtracted* for inaction.** Inaction is a neutral non-event; the only state changes are *additive* (completing adds, missing does nothing) | CLAUDE.md §1; TASK-028 |
| **AP03** | **Streak-freeze as monetized/earned anxiety patch** — a consumable that "insures" a streak | Duolingo streak-freeze (earned or bought) | Concedes the streak *is* anxiety-inducing, then gamifies/sells relief for an app-created problem. Violates CLAUDE.md §1 | **Don't create the anxiety.** Because progress is resilient/accruing (AP01), no insurance is needed. Any "rest day" is free, unlimited, and framed as self-care — never a scarce consumable | TASK-027, TASK-037 |
| **AP04** | **Closure pressure / empty-state-as-failure** — an unmet daily goal reads as failure at day's end | Apple Activity Rings — an unclosed ring reads as failure; daily closure can become compulsive (TASK-002 §4.4) | A goal-gradient pull becomes guilt when unmet; glanceable status becomes a glanceable accusation. Violates CLAUDE.md §1 | **The un-done state is a warm invitation**, never an alarm. No end-of-day "you didn't finish" moment; completion celebrates, non-completion is silent and neutral | TASK-020, TASK-032 |
| **AP05** | **All-or-nothing binary action** — a habit is "done" or "failed," with no partial/easier path | Most trackers (Habitify, Productive): binary check-off; no scaled-down variant | A rigid binary maximizes failure days and discourages the "showed up at all" win. Violates PRD Principle 1 (ridiculously small) | **Every action has an easier variant** reachable in ≤2 taps (F12). Doing the smaller version still counts as done; scaling down never penalizes progress | TASK-022 |

### B. Monetization dark patterns

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP06** | **Early / hard paywall before first value** — an upgrade interrupt before the user completes any action | Fabulous, Productive — paywall during onboarding (TASK-001 §4; F41) | Blocks activation and demands payment before trust or value; depresses first-action rate (PRD <24h target) | **The core loop is free forever** (one habit: cue → action → completion → gentle progress). No paywall may interrupt the path to the first Little Win; premium gates *breadth* (multiple journeys), never the core loop | TASK-037, TASK-038 |
| **AP07** | **Gacha / soft-currency collectible store** — a randomized or purchasable reward economy | Finch (rainbow stones, collectibles), Habitica (gems/gear) (F42) | Variable-reward purchasable loops nudge spend and compulsive collection — ethically fraught in a *health* product, adjacent to loot-box scrutiny | **No randomized or pay-to-progress economy.** Any cosmetics are earned through real actions or a flat, transparent unlock — never randomized, never gated behind spend | TASK-038; legal/brand review |
| **AP08** | **Engagement-currency rewards** — XP/points earned for app time rather than the real action | Habitica (XP/gold), Duolingo (XP) (F24) | Rewards *tapping and app time*, not the real-world behavior — optimizes time-in-app over outcome and conflates engagement with efficacy. Violates PRD Principle 3 | **Reward only completion of the real action.** No currency accrues from opening the app, browsing, or streak-grinding; measure real-world behavior retention separately from app retention | TASK-026, TASK-033, TASK-034 |

### C. Onboarding & setup friction

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP09** | **Heavy coached onboarding before first win** — a long, content-dense setup before any action | Fabulous (science-framed "journey" commit), Atoms, Routinery (TASK-001 §5.4) | High up-front effort/time tax → pre-activation drop-off. Violates PRD Principle 1 and the <2-second ethos | **First action reachable in ≤90 seconds.** Defer all coaching depth until *after* the first completion; onboarding collects only the minimum needed to deliver one action | TASK-039, TASK-015 |
| **AP10** | **Choice overload at setup** — too many decisions before any reward | Habitica (3 task types + avatar + RPG jargon), Routinery (build a timed routine) | Decision fatigue before the first win → abandonment. Violates PRD Principle 1 | **Offer one recommended action** (rule-based, F36) with an opt-in template picker. Never require configuring many habits before the first win | TASK-025, TASK-001 templates |
| **AP11** | **Inflating a tiny action into a multi-step timed chore** — a 2-minute action becomes a guided program | Routinery (step-timers), Fabulous (sequenced rituals) (F13) | Effort balloons and the one-gesture completion is lost. Violates CLAUDE.md §2 (< 2-second, one-gesture) | **The atomic unit is ONE tiny action in a single gesture.** Multi-step sequences are never the default; timers are optional, never required | TASK-020 |

### D. Notification & cueing pressure

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP12** | **Loss-framed / guilt notifications** — messages that invoke loss or a disappointed character | Duolingo — "Duo misses you," "You're about to lose your 50-day streak" (TASK-002 §4.1) | Manufactures recurring low-grade anxiety as the retention engine — the exact mechanic CLAUDE.md §1 forbids | **Notifications are warm, opt-in, invitational** ("Ready for today's little win?"). Never reference loss, failure, disappointment, or a sad companion | TASK-023 |
| **AP13** | **Reminder nagging / notification fatigue** — default-on, frequent, escalating reminders | Default-on frequent reminders (common across trackers; Duolingo escalation) (F33) | Volume erodes trust, feels like nagging, trains users to dismiss/disable. Violates CLAUDE.md §1 spirit | **Off until explicitly opted in**, frequency capped and user-controlled, with a reminder-*reduction* path (graduation) rather than escalation | TASK-023, TASK-036 |
| **AP14** | **Rigid clock scheduling that manufactures "lateness"** — a fixed time slot that reads as missed when life slips | Productive (time-of-day slots), Tiimo (rigid blocks) (TASK-002 §4.5; F05) | Clock rigidity creates a failure-feeling when the day slips; the cue becomes a deadline. Violates CLAUDE.md §1 | **Anchor to existing routines** (implementation intentions: "after my morning coffee") rather than clock deadlines. A slipped cue is fine; the action stays available all day with no "late" state | TASK-023 |

### E. Social pressure & comparison

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP15** | **Competitive leaderboards / leagues** — ranking users against each other, with demotion | Duolingo leagues (F29) | Social comparison + demotion anxiety turns a personal health practice into a ranked competition — hazardous in a health context. Violates CLAUDE.md §1 | **No ranking, leagues, or competitive comparison.** If social exists at all, it is gentle co-presence without scores (F31) | Concept phase; reject F29 |
| **AP16** | **Urgency/FOMO windows & forced public sharing** — a time window to act + public proof-of-completion | BeReal — unpredictable window + "you missed it"; public posting + comparison (TASK-002 §4.6; F17, F30) | Time-pressure and public exposure create anxiety and comparison; a missed window is a visible failure. Violates CLAUDE.md §1 | **No time windows** — the Little Win is available whenever the user arrives. Sharing is optional, private by default, never required, never a completion obligation | Reject F17; TASK-041 |

### F. Visual & copy shaming

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP17** | **Red/alarm color semantics for "missed"** — danger coloring applied to inaction | Common tracker convention: missed days render red/alarm (TASK-001 §6) | Red = danger/error; it shames the user visually. **Explicitly forbidden** by CLAUDE.md §1 (no red warning badges) | **Missed days get neutral/warm, low-salience treatment** (soft, uncolored, or simply absent). Reserve color for *positive* completion only; never red or warning iconography for inaction | TASK-030, TASK-032 |
| **AP18** | **Decline-surfacing analytics** — prominent stats that render a downward trend as a verdict | Way of Life (% trend graphs), Habitify (charts) (F23) | A downward completion-rate line reads as a report card and invites self-judgment; data framed as verdict. Violates CLAUDE.md §1 | **Default view emphasizes completed opportunities and recovery, not failure rates.** No prominent "you're declining" graph; analytics are opt-in, framed as gentle insight, never the emotional center | TASK-032, TASK-034 |

### G. Health-integrity anti-patterns

| ID | Anti-pattern | Observed example | Why it harms (violates) | Design guardrail | Home |
|---|---|---|---|---|---|
| **AP19** | **Unsupported health-outcome promises** — implying individual disease-risk reduction from a micro-action | Wellness-app convention of outcome claims (category-wide; PRD §5 caution) | Overclaiming misleads, risks App Store/regulatory issues, breaks trust, and conflates general-benefit evidence with individual disease prevention. Violates CLAUDE.md §3 | **Claims limited to evidence-graded, general benefits; no individual disease-prevention promises.** Every action's claim passes the prevention-action evidence rubric with a named review owner and date | TASK-006, TASK-024, TASK-042 |
| **AP20** | **Unconstrained coaching / AI as medical advice** — generated guidance that drifts toward prescriptive health advice | Fabulous-style coaching narrative drifting prescriptive; the risk for any AI suggestion engine (PRD §Differentiation) | Unconstrained advice in a health context is unsafe and out of scope; AI suggestions ungrounded in reviewed interventions are a liability. Violates CLAUDE.md §3 | **Suggestions drawn only from a reviewed, evidence-graded catalog with contraindications.** AI may rank/contextualize existing reviewed actions but never generate novel health advice; a non-medical disclaimer is explicit | TASK-024, TASK-025 |

> **Count check:** A (5) + B (3) + C (3) + D (3) + E (2) + F (2) + G (2) = **20 anti-patterns**, each with an observed example and a design guardrail — satisfying and exceeding the TASK-004 acceptance criterion (≥15).

---

## 4. The meta-pattern: the category runs on manufactured anxiety

Reading the 20 together reveals a single underlying engine. The most powerful retention mechanics in the category are powerful **precisely because they create a small, recurring anxiety** and then offer the app as relief (TASK-002 §5.3). The anxiety comes in four flavors:

| Anxiety type | Anti-patterns | How it hooks | What it costs the user |
|---|---|---|---|
| **Loss** | AP01, AP02, AP03, AP04 | "Don't lose what you built" (streak, HP, ring) | Dread; catastrophic abandonment on a break |
| **Urgency** | AP14, AP16 | "Act now / within the window or you missed it" | Time-pressure; failure-feeling when life slips |
| **Comparison** | AP15, AP16 | "You're behind others / exposed to them" | Social anxiety; a personal practice becomes performance |
| **Judgment** | AP12, AP17, AP18 | "Here's how you're failing" (guilt copy, red, decline graphs) | Shame; the app becomes an accuser |

The remaining anti-patterns are **value-extraction** (AP06–AP08: charge or reward before/instead of real value) and **activation friction** (AP09–AP11: effort before the first win) — different harms, same root instinct to optimize the metric over the human.

**HerRays' bet** (a hypothesis to validate in TASK-016/TASK-040, not an assumption): *gentleness plus genuine delight can retain without any of these anxieties.* That is a harder, more defensible position than the category's — and the guardrails below are how it is enforced in code.

## 5. The guardrail design system — "do this instead"

Every anti-pattern has a positive substitute. Collapsed, the guardrails form a coherent, buildable **Zero-Guilt design system** — the inverse of the manufactured-anxiety engine:

| The category's anxiety engine | HerRays' gentle substitute | Where it ships |
|---|---|---|
| Reset-to-zero streak (AP01) | Resilient decaying strength + permanent accruing artifact; never a "0" | TASK-032, TASK-027 |
| Punitive loss / subtraction (AP02) | Additive-only state; inaction is a neutral non-event | TASK-028 |
| Monetized anxiety patch (AP03) | No anxiety to patch; free, unlimited, self-care "rest" | TASK-027 |
| Closure pressure / empty = failure (AP04) | Un-done state is a warm invitation; non-completion is silent | TASK-020, TASK-032 |
| All-or-nothing action (AP05) | Easier variant ≤2 taps, still counts as done | TASK-022 |
| Early hard paywall (AP06) | Core loop free forever; premium gates breadth, not the loop | TASK-037 |
| Gacha / purchasable rewards (AP07) | Earned cosmetics only; flat, transparent unlock | TASK-038 |
| XP for app time (AP08) | Reward the real action only; behavior ≠ app retention | TASK-026, TASK-034 |
| Heavy onboarding (AP09) | First action in ≤90s; coaching deferred until after the win | TASK-039 |
| Choice overload (AP10) | One recommended action; templates opt-in | TASK-025 |
| Multi-step timed chore (AP11) | One tiny action, one gesture; timers optional | TASK-020 |
| Guilt notifications (AP12) | Warm, opt-in, invitational copy; never loss-framed | TASK-023 |
| Nagging / fatigue (AP13) | Opt-in, capped, user-controlled, tapering | TASK-023, TASK-036 |
| Rigid clock "lateness" (AP14) | Routine-anchored cues; no "late" state | TASK-023 |
| Leaderboards / leagues (AP15) | No ranking; gentle co-presence only | Concept phase |
| Urgency windows / forced sharing (AP16) | No windows; sharing optional & private by default | TASK-041 |
| Red "missed" semantics (AP17) | Neutral/warm missed state; color for positives only | TASK-030, TASK-032 |
| Decline-surfacing analytics (AP18) | Emphasize completion & recovery; stats opt-in | TASK-032, TASK-034 |
| Health-outcome overclaims (AP19) | Evidence-graded general benefits; review owner + date | TASK-006, TASK-024 |
| Unconstrained AI advice (AP20) | Reviewed catalog only; AI ranks, never invents | TASK-024, TASK-025 |

### 5.1 Three guardrails that define the product (not just avoid harm)

Three substitutes are strong enough to be *differentiators*, not merely safe defaults:

1. **Additive-only progress (AP01/AP02/AP18).** No mechanic in HerRays ever subtracts, zeroes, or renders decline as a verdict. This single rule distinguishes HerRays from essentially the entire streak-driven category and is the backbone of the gentle-restart wedge (TASK-027).
2. **Core loop free forever (AP06).** Monetizing *breadth* rather than the core behavior aligns the business with the user's success — and converges with the habit-graduation thesis (F26), which deliberately reduces engagement once a habit is automatic (the category's single biggest open gap, TASK-003 §4.2).
3. **Reward the real action, never app time (AP08).** This operationalizes PRD Principle 3 and forces the measurement discipline of separating behavior retention from app retention (TASK-034) — the integrity backbone of the whole product.

## 6. Cross-cutting outputs

### 6.1 Severity tiering (for prioritization)

| Tier | Meaning | Anti-patterns |
|---|---|---|
| **Hard-blocked** | Directly named by CLAUDE.md §1/§3 — may never ship in any form | AP01, AP02, AP12, AP17, AP19 |
| **Reject-the-mechanism** | The mechanism is incompatible; only an unrecognizably-transformed substitute is allowed | AP03, AP04, AP07, AP08, AP15, AP16, AP18, AP20 |
| **Guardrail-and-allow** | Legitimate need exists; permitted only with the guardrail enforced | AP05, AP06, AP09, AP10, AP11, AP13, AP14 |

### 6.2 Patterns that *look* like anti-patterns but are safe with their guardrail
Several rejected mechanisms have a legitimate kernel worth preserving — the guardrail is what separates the safe kernel from the harm: the **single salient daily prompt** (keep BeReal's "one clear thing," drop the window — AP16), **glanceable completion** (keep the Activity Rings glance, drop closure-as-failure — AP04), and **reminders** (keep the cue, drop the nag and the guilt — AP12/AP13). The library's job is not to ban simplicity or cues; it is to ban the anxiety bolted onto them.

### 6.3 Reviewer red-flag checklist (reusable gate for every future feature & PR)

Operationalizes the guardrails into a yes/no gate. **Any "yes" blocks the change** until resolved. This belongs in the PR template and the Reviewer step (CLAUDE.md workflow rules).

- [ ] Does any state **subtract** progress, points, health, or a count for inaction? (AP01, AP02)
- [ ] Can any counter display or imply a **"0" / reset** after a miss? (AP01)
- [ ] Does any copy reference **loss, failure, disappointment, "don't lose," or a sad companion**? (AP12)
- [ ] Is **red or warning iconography** used for a missed/undone state? (AP17)
- [ ] Does an **empty/undone state read as an accusation** rather than an invitation? (AP04)
- [ ] Is there a **time window** after which the action is "missed"? (AP16)
- [ ] Does a **paywall interrupt** the path to the first Little Win, or gate the core single-habit loop? (AP06)
- [ ] Does any reward accrue for **app time / tapping** rather than the real action? (AP08)
- [ ] Is there **ranking, a leaderboard, or social comparison**? (AP15)
- [ ] Does the first action take **> ~90 seconds** or require configuring multiple habits first? (AP09, AP10)
- [ ] Does completing the core action take **more than one gesture**, or force a multi-step/timed sequence? (AP11)
- [ ] Are notifications **on by default**, uncapped, or escalating? (AP13)
- [ ] Does any **health claim** exceed evidence-graded general benefit, or imply individual disease prevention? (AP19)
- [ ] Does any AI/coaching output **generate health advice** outside the reviewed, contraindication-checked catalog? (AP20)
- [ ] Does a **slipped cue** produce a "late" state, or is any randomized/purchasable reward economy present? (AP14, AP07)

## 7. Handoffs

| Consumer task | What it takes from this library |
|---|---|
| **TASK-005 / TASK-006** (evidence) | AP19/AP20 define the claim limits the evidence register and rubric must enforce |
| **TASK-011–013** (concepts) | Each concept must pass §6.3; the guardrail substitutes (§5) are the Zero-Guilt design vocabulary |
| **TASK-014** (scorecard) | §6.3 checklist can back the scorecard's "safe/trustworthy health guidance" non-negotiable gate (PRD §Scorecard) |
| **TASK-020 / TASK-022** (card, fallback) | AP04, AP05, AP11 guardrails (invitation state, easier variant, one-gesture) |
| **TASK-023** (cue scheduler) | AP12, AP13, AP14 guardrails (warm opt-in cues, no nag, routine-anchored not clock-rigid) |
| **TASK-027** (gentle restart) | AP01, AP02, AP03 guardrails — the restart flow is the direct antidote to streak/punishment guilt |
| **TASK-028** (graduation) | AP02 additive-only rule; AP08 reward-the-action integrity |
| **TASK-030** (design tokens) | AP17 — no red/alarm semantics; positive-only color; reduced-motion |
| **TASK-032** (progress viz) | AP01, AP04, AP18 — accrual not reset, invitation not accusation, completion not decline |
| **TASK-034** (retention) | AP08 — measure behavior retention separately from app retention |
| **TASK-037 / TASK-038** (monetization) | AP06, AP07, AP08 — free core loop, no gacha, no engagement currency |
| **TASK-039** (usability) | AP09, AP10, AP11 — ≤90s first action, no choice overload, one-gesture |
| **TASK-041** (privacy/consent) | AP16 — optional, private-by-default sharing; no forced exposure |

## 8. Open questions / verification before decisions

1. **Re-verify current mechanics** per product before any decision leans on an exemplar — especially Duolingo's streak-freeze/notification design, BeReal's window, and Apple Rings' award framing (they evolve; details flagged in TASK-001/002).
2. **Validate the core bet** — that gentle motivation retains as well as anxiety-based motivation — in desirability and behavioral testing (TASK-016, TASK-040), rather than assuming the guardrails are costless.
3. **Finch's collectibles (AP07):** confirm the exact gacha/soft-currency mechanics before citing them in any decision; the *capability* is the concern regardless, but the exemplar should be verified (echoes TASK-003 §6.1).
4. **Severity tiering (§6.1) is a design judgment**, not a legal one — route AP19/AP20 (health-claim and AI-advice limits) through the preventive-health specialist and a claims/regulatory review (TASK-006, TASK-042) before launch.
5. **The red-flag checklist (§6.3) should be adopted into the PR template and Reviewer step** so the guardrails are enforced continuously, not re-litigated per feature.

## 9. Coverage checklist (acceptance criteria)

- [x] **≥15 anti-patterns** — **20** documented (AP01–AP20), grouped into seven harm families (§3).
- [x] **Each has an observed example** in a named product from TASK-001/002 (§3, "Observed example" column).
- [x] **Each has a proposed design guardrail** — a buildable Zero-Guilt substitute (§3 "Design guardrail" column; consolidated in §5).
- [x] **Fully traceable** — every anti-pattern grounded in an app already documented in TASK-001/002/003; no new products introduced; explicitly wired to the 🚫/⚠️ feature rows from TASK-003 §4.1.
- [x] **Mapped to HerRays constraints** — each entry names the CLAUDE.md §1/§2/§3 or PRD principle it violates.
- [x] **Actionable beyond a list** — meta-pattern analysis (§4), a positive guardrail design system (§5), severity tiering and a reusable reviewer red-flag checklist (§6), and a handoff map (§7).
- [x] No placeholder text (`[TBD]`, Lorem ipsum); no filler.
