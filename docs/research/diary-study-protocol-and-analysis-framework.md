# 14-Day Diary Study Protocol & Analysis Framework (HerRays Stage-2 Discovery)

**Task:** TASK-009 (instruments only — see §0) · **Workstream:** Research
**Owner:** UX researcher (per PRD team table) · **Reviewers:** Behavioral scientist (coding validity), Product strategist (segment fit)
**Recruits via:** `user-recruitment-screener.md` (TASK-007) · **Companion instrument:** `behavioral-interview-protocol-and-analysis-framework.md` (TASK-008)
**Feeds (once real data exists):** TASK-010 (primary audience & JTBD), TASK-011–013 (concept briefs), TASK-022/023 (fallback & cue scheduler), TASK-020–032 (experience)
**Date:** 2026-11-22

---

## 0. What this document is — and what it is not (read first)

This is the **field-ready instrument and analysis framework** for TASK-009: the 14-day diary protocol, the daily entry instrument, the opportunity/barrier coding scheme, the **context-map framework**, and the **completion-rate definitions and computation method**. These are the reusable, durable deliverables.

**This document does NOT contain the ≥10 completed participant diaries that TASK-009's acceptance criterion requires, and it does not claim to.** A real 14-day diary study cannot be conducted inside an autonomous overnight build: it requires recruited, consented participants making in-the-moment entries across fourteen real calendar days. Fabricating fourteen days of entries for ten people and presenting them as field data would (a) violate CLAUDE.md §3 (no fake content), and (b) repeat exactly the error the Reviewer **rejected** for the sibling task TASK-008 (PROGRESS.md, 2026-11-22), where constructed human-subject records were ruled scaffolding, not an empirical deliverable, and barred from the research gate (TASK-010, TASK-019).

**Status of TASK-009: `blocked` — requires human-subject research.** The empirical requirement (≥10 complete diaries + a populated context map + an observed completion rate) remains **open**. The Reviewer anticipated this precise outcome in the TASK-008 ruling: *"Downstream Research tasks that also require human-subject research (TASK-009 diary study) ... are likely blocked for autonomous execution for the same reason — flagged for human triage."* This framework is published now so that the moment real participants can be run, there is nothing to design — only to execute, collect, code, and tabulate. See §7 for the definition-of-done and §8 for the explicit blocker statement and unblock path.

Everything below the line is genuine instrument design grounded in the PRD (§2 discovery, §5 behavior engine), the TASK-007 screener, `behavior-change-evidence-register.md` (TASK-005), `competitor-anti-patterns.md` (TASK-004), `prevention-action-evidence-rubric.md` (TASK-006), and the TASK-008 interview framework. No synthetic data is presented as findings anywhere. §4.3 and §5.4 contain **worked calculation fixtures on explicitly invented numbers**, labelled NON-DATA, used only to prove the context-map coding and the completion-rate formulas are deterministic and auditable; they carry zero evidential weight and appear in no results table.

---

## 1. Recruitment linkage (gate from TASK-007)

Participants are drawn **only** through `user-recruitment-screener.md`. The screener's three mutually-exclusive segments and **diary quotas** bind this protocol exactly (screener §3; quota math 4 + 3 + 3 = 10, sized to the ≥10 acceptance target with a recruit-to-12 buffer against attrition — see §2.4):

| Segment | Definition (screener §3) | Diary quota | Why this segment is in the diary (not only interviews) |
|---|---|---:|---|
| **A — Abandoned-app users (lapsed)** | Installed a habit/wellness app ≤12 mo ago; stopped ≤~30 days of use | **4** | Catches the *in-the-moment* lapse that retrospective interviews (TASK-008) miss — the actual day and context a routine died, not the remembered story of it. |
| **B — Successful habit builders (sustainers)** | 3+ months of a sustained daily routine; app-free sustainers welcome | **3** | Reveals the real-world cues and recovery moves sustainers use *as they happen*, a live blueprint for the protective factors (TASK-008 §3.1). |
| **C — Busy beginners (time-starved)** | High time pressure; no sustained routine | **3** | Surfaces where a two-minute action could realistically slot into a loaded day — the "moments of opportunity" the context map (§4) exists to find. |

