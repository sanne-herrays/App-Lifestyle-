# Prevention-Action Evidence & Safety Rubric — Rating Health Actions for HerRays

**Task:** TASK-006 · **Workstream:** Research · **Stage:** Behavioral validation (PRD §5) → feeds Experience (TASK-024/025) and Launch (TASK-041/042)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22

---

## 1. Purpose

The behavior-change register (TASK-005) grades **mechanisms** — *does cueing / self-monitoring / autonomy actually change behavior?* It stops hard at a boundary it names three times: it may say "self-monitoring increases goal attainment (grade A)"; it may **not** say "this app prevents diabetes." That second kind of statement — *about the health action itself and what it does to a person's body or disease risk* — was explicitly deferred here (TASK-005 §2.2, §2.3, §8 note 6; TASK-004 AP19/AP20).

This document is that gate. It is the **method for rating a candidate health micro-action on two axes the behavioral register does not touch — how safe it is, and how strong the evidence is that it confers an *established general-population health benefit* — and for binding each rating to the exact language the product is allowed to use.** Its single most important job is to let HerRays recommend real health actions **without ever implying personal disease-risk reduction** (CLAUDE.md §3; PRD §5 "distinguish established general health benefits from unsupported individual disease-risk claims").

Every action that enters the catalog (TASK-024) must carry a completed **Action Evidence & Safety Record (AESR)** built from this rubric. The rubric is the contract between three downstream consumers:

- **TASK-024** (evidence-reviewed action catalog) — each record *is* an AESR; the rubric defines its required fields.
- **TASK-025** (recommendation rules) — contraindication and safety fields are the hard exclusion filters the engine reads.
- **TASK-042** (editorial package) + all user-facing copy — the claim-limit ladder (§5) is the only source of permitted health language; the claims-review step cites this document.

**What this is not.** It is not medical advice, not a regulatory determination, and not a clinical guideline. It is a product-grade rating method, written to be conservative, auditable, and falsifiable, that keeps HerRays firmly in the space of *generally-recommended, low-risk, widely-beneficial everyday actions* and out of the space of *individualized medical or disease-prevention claims*.

---

## 2. Scope: what may and may not be rated

### 2.1 In scope — the only kind of action HerRays ships

A candidate action is eligible for rating **only if all four gates pass**:

1. **Low-risk for a general adult population** — the kind of action public-health bodies already recommend universally (move a little, step outside, drink water, breathe slowly, stretch, connect with someone). If it needs medical supervision, dosing, or screening, it is out.
2. **Tiny** — completable in the PRD §1 floor of ~20 seconds to 2 minutes, with an easier variant (ties to TASK-005 §3.7, TASK-022/024).
3. **Benefit is general and non-promissory** — supported as broadly healthy for people in general, not sold as changing *this user's* risk of a named disease.
4. **Self-administered and reversible** — no action whose harm, if the rubric is wrong, could be serious or irreversible.

### 2.2 Out of scope — hard-blocked, never rated as a HerRays action

| Out-of-scope class | Example | Why blocked |
|---|---|---|
| Clinical / dosed interventions | "Take 2000 IU vitamin D," fasting protocols, supplement regimens | Needs medical context, screening, individualized dosing; AP19 risk |
| Diagnostic or screening prompts | "Check this symptom," self-diagnosis flows | Implies medical assessment HerRays is not qualified to give |
| Disease-targeted protocols | "Do X to lower your blood pressure / prevent cancer" | Individual disease-risk claim — the exact claim CLAUDE.md §3 forbids |
| Elimination / restrictive diet actions | "Skip carbs today," calorie targets | Eating-disorder risk; not low-risk for all; guilt vector |
| Vigorous / load-bearing exercise without screening | "Do 50 burpees" | Cardiac/injury risk in an unscreened population |
| Anything targeting a vulnerable group's condition | Pregnancy, pediatric, chronic-disease management actions | Requires clinical governance outside this rubric |

