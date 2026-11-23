# 30-Day Behavioral Pilot — Protocol & Analysis Framework (HerRays Stage-5, TASK-040)

**Workstream:** Validation & Growth · **Owner:** Principal Product Builder & Strategist
**Status of the empirical record:** OPEN (see §11) · **Stimulus:** the already-built, instrumented prototype in `prototype/src`
**Standards:** CLAUDE.md §1 (Zero-Guilt), §2 (<2-second action), §3 (no boilerplate / no fabrication / no disease-prevention claims), §4 (strict TS)

---

## 0. What this document is — and what it is not (read first)

This is a **field-ready protocol for a 30-day single-arm behavioral feasibility pilot**: everything a team needs to recruit, consent, run, monitor, and analyze a real cohort tomorrow, and to return every outcome the acceptance criterion names — **protocol, consent, attrition, completion, adverse events, and behavior outcomes** — *without making a disease-prevention claim*. It contains the design rationale, the eligibility and consent instruments, the day-by-day procedure, the outcome definitions bound to already-built instrumentation, the safety-monitoring and stopping rules, and the analysis plan with empty result tables.

It is **not** a results report. **No participant has been recruited, consented, enrolled, or observed for thirty calendar days in an autonomous overnight build.** A 30-day pilot is, definitionally, thirty days of real human behavior; it cannot be compressed into a single build session. **Every result slot in §10 is deliberately empty.** Populating those slots with invented attrition curves, completion rates, adverse-event tallies, or automaticity changes would (a) violate CLAUDE.md §3's prohibition on fabricated content, (b) corrupt every gate downstream of it — the TASK-042 editorial package (which would then advertise a fabricated "tested" result), the TASK-043 launch plan, and the subscription-economics assumptions in TASK-038 — and (c) repeat exactly the synthetic-record pattern the Reviewer rejected on 2026-11-22, which put TASK-008/009/016/017/018/039 into `blocked`.

