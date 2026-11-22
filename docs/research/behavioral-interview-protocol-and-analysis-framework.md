# Behavioral Interview Protocol & Analysis Framework (HerRays Stage-2 Discovery)

**Task:** TASK-008 (instruments only — see §0) · **Workstream:** Research
**Owner:** UX researcher (per PRD team table) · **Reviewers:** Behavioral scientist (coding validity), Product strategist (segment fit)
**Recruits via:** `user-recruitment-screener.md` (TASK-007) · **Feeds (once real data exists):** TASK-009 (diary study), TASK-010 (primary audience & JTBD), TASK-011–013 (concept briefs), TASK-020–032 (experience)
**Date:** 2026-11-22

---

## 0. What this document is — and what it is not (read first)

This is the **field-ready instrument and analysis framework** for TASK-008: the interview protocol, the B1–B7 barrier coding scheme, the barrier-taxonomy template, and the analysis workflow. These are the reusable, durable deliverables.

**This document does NOT contain the 15 interview records that TASK-008's acceptance criterion requires, and it does not claim to.** Real human interviews cannot be conducted inside an autonomous overnight build. A prior pass produced a *synthetic* record set and routed it through review; the Reviewer **rejected** it (PROGRESS.md, 2026-11-22) on the correct ground that constructed records — however honestly labelled — are scaffolding, not the empirical deliverable, and that no go/no-go gate (TASK-010, TASK-019) may be built on them.

**Status of TASK-008: `blocked` — requires human-subject research.** The record requirement (15 anonymized interviews) remains **open**. This framework is published now so that the moment real sessions can be run, there is nothing to design — only to execute, transcribe, code, and tabulate. See §6 for the exact definition-of-done and §7 for the blocker statement.

Everything below the line is genuine instrument design grounded in the PRD, the TASK-007 screener, `behavior-change-evidence-register.md` (TASK-005), and `competitor-anti-patterns.md` (TASK-004). No synthetic data is presented as findings anywhere in this document. §5.3 contains **synthetic coding fixtures** used only to prove the coding scheme is deterministic and testable; they are explicitly labelled and are not interview records.

---

## 1. Recruitment linkage (gate from TASK-007)

Participants are drawn **only** through `user-recruitment-screener.md`. The screener's three mutually-exclusive segments and interview quotas bind this protocol exactly:

| Segment | Definition (screener §3) | Interview quota | Inclusion signal to capture per record |
|---|---|---:|---|
| **A — Abandoned-app users (lapsed)** | Installed a habit/wellness app ≤12 mo ago; stopped ≤~30 days of use | **6** | Which app class; approximate active duration (screener Q4/Q5) |
| **B — Successful habit builders (sustainers)** | 3+ months of a sustained daily routine; app-free sustainers welcome | **4** | What routine; duration; app or app-free (screener Q6) |
| **C — Busy beginners (time-starved)** | High time pressure; no sustained routine | **5** | Time-pressure source; no-sustained-routine confirmation (screener Q6/Q7) |

Exclusions E1–E8 (screener §4) are applied **before** scheduling; eligibility-sensitive respondents (E5 clinician-advised/pregnant, E6 food/exercise sensitivity) are screened out upstream so that **no health-claim content is elicited or coded in interviews** — consistent with `prevention-action-evidence-rubric.md` and TASK-041 data-minimization.

---

## 2. Interview protocol

- **Format:** 45-minute semi-structured 1:1 video interview, one per participant; retrospective + contextual (matches screener Q10 option 1).
- **Sample:** n = 15, composed to the screener quotas above (**A×6, B×4, C×5**). Purposive and non-representative *by design* (screener §3) — sized for **saturation of barrier families**, not prevalence estimates.
- **Stance (PRD §2 — "observe what people *actually did*"):** anchor every question in a concrete past episode, not stated preferences or endorsed aspirations. Ask for the last *actual* attempt, the *actual* good day, the *actual* first missed day. Zero-Guilt from first contact (screener D4): lapses are ordinary data, never a failure for the participant to explain away.
- **Consent & privacy:** record only with explicit consent; store transcripts under opaque participant IDs (P01…P15); strip names and re-identifiable detail at transcription; no health diagnosis/severity/history is to be solicited (see §1).

### 2.1 Interview spine (identical for all 15)

1. Walk me through the **last time you tried to start a small daily thing.** What was happening in your life at the time?
2. What made you pick **that** thing? Where did the idea come from?
3. Tell me about a **good day** for it — what actually happened, start to finish.
4. Tell me about the **first day it didn't happen.** And then what?
5. If you used an **app or tool**, what did it feel like to open it? When did you stop?
6. What would have made it **easier to come back** after a gap?
7. When did it feel **worth it** — if ever? What did "worth it" feel like?

### 2.2 Probes (use sparingly, non-leading)