> Out-of-scope candidates are rejected at intake, logged with the reason, and never shown. The recommendation engine (TASK-025) must have no code path that can surface them.

---

## 3. The rubric — the five required dimensions

Every AESR carries these five fields (the acceptance criterion), plus traceability fields. Dimensions **3.1–3.5 map one-to-one** to the acceptance criterion: *evidence grade, contraindications, claim limits, review owner, review date.*

| # | Field (acceptance criterion) | What it records | Who fills it |
|:--:|---|---|---|
| 3.1 | **Evidence grade** | A–D strength of evidence that the action confers an *established general-population* health benefit | Preventive-health specialist |
| 3.2 | **Contraindications** | Who should modify, skip, or check first — the safety filter | Preventive-health specialist |
| 3.3 | **Claim limits** | The exact permitted benefit statement + the forbidden framings for this action | Preventive-health specialist + Editorial |
| 3.4 | **Review owner** | The named accountable role for this record | Assigned at intake |
| 3.5 | **Review date** | Last-reviewed date + next-review-due date + trigger events | Review owner |
| + | Safety/risk tier | S1–S3 (see §3.2) — orthogonal to evidence; a well-evidenced action can still carry a caution | Preventive-health specialist |
| + | Easier variant | The ≤20-second fallback (ties TASK-022/024) | Product + specialist |
| + | Behavioral linkage | Which TASK-005 mechanism(s) this action rides on | Behavioral scientist |

### 3.1 Evidence grade — strength of the *general health benefit* claim

A GRADE-inspired, deliberately conservative four-tier scale. It rates **how well established the benefit is for people in general** — not effect size, and explicitly **not** individual risk reduction. It is intentionally aligned with TASK-005's A–D scheme so reviewers read one grading language across both registers.

| Grade | Meaning | Typical basis | What it licenses |
|:---:|---|---|---|
| **A** | Established universal recommendation | Convergent systematic reviews / major public-health guidance; benefit accepted for general adults | A plain general-benefit statement (still non-disease, non-individual) |
| **B** | Well-supported | Multiple consistent studies / guideline support with some heterogeneity | A softened "is associated with / can support" statement |
| **C** | Plausible / emerging | Mixed or early evidence, strong mechanism, thin field replication | "Many people find…" experiential framing only; no benefit assertion |
| **D** | Insufficient / contested | Mostly anecdote or popular wellness lore | **Not shippable as a benefit** — allow only as neutral, enjoyable action with no health claim, or reject |

> **The engagement≠efficacy caution still applies.** An action can be enjoyable and retentive (good for the product) while its *health* evidence is only C. Grade the health claim, not the app metric.

### 3.2 Safety / risk tier — orthogonal to evidence

Evidence and safety are independent axes: a grade-A action can still need a caution, and a low-risk action can be only grade-C on benefit. Both are recorded.

| Tier | Meaning | Handling |
|:---:|---|---|
| **S1** | Negligible risk for general adults | Ship with standard easier-variant; no special gating |
| **S2** | Low risk with common-sense caveats | Ship with a short, non-alarming caveat and contraindication list (§3.2 field) |
| **S3** | Low-risk *only* with a stated precondition (e.g., "if mobility allows") | Ship only with an explicit, gentle self-check and an easier variant that removes the precondition |
| **S4** | Cannot be made general-safe | **Reject** — route back to §2.2 out-of-scope |

### 3.3 Contraindications — the safety filter the engine reads

A structured list, never free text alone, so TASK-025 can exclude deterministically. Each contraindication names a **condition/context** and a **disposition**: *modify*, *offer easier variant*, *skip for now*, or *advise check with a professional* (advisory, never diagnostic). Taxonomy:

