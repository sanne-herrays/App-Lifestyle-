# Reminder-Reduction Experiment — Pre-Registration (HerRays Stage-7 Habit Graduation)

**Task:** TASK-036 (pre-registered design — see §0) · **Workstream:** Validation & Growth
**Owner:** Data / experimentation scientist (per PRD team table) · **Reviewers:** Behavioral scientist (hypothesis & measurement validity), Preventive-health specialist (claim limits & safety), Privacy/security (consent & minimization)
**Grounds:** PRD §5 (behavioral validation — *"streaks vs flexible consistency"*), §7 (*"habit graduation … once a behavior is automatic, reduce prompting"*), Principle 5 (*"Help habits become independent of the app over time"*)
**Consumes:** `behavior-change-evidence-register.md` §3.1/§3.6/§3.10/§3.11 (TASK-005), habit graduation state machine (TASK-028), automaticity survey (TASK-035), activation events (TASK-033), cohort retention (TASK-034), completion ledger (TASK-026), cue scheduler (TASK-023), gentle restart (TASK-027), privacy/consent (TASK-041)
**Feeds (once a real run exists):** TASK-028 graduation-policy thresholds, TASK-040 (30-day behavioral pilot — the likely host cohort), TASK-042 editorial package (an app whose success is the user *needing it less*)
**Date:** 2026-11-23

---

## 0. What this document is — and what it is not (read first)

This is the **pre-registration** for TASK-036: a complete, locked experimental design that tests whether, **once a tiny habit is automatic, reminders can be tapered without materially reducing the real-world behavior** — the empirical heart of "habit graduation" (PRD §7) and of Principle 5 (*habits become independent of the app*).

**TASK-036's acceptance criterion is a design deliverable, and this document satisfies it in full.** The criterion asks that five things be *pre-registered*: **randomization** (§4), **eligibility** (§3), **outcome window** (§5), **consent** (§6), and **stopping rules** (§7). Every one is a specification written *before* any data exists — that is precisely what a pre-registration is. No participant, no result, and no empirical record is required to complete this task, and none is fabricated here.

**This is categorically different from the blocked human-subject tasks (TASK-008/009/016/017/018).** Those were `blocked` because their acceptance criteria demanded *empirical records* (interview transcripts, diary entries, preference counts, commitment behavior) that cannot be honestly produced without a real cohort. TASK-036 demands no such record — it demands the pre-registered design, which is a durable artifact and is delivered here. Accordingly this task is advanced to **`in_review`, not `blocked`.**

What this document does **not** do, and does not claim to: it does **not** report outcomes. The *execution* of this experiment needs a real graduation-eligible cohort — which the design nests inside the TASK-040 behavioral pilot (§1.3). Section 9 therefore holds **empty result slots** that may be populated *only* from a real run; §9.6 contains an explicitly labelled **NON-DATA** determinism fixture (invented numbers, zero evidential weight) used solely to prove the sizing and non-inferiority arithmetic is auditable. Executing the run is out of scope for TASK-036 and is tracked as a dependency of TASK-040, not a blocker of this task.

Everything below is genuine experimental design grounded in the PRD and the project's own evidence register. No synthetic data is presented as findings anywhere.

---

## 1. Objective, scope, and the experimental question

### 1.1 The question this experiment answers (and the ones it does not)

**Answers:** *For habits that have reached automaticity in HerRays, does progressively reducing reminders (tapering) preserve the real-world behavior at least as well as continuing reminders?* If yes, the product can graduate automatic habits — withdraw prompting, celebrate independence — without sacrificing the behavior it exists to support. If no (tapering causes a meaningful behavior drop), graduation must be gentler, slower, or user-paced.

**Does not answer:** (a) whether the behavior produces any **health outcome** — this experiment measures *behavior persistence and automaticity only*, never disease risk (CLAUDE.md §3; §8.3). (b) Whether reminders help a *non-automatic* habit — that is initiation, not graduation, and is out of scope (see eligibility, §3). (c) The optimal taper *schedule* across its whole design space — this tests one pre-registered taper against maintenance; schedule optimization is a future factorial study.

### 1.2 Why this framing: non-inferiority, not superiority