Exclusions E1–E8 (screener §4) are applied **before** enrolment. Two are load-bearing for this study specifically:
- **E7 (availability)** screens out anyone who cannot commit to ~2 min/day for 14 days in the study window — this directly protects the completion rate (screener §4 note: *"TASK-009 needs ≥10 complete diaries"*).
- **E5/E6 (eligibility-sensitive)** are screened out upstream so that **no health-claim content is elicited, prompted, or coded** in any diary entry, consistent with `prevention-action-evidence-rubric.md` and TASK-041 data-minimization. The diary observes *whether and where a tiny action happened*, never a health outcome.

---

## 2. Diary study protocol

### 2.1 Design — a hybrid of time-contingent and event-contingent sampling

A single sampling mode is insufficient for this study's two jobs, so the protocol runs both in parallel for 14 days:

| Mode | Trigger | Captures | Guards against |
|---|---|---|---|
| **Daily time-contingent entry** (once/day, user-chosen slot) | A single gentle, opt-in reminder at a self-set time | The day's *opportunities* for a tiny action — moments where one could have happened, whether or not it did | Survivorship bias: days with no action still produce an entry, so failures and non-opportunities are visible |
| **Event-contingent entry** (as it happens) | The participant performing — or consciously skipping — a tiny real-world action | The in-the-moment context (where, what was happening right before, how it felt), captured before memory decays | Recall bias — the exact failure mode interviews cannot reach (TASK-008 §5.2) |

This is the methodological reason the diary study exists alongside interviews: **it measures real decisions in real contexts rather than remembered ones** (PRD §2 — *"observe real decisions and routines rather than relying only on stated preferences"*).

### 2.2 Zero-Guilt stance (CLAUDE.md §1, from first contact)

- A **missed day is ordinary data, never a failure.** The daily entry explicitly offers *"Nothing today — and that's fine"* as a first-class, one-tap option (not a greyed-out afterthought). Participants are told at enrolment that days with no action are **as valuable to the research as days with one.**
- **No streaks, no completion meters, no nagging.** At most one opt-in daily reminder, self-scheduled, silenceable, never guilt-framed — the instrument must not itself reproduce the anti-patterns (TASK-004 B2/B7) the study is trying to observe in participants' own prior tools.
- Entry effort is bounded to **≤2 minutes/day** (screener §4 E7 commitment) to avoid the study instrument becoming the very effort>value barrier (B1) it measures.

### 2.3 Consent, privacy & data handling (governed by TASK-041)

- Explicit informed consent at enrolment; entries stored under opaque participant IDs (D01…D12); names and re-identifiable detail stripped at ingestion.
- Free-text is for *context*, not health status; coders redact any volunteered health detail at transcription and it is never coded (see §1, E5/E6).
- Photos, if the instrument allows them, are **optional**, stored with EXIF/location stripped, and never required to complete an entry.
- Participants may withdraw at any time; withdrawn partial data is deleted, not analysed (mirrors TASK-041 withdrawal flow).

### 2.4 Sample, duration & attrition plan

- **Target n = 10 complete diaries** (acceptance floor), composed to the screener quotas **A×4 / B×3 / C×3**.
- **Recruit n = 12** (A×5 / B×3 / C×4 or nearest quota-preserving split) to absorb expected attrition and still land ≥10 complete — *"complete"* defined precisely in §5.1. Over-recruitment is logged, not hidden.
- **Duration: 14 consecutive calendar days** per participant (PRD §2 — *"two-week diary study"*). Staggered start dates are permitted; each participant's 14-day window is analysed on their own day-index (Day 1…Day 14), not wall-clock dates.
- **Onboarding call (10 min):** set the daily reminder slot, practise one entry, confirm the Zero-Guilt framing, confirm no health content will be asked.

---

## 3. Daily entry instrument

### 3.1 The daily entry (time-contingent, once/day — ≤60 s)

Neutral wording; never uses *habit*, *streak*, *HerRays*, *should*, or *consistent* (same forbidden-word list as the screener §7 and TASK-008 §2.2 neutrality audits).

1. **Did a tiny real-world action happen today?** · *Yes, one* · *Yes, more than one* · *No — and that's fine*
2. *(If an action happened)* **What was it, in a few words?** *(free text; context, not health claim)*
3. **When in the day?** *morning / midday / afternoon / evening / night* *(context-map dimension T, §4)*
4. **Where were you / what was happening right before?** *(free text → coded to anchor dimension R, §4)*
5. **Was there a moment today a tiny action *could* have happened but didn't?** *Yes / No* *(the opportunity-missed signal — §4, §5.3)*
6. *(If yes)* **What got in the way, in a few words?** *(free text → barrier code B1–B7, §6.1)*
7. **One tap:** how did today feel for this? *😌 easy · 😐 neutral · 😣 effortful* *(affect, not self-judgment)*