- **Physical** — mobility, balance, injury, pain ("stand and stretch" → seated variant).
- **Cardio-respiratory exertion** — anything raising exertion above a gentle walk gets an exertion caveat and a lower-intensity variant.
- **Environmental** — weather/air-quality/safety for "go outside" (→ indoor variant).
- **Contextual safety** — never prompt an action unsafe to do while driving/working.
- **Sensory / neurodivergence** — e.g., breathing exercises for some users with anxiety/respiratory conditions → optional, with an opt-out.
- **Pregnancy / clinical condition** — if any plausible interaction exists, add a gentle "you know your body / check with your clinician" and an easier variant; if the action *requires* clinical judgment, it is S4/out-of-scope.

> **Design rule.** Every contraindication must resolve to a *buildable exclusion or a gentler variant* — never to a scary warning (that would violate Zero-Guilt). The fallback flow (TASK-022) is the safety mechanism, not a red banner.

### 3.4 Review owner — named accountability

| Record state | Accountable role (PRD team table) |
|---|---|
| Evidence grade & safety tier | **Preventive-health specialist** (sign-off authority) |
| Claim-limit wording | **Preventive-health specialist** + **Editorial storytelling** (joint) |
| Catalog integration & exclusion logic | **iOS technical lead** / product owner of TASK-024/025 |
| Final claims gate before launch | **Preventive-health specialist** signs the TASK-042 claims review |

Until a named owner has signed the record, the action is `draft` and **must not** be shown to any user. "The team" is not an owner; a role is.

### 3.5 Review date — nothing is evergreen

Each AESR carries:

- **Last-reviewed** — ISO date the current grade/claim was confirmed.
- **Next-review-due** — by cadence below.
- **Review triggers** — events that force an immediate re-review regardless of date.

| Evidence grade | Default review cadence |
|:---:|---|
| A | Every 24 months |
| B | Every 18 months |
| C | Every 12 months |
| D | Not shipped; re-evaluate only if promoted to a candidate |

**Mandatory re-review triggers (override the cadence):** new major guidance/guideline change touching the action; any reported adverse event or user-safety report; a claims/regulatory challenge; a contraindication discovered in testing (TASK-039/040); or a wording change to the benefit statement. An action whose **next-review-due has passed** is automatically flagged and its benefit copy suppressed to grade-C "many people find…" framing until re-reviewed — it is never silently shown on stale evidence.

---

## 4. The rating workflow (intake → ship)

```
 candidate action
      │
      ▼
 [Gate 1] §2.1 eligibility (low-risk? tiny? general? reversible?)  ──fail──► reject + log reason
      │ pass
      ▼
 [Gate 2] assign Safety tier S1–S4 (§3.2)                          ──S4──► reject (out-of-scope §2.2)
      │ S1–S3
      ▼
 [Gate 3] assign Evidence grade A–D (§3.1)                         ──D──► no health claim: neutral action or reject
      │ A–C
      ▼
 [Gate 4] write Claim limit from the ladder (§5) at/below grade    ◄──── Editorial + specialist
      │
      ▼
 [Gate 5] list Contraindications → buildable exclusions/variants (§3.3)
      │
      ▼
 [Gate 6] assign Review owner + Last-reviewed + Next-review-due (§3.4/3.5)
      │
      ▼
 owner signs → status = approved → eligible for TASK-024 catalog + TASK-025 engine
```

**No step is skippable, and the gates are ordered by cost of being wrong:** safety before evidence, evidence before claims. An action may ship as *approved* only when all six gates and a named sign-off are present.

---

## 5. Claim-limit ladder — the only permitted health language

This is the operational heart of the rubric and the direct answer to "rate evidence **without implying personal disease-risk reduction**." The permitted statement is bounded by the evidence grade; the forbidden framings are bounded for *every* grade.

### 5.1 Permitted benefit statements by grade