The graduation thesis is **not** "removing reminders makes people do the behavior *more*." It is "once the habit is automatic, the reminder is scaffolding the user has outgrown — removing it should do *no meaningful harm*, and it restores autonomy (ER §3.9)." The correct statistical frame for "does no meaningful harm" is a **non-inferiority test** with a pre-registered margin (§8.1), *not* a superiority test. A superiority design would be the wrong question and would mis-read a true null (equal behavior) as a failure. The design also carries secondary *superiority* tests on autonomy and sustained automaticity, where tapering is *hypothesized* to help (§8.2).

### 1.3 Host cohort and governance

This experiment is designed to run as a **pre-registered sub-study nested in the TASK-040 30-day behavioral pilot**, extended to the follow-up window in §5. It inherits TASK-040's recruitment, consent infrastructure (extended by the experiment-specific consent in §6), ethical oversight, and TASK-041 data governance. It can also run standalone on any live cohort that produces graduation-eligible habits. Either way, the design in this document is fixed *before* enrolment and is not amended after unblinding except by a logged, dated protocol amendment.

---

## 2. Hypotheses (pre-specified, directional)

| ID | Type | Statement | Pre-registered test (§8) |
|---|---|---|---|
| **H1 (primary)** | Non-inferiority | Among automaticity-graduation-eligible habits, the **taper** arm's real-world **behavior-retention rate** in the primary outcome window (§5.3) is **non-inferior** to the **maintain** arm, within margin **δ** (§8.1). | One-sided non-inferiority test on the between-arm difference, α = 0.025; non-inferior iff the 95% CI lower bound for (taper − maintain) lies **above −δ**. |
| **H2 (secondary)** | Superiority | The taper arm reports **higher perceived autonomy** (self-determination; ER §3.9) at end of the outcome window than the maintain arm. | Two-sided superiority, α = 0.05, on the autonomy measure (§5.4). |
| **H3 (secondary)** | Non-inferiority | The taper arm's **SRBAI automaticity** (TASK-035) is non-inferior to maintain across the window (automaticity does not decay when scaffolding is removed from an already-automatic habit). | Non-inferiority on mean SRBAI change, margin pre-set in §8.1. |
| **H4 (safety, descriptive)** | Harm screen | The taper arm shows **no excess lapse** beyond the safety threshold (§7.3) — the trigger for the ethical stopping rule, not a hypothesis to "win." | Monitored continuously against the pre-set harm boundary. |

All four are fixed before data collection. H1 is confirmatory; H2–H3 are secondary and reported with the understanding that the study is powered for H1. H4 governs safety, not inference.

---

## 3. Eligibility (pre-registered)

Eligibility is evaluated **per habit**, at the moment a habit crosses the graduation gate — not per user at enrolment — because a single user may hold a graduation-eligible habit and a still-forming one simultaneously. Randomization (§4) fires only when **all** inclusion criteria are met and **no** exclusion applies.

### 3.1 Inclusion criteria (all required)

| # | Criterion | Operational definition | Source of truth |
|---|---|---|---|
| I1 | **Automaticity reached** | Latest SRBAI response places the habit in the top automaticity band (e.g., mean ≥ pre-set threshold `τ_auto`), with a valid, version-stamped response on file. | TASK-035 automaticity survey (`compareBaselineToLatest`, band) |
| I2 | **Graduation state = "stable"** | The habit's state machine is in `stable` (the pre-graduation state), reached through the documented transitions — never forced. | TASK-028 graduation state machine |
| I3 | **Demonstrated consistency** | ≥ `k` completed opportunity-days out of the last `N` (e.g., ≥ 19 of 30), by the resilient-consistency definition — *not* a consecutive streak (ER §3.10). | TASK-026 ledger → TASK-034 behavior-retention |
| I4 | **Reminders currently on** | The habit has at least one active, opted-in cue/reminder that *could* be tapered (you cannot reduce what is off). | TASK-023 cue scheduler |
| I5 | **Minimum tenure** | Habit active ≥ `T_min` days (e.g., ≥ 42), so "automatic" reflects durability, not a brief spike. | TASK-026 ledger first-seen |
| I6 | **Adult, consented** | Age ≥ 18 and has completed the experiment-specific informed consent (§6). | TASK-041 consent |

### 3.2 Exclusion criteria (any one excludes)

