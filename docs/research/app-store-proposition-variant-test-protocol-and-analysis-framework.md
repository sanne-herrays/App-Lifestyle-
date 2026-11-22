# App Store Proposition Variant Test — Protocol & Analysis Framework (HerRays Stage-4)

**Task:** TASK-017 (instruments only — see §0) · **Workstream:** Concepts
**Owner:** Growth & monetization lead (per PRD team table) · **Reviewers:** Product strategist (proposition validity), Data/experimentation scientist (randomization & CI method), Brand/visual director (creative), Preventive-health specialist (claims gate)
**Stimuli:** three store-listing propositions (§2) expressing the PRD §3 concept promises, built on the approved concept briefs (`docs/strategy/`) and the TASK-015 prototypes
**Feeds (once real data exists):** TASK-019 (concept selection — desirability/message-pull evidence), TASK-042 (App Store editorial package — tested copy & screenshots), TASK-043 (launch experiment plan — paid-acquisition creative)
**Date:** 2026-11-22

---

## 0. What this document is — and what it is not (read first)

This is the **field-ready experiment design and analysis framework** for TASK-017: the three concrete proposition variants (real headlines, subheads and screenshot narratives), the audience-equivalence and randomization design, the metric definitions, the pre-registered analysis plan with a stated confidence-interval method, and the result tables with empty slots. These are the reusable, durable deliverables.

**This document does NOT contain the traffic, exposure, click-through and confidence-limit results on live equivalent audiences that TASK-017's acceptance criterion requires, and it does not claim to.** A proposition test measures how **real, cold prospective users** respond to a store listing or ad — it needs a live (or pre-launch) listing or ad account, real impressions accrued across several days, and observed clicks. None of that exists inside an autonomous overnight build: there is no ad spend, no App Store Connect listing serving traffic, no randomized live audience, and therefore no click-through rate and no confidence interval to report. Every traffic, exposure, CTR and CI cell below is an **empty template** waiting on a real run.

This mirrors the Reviewer's repeated, explicit rulings on empirical deliverables (PROGRESS.md, 2026-11-22): human-subject / live-traffic studies (TASK-008 interviews, TASK-009 diary study, TASK-016 blinded desirability test) were **blocked**, and constructed/synthetic records were **forbidden** from being advanced through a decision gate as if empirical. TASK-017 is the same class of work — the TASK-016 completion note named it explicitly as "also a human-subject/live-traffic study — likely a same-class blocker." Fabricating per-variant click-through rates would corrupt TASK-019 (concept selection) and TASK-043 (launch plan), and would violate CLAUDE.md §3.

**Status of TASK-017: `blocked` — requires a live traffic run.** The empirical requirement (per-variant traffic, exposure, click-through and confidence limits, from real equivalent audiences) remains **open**. This framework is published now so that the moment a listing or ad account can serve traffic, there is nothing to design — only to launch, accrue, and tabulate. See §8 for the definition-of-done and §9 for the blocker statement and unblock path.

Everything below is genuine instrument design grounded in the PRD (§3 three concepts, §4 desirability testing, §8 launch/advocacy, concept-selection scorecard), the three approved concept briefs in `docs/strategy/`, the TASK-015 prototypes, and the `prevention-action-evidence-rubric.md` claims ladder (TASK-006). No synthetic data is presented as findings anywhere. §6.5 contains a **labelled NON-DATA fixture** used only to prove the confidence-interval arithmetic is deterministic; it is not a test result and carries zero evidential weight.

---

## 1. Objective, scope, and boundaries

### 1.1 The question this test answers (and the ones it does not)

PRD §4 (Desirability testing) ends with "**Test App Store mockups, short videos and landing pages**"; PRD §8 (Launch) requires testing "App Store discovery and paid acquisition **separately**." TASK-017 owns exactly the **pre-tap message-pull question** and must not silently absorb the neighbouring instruments:

| PRD instrument | Owning task | In scope here? |
|---|---|---|
| Blinded, within-subjects **experience** preference (3 clickable prototypes) | TASK-016 | **No** — that is hands-on preference; this is cold-traffic message pull |
| App Store **proposition / headline / screenshot** variant test | **TASK-017** | **Yes** — the whole of this document |
| Behavioral **willingness-to-pay** test | TASK-018 | **No** — no price, no checkout, no charge in this protocol |
| 7-day voluntary-return / behavioral pilot | TASK-040 | **No** |
| Full paid-acquisition channel experiments (creator/referral/organic/paid) | TASK-043 | **No** — this supplies tested creative *into* that plan |

