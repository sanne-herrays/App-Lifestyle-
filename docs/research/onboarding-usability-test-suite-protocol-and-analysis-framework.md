# Onboarding Usability Test Suite — Protocol & Analysis Framework (HerRays Stage-5, TASK-039)

**Workstream:** Validation & Growth · **Owner:** Principal Product Builder & Strategist
**Status of the empirical record:** OPEN (see §9) · **Stimulus:** the already-built, approved first-session prototypes
**Standards:** CLAUDE.md §1 (Zero-Guilt), §2 (<2-second action), §3 (no boilerplate / no fabrication), §4 (strict TS)

---

## 0. What this document is — and what it is not (read first)

This is a **field-ready, moderated usability test suite**: everything a facilitator needs to run twelve-plus sessions tomorrow and return the three measurements the acceptance criterion names — **task success, time-to-first-action, and critical usability issues**. It contains the recruitment binding, the exact facilitator script, the task set, the measurement instruments with their scoring rules, the severity rubric, the data-capture templates, and the analysis plan.

It is **not** a results report. No participant has been recruited, consented, moderated, or observed in an autonomous overnight build. **Every result slot in §7 is deliberately empty.** Populating those slots with invented numbers would (a) violate CLAUDE.md §3's prohibition on fabricated content, (b) corrupt the downstream gates this feeds (TASK-040 pilot, TASK-042 editorial package), and (c) repeat exactly the synthetic-record pattern the Reviewer rejected on 2026-11-22 and that put TASK-008/009/016/017/018 into `blocked`. Per that ruling (PROGRESS.md §61), an acceptance criterion that demands **empirical records** — here, "at least 12 moderated sessions … reported" — is satisfied only by a real run, so this task is marked **`blocked`, not `in_review`**, with the instrument delivered in full and the empirical requirement left honestly open (§9).

The distinction is the one the Reviewer drew for TASK-036: a *design artifact* (a pre-registration, a protocol) is complete without data and advances to `in_review`; an *empirical deliverable* (sessions run, rates reported) is not, and advancing it with constructed numbers is fabrication. This document is the design artifact; the twelve sessions are the empirical deliverable that remains to be run.

---

## 1. Objective, scope, and the real stimulus

### 1.1 The question this suite answers (and the ones it does not)

**Primary question:** *When a first-time user opens HerRays, can they understand what the app asks of them and complete their first "Little Win" quickly and without confusion — and where does the first session break down?*

Three measured sub-questions, one per acceptance clause:

| # | Sub-question | Measurement (defined in §5) | Acceptance clause |
|---|---|---|---|
| Q1 | Can users complete the core first-session tasks unaided? | **Task success** (3-level: success / success-with-difficulty / failure) per task | "task success … reported" |
| Q2 | How long until the user completes their first real action? | **Time-to-first-action (TTFA)**, seconds, session start → first completion | "time-to-first-action … reported" |
| Q3 | What specifically obstructs comprehension or completion? | **Critical usability issue log**, severity-rated (§5.3) | "critical usability issues … reported" |

**Out of scope (stated so results are not over-read):** this is a *formative* usability test of the first session, not a summative benchmark, not a desirability/preference test (that is TASK-016), not a retention or behavior-persistence measure (TASK-034/040), and not a health-outcome study. It measures *usability* (comprehension + effort + error), never efficacy. It makes **no** claim that completing the task improves any health outcome (CLAUDE.md §3; PRD claims ladder).

### 1.2 The stimulus is real, built, and approved — not a mock

Sessions are run against the running prototype in `prototype/src`, not screenshots. The onboarding path under test is the one already shipped and Reviewer-approved:

- **Entry → goal selection → first action → completion**, via `flows/FirstSessionFlows.tsx` (the TASK-015 first-session prototypes; acceptance: "entry, goal selection, first action and completion without dead ends," approved).
- The **"Your Little Win Today" card** (`components/LittleWinCard.tsx`, TASK-020) as the core daily action surface — one-tap/one-gesture completion with the `HoldToComplete` interaction, the <2-second target (CLAUDE.md §2).
- The **tiny-action fallback** (`components/TinyActionFallback.tsx`, TASK-022) as the "make it easier" escape hatch, reached in ≤2 taps.
- The **gentle restart** (`components/GentleRestart.tsx`, TASK-027) as the missed-day re-entry, so the first session of a *returning* lapsed user is also covered.

Because all three concept flows exist (`TinyWinFlow`, `GrowingWorldFlow`, `EverydayAdventuresFlow`), the suite is written against the **generic first-session spine** (entry → goal → first action → completion) so it runs identically whichever concept TASK-019 selects; §3.4 notes the two concept-specific probes to add once the concept is fixed.

---

## 2. Participants and sample size

### 2.1 Sample size and rationale

**Target n = 12 completed moderated sessions** (the acceptance floor), recruited to **14 scheduled** to absorb two no-shows/exclusions without dropping below floor.

Rationale, stated honestly: for *formative* usability testing the detection curve is steep — with a per-participant problem-detection probability of ~0.31 (Nielsen–Landauer), **5 users surface ~85%** of issues and **12 users surface ~98%** of issues *within a homogeneous segment*. HerRays has **three** target segments (§2.2), and problem sets differ across them (a lapsed-app returner hits different walls than a busy beginner), so 12 is a floor that gives ~5 per segment lens, not a per-segment guarantee. The suite therefore treats 12 as **minimum detection across the blended sample** and flags (in §7.5) any segment represented by fewer than 4 completed sessions as *under-observed* rather than silently averaging it away.

### 2.2 Segment quotas (bound to the TASK-007 screener)

Recruit against the three segments already defined in `docs/research/user-recruitment-screener.md` — reuse its inclusion/exclusion rules verbatim; do **not** invent new segments here.

| Segment (TASK-007) | Target completed | Why they must be present |
|---|---|---|
| S1 — Abandoned-app user (quit a habit/health app ≤12 mo ago) | 4 | Most likely to recognize guilt/friction anti-patterns; stress-tests the restart (TASK-027) path |
| S2 — Busy beginner (little prior habit-app use, time-constrained) | 4 | The launch JTBD; stress-tests comprehension with the least prior scaffolding |
| S3 — Successful habit builder (sustained ≥1 habit) | 4 | Benchmarks the ceiling; flags where our model contradicts a working mental model |
| **Total** | **12** | |

**Exclusions** (reuse screener §exclusions): employees/contractors of HerRays or a named competitor; UX/PM professionals who test apps for a living; anyone who has seen a HerRays prototype (prevents learned-path contamination); clinical populations for whom a health micro-action could be contraindicated without screening (route to the TASK-006 contraindication rubric — a usability test must not place a participant at risk).

---

## 3. Task set (what the participant is asked to do)

Six tasks spanning the first-session spine. Each is phrased as a **goal, not an instruction** — we say *what* to achieve, never *how* (no "tap the green button"), so we measure discoverability, not recall. The facilitator reads the task prompt verbatim (§4) and then goes silent.

| T | Task (goal given to participant) | Spine stage | Surface under test | Primary metric |
|---|---|---|---|---|
| **T1** | "You've just opened HerRays for the first time. Get set up to the point where the app is ready to suggest something for you to do today." | Entry → goal selection | `FirstSessionFlows` entry + goal step | Success; first comprehension read |
| **T2** | "Do the thing the app suggests for today." | First action → completion | `LittleWinCard` (`HoldToComplete`) | **Success + TTFA (Q2 anchor)** |
| **T3** | "Suppose today's suggestion feels like too much right now. Make it easier for yourself." | Fallback | `TinyActionFallback` | Success; ≤2-tap check (TASK-022) |
| **T4** | "Set things up so the app nudges you at a time or moment that fits your day." | Cue scheduling | `HabitCueScheduler` (TASK-023) | Success; opt-in comprehension |
| **T5** | "Imagine it's a few days later and you missed some days. Pick things back up." | Lapsed re-entry | `GentleRestart` (TASK-027) | Success; **guilt-free comprehension (§5.4)** |
| **T6** | "Show me where you'd look to see how you've been doing." | Progress read | `HabitProgress` (TASK-032) | Success; interpretation accuracy |