### 3.2 The event-contingent entry (as it happens — ≤30 s)

Fired by the participant, optionally from a home-screen shortcut:

- **Just did one** → timestamp (auto) · *what* (free text) · *where/what-right-before* (free text) · *😌/😐/😣*.
- **Nearly did one, then didn't** → timestamp (auto) · *what got in the way* (free text → B1–B7).

The "nearly, then didn't" path is deliberate: it is the single highest-value capture in the whole study, because it records a real opportunity and its real barrier **at the moment of the decision** — the data interviews structurally cannot reach.

### 3.3 What the instrument deliberately does NOT collect

- No health status, symptom, diagnosis, weight, or diet detail (E5/E6; TASK-006; TASK-041).
- No streak count, no running total, no comparison to other participants (CLAUDE.md §1; TASK-004 B2).
- No mandatory fields beyond Q1 — an entry is valid with only "No — and that's fine."

---

## 4. Context-map framework (the "context map" acceptance deliverable)

The acceptance criterion requires *a context map*. A context map is **not** a single picture invented up front — it is a **coded synthesis of where, when, and in what circumstances tiny actions actually happen (and fail to happen)**, assembled from the real diary entries. This section defines its **dimensions, coding rules, and output template**; the cells fill **only** from real data.

### 4.1 Context dimensions (coded from entries Q3–Q6 and event entries)

| Dim | Context dimension | Values (coded from free text) | Source field | Why it matters (PRD / evidence) |
|---|---|---|---|---|
| **T** | **Time-of-day band** | morning / midday / afternoon / evening / night | Daily Q3; event timestamp | Locates when a two-minute action realistically fits a real day (PRD §2 moments of opportunity). |
| **L** | **Location / setting** | home / commute / work / outdoors / third-place / in-transit | Q4, event free text | Tests the "two minutes outside" class of action against where people actually are. |
| **R** | **Routine anchor** | after-waking / coffee / after-meal / arrival / wind-down / none | Q4, event free text | A real existing routine is the robust cue (evidence register: Wood & Neal; Gollwitzer implementation intentions) vs a brittle clock alarm (B4). |
| **S** | **Social setting** | alone / with-partner / with-kids / with-colleagues / in-public | Q4, event free text | Surfaces social enablers and frictions for a visible tiny action. |
| **O** | **Opportunity outcome** | taken / missed-opportunity / no-opportunity | Q1, Q5, event path | The spine of the map: separates "didn't happen because no chance arose" from "chance arose and was missed" (→ barrier, §6.1). |
| **A** | **Affect** | 😌 easy / 😐 neutral / 😣 effortful | Q7, event tap | Distinguishes a felt-easy action (sustainable) from an effortful one (B1 risk). |

### 4.2 Context-map output template (to be populated from real diaries)

**The cells are intentionally empty — they fill only with coded counts from real entries.** The primary context map is the **T × R opportunity grid** (when × what-anchor), each cell carrying taken / missed / no-opportunity counts; secondary cuts are L×O and S×O.