**Primary question:** *When three equivalent cold audiences each see one of three proposition framings of the product (headline + subhead + screenshot narrative), which proposition earns the most taps — i.e., which message actually makes a stranger want to find out more?*

**Why this is distinct from TASK-016.** TASK-016 asks *recruited* people, hands-on, which **experience** they prefer (within-subjects, blinded). TASK-017 asks *strangers*, pre-tap, which **pitch** pulls (between-subjects, on equivalent audiences). A concept can win hands-on preference yet pitch poorly to a cold audience — or the reverse. Both feed TASK-019; neither replaces the other.

**Explicit non-goals:** this test does **not** measure install→paid conversion (TASK-018/038), does **not** measure retention or real behavior (TASK-040), and does **not** by itself select a concept — it is one input (message pull, feeding the Desirability line) to the TASK-019 decision, which is overridden by the three non-negotiable gates (§7.3).

### 1.2 Why three, and why these three

The three propositions express the three live PRD §3 directions' core promises, so the result is directly comparable to the TASK-016 experience-preference read and routes cleanly into TASK-019. They are deliberately **equivalent in production value** (same visual system, same screenshot count, same word budget) so the test measures *message*, not *polish*.

---

## 2. The three proposition variants (concrete creative — the "variants" under test)

Each variant is a complete App Store-style proposition: a **headline**, a **subhead**, a **three-screenshot narrative**, and a one-line **message hypothesis**. All copy is pre-cleared against the `prevention-action-evidence-rubric.md` §5 claim ladder and the §7 Zero-Guilt / honesty checklist below. No variant may be shown without passing §7.

### Variant P1 — "Tiny Win" framing (subtraction / effortlessness)

- **Headline:** *Your smallest healthy habit, made the best part of your day.*
- **Subhead:** *One tiny action. Twenty seconds to two minutes. No streaks, no guilt.*
- **Screenshot narrative (3 stills):**
  1. The "Your Little Win Today" card mid-gesture — *"Two minutes outside. That's it."* with the hold-to-complete affordance.
  2. The gentle completion moment ("That felt good") — warm, no confetti-spam, no counter.
  3. The easier-variant card — *"Short on time? Twenty seconds counts just the same."*
- **Message hypothesis:** *ease + permission-to-be-small* is the strongest pull for time-starved, previously-burned users (Segment A/C). Tests PRD §3 Tiny-Win thesis (reduced choice/effort → consistency) as a *pitch*.

### Variant P2 — "Growing World" framing (attachment / visible, permanent progress)

- **Headline:** *Every little action grows a world that never fades.*
- **Subhead:** *Do one small thing for yourself and watch something beautiful take root — and it never dies back.*
- **Screenshot narrative (3 stills):**
  1. The world canvas after a handful of planted elements — calm, hand-made, unmistakably *yours*.
  2. The moment an action plants a permanent seed (the reward *is* the growth).
  3. The no-decay promise, stated plainly — *"Miss a day? Your world stays exactly as lovely."*
- **Message hypothesis:** *benign attachment + guilt-free permanence* out-pulls both ease and novelty, especially for lapsed users scarred by withering/streak-loss mechanics (Segment A). Tests the Growing-World thesis (attachment/visual progress → repetition) and foregrounds the Zero-Guilt differentiator.

### Variant P3 — "Everyday Adventures" framing (novelty / situational fit)

- **Headline:** *A fresh little adventure, right where your day already is.*
- **Subhead:** *Tiny missions that fit the moment you're in — different enough to stay interesting, small enough to actually do.*
- **Screenshot narrative (3 stills):**
  1. A contextual mission card tied to a stable anchor — *"After your coffee: step outside for one minute."*
  2. The "suggest a different one" affordance — novelty within a bounded, safe pool.
  3. The anchor idea made explicit — *"Same moment each day. A new little thing to try."*
- **Message hypothesis:** *novelty + "fits my real day"* lowers the "not for someone like me" objection and pulls boredom-prone prospects. Tests the Everyday-Adventures thesis (novelty/situational relevance → lower resistance) — and is the honest stress-test of whether novelty *as a pitch* survives contact with the stable-cue evidence (concept brief §0 flags this as the lowest-confidence bet).