**Ordering:** T1→T2 are fixed and always first (they define TTFA and the genuine cold-open). T3–T6 follow in fixed order for comparability across participants (this is formative, not a counterbalanced benchmark; a fixed order keeps the twelve issue logs comparable). T2 is the **critical task** — if T2 fails, the <2-second core-loop promise (CLAUDE.md §2) is not being delivered, and that is reported as a blocking finding regardless of other task success.

### 3.1 Pre-task: the five-second comprehension read

Before T1, show the first screen for **5 seconds**, remove it, and ask: *"What do you think this app wants you to do?"* Capture verbatim. This is the comprehension baseline (feeds §7.4) and is scored against the intended first-session promise from the TASK-011/012/013 concept brief that matches the selected concept.

### 3.2 What counts as "done" per task (success definition, pre-registered)

Pre-registering the success line per task prevents post-hoc leniency. A task is **Success (2)** only if the participant reaches the state below unaided; **Success-with-difficulty (1)** if they reach it but with a wrong turn, long hesitation (>20s stalled), or self-corrected error; **Failure (0)** if they do not reach it, give up, or require a facilitator assist (an assist auto-scores 0 and is logged as an issue).

| T | "Done" state (observable, binary) |
|---|---|
| T1 | A concrete action is presented to the participant for "today" (flow has advanced past goal selection to the action surface). |
| T2 | A **real completion event** is recorded (the `HoldToComplete` gesture fires the ledger event — TASK-026; not merely "looked at the card"). |
| T3 | The active action is swapped to its easier variant (TASK-022 fallback applied) and still completable. |
| T4 | A cue is created and enabled (TASK-023), with the participant having encountered the notification opt-in. |
| T5 | A restart resolves to a ready-to-complete action in ≤2 steps (TASK-027), no shame copy surfaced. |
| T6 | The participant locates the progress view and states, correctly, what it shows about their recent activity. |

### 3.3 Facilitation standard (no coaching, no leading)

Think-aloud protocol. The facilitator (a) reads the task verbatim, (b) stays silent during attempts, (c) uses only neutral probes ("What are you thinking?" / "What did you expect there?" / "What would you do next?"), and (d) never points, hints, or confirms. An **assist** is offered only when the participant is fully stuck and has asked, or after a hard 90-second stall on a single task; every assist is logged, scores the task 0, and the facilitator notes the exact wall hit.

### 3.4 Concept-specific probes (add once TASK-019 selects a concept)