- For cue reality (Q1–Q3): *"What else was happening right before you did it?"* — surface anchors vs alarms without naming either.
- For the lapse (Q4): *"What did you do next?"* — capture restart behaviour, not a reason to justify.
- For reward (Q7): *"How did you know?"* — distinguish a felt/real-body signal from an app signal.
- **Forbidden probe forms:** never use the words *habit*, *streak*, *HerRays*, *should*, or *consistent* in a question — all carry judgment or prime the thesis (mirrors the screener §7 neutrality audit).

### 2.3 Analysis convention

Open coding of each transcript → axial grouping into the B1–B7 barrier families (§3) → cross-case frequency + saturation check (§4 template). **Two-coder convention:** two researchers code independently; disagreements resolved by the behavioral scientist. A code is counted for a participant **only when the transcript shows the behaviour**, not merely a sentiment.

---

## 3. Barrier coding scheme (B1–B7)

Seven barrier families. Each is defined by an **observable behaviour in the transcript**, mapped one-to-one to the mechanism it violates in `behavior-change-evidence-register.md` (TASK-005) and to the matching anti-pattern in `competitor-anti-patterns.md` (TASK-004). This is the durable instrument: it is designed to survive replacement of any data and to produce a reproducible coding of real transcripts.

| Code | Barrier family | Observable signal in transcript | Violated mechanism (evidence register) | Anti-pattern link |
|---|---|---|---|---|
| **B1** | **Effort/friction exceeds value** | Logging or doing felt heavier than the payoff; setup cost incurred before any win | Action simplicity; engagement ≠ efficacy | Onboarding-friction family |
| **B2** | **All-or-nothing / broken-streak guilt** | A miss or reset erased perceived progress → avoidance | Flexible consistency; fresh-start restart | Streak-reset, HP-loss, report-card UI |
| **B3** | **Decision / goal-setting burden** | Had to choose what to do or set goals before acting → stalled | Goal clarity *mis-applied as up-front configuration* | Pre-action configuration friction |
| **B4** | **Missing or brittle cue** | No reliable trigger; fixed clock-time collided with real life | Cues / implementation intentions (Wood & Neal; Gollwitzer) | Fixed-time reminder pressure |
| **B5** | **Reward disconnected from real behaviour** | Points/badges stopped meaning anything; no real-body signal | Reward actual behaviour, not app engagement (PRD §3) | XP economy / vanity rewards |
| **B6** | **Life-disruption with no recovery path** | Travel / illness / shift broke the routine; nothing helped the return | Fresh-start restart; lapse tolerance | No gentle-restart affordance |
| **B7** | **Notification / pressure fatigue** | Reminders felt like nagging → muted → app forgotten | Autonomy / SDT (over-prompting erodes it) | Notification pressure, guilt pings |

### 3.1 Protective factors (inverse codes, expected from Segment B)

Sustainers are a **blueprint, not a control group.** Code their transcripts for the positive inverse of each barrier — these are the mechanisms HerRays should engineer, and the hypothesis is that they converge with the Zero-Guilt constraint:

- **anti-B4** — robust/contextual cue (a thing that happens anyway: a pet, coffee, a lobby), not an alarm.
- **anti-B5** — intrinsic or real-body reward, not points.
- **anti-B1** — bounded-tiny design that never competes with fatigue.
- **anti-B6** — self-paced graduation + a self-invented "tiny variant" for bad days.
- **identity** — "this is part of who I am now" framing.

---

## 4. Barrier taxonomy template (to be populated from real transcripts)

When the 15 interviews exist, tabulate as below. **The cells are intentionally empty — they are filled only with counts from real coded transcripts.** The acceptance criterion requires a coded synthesis of **≥5 recurring barriers**; the scheme supports 7.

| Rank | Barrier | Participants exhibiting (IDs) | n/15 | Segments most affected | Primary design implication → owning task |
|---|---|---|---:|---|---|
| — | **B1 Effort/friction exceeds value** | _(from data)_ | _(from data)_ | _(from data)_ | First action one tap / ≤2 s, no setup before a win → CLAUDE.md §2; TASK-020, TASK-015 |
| — | **B2 All-or-nothing / streak guilt** | _(from data)_ | _(from data)_ | _(from data)_ | No streak reset, no report-card UI; missing never erases progress → TASK-027, TASK-032 |
| — | **B3 Decision / goal-setting burden** | _(from data)_ | _(from data)_ | _(from data)_ | Remove the work of choosing — suggest one tiny action → differentiation thesis; TASK-025, TASK-024 |
| — | **B4 Missing / brittle cue** | _(from data)_ | _(from data)_ | _(from data)_ | Cues routine-anchored or contextual, never fixed-clock-only; opt-in → TASK-023 |
| — | **B5 Reward disconnected from behaviour** | _(from data)_ | _(from data)_ | _(from data)_ | Reward the real action and real-body signal, not points → PRD §3; TASK-021, TASK-031 |
| — | **B6 Life-disruption, no recovery path** | _(from data)_ | _(from data)_ | _(from data)_ | Gentle restart ≤2 taps after 1/3/7 missed days; tiny variant → TASK-027, TASK-022 |
| — | **B7 Notification / pressure fatigue** | _(from data)_ | _(from data)_ | _(from data)_ | Notifications opt-in, taperable, never guilt-framed → TASK-023, TASK-036 |