### 2.1 Creative equivalence controls (so the test is fair, not a rigged demo)

All three variants use: the same visual system and type (per TASK-030 tokens once they exist; the shared prototype aesthetic until then), **exactly three screenshots**, a headline ≤ 60 characters and subhead ≤ 90 (store-realistic), the same call-to-action label, and the same first-impression still format. No variant carries price, superlatives ("#1", "best"), a "recommended" marker, countdowns, or review-badge mock-ups. Any production asymmetry found in QA (§3.4) is a confound to fix *before* fielding, logged in §8.

---

## 3. Audience-equivalence & randomization design (the heart of "equivalent audiences")

"Equivalent audiences" has a precise, enforceable meaning: **each variant is shown to a randomly-assigned, statistically equivalent slice of the same traffic source over the same time window, so any CTR difference is attributable to the proposition and not to who saw it or when.** Three channels can deliver this; pick by launch stage.

### 3.1 Channel A — App Store Product Page Optimization (PPO) · highest fidelity, needs a live listing
Apple's native A/B/C test: up to **3 treatments + the original**, Apple randomly and evenly splits store traffic, holds each user on their assigned treatment, and reports impressions and conversion per treatment. This is the gold standard for *store* proposition testing because the audience is genuine App Store intent traffic. **Precondition:** an approved App Store Connect listing serving real traffic — not available pre-launch or overnight.

### 3.2 Channel B — Paid-social split test · best pre-launch, needs ad budget
One ad set per variant on a single platform (e.g. Meta Advantage/A-B test or TikTok Split Test), with **identical targeting, budget, bid strategy, placements and schedule**, the platform randomizing delivery across a de-duplicated audience. The click destination is a neutral landing page or a "notify me at launch" / TestFlight capture (no charge, no deceptive checkout — that boundary is TASK-018's). **Precondition:** a funded ad account and several days of live delivery.

### 3.3 Channel C — Landing-page A/B/C on equalized traffic · fully self-hosted
Three landing pages (one per proposition) behind a randomizing split at 1/3 each (server-side or edge split; the project already has web hosting available), fed by a **single equalized traffic source** so allocation is random and simultaneous. Measures tap-through on the primary CTA. **Precondition:** a real, equalized traffic source (paid or organic) accrued over days — the same blocker as B.

### 3.4 Pre-registration, QA, and fairness guards (all channels)
- **Pre-register before any traffic:** variants (§2), primary metric (§4.2 CTR), allocation (even 1/3), sample-size/MDE and stopping rule (§5), and the analysis (§5.2) — frozen in writing so the test cannot be re-cut after seeing results (guards against the §6.4 peeking trap).
- **Simultaneous exposure:** all variants run in the *same* window; never P1 this week, P2 next — time is a confound.
- **Even, random, sticky allocation:** 1/3 each; a user who returns sees the same variant (dedupe by device/user key) so a click is one person's reaction, not a re-roll.
- **QA pass (not counted):** confirm each variant renders identically across target devices, all three screenshots load, and the CTA fires its event (§4.3) before opening the gates. Log fixes in §8.

---

## 4. Metrics & instrumentation (the four acceptance words, defined)

The acceptance criterion names four things to report **separately per variant**: *traffic, exposure, click-through, and confidence limits*. Each is defined operationally so two analysts compute the same number.

### 4.1 Traffic and exposure

| Metric | Operational definition | Why it is reported separately per variant |
|---|---|---|
| **Traffic (allocation)** | Count of distinct users/sessions **assigned** to a variant's arm (the randomizer's output). | Confirms the 1/3 split actually held; a skewed allocation is a validity flag, not a result. |
| **Exposure (impressions)** | Count of times a variant's proposition was **actually rendered/served** to an assigned user (listing viewed / ad impression / landing page loaded). | The CTR denominator. Traffic ≠ exposure when assigned users never render (bounce before load); both are reported so the denominator is auditable. |

### 4.2 Click-through (primary metric)