- If **Tiny Win**: probe whether the "one tiny action" framing reads as *too small to matter* (the concept brief's named failure mode).
- If **Growing World**: probe whether the world-progression is understood as *linked to the real action* vs. a detached game.
- If **Everyday Adventures**: probe whether mission novelty reads as *fresh* vs. *random/unpredictable*.

---

## 4. The moderated script (verbatim — the "moderated session" requirement)

> **Open.** "Thanks for making time. I'm testing the app, not you — there are no wrong answers, and anything that confuses you is exactly what I need to find. I'll ask you to do a few things and to think out loud as you go. I'll mostly stay quiet so I can see how it really works for you. You can stop any time. Okay to start?"

> **Consent & recording.** "I'd like to record the screen and audio for notes — no video of your face, and it's stored anonymously under a participant code, not your name. Is that okay? You can ask me to stop at any point." *(Proceed only on explicit yes; see §4.1.)*

> **Five-second read (§3.1).** "I'll show you the first screen for five seconds, then take it away and ask you one question." *(Show 5s, remove.)* "In your words — what do you think this app wants you to do?"

> **Tasks (§3).** For each T1…T6: read the task prompt **verbatim**, then go silent. Neutral probes only (§3.3). At natural completion or after the stall/assist rule, say "Thanks — next one."

> **Post-task ease rating (per task).** "On a 1-to-5 scale, how easy or hard was that — 1 very hard, 5 very easy?" *(Single-ease-question; captured per task, feeds §7.3.)*

> **Debrief (after all tasks).** "What, if anything, confused you most? … Was there a moment it felt good or effortless? … If a friend asked what this app does, what would you say?"

> **Close.** "That's everything — this was really useful. Thank you." *(Deliver incentive per recruitment terms.)*

### 4.1 Consent, privacy & safety (non-negotiable)

- **Informed consent** captured before any recording; participant may withdraw mid-session and have the recording deleted.
- **Data minimization** (mirrors TASK-041 controls): store a participant **code** (P01…P14), never name/email, in the analysis file; recordings stored access-controlled, deleted after issue-coding is complete; no health conditions recorded unless volunteered, and if volunteered, not retained.
- **No deceptive tasks, no dark patterns**: no task asks the participant to pay, subscribe, or enter real personal health data; the willingness-to-pay question is explicitly out of scope here (that is TASK-018, honest-checkout-gated).
- **Zero-Guilt in the room (CLAUDE.md §1):** the facilitator never frames a task failure as the participant's fault; T5 (restart) is observed specifically for whether the *product* produces any shame — a participant must never leave the session feeling judged.

---

## 5. Instruments and scoring rules (how the three measurements are produced)

### 5.1 Task success (Q1) — 3-level scale, pre-registered per §3.2

Each task scored **2 / 1 / 0** by the facilitator against the §3.2 "done" state, from the recording, not from memory. A **second coder independently re-scores ≥3 of the 12 sessions** (25%) on task success; disagreements are reconciled and the reconciliation rule noted, so the success rates are not one person's judgment. Report per task: count at each level, and **success rate = (# scored 2) / n** with **completion rate = (# scored ≥1) / n** reported alongside (never collapse the two).

### 5.2 Time-to-first-action (Q2) — exact definition

**TTFA = wall-clock seconds from the moment the facilitator finishes reading the T1 prompt (session-start anchor) to the moment the T2 completion event fires** (the real `HoldToComplete` ledger event, TASK-026). Measured from the recording timestamp, not a stopwatch.

- Rules: facilitator talk-time during T1→T2 is **subtracted** (pauses for the think-aloud probe are not the product's latency); an assisted T2 is recorded as **TTFA = censored** (not a number) and reported separately, never imputed.
- Report: median and full range (min–max) across non-censored sessions, the **count censored**, and a per-segment median where n≥4. Median, not mean — with n=12 a single stuck participant would distort a mean.
- Decision tie-back: TTFA is read against the <2-second *action* promise (CLAUDE.md §2) — note that TTFA includes first-run setup (goal selection) and so is expected to exceed 2s; the 2s target applies to the **completion gesture itself**, which is measured separately in §5.2a.

### 5.2a Core-action gesture time (the CLAUDE.md §2 <2s check)

Distinct from TTFA: the time from first contact with the Little Win card's completion affordance to the recorded completion, on T2 **and** on the returning-user restart (T5). Reported as median seconds; a value >2s on an unobstructed attempt is a **Severity-1 finding** against §2.

### 5.3 Critical usability issue log (Q3) — severity rubric

Every observed obstacle is logged as a row (§7.6 template) and assigned a severity. "Critical" is defined, not left to vibe:

| Severity | Definition | Reporting rule |
|---|---|---|
| **S1 — Critical** | Blocks task completion, causes task failure, breaks the <2s core-action promise, or surfaces any guilt/shame copy (CLAUDE.md §1 violation). | Must be reported individually, with frequency and the exact surface; gates TASK-040. |
| **S2 — Serious** | Major detour/confusion; task completed only with difficulty or after self-recovery; repeated across ≥3 participants. | Reported individually. |
| **S3 — Minor** | Cosmetic, one-off hesitation, preference friction; does not threaten completion. | Reported in aggregate. |

An issue's severity is the **highest** it reached in any session. Frequency (how many of the 12 hit it) is reported alongside severity — a minor issue that 10/12 hit is escalated for review. **Any S1 is a blocking finding** carried verbatim into the §7 synthesis and the TASK-040 go/no-go.

### 5.4 Guilt-free comprehension (CLAUDE.md §1 integrity probe, on T5)

On the restart task, explicitly code whether the participant expresses any self-blame ("I failed," "I'm bad at this") and whether the **product** surfaced any shame copy. Zero shame-copy occurrences is the pass bar; any occurrence is an automatic S1 (it contradicts the product's defining constraint). This reuses the same `isGuiltFree` lexicon standard the prototype enforces in code, applied here to the observed session.

---

## 6. Pilot before fielding (confound removal)

Run **1 pilot session** (recruited to the same screener, excluded from the n=12) to (a) time the full script — target ≤45 min — (b) confirm the task prompts are read as goals not puzzles, (c) verify screen/audio capture and the TTFA timestamp are recoverable, and (d) confirm the §3.2 success lines are observable without ambiguity. Fix the script/capture before fielding; note any change in §7.7. If the pilot forces a task-prompt wording change, the pilot is discarded and not pooled.

---

## 7. Analysis framework — empty result slots (populated only from real sessions)

> Every table below is intentionally empty. It is filled **only** after ≥12 real moderated sessions. No illustrative or placeholder numbers appear here (CLAUDE.md §3). "—" marks a slot awaiting real data.

### 7.1 Session log (provenance)

| P-code | Segment | Date | Facilitator | Completed? | TTFA censored? | Notes |
|---|---|---|---|---|---|---|
| P01 | — | — | — | — | — | — |
| … | | | | | | |
| P12 | — | — | — | — | — | — |

### 7.2 Task success summary (acceptance: "task success … reported")

| Task | Success (2) | Success-w/-difficulty (1) | Failure (0) | **Success rate** | Completion rate (≥1) |
|---|---|---|---|---|---|
| T1 Entry→goal | — | — | — | — | — |
| T2 First action **(critical)** | — | — | — | — | — |
| T3 Fallback (≤2 taps) | — | — | — | — | — |
| T4 Cue + opt-in | — | — | — | — | — |
| T5 Restart (guilt-free) | — | — | — | — | — |
| T6 Progress read | — | — | — | — | — |

Inter-coder agreement on the double-scored subset: **— %** (reconciliation rule applied: —).

### 7.3 Single-ease-question (per task, 1–5)

| Task | Median ease | Range | n |
|---|---|---|---|
| T1 | — | — | — |
| … | — | — | — |

### 7.4 Comprehension (five-second read, scored vs. intended promise)

| Read correctly conveyed the first-session promise? | Count / 12 |
|---|---|
| Fully | — |
| Partially | — |
| Not at all | — |

Representative verbatims (real, anonymized): —

### 7.5 Time-to-first-action (acceptance: "time-to-first-action … reported")

| Metric | Value |
|---|---|
| Median TTFA (non-censored), seconds | — |
| Range (min–max), seconds | — |
| Sessions censored (T2 assisted) | — / 12 |
| Median core-action gesture time, T2 (CLAUDE.md §2) | — |
| Median core-action gesture time, T5 restart | — |
| Per-segment median TTFA (where n≥4) | S1: — · S2: — · S3: — |

Segments with <4 completed sessions are marked **under-observed**, not averaged: —

### 7.6 Critical usability issue log (acceptance: "critical usability issues … reported")

| ID | Surface / task | Issue (observed, specific) | Severity (S1–S3) | Frequency (/12) | Proposed fix | Owner task |
|---|---|---|---|---|---|---|
| U01 | — | — | — | — | — | — |
| … | | | | | | | |

**S1 (critical) findings — reported individually, gate TASK-040:** —

### 7.7 Deviations, pilot changes, and limitations to state in the synthesis

- Pilot-driven script changes: —
- Any protocol deviation per session: —
- Standing limitations to state plainly: formative (not summative) test; small per-segment n; moderated lab-style setting differs from real-world first use; single selected concept only; usability measured, **not** efficacy or health outcome (CLAUDE.md §3).

### 7.8 NON-DATA determinism note (labelled; zero evidential weight)

Any example rows used while building the capture spreadsheet template are fixtures for formatting only, live outside this document, and carry **zero** evidential weight. No fixture is ever promoted into §7.1–7.6.

---

## 8. Decision linkage (how this feeds downstream — without pre-deciding it)

- **→ TASK-040 (30-day behavioral pilot):** S1 findings are **blocking** — a first session that fails T2 or surfaces shame copy is fixed before a 30-day cohort is exposed. TTFA and T2 success are the go/no-go inputs.
- **→ TASK-042 (App Store editorial package):** acceptance there requires "tested US English copy" — the comprehension results (§7.4) and any copy-level S1/S2 issues are the evidence that the onboarding copy was tested, not asserted.
- **→ Experience backlog (TASK-020/022/023/027/032):** every issue row carries an **owner task** so fixes route back to the component that produced them.
- **→ TASK-041 (privacy/consent):** this suite's §4.1 consent/minimization practice is the same standard TASK-041 implements in-product; findings on the opt-in step (T4) feed it.

This suite **does not** itself decide ship/no-ship; it produces the three measurements that those gates consume.

---

## 9. Blocker statement & acceptance-criterion status

**Acceptance criterion:** *"At least 12 moderated sessions; task success, time-to-first-action and critical usability issues reported."*

**Status: BLOCKED — empirical record OPEN.** This criterion demands **reported results from ≥12 real moderated human sessions**. That requires recruited, consented, moderated, observed participants — people doing real first sessions in real time — which cannot be produced in an autonomous overnight build. There is no participant, no recording, no observed task-success tally, no measured TTFA, and no observed issue log, so none can be honestly reported.

This is the **same class** as TASK-008/009/016/017/018 (human-subject empirical records), which the Reviewer `blocked` on 2026-11-22 while explicitly forbidding synthetic human-subject records from being advanced through a gate as if empirical (PROGRESS.md §61; CLAUDE.md §3). It is **unlike** TASK-036, whose criterion asked only for a *pre-registered design* and so advanced to `in_review`. Fabricating twelve session records and their rates would corrupt the TASK-040 pilot go/no-go and the TASK-042 editorial "tested copy" claim. Therefore this task is marked **`blocked`, not `in_review`**, and this document delivers the complete field-ready instrument instead.

**What is delivered now (design complete):** objective and scoping (§1), stimulus binding to the real built prototype (§1.2), sample size + segment quotas bound to the TASK-007 screener (§2), the six-task set with pre-registered success lines (§3), the verbatim moderated script with consent/privacy/safety (§4), the three measurement instruments with scoring rules and a severity rubric (§5), the pilot step (§6), the full analysis framework with empty result slots (§7), and downstream decision linkage (§8).

**Definition of done (what closes TASK-039 honestly):**
1. Pilot session run; script/capture confirmed (§6).
2. **≥12 completed moderated sessions**, recruited to the §2.2 quotas, consented per §4.1.
3. §7.2 **task success** populated (with the double-coded agreement figure).
4. §7.5 **time-to-first-action** populated (median, range, censored count, gesture-time check).
5. §7.6 **critical usability issue log** populated, every S1 reported individually.
6. §7.7 limitations stated; synthesis written; routed to TASK-040/042.
7. Only then → `in_review`.

**Unblock path:** assign a facilitator and a second coder; recruit 14 via the TASK-007 screener; schedule after TASK-019 fixes the concept (so §3.4 probes are set); run pilot + 12; populate §7; submit for review.

---

*No fabricated participants, sessions, rates, or issues appear anywhere in this document. All result slots in §7 are intentionally empty pending a real run (CLAUDE.md §3).*