| Routine anchor (R) ↓ \ Time band (T) → | morning | midday | afternoon | evening | night |
|---|---|---|---|---|---|
| after-waking | _(taken / missed / none, from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| coffee | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| after-meal | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| arrival (home/work) | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| wind-down | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| none / unanchored | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

**Reading rule (for TASK-010/023):** cells with high *taken* density are HerRays' **default cue recommendations** (anchor-contextual, per TASK-023); cells with high *missed-opportunity* density are where the **fallback flow (TASK-022)** and gentler cue design must focus. A cell that is overwhelmingly *no-opportunity* tells us not to suggest an action there at all.

### 4.3 Context-map coding fixture (NON-DATA — determinism check only)

To prove two coders converge on the same context codes before real data exists, one **invented** entry is coded below. **This is a constructed fixture, not a diary record, and carries zero weight in any map cell.**

- *Fixture C (invented):* daily entry — "did 90 seconds of stretching right after my morning coffee at the kitchen counter, kids still asleep, felt fine." → **T**=morning, **L**=home, **R**=coffee, **S**=alone, **O**=taken, **A**=😌. Both coders land identically; the cell (R=coffee, T=morning) increments *taken* by 1. This demonstrates the mapping is deterministic; it is not evidence.

---

## 5. Completion-rate definitions (the "documented completion rate" acceptance deliverable)

The acceptance criterion requires *a documented completion rate*. A single undefined "completion rate" would be ambiguous and would risk the exact confusion the PRD warns against — **counting app engagement as if it were real behaviour** (PRD §3; §5 — *"Measure actual action frequency ... not only app opens"*). This section therefore **defines three distinct, precisely-specified rates**, their formulas, and their result slots. The formulas are final; the numerators/denominators fill only from real data.

### 5.1 Rate 1 — Diary completion rate (study-integrity metric)

*Did we actually run a complete study?* This is the rate the acceptance criterion's "≥10 complete participant diaries" is checked against.

- **Per-participant daily-entry compliance** = (days with a valid daily entry) ÷ 14. A valid entry includes "No — and that's fine" (Q1 answered).
- **"Complete diary" definition (pre-registered to prevent post-hoc leniency):** a participant counts as *complete* iff daily-entry compliance ≥ **11/14 days (≈79%)** AND they completed the day-14 wrap. Days missed are reported, never back-filled.
- **Study completion rate** = (participants meeting the complete-diary bar) ÷ (participants enrolled). Acceptance passes when the numerator ≥ 10.

> **Result slot (from data):** enrolled = _(n)_; complete = _(n)_; study completion rate = _(n/N)_. **OPEN — pending real study.**

### 5.2 Rate 2 — Action-completion rate (behavioural metric — the one that matters for the product)

*When a real opportunity arose, how often did a tiny action actually happen?* This is the behavioural signal, deliberately separated from app/diary engagement (PRD §3).

- **Action-completion rate** = (opportunities where O = *taken*) ÷ (opportunities where O = *taken* OR *missed-opportunity*). *No-opportunity* days are **excluded from the denominator** — a day with no realistic chance is not a failure to complete.
- Reported **overall** and **per segment** (A/B/C) and **per context cell** (§4.2), because the product decision is *where* completion is high, not just whether it is.

> **Result slot (from data):** taken = _(n)_; missed = _(n)_; action-completion rate = _(%)_, with per-segment and per-cell breakdowns. **OPEN — pending real study.**

### 5.3 Rate 3 — Opportunity-capture rate (design-headroom metric)

*How much of the available real-world opportunity is currently being used?* Quantifies the gap HerRays is trying to close.

- **Opportunity-capture rate** = (O = *taken*) ÷ (all entries logging any opportunity, taken or missed). A low rate with many missed opportunities is the product's addressable headroom and points directly at fallback (TASK-022) and cue (TASK-023) design.

> **Result slot (from data):** **OPEN — pending real study.**

### 5.4 Completion-rate computation fixture (NON-DATA — formula check only)

To prove the formulas are deterministic, they are evaluated on **invented** numbers. **These numbers are not data and appear in no result slot.**

- *Invented inputs:* enrolled = 12; complete (≥11/14 + wrap) = 10 → **study completion rate = 10/12 = 83.3%**. Across all participants, O=taken = 180, O=missed = 120, O=no-opportunity = 90 → **action-completion rate = 180 / (180+120) = 60.0%**; **opportunity-capture rate = 180 / (180+120) = 60.0%** (equal here only because this fixture logged no taken-without-prior-opportunity events). The arithmetic is reproducible from the §5.1–5.3 formulas — which is all this fixture shows. It is not a finding.

---

## 6. Analysis workflow & quality controls

### 6.1 Barrier coding — reuse the TASK-008 B1–B7 scheme (shared instrument)

Free-text "what got in the way" fields (daily Q6, event "nearly then didn't") are coded with the **same B1–B7 barrier families** defined in `behavioral-interview-protocol-and-analysis-framework.md` §3, so interview and diary findings are directly comparable and can be triangulated in TASK-010. The diary adds the critical in-the-moment timestamp interviews lack, strengthening any barrier the two methods agree on.

| Code | Barrier family (full definition in TASK-008 §3) | Diary signal | Owning design task |
|---|---|---|---|
| B1 | Effort/friction exceeds value | 😣 affect + "too much effort/tired" | TASK-020, TASK-022 |
| B2 | All-or-nothing / streak guilt | "already broke it" / "missed yesterday so…" | TASK-027, TASK-032 |
| B3 | Decision / goal-setting burden | "didn't know what to do" | TASK-024, TASK-025 |
| B4 | Missing / brittle cue | "forgot" / "no reminder that fit" | TASK-023 |
| B5 | Reward disconnected from behaviour | "didn't feel like it did anything" | TASK-021, TASK-031 |
| B6 | Life-disruption, no recovery path | "travelling / sick / schedule blew up" | TASK-022, TASK-027 |
| B7 | Notification / pressure fatigue | "muted it" / "nagging" | TASK-023, TASK-036 |

### 6.2 Pipeline

1. **Ingest** entries under opaque IDs; redact names and any volunteered health detail at this step.
2. **Code** each entry independently (two coders) on the §4.1 context dimensions and §6.1 barrier codes; a code counts only when the entry *shows* it, not merely implies a sentiment.
3. **Resolve** disagreements via the behavioral scientist (same two-coder convention as TASK-008 §2.3).
4. **Populate** the §4.2 context map and the §5 completion-rate slots from coded counts.
5. **Saturation & limitations** (§6.3) logged and carried to TASK-010.

### 6.3 Limitations to state in the final synthesis

- **Purposive, non-representative** by design (screener §3); n≈10 qualitative, sized for context/opportunity saturation, not prevalence estimates.
- **Reactivity (Hawthorne):** the act of daily logging may itself increase action frequency; the action-completion rate (§5.2) is therefore an *upper-ish* estimate and is labelled as such — the 30-day pilot (TASK-040) tests behaviour without a daily diary.
- **Segment B self-selection:** volunteer sustainers may over-represent intrinsic-motivation types; treat their context patterns as hypotheses to test (TASK-016), not proven transfer.
- **No health-claim content** elicited or coded; eligibility-sensitive respondents screened out upstream (screener E5/E6; TASK-006).
- **Attrition** reported transparently (enrolled vs complete, §5.1); no diary is back-filled or imputed.

---

## 7. Definition of done (what closes TASK-009 honestly)

TASK-009 may move to `in_review` **only** when all of the following exist:

1. **≥10 complete participant diaries** — real participants recruited through the TASK-007 screener to the A×4 / B×3 / C×3 quotas, each meeting the §5.1 "complete" bar (≥11/14 days + day-14 wrap); opaque IDs; no re-identifiable or health detail.
2. **A populated context map** — the §4.2 T×R grid (plus L×O and S×O cuts) filled with coded counts from real entries, with the reading rule applied to name default-cue cells and fallback-focus cells.
3. **A documented completion rate** — Rates 1–3 (§5.1–5.3) computed from real data with per-segment breakdowns and the §6.3 limitations (especially reactivity) stated.

Until item 1 exists, the task is blocked, not done. This framework satisfies the *design* of items 1–3; it cannot satisfy their *data*.

---

## 8. Blocker statement (surfaced explicitly)

> **TASK-009 is BLOCKED pending human-subject research.** Running a real 14-day diary study is out of scope for an autonomous overnight build (no participants, no consent process, no fourteen real days executable here). Per the Reviewer's 2026-11-22 TASK-008 ruling — which explicitly named this task as a likely same-class blocker — synthetic diary entries must **not** be advanced through the research gate as if empirical. This deliverable therefore ships the **field-ready instruments** (protocol §2, daily + event instrument §3, context-map framework §4, completion-rate definitions §5, analysis workflow §6) so execution is turnkey once real participants are possible, and leaves the empirical requirement **open**.
>
> **Unblock path:** a human operator recruits ~12 participants via `user-recruitment-screener.md`, runs the 14-day protocol (§2–§3), double-codes entries (§6), populates the §4.2 context map and the §5 completion-rate slots, then advances TASK-009 to `in_review`. No instrument redesign is required.

---

## 9. Acceptance-criterion status

| TASK-009 acceptance requirement | Status |
|---|---|
| **≥10 complete participant diaries** | **OPEN / BLOCKED** — requires human-subject research (§8). No synthetic stand-in is presented as satisfying this. |
| **A context map** | **Framework ready, data pending** — §4 dimensions + §4.2 T×R template support it; cells fill only from real entries. |
| **A documented completion rate** | **Definitions ready, data pending** — §5 defines three precise rates with final formulas; result slots fill only from real data. |

**Verification note:** Research-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed exit 0 (see PROGRESS.md). Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