- **CTR = clicks ÷ exposures**, per variant, where a **click** is one de-duplicated tap on the single primary CTA (PPO: tap to the product page / "Get"; Channel B/C: tap on the primary CTA to the capture step). One click per exposed user (dedupe), so CTR is a clean binomial proportion.
- Reported **per variant** as a point estimate **and** with confidence limits (§4.4). A secondary **"qualified click" rate** (reached the capture/TestFlight step) may be reported as a guardrail but the pre-registered primary is CTR.

### 4.3 Instrumentation (ties to TASK-033)
Every arm emits, under the TASK-033 event schema: `proposition_impression` and `proposition_click`, each carrying an anonymous user key, timestamp, schema version, and the variant id (P1/P2/P3) — **no raw health details, no PII** (consistent with TASK-033/041). CTR is computed only from these events; no vanity platform-reported number is used without the underlying event counts.

### 4.4 Confidence limits (the "confidence limits" requirement) — stated method
Each variant's CTR is a binomial proportion; report a **95% Wilson score interval** (robust at the small counts and low CTRs typical of store/ad tests, unlike the normal-approximation "Wald" interval which misbehaves near 0):

For `x` clicks in `n` exposures, `p̂ = x/n`, `z = 1.96`:

```
          p̂ + z²/(2n)  ±  z · sqrt[ p̂(1−p̂)/n + z²/(4n²) ]
CI(95%) = ───────────────────────────────────────────────────
                          1 + z²/n
```

For **pairwise variant comparisons** (e.g. P2 vs P1), report the **difference in CTR with a 95% CI** (Newcombe method on the two Wilson intervals) and a two-proportion test; treat a difference as credible only if its CI excludes 0 **and** the stopping rule (§5) was satisfied. Confidence limits are reported *per variant* (§6.1) and *per comparison* (§6.2) — never a single pooled number.

---

## 5. Pre-registered analysis plan (sample size, power, stopping rule)

### 5.1 Sample size / minimum detectable effect (planning figures, not data)
Sizing is a design parameter fixed **before** launch. For a primary CTR, to detect a target absolute difference between the best and a reference variant at **α = 0.05 (two-sided), power = 0.80**, required exposures **per variant** are approximated by:

```
n_per_variant ≈ (z_α/2 · sqrt(2·p̄·(1−p̄)) + z_β · sqrt(p₁(1−p₁)+p₂(1−p₂)))²  /  (p₁ − p₂)²
```

The operator fills `p₁, p₂` from a realistic baseline (e.g. assume a reference CTR and the smallest lift worth acting on) and records the resulting `n_per_variant` here as the **recruitment target** before any spend. *(Worked only as the NON-DATA fixture in §6.5 — the real planning figure is set at pre-registration.)* An **underpowered** run that cannot reach `n_per_variant` is reported as *inconclusive*, not spun as a winner.

### 5.2 Decision rule
- **Primary:** rank variants by CTR with 95% CIs (§6.1); declare a winner only if its CTR CI does not overlap the runner-up's **and** the pairwise difference CI (§6.2) excludes 0 at the pre-registered `n`.
- **Overlapping CIs → no winner.** A narrow or split result is a valid, reportable outcome; the honest action is "message pull does not separate these three — decide on the other TASK-019 inputs," not over-spending until one variant drifts ahead by noise.

### 5.3 Stopping rule (anti-peeking)
Fix the exposure target `n_per_variant` (or a fixed calendar window) in advance; **do not stop the moment a variant looks ahead.** If interim looks are operationally required, pre-register a sequential boundary (e.g. alpha-spending / a fixed number of looks) so the reported α is honest. Early stopping on an unplanned peek inflates false positives and is disallowed.

---

## 6. Analysis framework (empty result slots — populated only from a real run)

### 6.1 Per-variant results (acceptance: "traffic, exposure, click-through and confidence limits reported separately per variant")

**Cells are intentionally empty; they fill only from a real, pre-registered run (§3–§5).**

| Variant | Traffic (assigned) | Exposure (impressions) | Clicks | CTR = clicks/exp. | 95% CI (Wilson) |
|---|---:|---:|---:|---:|---:|
| **P1 — Tiny Win framing** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **P2 — Growing World framing** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **P3 — Everyday Adventures framing** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.2 Pairwise comparisons (CTR difference with 95% CI)