The distinction the Reviewer drew for TASK-036 governs here. A *design artifact* — a pre-registration, a protocol — is complete without data and advances to `in_review` (that is how TASK-036's reminder-reduction pre-registration advanced). An *empirical deliverable* — a cohort actually run, outcomes actually reported — is not complete without the run, and advancing it with constructed numbers is fabrication. **This document is the design artifact. The 30-day cohort is the empirical deliverable that remains to be run.** Accordingly this task is marked **`blocked`, not `in_review`** (§12), with the protocol delivered in full and the empirical requirement left honestly open (§11).

This is the single most empirically-demanding task in the backlog: it is not a one-session lab study (TASK-039) or a traffic run (TASK-017) but a **thirty-day longitudinal study of real people performing real-world health micro-actions**, which also carries the backlog's only genuine *physical-safety* surface (people doing bodily actions → an adverse-event duty, §6.3, §9). Fabricating it is therefore both the most tempting shortcut and the most harmful one.

---

## 1. Objective, scope, and the real instrumented system

### 1.1 The question this pilot answers (and the ones it does not)

**Primary question (feasibility + early behavior signal):** *When real people use HerRays for thirty days, do they keep performing the tiny real-world health action — and does the behavior show early signs of becoming automatic — without the app causing guilt, harm, or dropout?*

This maps to PRD §5 ("Behavioral validation … Measure actual action frequency and habit automaticity, not only app opens") and PRD §7's three-retention framing. It is deliberately a **feasibility and promising-change** study, exactly as PRD §5 instructs ("Early pilots establish feasibility and promising change, not long-term disease prevention").

Five measured outcome families, one per acceptance clause:

| # | Outcome (acceptance clause) | Instrument (defined in §6) | Built artifact it reads |
|---|---|---|---|
| O1 | **Protocol** — a pre-registered, executable design | this document (§1–§9) | — |
| O2 | **Consent** — informed, withdrawable, data-minimizing | §5 consent instrument + withdrawal flow | TASK-041 consent/export/deletion controls |
| O3 | **Attrition** — who stops, when, and why | §6.1 retention/attrition definitions | `lib/cohortRetention.ts` (TASK-034), `lib/activation.ts` (TASK-033) |
| O4 | **Completion** — real-world action completion over 30 days | §6.2 completion-rate definitions | `lib/ledger.ts` (TASK-026), `lib/cohortRetention.ts` behavior cohorts |
| O5 | **Adverse events** — any harm, discomfort, or guilt signal | §6.3 AE taxonomy + capture | `lib/actionCatalog.ts` contraindications (TASK-024/006), §7 monitoring |
| O6 | **Behavior outcomes** — frequency + automaticity change | §6.4 action-frequency + SRBAI change | `lib/ledger.ts`, `lib/automaticitySurvey.ts` (TASK-035) |

**Explicitly out of scope (stated so results are never over-read):**
- **No disease-prevention or individual-risk claim** is in scope, derivable, or permitted from any result (CLAUDE.md §3; TASK-006 claims ladder). A 30-day pilot cannot and must not speak to disease risk; the only health language permitted is the grade-bounded general-benefit phrasing already cleared in `docs/research/prevention-action-evidence-rubric.md` §5.
- **Not a controlled efficacy trial.** Single-arm, no randomized comparator for the *primary* feasibility question. (One randomized sub-experiment — the TASK-036 reminder taper — may be *nested* inside this cohort; §2.3. Its causal claims are scoped to that pre-registration, not to this pilot.)
- **Not a retention benchmark for the market.** n is a feasibility sample (§3), not powered to certify the PRD §7 hypothesis targets; those targets are stated here only as *reference lines to compare against*, never as pass/fail thresholds a small pilot could certify.
- **Not a usability test** (that is TASK-039) nor a desirability/preference test (TASK-016).

### 1.2 The stimulus is real, built, and instrumented — not a mock

The pilot runs against the running prototype, using the measurement stack already built and (per PROGRESS.md) Reviewer-approved:

- **The daily action loop:** `components/LittleWinCard.tsx` (TASK-020) one-tap/one-gesture completion with `HoldToComplete`; `components/TinyActionFallback.tsx` (TASK-022) for the easier variant; `components/HabitCueScheduler.tsx` (TASK-023) for cue timing; `components/GentleRestart.tsx` (TASK-027) for missed-day re-entry. The <2-second completion target (CLAUDE.md §2) is a *design* property already verified, not a pilot outcome.
- **The action library:** `lib/actionCatalog.ts` (TASK-024) — ≥20 evidence-graded micro-actions, each carrying `evidenceGrade`, `contraindications`, an `easierVariant`, and a `reviewDate`. Contraindications are the enrollment-and-runtime safety filter (§7.1).
- **The completion record:** `lib/ledger.ts` (TASK-026) — unique-ID, timestamped, duplicate-safe, offline-syncing completion events. This is the **sole source of truth for O4 (completion) and the behavior half of O3/O6**; no completion is counted that is not a real ledger event.
- **The analytics spine:** `lib/activation.ts` (TASK-033) emits anonymous-keyed, schema-versioned events with **no raw health details**; `lib/cohortRetention.ts` (TASK-034) computes **app retention and behavior retention separately** at D1/D7/D30 and marks immature cohorts; `lib/automaticitySurvey.ts` (TASK-035) captures the SRBAI automaticity measure with version attribution and optional completion.
- **Governance already in place:** `docs/research/user-recruitment-screener.md` (TASK-007) defines the segments and exclusions reused verbatim in §3; `docs/research/prevention-action-evidence-rubric.md` (TASK-006) defines the AE/contraindication taxonomy and the claims ladder; `docs/research/reminder-reduction-experiment-preregistration.md` (TASK-036) is the nested experiment this cohort can host (§2.3).

Because this instrumentation already exists and is tested, the pilot's engineering readiness is **high**; what is missing is only the thirty days of real people — which is precisely the part that cannot be fabricated.

---

## 2. Design

### 2.1 Design type and duration

**Single-arm, prospective, 30-day behavioral feasibility pilot** with a short baseline and an endline measurement.

| Phase | Window | What happens |
|---|---|---|
| Screening & consent | Day −7 to Day 0 | Screener (§3), consent (§5), contraindication filter (§7.1), baseline SRBAI |
| Baseline | Day 0 | One chosen habit + cue set; first action attempted in-session (TTFA sanity only) |
| Active pilot | Day 1 – Day 30 | Daily loop in the wild; ledger records real completions; weekly check-ins |
| Endline | Day 30 – Day 33 | Endline SRBAI, exit interview (subset), AE reconciliation |
| Behavior-retention readout | Day 30 (D30 cohort) | App + behavior retention computed; D7 already observable mid-pilot |

Thirty days is the PRD-aligned feasibility window (long enough to observe repetition, restart behavior, and early automaticity movement per Lally 2010's variance; short enough to be a feasibility pilot, not an efficacy trial). D90 behavior retention is **out of scope for this pilot** (it would require a 90-day run) and is flagged as a follow-on, not reported here.

### 2.2 Why single-arm (and what that costs us, stated honestly)

Feasibility pilots answer *"can this be run, is it safe, do people keep doing the behavior, is there a promising automaticity signal?"* — questions that do not require a control group. A single arm is the right, honest design for a first 30-day run and avoids over-claiming causation. **The cost:** completion and automaticity changes observed here are **not** attributable to HerRays versus no-app or versus a simpler tool; they are descriptive. §10.5 requires every synthesis sentence to respect that boundary.

### 2.3 Optional nested randomized sub-experiment

This cohort is the natural **host cohort** for the TASK-036 reminder-reduction experiment (its pre-registration §1.3 already anticipates a host cohort). If run, eligible participants who reach a stable-habit state mid-pilot are randomized per that pre-registration; its outcomes, stopping rules, and analysis are governed **solely by that document**, reported separately, and never merged into this pilot's descriptive feasibility readout. Running it is optional and must not delay or bias the primary feasibility outcomes.

---

## 3. Participants, sample size, and eligibility

### 3.1 Sample size and rationale

**Target n = 30 enrolled to reach ≥20 completing 30 days** (recruit 30 against an anticipated ≤33% attrition so the completion floor clears the PRD §7 D30 reference line with interpretable cells). The acceptance criterion sets no explicit n; 30 enrolled / ~20 completing is chosen as the smallest cohort that (a) yields a readable attrition curve, (b) gives ≥6 completers per segment lens (§3.2) for descriptive comparison, and (c) is large enough that a single adverse event is detectable without being so large it delays the first honest feasibility read.

Stated honestly: **this n is a feasibility sample, not a powered one.** It can *describe* attrition, completion, AEs, and automaticity movement with wide uncertainty; it **cannot certify** the PRD §7 targets (that needs TASK-040's successor at scale). Every rate in §10 is reported with a 95% confidence interval (Wilson for proportions) precisely so the reader sees the width, not a false point estimate.

### 3.2 Segment quotas (bound to the TASK-007 screener)

Recruit against the three segments already defined in `docs/research/user-recruitment-screener.md` — reuse its inclusion/exclusion rules verbatim; do **not** invent new segments.

| Segment (TASK-007) | Target enrolled | Why present in a behavior pilot |
|---|---|---|
| S1 — Abandoned-app user (quit a habit/health app ≤12 mo ago) | 10 | Most likely to lapse mid-pilot; stress-tests the restart (TASK-027) path and the attrition measure |
| S2 — Busy beginner (little prior habit-app use, time-constrained) | 10 | The launch JTBD; the core feasibility question is whether *they* keep the behavior |
| S3 — Successful habit builder (sustained ≥1 habit) | 10 | Benchmarks the achievable ceiling of completion and automaticity |
| **Total** | **30** | |

### 3.3 Eligibility

**Inclusion (all required):** adult (18+); owns and uses an iPhone capable of running the prototype; willing to perform a *tiny, low-risk, reversible* real-world action daily for 30 days; able to give informed consent in US English; reachable for weekly check-ins and an endline measure.

**Exclusion (any one excludes):**
- **Safety-first (the hard gate):** any condition for which a candidate action is contraindicated per `lib/actionCatalog.ts` + the TASK-006 S1–S4 safety taxonomy, where no cleared `easierVariant` removes the contraindication. A behavioral pilot **must not** place a participant at physical risk; when in doubt, exclude or route to a safer action — never enroll-and-hope.
- Pregnancy or a clinical condition requiring medical clearance for even light activity, unless such clearance is documented (default: exclude from physically-exertive actions; offer a non-exertive catalog action).
- Employees/contractors of HerRays or a named competitor; professional UX/PM app-testers; anyone who has seen a HerRays prototype (learned-path contamination).
- Minors and any vulnerable group the TASK-006 rubric marks out-of-scope.

The safety exclusion is non-negotiable and is **the** reason a 30-day pilot cannot be auto-run: it requires a human reviewer to apply the contraindication rubric to a real person before any action is assigned.

---

## 4. Consent (the O2 deliverable)

Consent is an **acceptance-named outcome**, not a formality. The consent instrument must be obtained, logged, and withdrawable before any Day-0 data is collected.

### 4.1 What the participant is told (plain-language consent script, verbatim intent)

- **What this is:** a 30-day study of a tiny daily health action, to learn whether the app is feasible and pleasant to keep using. *Not* a medical study; *no* promise that it prevents any disease or improves any specific health outcome (CLAUDE.md §3).
- **What you'll do:** pick one small action, do it (or its easier version) most days, tap to record it, answer a few short questions at the start, weekly, and at day 30.
- **What we record:** that you completed an action and when (anonymous key + timestamp), your optional automaticity-survey answers, and anything you tell us. **We do not collect raw health details** (TASK-033 schema guarantee). Optional health data is off by default (TASK-041).
- **Risks:** the actions are tiny and low-risk; if any action ever feels unsafe or uncomfortable, stop — switching to an easier version or skipping is always fine and is never penalized (CLAUDE.md §1).
- **Your control:** you can withdraw at any time, with no reason and no penalty; on withdrawal you can **export or delete** your data (TASK-041 flows). Withdrawal does not affect any compensation already earned.
- **Compensation:** [fixed, disclosed, not contingent on a particular outcome — never structured to pressure continuation].

### 4.2 Consent properties enforced (bound to TASK-041)

| Property | Enforcement |
|---|---|
| Informed | Script §4.1 delivered and acknowledged before Day-0 data |
| Voluntary & withdrawable | Withdraw any time; TASK-041 consent-withdrawal flow, tested |
| Data-minimizing | No optional health data by default; TASK-033 "no raw health details" schema |
| Exportable/erasable | TASK-041 export + deletion flows exercised at withdrawal/endline |
| Non-coercive | Compensation fixed and outcome-independent; no guilt copy on exit (CLAUDE.md §1) |

---

## 5. Procedure (day-by-day)

1. **Day −7…0 — Screen & consent:** apply TASK-007 screener; apply §3.3 safety exclusion via the TASK-006 rubric against `lib/actionCatalog.ts`; obtain §4 consent; record baseline **SRBAI** (`lib/automaticitySurvey.ts`, baseline version attributed).
2. **Day 0 — Setup:** participant selects one action (recommendation via `lib/recommendation.ts`, honoring preferences + contraindication exclusions) and one cue (`HabitCueScheduler`); attempts the first completion in-session (confirms the loop works for them; TTFA captured as a sanity check only, not a pilot endpoint — TTFA is TASK-039's measure).
3. **Days 1–30 — Active pilot:** daily loop in the wild. Every real completion is a `lib/ledger.ts` event (duplicate-safe, offline-syncing). Missed days route to `GentleRestart` (TASK-027), never to guilt. The easier variant (`TinyActionFallback`) is always available and counts as a completion of the day's opportunity (CLAUDE.md §1: reducing the action is not a failure).
4. **Weekly (Day 7/14/21) — Check-in:** a 2-minute contact to (a) capture any adverse event or discomfort (§6.3), (b) confirm the participant is still active vs. lapsed (feeds O3 attrition), (c) offer — never push — a restart if lapsed.
5. **Day 30–33 — Endline:** repeat **SRBAI** (follow-up version, comparable to baseline per TASK-035's baseline/follow-up design); run an exit interview on a subset (all withdrawers + a sample of completers); reconcile the AE log (§6.3); compute app + behavior retention (`lib/cohortRetention.ts`).

All facilitator contacts follow a no-coaching, no-guilt standard: a lapsed participant is met with a warm restart offer, never a "you broke your streak" message (there is no streak; CLAUDE.md §1).

---

## 6. Outcome definitions (how each acceptance outcome is produced)

### 6.1 Attrition (O3) — defined

- **Denominator:** all participants who complete Day-0 setup (the enrolled-and-started set).
- **Attrited** = a participant who has recorded **no ledger completion and no app session for ≥7 consecutive days as of Day 30**, OR who formally withdrew. (The 7-day silence rule is a *behavioral* attrition definition; a gap <7 days is a lapse, not attrition, because the gentle-restart model treats lapses as recoverable — CLAUDE.md §1.)
- **Reported as:** overall attrition rate (with 95% Wilson CI), an attrition *curve* (cumulative attrited by day, from `lib/activation.ts` last-active timestamps), attrition by segment, and **reasons** coded from withdrawal messages and exit interviews (voluntary; never inferred punitively).
- **Immaturity rule:** any cohort cell with <5 completers is flagged *under-observed* (reuse TASK-034's immature-cohort convention), not silently averaged.

### 6.2 Completion (O4) — defined

- **Daily opportunity:** each calendar day in a participant's active window is one opportunity.
- **Completed opportunity:** a day with ≥1 valid `lib/ledger.ts` completion event (the easier variant counts; duplicates do not double-count — TASK-026 guarantee).
- **Primary completion metric:** **per-participant completion rate** = completed opportunities ÷ active opportunities, summarized across the cohort (median + IQR, not just mean, because small-n distributions skew).
- **Secondary:** proportion of participants completing **3+ actions/week** (the PRD §7 reference line), and the **first-action-within-24h** proportion (PRD §7 reference), both reported with CIs and labeled *reference comparison, not a certified target* (§3.1).
- **Source of truth:** the ledger only. No completion is counted from a survey, a self-report, or an app-open; behavior means a recorded real-world action (PRD §5: "Reward actual behavior rather than app engagement").

### 6.3 Adverse events (O5) — defined (the safety duty)

This is the backlog's only physical-safety surface and is treated with corresponding seriousness.

- **Adverse event (AE):** any undesirable physical, psychological, or experiential harm reported by or observed in a participant during the pilot, whether or not attributed to the app or action. Includes: physical discomfort/injury from an action; a guilt/shame/anxiety response to the product (a **CLAUDE.md §1 violation is itself a logged AE** — guilt is an adverse event in this product); a safety-relevant contraindication missed at enrollment.
- **Severity grading:** mild / moderate / serious (serious = any event requiring medical attention or causing a participant to stop for safety). Each AE is coded for **relatedness** (unrelated / possibly / probably related to app or action) — honestly, without defensive minimization.
- **Capture:** passive (any participant message), active (weekly check-in direct question: *"Did anything about the action or the app feel uncomfortable or unsafe this week?"*), and endline reconciliation. **Zero AEs is a reportable finding**, not an empty section.
- **Escalation:** any **serious** AE triggers the §7.3 safety stopping rule and immediate individual follow-up; related moderate/serious AEs trigger a catalog/contraindication review against TASK-006/024.

### 6.4 Behavior outcomes (O6) — defined

- **Action frequency:** the completion metrics in §6.2, reported over time (weekly bins) to show whether the behavior holds, grows, or decays across 30 days.
- **Automaticity change:** **SRBAI** (Self-Report Behavioral Automaticity Index) via `lib/automaticitySurvey.ts`, baseline (Day 0) vs. endline (Day 30), per participant and cohort-summarized as a change score with 95% CI. Labeled per TASK-035's attribution as *validated-instrument* or *exploratory* exactly as that component records it.
- **Honest framing:** automaticity movement over 30 days is an **early signal of promising change**, explicitly *not* evidence of a durable habit or any health outcome (PRD §5; Lally 2010's long/variable automaticity timelines are cited in the synthesis so a small positive change is not over-read).

### 6.5 No disease-prevention claims (acceptance clause, enforced)

Every result sentence passes the TASK-006 claims ladder: permitted language is grade-bounded general-benefit phrasing only; **forbidden at every grade** are individual disease-risk statements, quantified health outcomes, cure/treat/prevent framing, and fear/timeline framing. A reviewer runs the §10 synthesis through the TASK-042 claims-review gate before it leaves the team.

---

## 7. Safety monitoring and stopping rules (pre-registered)

### 7.1 Enrollment safety filter
No participant is assigned an action without the TASK-006 contraindication rubric applied to them against `lib/actionCatalog.ts`; if no cleared `easierVariant` removes a contraindication, that action is not offered to that participant (§3.3).

### 7.2 Runtime safety
The easier-variant and skip paths are always one-to-two taps away (TASK-022/027); a participant can downgrade or stop any action at any time with no penalty and no guilt copy. Weekly AE probing (§6.3) is mandatory, not optional.

### 7.3 Stopping rules
- **Ethical/safety stop (individual):** any serious related AE → that participant stops that action immediately; follow-up initiated.
- **Ethical/safety stop (study-level):** ≥2 serious related AEs, or any pattern suggesting a catalog action is unsafe as deployed → pause enrollment, review the implicated action against TASK-006/024, do not resume until resolved.
- **Guilt stop (CLAUDE.md §1 boundary):** if the pilot itself is observed to produce guilt/shame responses (logged AEs under §6.3) at a rate inconsistent with the Zero-Guilt mandate, treat as a product defect, pause, and fix before continuing — the product's core promise outranks completing the pilot on schedule.

---

## 8. Instrumentation integrity (what makes the numbers trustworthy)

- **Behavior = ledger events**, never app-opens or self-report (`lib/ledger.ts`; TASK-026 unique-ID/duplicate-safe/offline-sync guarantees).
- **App vs. behavior retention computed separately** (`lib/cohortRetention.ts`; TASK-034) so "still opens the app" is never confused with "still does the action."
- **No raw health details in telemetry** (`lib/activation.ts`; TASK-033 schema guarantee); events are anonymous-keyed and schema-versioned.
- **Automaticity instrument version-attributed** (`lib/automaticitySurvey.ts`; TASK-035) so baseline/endline are comparable and the validated-vs-exploratory status travels with the number.
- **Immature/under-observed cells flagged, never averaged away** (§6.1).

---

## 9. Ethics, privacy, and data governance

Consent is informed, voluntary, withdrawable (§4). Data is minimized: no optional health data by default; export and deletion flows (TASK-041) are exercised at withdrawal and endline. Compensation is fixed and outcome-independent (§4.1). The pilot carries a real adverse-event duty (§6.3, §7) because participants perform bodily actions — this is honored with active weekly AE probing and pre-registered stopping rules, not a disclaimer. The study makes **no** disease-prevention or individual-risk claim at any point (§6.5; CLAUDE.md §3).

---

## 10. Analysis framework — empty result slots (populated only from a real run)

> Every table below is intentionally empty. It is filled **only** from a completed 30-day run. Inventing values here is the fabrication this task refuses to commit (§0, §12).

### 10.1 Enrollment & provenance
| Field | Value |
|---|---|
| Screened / consented / enrolled / started Day 0 | ⟨pending⟩ |
| Completed 30 days / withdrew / lost-to-follow-up | ⟨pending⟩ |
| Recruitment window (real calendar dates) | ⟨pending⟩ |
| Segment counts (S1 / S2 / S3) | ⟨pending⟩ |

### 10.2 Attrition (O3)
| Metric | Value (95% CI) |
|---|---|
| Overall 30-day attrition rate | ⟨pending⟩ |
| Attrition by segment (S1 / S2 / S3) | ⟨pending⟩ |
| Attrition curve (cumulative by day 7/14/21/30) | ⟨pending⟩ |
| Coded withdrawal/lapse reasons (top recurring) | ⟨pending⟩ |

### 10.3 Completion (O4)
| Metric | Value (95% CI) |
|---|---|
| Per-participant completion rate (median, IQR) | ⟨pending⟩ |
| % completing 3+ actions/week *(PRD §7 reference line, not a certified target)* | ⟨pending⟩ |
| % first action within 24h *(PRD §7 reference line)* | ⟨pending⟩ |
| Weekly completion trend (W1→W4) | ⟨pending⟩ |
| Easier-variant usage share (context, not a penalty) | ⟨pending⟩ |

### 10.4 Adverse events (O5)
| Field | Value |
|---|---|
| Total AEs (mild / moderate / serious) | ⟨pending — zero is a valid, reportable result⟩ |
| Related AEs (possibly/probably, by action) | ⟨pending⟩ |
| Guilt/shame AEs (CLAUDE.md §1 violations logged) | ⟨pending⟩ |
| Any stopping rule triggered? | ⟨pending⟩ |

### 10.5 Behavior outcomes (O6)
| Metric | Value (95% CI) |
|---|---|
| Automaticity (SRBAI) baseline → endline change | ⟨pending⟩ |
| Action-frequency trajectory over 30 days | ⟨pending⟩ |
| App retention D1/D7/D30 (separate from behavior) | ⟨pending⟩ |
| Behavior retention D1/D7/D30 (ledger-based) | ⟨pending⟩ |

### 10.6 Limitations to state in the synthesis (pre-committed)
- Single-arm → **descriptive only**; no causal/comparative claim (§2.2).
- Feasibility n → wide CIs; PRD §7 targets **compared, not certified** (§3.1).
- 30-day window → early automaticity signal, **not** a durable-habit or health-outcome claim; D90 behavior retention not measured here (§2.1, §6.4).
- Self-report components (SRBAI, AE probes) carry self-report bias; ledger completion is the objective anchor.
- **No disease-prevention claim** anywhere (§6.5).

### 10.7 NON-DATA determinism note (labelled; zero evidential weight)
Any illustrative figure a reader encounters while scoping this pilot (e.g., a worked example of how a completion rate would compute) is a **format demonstration only**, carries **zero evidential weight**, and must never be cited as a pilot result. The authoritative result record is §10.1–10.5, and it is empty until a real cohort fills it.

---

## 11. Definition of done (what closes TASK-040 honestly)

TASK-040 moves to `in_review` only when a **real 30-day run** has produced:
1. ≥20 participants completing the 30-day protocol (enrolled ~30 per §3.1), consented per §4, with the consent + withdrawal + export/deletion flows (TASK-041) actually exercised.
2. §10.2 **attrition**, §10.3 **completion**, §10.4 **adverse events**, and §10.5 **behavior outcomes** reported from real ledger/survey/AE data, each with its uncertainty.
3. The §10 synthesis passed through the TASK-042 claims-review gate with **no disease-prevention claim** present.
4. Any triggered stopping rule (§7.3) documented with its resolution.

Until all four exist, the empirical record is **OPEN** and the task stays `blocked`.

### 11.1 Unblock path
A human study lead: (a) finalizes compensation and ethics sign-off; (b) recruits 30 via the TASK-007 screener and applies the §3.3 safety filter; (c) runs the §5 procedure over 30 real calendar days with weekly AE probing; (d) exports ledger/survey/AE data into §10; (e) runs the claims-review gate; (f) advances the task. The engineering stimulus is ready today; the thirty days of real human behavior are the only missing input.

---

## 12. Status

**`blocked`** — not `in_review`. The protocol, consent instrument, outcome definitions, safety monitoring, and analysis framework are delivered in full and are field-ready. The acceptance criterion names **reported empirical outcomes** ("attrition, completion, adverse events and behavior outcomes reported") that exist only after a real 30-day cohort is run; those cannot be produced — and must not be fabricated — in an autonomous overnight build (CLAUDE.md §3). This mirrors the Reviewer's 2026-11-22 ruling that put TASK-008/009/016/017/018/039 into `blocked`, and the TASK-036 distinction between a design artifact (complete without data) and an empirical deliverable (not). Marking `blocked` rather than advancing constructed numbers protects the downstream TASK-042/043/038 gates and keeps the empirical requirement honestly open (§11).