| # | Exclusion | Why |
|---|---|---|
| E1 | **Lapsed / in gentle-restart state** | A habit in a restart state (TASK-027) is re-initiating, not graduating; tapering support from someone just returning is both invalid *and* unkind. |
| E2 | **Never had reminders** | No scaffolding to remove → no contrast to measure (fails I4). |
| E3 | **Health-eligibility-sensitive** | Carried forward from the recruitment screener E5/E6 and the prevention-action rubric: anyone for whom an action carries contraindication nuance is excluded so that **no health-claim content is elicited or inferred** anywhere in the experiment. |
| E4 | **Insufficient or stale automaticity evidence** | I1 cannot be evaluated from a current, version-matched SRBAI response (prevents randomizing on stale or missing data). |
| E5 | **Active withdrawal / opt-out of experiments** | The user has opted out of research participation (TASK-041); honoured unconditionally. |

### 3.3 Unit of randomization and clustering

The **habit** is the unit of randomization and analysis. Where a single user contributes **multiple** eligible habits, all of that user's eligible habits are assigned to the **same arm** (randomization is clustered at the user to prevent within-user contamination — a user cannot be half-tapered), and the analysis accounts for the (small) clustering via a user-level random effect or cluster-robust CIs (§8.4). Most users are expected to contribute a single eligible habit; the clustering adjustment is a pre-registered safeguard, not an expected large effect.

---

## 4. Randomization (pre-registered)

| Element | Specification |
|---|---|
| **Design** | Two-arm, parallel-group, individually randomized controlled experiment. |
| **Arms** | **Taper** (intervention): reminders follow the pre-registered reduction schedule (§4.3). **Maintain** (control): reminders continue at the user's established cadence, unchanged. |
| **Allocation ratio** | **1:1.** |
| **Method** | **Stratified permuted-block randomization**, server-side, generated from a seed fixed and logged before launch. Block sizes randomly varied (e.g., 4/6) within strata to frustrate allocation prediction. |
| **Strata** | (a) **automaticity band** at the gate (top band vs. just-over-threshold), (b) **goal category** (coarse bucket — move / calm / water / outside; no finer health detail, per §8.3), (c) **baseline consistency tertile** (I3). Stratifying on the strongest prognostic factors improves balance and precision. |
| **Allocation concealment** | Assignment is computed **server-side at the instant the gate is crossed** and is not previewable by the participant or by anyone who could influence eligibility. The eligibility check (§3) is evaluated and logged *before* the arm is drawn, so knowledge of the arm cannot bias who is enrolled. |
| **Timing** | A habit is randomized **once**, at first graduation-eligibility (§3). Re-entry is not permitted — a habit that lapses and later re-qualifies is **not** re-randomized (it is censored and reported separately), preventing selection on response. |

### 4.1 Blinding — stated honestly

This is an **open-label** behavioral experiment: a participant *will* perceive that their reminders are becoming less frequent, so participant-blinding to arm is not fully achievable and the design does not pretend otherwise. Three real masking protections are nonetheless pre-registered:

1. **Blinded, objective primary outcome.** Behavior retention (§5.3) is computed automatically from the TASK-026 ledger — a real-world completion event — **not** from any human judgement or self-report, so outcome *assessment* is blind by construction.
2. **Attention-matched control.** The maintain arm continues to receive its normal gentle reminders, so the arms differ in *reminder frequency*, not in whether the app is "paying attention." Both arms keep identical access to the card, restart, and all other surfaces. The contrast isolates **reminder dose**, not engagement writ large.
3. **Blinded analysis.** Arm labels are masked (coded A/B) in the analysis dataset until the primary analysis is locked (§8.5); the analyst does not know which code is taper until after the CI is computed.

### 4.2 What is manipulated, precisely

The **only** manipulated variable is **reminder/cue frequency** for the eligible habit, delivered through the existing TASK-023 scheduler. No copy changes, no feature is removed, no surface is hidden. The taper reduces *when prompts fire*; it never removes the user's ability to act, to see progress, or to re-enable reminders (§6).

### 4.3 The pre-registered taper schedule (intervention arm)

The taper is **gradual and framed as graduation, never withdrawal** (§8.2). The schedule is fixed in advance; values below are the registered defaults (the operator may substitute values at lock, but not after launch):