| Comparison | ΔCTR (pp) | 95% CI of difference (Newcombe) | Credible at pre-registered n? |
|---|---:|---:|---|
| P2 − P1 | _(from data)_ | _(from data)_ | _(from data)_ |
| P3 − P1 | _(from data)_ | _(from data)_ | _(from data)_ |
| P2 − P3 | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.3 Validity & balance checks (reported alongside results)
- **Allocation balance:** achieved split vs the 1/3 target (a skew flags a broken randomizer).
- **Exposure vs traffic gap:** per-variant render-through, to confirm the CTR denominator is sound.
- **Simultaneity:** confirm all arms ran the same window; report any pause/imbalance.
- **Power achieved:** actual `n_per_variant` vs §5.1 target; mark the run *inconclusive* if short.

### 6.4 Limitations to state in the final synthesis
- **Click ≠ install ≠ retained user ≠ paying user.** CTR measures *pre-tap message pull* only; install→paid is TASK-018/038, retention/behavior is TASK-040. A proposition can win the tap and lose everywhere downstream.
- **Channel generalizability:** a paid-social (Channel B) or landing-page (C) result may not transfer to in-store (PPO, A) intent traffic; name the channel and caveat accordingly.
- **Novelty/curiosity pull (esp. P3)** can inflate first-exposure CTR without predicting sustained desire — one reason the behavioral gates (§7.3) override a raw message-pull win.
- **Creative confound:** CTR reflects headline *and* screenshot *and* craft together; if one variant's art is stronger, that is a production-equivalence failure (§2.1), not a proposition result.

### 6.5 NON-DATA determinism fixture (labelled; zero evidential weight)
To prove the §4.4 Wilson arithmetic and §5.1 sizing are deterministic *before* any real run, one invented mini-case is worked here. **These are fixtures, not results; they appear in no table above and inform no decision.**
- *Fixture (constructed): x = 40 clicks in n = 1000 exposures → p̂ = 0.040.* Wilson 95% CI ≈ **[0.0295, 0.0540]** (center ≈ 0.0418, half-width ≈ 0.0123). Any analyst applying the §4.4 formula to (40, 1000) must reproduce this interval — that is all this fixture demonstrates.
- *Sizing fixture (constructed): p₁ = 0.030, p₂ = 0.020, p̄ = 0.025, α = 0.05, power = 0.80 → n_per_variant ≈ 3,830 exposures.* A planning figure for a worked example only; the real target is set at pre-registration (§5.1) from a realistic baseline.

---

## 7. Standards upheld (CLAUDE.md / PRD)

### 7.1 Health-claim integrity (CLAUDE.md §3; `prevention-action-evidence-rubric.md` §5)
Every headline/subhead in §2 is pre-cleared against the claim ladder: **general-benefit and experiential framing only, no individual disease-risk or prevention claim, no quantified outcome, no cure/treat language, no fear/loss framing, no timeline promise.** None of P1/P2/P3 says or implies "reduce your risk of…", "prevent…", "in 30 days you'll…". The store proposition sells the *feeling of the daily action*, never a medical outcome — the same boundary the product itself must hold (TASK-024/042).

### 7.2 Zero-Guilt & honesty in the pitch (CLAUDE.md §1; TASK-004 anti-patterns)
The creative carries no manufactured anxiety: no countdowns, fake scarcity, loss-framed "don't lose your…", shaming before-you, streak-pressure, or deceptive review/ranking badges. P2 actively advertises the no-decay promise as a *differentiator*. The click destination is honest (a real learn-more / notify / TestFlight step) — no deceptive charge (that boundary belongs to TASK-018). A "warm screen-out" ethic extends to the audience: nobody is tricked into a tap.

### 7.3 The three non-negotiable gates override message pull (PRD scorecard)
A proposition can top CTR and still be rejected if its concept fails a gate: **(1) credible real-world behavior-change evidence, (2) meaningful desirability, (3) safe/trustworthy health guidance.** A novelty-driven CTR win for P3 that is contradicted by the behavioral evidence (still gated on the blocked TASK-008/009/040) does **not** advance on the tap number alone. This test feeds the Desirability/message-pull input to TASK-019; it does not out-vote the gates.

---

## 8. Definition of done (what closes TASK-017 honestly)