| Grade | May say (general, non-individual, non-disease) | Must not exceed |
|:---:|---|---|
| **A** | "Moving your body is broadly good for health." / "Time outside is widely recommended for wellbeing." | Still no "for *you*," no named disease, no quantified risk |
| **B** | "A short walk is associated with feeling more energized for many people." | No causal promise, no "will," no outcome guarantee |
| **C** | "Lots of people find a minute of slow breathing helps them feel calmer." | Experiential only — "many people find," never "this improves X" |
| **D** | *(no health statement at all)* | — |

### 5.2 Forbidden framings — at every grade, no exceptions

- ❌ **Individual disease-risk reduction** — "reduces *your* risk of [diabetes/heart disease/cancer/dementia]," "prevents," "protects you from."
- ❌ **Quantified outcome** — "cuts risk 30%," "adds years to your life," "burns N calories."
- ❌ **Causal cure/treatment language** — "treats," "heals," "fixes," "boosts immunity."
- ❌ **Diagnostic or personalized medical framing** — "based on your health, you should…," anything implying assessment of the individual.
- ❌ **Fear / scarcity health framing** — "don't skip or you'll…," loss-framed health consequences (also a Zero-Guilt violation, TASK-004 AP18/AP19).
- ❌ **Timeline promises** — "in 21 days you'll be healthier" (collides with TASK-005 §3.6 "66-day" prohibition).

### 5.3 Approved phrasing bank (reusable, pre-cleared patterns)

- "A little [action] — a nice thing to do for yourself today."
- "Many people enjoy / find [benefit-feeling] after [action]."
- "[Action] is one of those small things that's broadly good to do." *(A/B only)*
- "No pressure — this is just today's tiny win." *(always available)*

> **Reviewer rule (add to PR checklist alongside TASK-004 red-flags and TASK-005 grade-gate):** every health-adjacent string in the app must map to an approved pattern **at or below** its action's evidence grade, and must survive the §5.2 forbidden-framings scan. Copy with no backing AESR does not ship.

---

## 6. Worked examples

Three candidate actions run through the rubric, showing a completed AESR each. (Evidence grades below are the product-grade working assessments to be **verified against primary public-health guidance before launch** — see §8.)

### 6.1 "Two minutes outside"  *(the PRD's flagship action)*

| Field | Entry |
|---|---|
| Evidence grade | **A** — time outdoors / light activity / daylight exposure is near-universally recommended for general wellbeing |
| Safety tier | **S2** — weather, air quality, personal safety at night |
| Contraindications | Environmental (bad weather/air → indoor-by-a-window variant); contextual safety (not while driving); mobility (step outside *or* open a window and look out) |
| Claim limit | May say (A): "Stepping outside is widely recommended and a nice reset." **Not:** "sunlight prevents depression," "lowers your blood pressure" |
| Easier variant | "Just open a window and take three breaths of fresh air" (≤20s) |
| Behavioral linkage | TASK-005 §3.1 cues, §3.7 action simplicity |
| Review owner | Preventive-health specialist |
| Last-reviewed / next-due | 2026-11-22 / 2028-11-22 (A: 24 mo) |

### 6.2 "A glass of water"

| Field | Entry |
|---|---|
| Evidence grade | **B** — staying hydrated is broadly sensible; strong *specific* benefit claims are overstated in popular media |
| Safety tier | **S2** — rare fluid-restriction conditions (certain kidney/heart conditions) |
| Contraindications | Clinical (fluid-restricted users → "if your clinician has advised limiting fluids, skip this one" + swap action); no exertion/physical risk |
| Claim limit | May say (B): "A glass of water — many people feel a little fresher." **Not:** "flushes toxins," "boosts metabolism," "prevents [disease]" |
| Easier variant | "One sip counts" |
| Behavioral linkage | §3.1 cues (stack on an existing routine), §3.4 immediate simple completion |
| Review owner | Preventive-health specialist |
| Last-reviewed / next-due | 2026-11-22 / 2028-05-22 (B: 18 mo) |

### 6.3 "One minute of slow breathing"