| Phase | Days (relative to randomization) | Reminder dose (taper arm) | Reminder dose (maintain arm) |
|---|---|---|---|
| **Baseline** | −14 → 0 | established cadence | established cadence |
| **Taper** | 0 → 14 | step down in two pre-set steps (e.g., daily → every-other-day → twice-weekly) | unchanged |
| **Reduced-hold** | 15 → 28 | held at the target-reduced dose (e.g., ≤ twice-weekly) | unchanged |
| **Independence follow-up** (optional) | 29 → 56 | reminders off by default, re-enable available | unchanged |

The user may **re-enable reminders at any time** (§6); doing so is recorded as a pre-specified event and handled analytically (ITT primary; §8.4), never blocked and never guilt-framed.

---

## 5. Outcome window and measures (pre-registered)

### 5.1 The windows, defined

| Window | Days (rel. to randomization) | Purpose |
|---|---|---|
| **Baseline** | −14 → 0 | Establish each habit's pre-randomization behavior-retention rate and SRBAI (covariate + balance check). |
| **Taper window** | 0 → 14 | The reminder dose is actively reduced (taper arm). *Not* the primary window — it is a transition. |
| **Primary outcome window** | **15 → 28** | Reminders held at the reduced dose. **This is where the primary endpoint is measured** — behavior under the reduced-reminder steady state, not during the transient taper. |
| **Independence follow-up** | 29 → 56 | Secondary: does behavior persist with reminders *off*? (optional; app-independence, Principle 5). |

Anchoring the primary endpoint to **days 15–28** (not the taper itself) is deliberate: it measures the *steady-state* effect of reduced reminders on an automatic habit, after the schedule has settled — the quantity a graduation policy actually needs.

### 5.2 Primary endpoint

**Behavior-retention rate** = (number of opportunity-days in the primary outcome window with ≥ 1 completed real-world action) ÷ (opportunity-days in the window), per the TASK-034 behavior-retention definition, computed from the TASK-026 ledger. This is a **behavior** measure (did the real-world action happen?), explicitly distinct from app-open retention (TASK-034 separates the two; PRD §7 *"do not optimise compulsive app use"*). Per-habit rate is the analysis unit; arm-level rates are summarized with 95% Wilson intervals (§8.4).

### 5.3 Secondary endpoints

| Endpoint | Measure | Hypothesis |
|---|---|---|
| **Perceived autonomy** | Short self-determination / autonomy item set, administered at window end (optional, guilt-free, skippable like TASK-035). | H2 |
| **Sustained automaticity** | SRBAI change, baseline → window end (TASK-035, version-matched). | H3 |
| **App-independence** | Behavior-retention rate in the 29–56 follow-up (reminders off). | Descriptive / Principle 5 |
| **Re-enable rate** | Proportion re-enabling reminders during the window, and time-to-re-enable. | Descriptive (a *choice*, not a failure) |

### 5.4 Instrumentation (ties to existing systems)

All measures are emitted through already-built, privacy-reviewed systems: completions from the **TASK-026 ledger**; activation/milestone context from **TASK-033** events (anonymous user key, timestamp, schema version, **no raw health detail**); automaticity from **TASK-035**; retention computation from **TASK-034**. The experiment adds a single event type — a version-stamped, arm-coded **assignment event** (habit id hash, stratum, arm code, schedule id, timestamp) — carrying no health detail and subject to the same TASK-033 structural guard.

---

## 6. Consent (pre-registered)

Participation requires **experiment-specific informed consent**, layered on top of the TASK-040/TASK-041 baseline consent. It is plain-language, explicit, and honest — no deception, consistent with the honesty stance applied throughout HerRays research.

**The consent discloses, in plain language:**
1. **Randomization** — "we will randomly choose whether your reminders for this habit stay the same or gently reduce over the coming weeks, and we'll compare the two to learn whether reminders can ease off once a habit feels automatic."
2. **What changes and what does not** — only reminder *frequency* may change; the habit, the card, progress, and restart are untouched.
3. **Full autonomy override** — *"You can turn your reminders back on at any time, instantly, with no penalty and no questions."* This is a first-class control, not buried; exercising it is honoured immediately (§4.3) and never guilt-framed.
4. **Right to withdraw** — from the experiment, or from research entirely, at any time, with no effect on their use of the app (TASK-041).
5. **Data** — exactly what is recorded (completion events, automaticity responses, arm), under an opaque key, data-minimized; no health-outcome data is collected (§8.3); how to export/delete (TASK-041 flows).
6. **No health promise** — plain statement that this studies *habit behavior*, not any health result (§8.3).