TASK-017 may move to `in_review` **only** when all of the following exist:
1. **A real, pre-registered run** (§3.4) on one of the three channels (§3.1–§3.3) with an approved listing or funded, equalized traffic source, even 1/3 sticky allocation, simultaneous exposure, and the §2 creative passing the §7 claims/Zero-Guilt gate.
2. **Traffic and exposure recorded** per variant (§4.1), tabulated in §6.1, with the §6.3 allocation/render-through balance checks.
3. **Click-through recorded** per variant from the TASK-033 events (§4.2–§4.3), tabulated in §6.1.
4. **Confidence limits recorded** — a 95% Wilson CI per variant (§4.4) in §6.1, and pairwise difference CIs in §6.2.
5. **Decision, power-achieved, and limitations** (§5.2, §6.3–§6.4) completed and carried to TASK-019/042/043.

Until item 1 exists, the task is blocked, not done. This framework satisfies the *design* of items 2–5 and delivers the creative under test (§2); it cannot satisfy item 1. The QA pass (§3.4) and any production-equivalence fixes it produces are logged here before fielding.

---

## 9. Blocker statement & acceptance-criterion status

> **TASK-017 is BLOCKED pending a live traffic run.** Testing App Store proposition variants requires real impressions from equivalent cold audiences accrued over days against a live/pre-launch listing or a funded ad account — none of which exists in an autonomous overnight build. There is no traffic, no exposure, no click, and therefore no click-through rate and no confidence limit to report. Per the Reviewer's 2026-11-22 rulings on TASK-008/009/016, synthetic records must **not** be advanced through a decision gate as if empirical; fabricating per-variant CTRs here would corrupt TASK-019 (concept selection) and TASK-043 (launch plan). This deliverable therefore ships the **field-ready experiment design** — the three concrete propositions (§2), the audience-equivalence & randomization design (§3), the metric definitions (§4), the pre-registered analysis with a stated Wilson-CI method and stopping rule (§5), and the result tables with empty slots (§6) — so execution is turnkey, and leaves the empirical requirement **open**.
>
> **Unblock path:** a human operator pre-registers the test (§3.4), launches one channel (PPO once a listing serves traffic, or a funded paid-social / landing-page split pre-launch) with even 1/3 allocation and simultaneous exposure, accrues to the pre-registered `n_per_variant` (§5.1) under the §5.3 stopping rule, then populates §6.1–§6.3 from the TASK-033 events (traffic, exposure, CTR, Wilson CIs, pairwise difference CIs) and completes the §6.4 limitations. No creative or instrument redesign is required.

| TASK-017 acceptance requirement | Status |
|---|---|
| **Traffic reported per variant** | **Framework ready, data pending** — §4.1 definition + §6.1 template (empty cells). |
| **Exposure reported per variant** | **Framework ready, data pending** — §4.1 definition + §6.1 template (empty cells). |
| **Click-through reported per variant** | **OPEN / BLOCKED** — requires a live traffic run (§9). §4.2–§4.3 define it; §6.1 awaits real events. No synthetic stand-in is presented as satisfying this. |
| **Confidence limits reported per variant** | **Framework ready, data pending** — §4.4 Wilson method stated; §6.1/§6.2 templates (empty cells). |
| **Reported *separately* per variant** | **Framework ready** — §6.1 is one row per variant across all four metrics; §6.2 is pairwise. |

**Status routing note (disclosed deviation):** per the standard workflow this step would set TASK-017 to `in_review`. As with TASK-008/009/016, routing a non-completable empirical task through the gate as "done" would require fabricating the per-variant traffic and click-through data the criterion demands and would re-arm the synthetic-data reject loop the Reviewer has repeatedly closed. TASK-017 is therefore set to **`blocked`** with a `blocked_reason`, surfacing the blocker honestly — the terminal state the Reviewer sanctioned for this autonomous context. The next pending task, TASK-018 (honest willingness-to-pay test), is the same class of live/behavioral study; the first truly autonomous-executable pending work is the Experience-workstream build (e.g. TASK-020 "Your Little Win Today" card). Flagged for human triage.

**Verification note:** Research/instrument-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed **exit 0** (strict `tsc -b && vite build`, `✓ built in 96ms`, zero warnings, 26 modules). No `[TBD]`/Lorem ipsum/placeholder/TODO/FIXME content; no synthetic data presented as findings (the §6.5 fixture is explicitly labelled NON-DATA). Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
</content>
</invoke>