| Field | Entry |
|---|---|
| Evidence grade | **C** — calming effect is plausible and popular; rigorous general-population benefit evidence is mixed/emerging |
| Safety tier | **S3** — can feel uncomfortable or anxiety-provoking for some (panic, certain respiratory conditions) |
| Contraindications | Sensory/neurodivergence & respiratory (optional, easy opt-out, "stop anytime"); never forced; offer a non-breathing calm alternative |
| Claim limit | May say (C, experiential only): "Lots of people find slow breathing helps them feel calmer." **Not:** "reduces anxiety," "treats stress," "lowers cortisol" |
| Easier variant | "Just one slow breath" |
| Behavioral linkage | §3.8 positive affect (grade C — build-and-test), §3.9 autonomy (fully optional) |
| Review owner | Preventive-health specialist |
| Last-reviewed / next-due | 2026-11-22 / 2027-11-22 (C: 12 mo) |

> Note how grade drives language: §6.1 earns a plain statement, §6.3 is confined to "many people find." The rubric makes the honesty automatic.

---

## 7. Implementation handoff map

| Rubric output | Owning task | What it becomes |
|---|---|---|
| The AESR schema (§3 five fields + traceability) | **TASK-024** | The required record shape for all ≥20 catalog actions (evidence grade, contraindications, duration, easier variant, review date — already the TASK-024 acceptance fields) |
| Contraindication lists → structured exclusions (§3.3) | **TASK-025** | Hard exclusion filters in the recommendation rules; the no-match fallback when all actions are contraindicated |
| Safety tiers + easier variants (§3.2) | **TASK-022** | The fallback flow is the primary safety control (variant, not warning) |
| Claim-limit ladder + forbidden framings (§5) | **TASK-042**, all copy | The claims-review gate; the approved-phrasing bank; the PR health-copy checklist |
| Review owner + cadence + triggers (§3.4/3.5) | **TASK-041**, ops | Governance: who signs, when records expire, stale-evidence suppression |
| Grade→claim discipline (§5.1) | **TASK-031** (7-day preview), **TASK-016** | Preview/marketing make "no unsupported health-outcome promises" by construction |

This rubric is the **safety/claims source of truth**; TASK-005 is the behavioral source of truth. Together they gate every health-adjacent decision: TASK-005 answers *does the mechanism change behavior?*, this document answers *is the action safe, how well-evidenced is its general benefit, and what may we say about it?*

---

## 8. Evidence & verification notes

This rubric is a **product-grade rating method**, not a clinical or regulatory determination. Before any action ships (TASK-024) or any health claim is published (TASK-042), verify:

1. **Each action's evidence grade** against current major public-health guidance (e.g., national physical-activity, hydration, and wellbeing recommendations) — the §6 working grades are provisional and carry a **verify-against-guidance** flag.
2. **Claims classification** — confirm the permitted-statement ladder (§5) against current advertising-standards and app-store health-claim guidance in each launch market; adjust the ladder, not the individual strings, if the bar moves (CLAUDE.md §3; PRD "verify … privacy/regulatory classification").
3. **Contraindication completeness** — have the preventive-health specialist review each list before launch; usability/pilot testing (TASK-039/040) must surface and feed back any missed contraindication as a §3.5 re-review trigger.
4. **No individual-risk or disease-prevention claim** may be derived from this document under any grade — this is the categorical boundary the rubric exists to hold (§5.2).
5. **Role sign-off exists** — no AESR is `approved` without a named review owner and both dates recorded; the engine must refuse to surface `draft` or expired records.

> **Confidence tags.** The *rubric method* (grading scheme, gates, claim ladder, governance) is high-confidence and ready to adopt. The *specific grades* in §6 are working assessments pending guidance verification (note 1). The forbidden-framings list (§5.2) is deliberately stricter than any single regulator to stay safely inside CLAUDE.md §3.

**Status:** Research-only deliverable. No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).