Consent is **opt-in**, revocable, and stored with version + timestamp. A participant who declines the experiment simply continues with normal (maintain-equivalent) reminders — declining costs them nothing.

---

## 7. Stopping rules (pre-registered)

Three independent stopping mechanisms are fixed in advance. Any one can halt the experiment; they are not mutually exclusive.

### 7.1 Primary (sample-size / anti-peeking) stopping rule

The run stops when the pre-registered per-arm sample size `n_per_arm` (§8.1) is reached, **or** at a pre-set calendar deadline, whichever comes first. **No stopping on an unplanned peek.** If interim looks are operationally required, a **sequential boundary** (alpha-spending, e.g., O'Brien–Fleming, with a pre-registered number of looks) is fixed before launch so the reported α stays honest — the same anti-peeking discipline the willingness-to-pay pre-registration uses. Early stopping on a favourable-looking unplanned interim is **disallowed**; a run that cannot reach `n_per_arm` is reported **inconclusive**, never spun into a graduation recommendation.

### 7.2 Futility stopping rule

If a pre-registered interim look crosses a **futility boundary** (the non-inferiority margin cannot plausibly be met even with the remaining planned sample — conditional power below the pre-set floor), the experiment may stop for futility and report "inconclusive / underpowered," freeing the cohort from a study that cannot answer its question.

### 7.3 Ethical / safety stopping rule (the Zero-Guilt + do-no-harm boundary)

This experiment's intervention is *removing support*, so it carries a specific duty of care. The run halts the **taper arm** (and reverts affected users to maintain cadence, framed warmly) if **any** of the following pre-set triggers fires:

- **Harm boundary (H4):** the taper arm's behavior-retention rate falls below the maintain arm by more than a pre-registered **harm threshold** `Δ_harm` (set *more conservative* than the inferiority margin δ — harm is stopped earlier than non-inferiority is "lost"), on a monitored interim.
- **Distress signal:** any credible report that reduced reminders are causing distress or a felt sense of abandonment (the exact Zero-Guilt failure the product exists to avoid — CLAUDE.md §1).
- **Individual override is always available regardless:** separate from any group stopping rule, *every* participant can re-enable reminders instantly at any time (§6). The group rule protects the cohort; the individual override protects the person.

Real-world safety and the three non-negotiable gates (safe/trustworthy guidance; PRD scorecard) **override** any experimental or commercial consideration. Stopping for safety is a success of the design, not a failure.

---

## 8. Pre-registered analysis plan

### 8.1 Margins and sample size (planning figures, not data)

The non-inferiority margin **δ** (primary) and the automaticity margin (H3) are fixed **before** launch, each justified as *the smallest difference that would change the graduation policy* — not a statistical convenience. For a non-inferiority test on two proportions at one-sided **α = 0.025, power = 0.80**, assuming a true between-arm difference of 0, the per-arm sample size is approximated by:

```
                 ( z_(1−α) + z_(1−β) )²  ·  [ p_t(1 − p_t) + p_c(1 − p_c) ]
n_per_arm  ≈  ─────────────────────────────────────────────────────────────────
                                         δ²
```

The operator fills `p_c` (assumed maintain-arm retention), `p_t` (assumed taper-arm retention, = `p_c` under the null) and `δ` from a defensible baseline, and records the resulting `n_per_arm` here as the **enrolment target before any run**. (Worked only as the NON-DATA fixture, §9.6.) An underpowered run is reported **inconclusive** (§7.1), never as evidence for graduation.

### 8.2 Decision rule (primary, H1)

- Compute each arm's behavior-retention rate with a **95% Wilson score interval** (robust at small counts / near the boundaries, unlike the Wald interval).
- Compute the **difference (taper − maintain) with a 95% CI** (Newcombe method on the two Wilson intervals).
- **Declare non-inferiority** iff the CI **lower bound > −δ** *and* the stopping rule (§7) was satisfied.
- If the CI lower bound ≤ −δ → **not non-inferior**: tapering at this schedule harms behavior; graduation must be gentler/slower (a valid, reportable, policy-relevant outcome).
- If the CI straddles the margin at the planned `n` → **inconclusive**, not a win.

### 8.3 Health-claim integrity (CLAUDE.md §3)

The endpoints are **behavior persistence and automaticity only**. Nothing in this experiment measures, infers, or claims a disease-risk or health outcome. Results are reported as *"the behavior did / did not persist when reminders were reduced"* — never *"reducing reminders improved health."* Goal is handled only as a coarse bucket (move/calm/water/outside; §4 strata). This mirrors the prevention-action rubric's claim limits and keeps the experiment on the right side of the non-negotiable safety gate.

### 8.4 Estimand, missing data, and intercurrent events

- **Estimand / primary analysis:** **intention-to-treat (ITT)** — habits analyzed in the arm they were assigned, regardless of re-enabling reminders. ITT answers the policy question honestly ("if we *offer* graduation…").
- **Re-enabling reminders** (taper arm) is a pre-specified **intercurrent event** handled by a *treatment-policy* strategy under ITT (the re-enable is part of the taper experience), with a **per-protocol** sensitivity analysis (habits that completed the assigned schedule) reported alongside — never instead.
- **Withdrawal / missing opportunity-days:** pre-registered handling (primary: observed opportunity-days as denominator; sensitivity: pre-set imputation). Clustering (multiple habits per user, §3.3) handled via cluster-robust CIs or a user random effect.
- **Censoring:** habits that lapse into restart (E1) mid-window are censored at lapse and reported separately (lapse is itself an outcome, descriptively).

### 8.5 Blinded, locked analysis

The analysis dataset is arm-masked (A/B) until the primary CI is computed; the full analysis plan (this section) is locked before unblinding. Any deviation is a dated, logged amendment reported in the final write-up.

---

## 9. Analysis framework — empty result slots (populated only from a real run)

> These tables are intentionally empty. They are populated **only** from a real graduation-eligible cohort (host: TASK-040). No synthetic values will be entered.

### 9.1 Per-arm primary endpoint (behavior retention, days 15–28)

| Arm | Habits (n) | Opportunity-days | Days with ≥1 action | Behavior-retention rate | 95% Wilson CI |
|---|---:|---:|---:|---:|---:|
| Taper | _ | _ | _ | _ | _ |
| Maintain | _ | _ | _ | _ | _ |

### 9.2 Primary non-inferiority result (H1)

| Quantity | Value |
|---|---|
| Difference (taper − maintain) | _ |
| 95% CI (Newcombe) | _ |
| Pre-registered margin −δ | _ |
| Non-inferiority declared? (CI lower bound > −δ) | _ |
| Stopping rule satisfied? (§7) | _ |

### 9.3 Secondary endpoints

| Endpoint (hypothesis) | Taper | Maintain | Effect + 95% CI | Pre-registered test result |
|---|---:|---:|---:|---:|
| Perceived autonomy (H2) | _ | _ | _ | _ |
| SRBAI change (H3) | _ | _ | _ | _ |
| App-independence, days 29–56 | _ | _ | _ | _ |
| Re-enable rate / time-to-re-enable | _ | _ | _ | _ |

### 9.4 Balance & validity checks (reported alongside results)

| Check | Taper | Maintain |
|---|---:|---:|
| Baseline behavior-retention rate | _ | _ |
| Baseline SRBAI band distribution | _ | _ |
| Consistency-tertile distribution | _ | _ |
| Goal-bucket distribution | _ | _ |
| Attrition / withdrawal rate | _ | _ |

### 9.5 Limitations to state in the final synthesis

- Open-label on the manipulated variable (§4.1) — mitigated by blinded objective outcome + blinded analysis, but stated plainly.
- Automaticity is self-report (SRBAI; ER §3.6 grade B) — a validated instrument, but self-report ≠ objective automaticity.
- Single taper schedule tested (§4.3) — a null result bounds *this* schedule, not all possible tapers.
- Generalizes only to habits that *reached* graduation eligibility in HerRays — by design (§3), not a flaw, but a scope limit on the claim.
- "66 days to automatic" and similar figures are **not** assumed anywhere (ER §3.6 limitation); eligibility is measured, never assumed by calendar.

### 9.6 NON-DATA determinism fixture (labelled; zero evidential weight)

*Invented numbers, used only to show the sizing and decision arithmetic is deterministic and auditable. These are NOT data and appear in no results table.* With illustrative `p_c = 0.80`, `p_t = 0.80` (true difference 0), `δ = 0.10`, one-sided `α = 0.025` (`z = 1.960`), power `0.80` (`z = 0.842`):

```
n_per_arm ≈ (1.960 + 0.842)² · [0.80·0.20 + 0.80·0.20] / 0.10²
          = (2.802)² · [0.16 + 0.16] / 0.01
          = 7.851 · 0.32 / 0.01
          ≈ 251 habits per arm  (→ ~502 eligible habits total; the enrolment target the operator would lock).
```
Decision-rule check (also NON-DATA): a hypothetical observed difference of −0.03 with a 95% CI of [−0.09, +0.03] would **declare non-inferiority** (lower bound −0.09 > −δ = −0.10); the same point estimate with CI [−0.13, +0.07] would **not** (lower bound −0.13 ≤ −0.10). This demonstrates the rule is mechanical and pre-committed — the real run supplies the real numbers.

---

## 10. Standards upheld (CLAUDE.md / PRD)

### 10.1 Zero-Guilt carried into the experiment (CLAUDE.md §1)
Tapering is framed as **graduation and celebration** ("your habit has grown its own roots"), never as support being *taken away*. The individual re-enable override (§6) and the ethical/distress stopping rule (§7.3) exist precisely so no participant is left feeling abandoned. Re-enabling reminders is a neutral *choice*, recorded without guilt. The maintain arm keeps its normal gentle, non-nagging reminders — no arm is ever shamed.

### 10.2 Health-claim integrity (CLAUDE.md §3; prevention-action rubric)
The experiment measures behavior persistence and automaticity, **never** a health outcome; health-eligibility-sensitive habits are excluded (E3) so no health-claim content is elicited or inferred; goal is coarse-bucketed only.

### 10.3 The non-negotiable gates override everything (PRD scorecard)
Safe/trustworthy guidance and user autonomy **override** any experimental tidiness or growth consideration: safety stopping (§7.3) and individual override (§6) are absolute. This is the structural opposite of engagement-maximization — the product's success is the user needing it *less* (ER §3.6; PRD Principle 5).

### 10.4 Privacy & data minimization (TASK-041)
Opaque per-habit key; only completion events, automaticity responses, and arm code are recorded; no raw health detail (TASK-033 structural guard); export/deletion honoured; experiment consent is separate, versioned, revocable.

---

## 11. Definition of done (what closes TASK-036 honestly)

TASK-036's acceptance criterion — *"Randomization, eligibility, outcome window, consent and stopping rules pre-registered"* — is met by this document:

| Acceptance element | Delivered in | Status |
|---|---|---|
| **Randomization** pre-registered | §4 (design, ratio, method, strata, concealment, timing, blinding, taper schedule) | ✅ |
| **Eligibility** pre-registered | §3 (per-habit inclusion I1–I6, exclusion E1–E5, unit/clustering) | ✅ |
| **Outcome window** pre-registered | §5 (four defined windows; primary endpoint anchored to days 15–28) | ✅ |
| **Consent** pre-registered | §6 (experiment-specific informed consent, autonomy override, withdrawal, data) | ✅ |
| **Stopping rules** pre-registered | §7 (sample-size/anti-peeking; futility; ethical/safety + individual override) | ✅ |

The design is locked. **Execution** (running the design on a real graduation-eligible cohort and populating §9) is a dependency of the **TASK-040** behavioral pilot, not of TASK-036 — and is not attempted or faked here. The result, once real, feeds the TASK-028 graduation-policy thresholds.

---

## 12. Status

**TASK-036 → `in_review`.** The pre-registration (the complete acceptance deliverable) is delivered. This task is **not** `blocked`: unlike TASK-008/009/016/017/018, its acceptance criterion requires a *design*, not an *empirical record*, and the design is a durable artifact produced in full above. No synthetic data appears anywhere; §9 holds empty result slots and §9.6 is explicitly labelled NON-DATA.