**Saturation rule:** stop-and-review when no new barrier family appears across three consecutive transcripts. If saturation is reached before n=15, record it and continue the remaining interviews to confirm, rather than halting recruitment.

**A-priori hypotheses (to confirm or refute with data, NOT findings):** the Stage-1 evidence base (TASK-004/005) and the differentiation thesis predict B1 (friction) and B3 (decision burden) as the most load-bearing barriers for Segment C, and B2/B4/B6 for Segment A. These are the priors the real interviews are run to test — they are explicitly not results, and must not be cited as such by any decision gate.

---

## 5. Analysis workflow & quality controls

### 5.1 Pipeline

1. **Transcribe** each session under an opaque ID; redact names/re-identifiable detail at this step.
2. **Open-code** independently (two coders) against the §3 scheme; capture one illustrative, de-identified paraphrase per code per participant for the synthesis appendix.
3. **Axial grouping** into B1–B7; resolve disagreements via the behavioral scientist.
4. **Cross-case frequency** into the §4 template; compute n/15 per code and segment breakdown.
5. **Saturation check** (§4 rule) and **limitations log** (§5.2) carried forward to TASK-010.

### 5.2 Limitations to state in the final synthesis

- **Purposive, non-representative** by design (screener §3); n=15 qualitative, sized for saturation of barrier families, not prevalence.
- **Retrospective recall** (spine Q1–Q5) is subject to memory bias; the diary study (TASK-009) exists specifically to catch in-the-moment failures recall misses.
- **Segment B self-selection:** volunteer sustainers may over-represent intrinsic-motivation types; treat their mechanisms as hypotheses to test (TASK-016), not proven transfer.
- **No health-claim content** elicited or coded; eligibility-sensitive respondents screened out upstream (screener E5/E6).

### 5.3 Synthetic coding fixtures (NON-DATA — pipeline test only)

To demonstrate the coding scheme is deterministic and auditable *before* real transcripts arrive, two **synthetic** mini-vignettes are coded below. **These are invented test fixtures, not interview records, and carry no frequency weight.** They exist solely to show two independent coders would land on the same codes.

- *Fixture X (constructed, Segment-A shape):* "Tied my evening stretch to 'after dinner,' but dinner time moves every night; missed two nights when my kid was ill, came back to a streak of zero, and stopped opening it." → **B4** (fixed-ish anchor that drifts), **B6** (illness disruption, no recovery), **B2** (streak-zero → avoidance). Both coders converge; no sentiment-only codes.
- *Fixture Y (constructed, Segment-C shape):* "Downloaded two apps, each wanted my email and my goals before showing anything; closed them at the sign-up screen." → **B3** (goal/config before acting), **B1** (setup cost before any win), **B7** (permission/sign-up gate as pressure). Both coders converge.

These fixtures validate the *instrument*. They are not evidence and appear in no frequency table.

---

## 6. Definition of done (what closes TASK-008 honestly)

TASK-008 may move to `in_review` **only** when all of the following exist:

1. **15 real anonymized interview records** — actual sessions recruited through the TASK-007 screener to the A×6 / B×4 / C×5 quotas; opaque IDs; no re-identifiable detail.
2. **Independently double-coded** against the §3 scheme, disagreements resolved per §2.3.
3. **A coded synthesis of ≥5 recurring barriers** — the §4 template populated with real counts, segment breakdowns, and one de-identified illustrative paraphrase per load-bearing barrier.
4. **Limitations log** (§5.2) completed and carried to TASK-010.

Until item 1 exists, the task is blocked, not done. This framework satisfies items 2–4's *design*; it cannot satisfy item 1.

---

## 7. Blocker statement (surfaced explicitly)

> **TASK-008 is BLOCKED pending human-subject research.** Running 15 real behavioral interviews is out of scope for an autonomous overnight build (no participants, no recruitment, no consent process executable here). Per the Reviewer's 2026-11-22 ruling, synthetic records must **not** be advanced through the research gate as if empirical. This deliverable therefore ships the **field-ready instruments** (protocol §2, coding scheme §3, taxonomy template §4, workflow §5) so execution is turnkey once real sessions are possible, and leaves the empirical record requirement **open**.
>
> **Unblock path:** a human operator recruits and runs the 15 sessions via `user-recruitment-screener.md`, transcribes and double-codes them, populates §4, then advances TASK-008 to `in_review`. No instrument redesign is required.

---

## 8. Acceptance-criterion status

| TASK-008 acceptance requirement | Status |
|---|---|
| **15 anonymized interview records** | **OPEN / BLOCKED** — requires human-subject research (§7). No synthetic stand-in is presented as satisfying this. |
| **Coded synthesis of ≥5 recurring barriers** | **Framework ready, data pending** — §3 scheme (7 families) + §4 template support ≥5; cells fill only from real transcripts. |

**Verification note:** Research-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed exit 0 (below). Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
