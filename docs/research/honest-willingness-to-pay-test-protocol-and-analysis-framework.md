# Honest Willingness-to-Pay Test — Protocol & Analysis Framework (HerRays Stage-4)

**Task:** TASK-018 (instruments only — see §0) · **Workstream:** Concepts
**Owner:** Growth & monetization lead (per PRD team table) · **Reviewers:** Product strategist (offer validity), Data/experimentation scientist (randomization, elasticity & CI method), iOS technical lead (StoreKit / purchase integrity), Preventive-health specialist (paywall claims gate), Privacy/consent specialist (payment data minimization)
**Offer under test:** the selected concept's free vs premium split (PRD §7) at the PRD §7 annual price points (§2)
**Feeds (once real data exists):** TASK-019 (concept selection — commercial-viability evidence), TASK-038 (subscription economics model — conversion & price inputs), TASK-037 (premium entitlement gate — the real paywall this test exercises), TASK-043 (launch experiment plan — pricing & paid-acquisition assumptions)
**Date:** 2026-11-22

---

## 0. What this document is — and what it is not (read first)

This is the **field-ready experiment design and analysis framework** for TASK-018: the concrete price points and offer framings under test (§2), the *honest* commitment mechanisms and no-deceptive-checkout design (§3), the metric definitions for commitment and abandonment (§4), the pre-registered analysis plan with a stated confidence-interval method and demand-curve estimation (§5), and the result tables with empty slots (§6). These are the reusable, durable deliverables.

**This document does NOT contain the commitment-behavior and abandonment results at real price points that TASK-018's acceptance criterion requires, and it does not claim to.** A willingness-to-pay test — explicitly a *behavioral* one in PRD §4 ("behavioral willingness-to-pay test, **not just survey intent**") — measures what **real prospective users actually do** when a genuine price and a genuine checkout are put in front of them: how many commit, how many abandon, and where. That needs real users, a real (or pre-order / TestFlight) purchase surface, real money or a real binding commitment, and days of accrual. None of that exists inside an autonomous overnight build: there is no live App Store subscription configured, no funded cohort of real prospects, no payment sheet invoked, and therefore no commitment rate, no abandonment funnel, and no demand curve to report. Every commitment, abandonment, conversion and confidence-limit cell below is an **empty template** waiting on a real run.

This mirrors the Reviewer's repeated, explicit rulings on empirical deliverables (PROGRESS.md, 2026-11-22): human-subject / live-traffic studies (TASK-008 interviews, TASK-009 diary study, TASK-016 blinded desirability test, TASK-017 proposition variant test) were **blocked**, and constructed/synthetic records were **forbidden** from being advanced through a decision gate as if empirical. TASK-018 is the same class of work — the TASK-016 and TASK-017 completion notes both named it explicitly as "the same class of live/behavioral study — likely a same-class blocker." Fabricating per-price conversion and abandonment numbers would corrupt TASK-019 (concept selection), TASK-038 (economics model) and TASK-043 (launch plan), and would violate CLAUDE.md §3.

**Status of TASK-018: `blocked` — requires a real paid-commitment run with live users.** The empirical requirement (per-price commitment behavior and abandonment, from real prospects against an honest checkout) remains **open**. This framework is published now so that the moment a purchase surface and a prospect cohort exist, there is nothing to design — only to launch, accrue, and tabulate. See §8 for the definition-of-done and §9 for the blocker statement and unblock path.

Everything below is genuine instrument design grounded in the PRD (§4 desirability/behavioral-WTP testing, §7 retention & economics incl. the $29.99 / $39.99 / $59.99 annual price points and the free-vs-premium split, the concept-selection scorecard), the `prevention-action-evidence-rubric.md` claims ladder (TASK-006), and the TASK-004 anti-pattern library (dark-pattern checkouts). No synthetic data is presented as findings anywhere. §6.6 contains a **labelled NON-DATA fixture** used only to prove the confidence-interval and demand-curve arithmetic is deterministic; it is not a test result and carries zero evidential weight.

---

## 1. Objective, scope, and boundaries

### 1.1 The question this test answers (and the ones it does not)

PRD §4 (Desirability testing) requires a "**behavioral willingness-to-pay test (not just survey intent)**"; PRD §7 (Retention & economics) fixes the offer shape (free = one active habit; premium = multiple journeys, adaptive personalization, advanced insights, richer progression) and the three annual prices to test ($29.99, $39.99, $59.99). TASK-018 owns exactly the **behavioral purchase-commitment question** and must not silently absorb its neighbours:

| PRD instrument | Owning task | In scope here? |
|---|---|---|
| Cold-audience **message pull** (headline/screenshot CTR) | TASK-017 | **No** — that is a pre-tap, no-price proposition test |
| Blinded, within-subjects **experience** preference | TASK-016 | **No** — hands-on preference, no price |
| **Behavioral willingness-to-pay** (real price, real commitment, abandonment) | **TASK-018** | **Yes** — the whole of this document |
| **Subscription economics model** (LTV, CAC, fees, refunds, sensitivity) | TASK-038 | **No** — this *supplies* the conversion/price inputs that model consumes |
| **Premium entitlement gate** (free loop vs premium unlock mechanics) | TASK-037 | **No** — this *exercises* that gate's paywall as the test surface |
| 7-day voluntary-return / 30-day behavioral pilot | TASK-040 | **No** — retention, not purchase |

**Primary question:** *When a real prospect, having experienced the core free loop, is shown a genuine premium offer at a specific annual price with an honest checkout, do they actually commit — and at which of the PRD §7 price points does committed demand net of early abandonment and early refunds maximize credible value?*

**Why "behavioral," and why this is distinct from a survey.** Stated willingness-to-pay (Van Westendorp price-sensitivity meter, Gabor-Granger "would you buy at $X?") systematically **over-predicts** real purchasing — people say yes to prices they will not pay. PRD §4 is explicit that this must be a *behavioral* test. The acceptance word is "**actual commitment behavior**," not "intent": the primary outcome is a **revealed** commitment (a completed real purchase, or a binding real-money reservation), not a questionnaire answer. Stated-intent instruments may be run *alongside* only as a labelled secondary, never as the primary (§4.4).

**Explicit non-goals:** this test does **not** compute LTV, CAC, payback or renewal (TASK-038 consumes this test's output), does **not** measure retention or real-world behavior (TASK-040), does **not** select a concept by itself (one input — commercial viability — to TASK-019, overridden by the three non-negotiable gates, §7.4), and does **not** finalize the shipping price (it produces the evidence; the price decision is made with TASK-038).

### 1.2 Why these prices, and why between-subjects

The three annual prices are taken verbatim from PRD §7 ($29.99 / $39.99 / $59.99); the acceptance criterion requires "**at least two**," so the minimum viable run is two of these and the full run is all three. Price is assigned **between-subjects** (each prospect sees exactly one price) because within-subjects price exposure anchors and contaminates the second judgment — once someone has seen $29.99, their reaction to $59.99 is no longer a clean read of demand at $59.99. Equivalent, randomly-assigned cohorts per price let the per-price commitment rate be read as a point on a demand curve (§5.4).

---

## 2. The offer and price stimuli (concrete — the "price points" under test)

### 2.1 The offer (fixed across all arms; only the price varies)

Per PRD §7, every arm presents the **same** free/premium split — only the headline annual price differs, so the test measures price sensitivity, not offer confusion:

- **Free tier (always available, never time-bombed):** one active habit, the full core "Little Win" loop, basic progress, and the essential accessibility features. The free tier is a genuine, indefinitely-usable product — not a crippled trial. A prospect who declines premium keeps a real working app (this is itself a Zero-Guilt / honesty commitment, §7).
- **Premium (the thing being priced):** multiple concurrent journeys, adaptive personalization, advanced insights, and richer progression (PRD §7). Premium features are described in plain, feature-level terms — never as a health outcome (§7.3).

### 2.2 The price arms

| Arm | Annual price (PRD §7) | Monthly-equivalent shown for honesty | Role |
|---|---:|---:|---|
| **A1** | **$29.99 / year** | ~$2.50 / mo | Low anchor |
| **A2** | **$39.99 / year** | ~$3.33 / mo | PRD illustrative base case (§7 economics example) |
| **A3** | **$59.99 / year** | ~$5.00 / mo | High anchor |

- **Minimum run (meets acceptance "at least two"):** A1 + A3 (widest contrast → cleanest elasticity read on a smaller sample). **Full run:** A1 + A2 + A3 (three demand-curve points; required to estimate a revenue-maximizing price for TASK-038).
- **Honest price display (all arms):** the real recurring annual charge, the real renewal terms, the real monthly-equivalent, and the plain fact that the free tier remains usable if they decline. No "was $X now $Y" fake discount, no anchoring decoy tier that isn't really for sale, no introductory price that silently balloons on renewal (§3.3).
- **Optional free-trial variant (pre-register if used):** if an Apple-style "free for 7 days, then $X/year" trial is tested, the auto-renew date, the exact charge, and one-tap cancel must be disclosed on the same screen before confirmation, and the trial-start is treated as a *soft* commitment distinct from the post-trial charge (§4.2) — never counted as a purchase until the real charge lands.

---

## 3. Commitment mechanisms & the "honest / no misleading charges" design (the heart of the task)

The acceptance criterion has two load-bearing halves: measure **actual commitment behavior and abandonment**, and do it with **no misleading charges**. "Honest" is not a tone; it is an enforceable set of checkout constraints (§3.3). Three mechanisms can produce a *revealed* commitment signal; pick by launch stage. All three must pass the §3.3 honesty gate and the §7 standards before fielding.

### 3.1 Mechanism A — Live StoreKit subscription purchase · highest fidelity, needs a live/TestFlight app + configured prices
The real thing: Apple In-App Purchase with the three annual products configured in App Store Connect, surfaced behind the TASK-037 entitlement gate after the prospect has used the free core loop. A commitment is a **completed, real-money subscription** (StoreKit `Transaction` verified); abandonment is any prospect who reaches the paywall and does not complete. This is the gold standard because the money is real and the Apple payment sheet is the real purchase surface. **Precondition:** an approved (or TestFlight) build with StoreKit products live and a cohort of real prospects routed to it over days — not available in an autonomous overnight build. Early **refunds / cancellations within the observation window** are captured as a regret signal (§4.3).

### 3.2 Mechanism B — Honest paid pre-order / reservation · best pre-launch, needs a payment processor
Pre-launch, a prospect reserves founding-member access by placing a **real, refundable deposit or full annual pre-payment** through a real processor (e.g. a Stripe checkout on a landing page fed by an equalized traffic source). The charge is genuine and clearly disclosed as a pre-order with a stated delivery expectation and a no-questions refund window; a commitment is a **completed real payment**, abandonment is drop-off in the real checkout. Because real money changes hands under full disclosure, this is a true behavioral WTP signal, not stated intent. **Precondition:** a funded processor account, a legitimate pre-order offer the team will honor, and an equalized prospect source accrued over days.

### 3.3 Mechanism C — Disclosed "reserve your price" (no charge) · lowest friction, weakest signal, honesty-critical
Where no charge can yet be taken, a prospect taps "Subscribe at $X" and is **immediately and honestly told**, on the confirmation screen *before* any payment step, that the subscription is not yet available and they are reserving this price / joining early access — then optionally leaves an email or TestFlight sign-up. This measures *intent-to-commit at a specific price* and is **explicitly weaker** than A/B (no money moves), so it is reported as a clearly-labelled **secondary** behavioral proxy, never as the primary commitment rate, and the limitation (intent ≠ payment) is stated in every readout (§6.5). **It is honest only if the "not yet available" disclosure precedes any simulated payment UI** — invoking a realistic Apple payment sheet and *then* revealing there is no product would be a deceptive checkout and is **forbidden** (§3.3 below, TASK-004 F-dark-pattern).

### 3.3 The honesty gate — "no misleading charges" made enforceable (applies to A/B/C)

No mechanism may field until every item passes. These operationalize the acceptance phrase "no misleading charges" and the Zero-Guilt / honesty standards (CLAUDE.md §1; TASK-004 anti-patterns):

| # | Honesty requirement | Forbidden anti-pattern it blocks (TASK-004) |
|---|---|---|
| H1 | The **real price, currency, billing period and renewal behavior** are shown on the confirmation screen before any commitment. | Drip pricing; price revealed only after card entry. |
| H2 | **Auto-renewal and the exact next charge date/amount** are disclosed in plain language on the same screen, not buried in terms. | Hidden/forced continuity; "surprise" renewal. |
| H3 | **Cancellation is one obvious step** and is described before purchase; no retention maze. | Roach-motel / hard-to-cancel. |
| H4 | **No fake urgency or scarcity** — no countdown timer, "only N left," "price rises in 10:00," or loss-framed "don't lose your progress." | Manufactured-anxiety paywall (Zero-Guilt, §7.2). |
| H5 | **No deceptive comparison** — no struck-through fake "original" price, no decoy tier not genuinely for sale. | Phantom-anchor / fake-discount pricing. |
| H6 | **Mechanism C never simulates a charge** — the "not yet available / reserving" disclosure precedes any payment-sheet UI; no card or Face ID confirmation is ever invoked for a product that cannot be bought. | Deceptive-checkout / dark-pattern fake door. |
| H7 | **Declining is free and non-punitive** — the prospect keeps the full free tier; no guilt copy, no nag loop, no downgraded experience as punishment. | Shaming decline / punitive free tier (Zero-Guilt). |
| H8 | **Real charges are promptly and fully refundable** within the observation window (A/B), and refunds are honored, not contested. | Refund-hostile billing. |

A mechanism that cannot satisfy H1–H8 is not fielded; a run that violated any of them in practice is reported as **invalid**, not as a result.

### 3.4 Pre-registration, randomization, QA (all mechanisms)
- **Pre-register before any prospect sees a price:** the arms (§2.2), the primary commitment definition (§4.2), allocation (equal across arms), sample-size/MDE and stopping rule (§5), and the analysis (§5.4) — frozen in writing so the run cannot be re-cut after seeing results (guards the §6.4 peeking trap).
- **Equivalent, random, sticky assignment:** each prospect is randomly assigned one price arm and **always sees that same price** (dedupe by anonymous user/device key) so a commitment is one person's real decision, not a re-roll until they bite.
- **Same exposure point:** every arm hits the paywall at the **same moment in the journey** (e.g. after the first real completed "Little Win"), so arms differ only in price, not in how warmed-up the prospect is.
- **QA pass (not counted):** confirm each arm renders the correct price, the honesty disclosures (H1–H3) are present, the real purchase/reservation event fires (§4.5), and a test purchase + test refund round-trips cleanly before opening the gates. Log fixes in §8.

---

## 4. Metrics & instrumentation (the acceptance words, defined)

The acceptance criterion names two things to report at **≥2 price points**: *actual commitment behavior* and *abandonment*. Each is defined operationally so two analysts compute the same number.

### 4.1 The commitment funnel (where abandonment is located)
Reported per price arm, each step a de-duplicated per-user count:

| Step | Definition | Abandonment at this step |
|---|---|---|
| **S0 Reached paywall** | Prospect viewed the premium offer screen for their assigned price. | — (denominator) |
| **S1 Initiated commitment** | Tapped the primary "Subscribe / Reserve at $X" CTA. | S0 → not S1 = *offer-level* abandonment (price/offer rejected on sight). |
| **S2 Entered checkout** | Reached the real payment sheet / real checkout (A/B) — N/A for C by design (§3.3 H6). | S1 → not S2 = *checkout-entry* abandonment. |
| **S3 Committed** | **Primary outcome.** Completed a real purchase (A) or real payment (B); for C, confirmed the disclosed reservation (secondary proxy). | S2 → not S3 = *in-checkout* abandonment (the classic cart abandonment). |
| **S4 Retained commitment** | Did **not** refund/cancel within the pre-registered observation window (A/B). | S3 → not S4 = *early regret* (counts against net commitment). |

### 4.2 Actual commitment behavior (primary metric)
- **Commitment rate (per arm) = S3 ÷ S0** — committed prospects over all who reached that price's paywall. For A/B this is a **real-money** rate; for C it is the labelled intent proxy (§3.3, §6.5).
- **Net commitment rate (per arm) = S4 ÷ S0** — the honest headline, crediting only commitments that survived early refund/cancel. The gap S3→S4 is itself a WTP signal (regret at that price).
- Reported **per arm** as a point estimate **and** with confidence limits (§4.6). The free-trial variant's trial-start (if used) is reported separately and is **never** counted as S3 until the real post-trial charge lands.

### 4.3 Abandonment (co-primary — explicitly required)
- **Abandonment is reported per funnel step, per arm** (the S0→S1, S1→S2, S2→S3, S3→S4 drops above), not as a single lump. Locating *where* prospects leave distinguishes a price objection (S0→S1) from a checkout-friction problem (S2→S3, a TASK-037 fix) from buyer's remorse (S3→S4) — operationally different conclusions.
- **Early-refund / cancellation rate (A/B) = (S3 − S4) ÷ S3** per arm, reported as a first-class regret metric.

### 4.4 Secondary / labelled (never the primary)
- **Stated-intent instruments** (Van Westendorp PSM; Gabor-Granger acceptance at each price) may be captured for triangulation and are reported in a clearly-labelled **STATED-INTENT (non-behavioral)** block — useful for the demand-curve shape, but the decision rests on the §4.2 revealed rate. The known stated-vs-revealed inflation is stated every time (§6.4).

### 4.5 Instrumentation (ties to TASK-033)
Every arm emits, under the TASK-033 event schema: `paywall_impression`, `commitment_initiated`, `checkout_entered`, `commitment_completed`, and `commitment_refunded` — each carrying an anonymous user key, timestamp, schema version, the price-arm id (A1/A2/A3), and the mechanism (A/B/C). **No raw card/PII, no raw health details** are stored (payment handled entirely by Apple/the processor; the app records only the anonymous outcome event — consistent with TASK-033/041). All rates are computed from these events, never from a vanity platform number without the underlying counts.

### 4.6 Confidence limits — stated method
Each arm's commitment rate is a binomial proportion; report a **95% Wilson score interval** (robust at the small counts and low conversion rates typical of paywall tests, unlike the normal-approximation "Wald" interval which misbehaves near 0):

For `x` commitments in `n` paywall views, `p̂ = x/n`, `z = 1.96`:

```
          p̂ + z²/(2n)  ±  z · sqrt[ p̂(1−p̂)/n + z²/(4n²) ]
CI(95%) = ───────────────────────────────────────────────────
                          1 + z²/n
```

For **pairwise price comparisons** (e.g. A1 vs A3), report the **difference in commitment rate with a 95% CI** (Newcombe method on the two Wilson intervals); treat a difference as credible only if its CI excludes 0 **and** the stopping rule (§5) was satisfied. Confidence limits are reported *per arm* (§6.1) and *per comparison* (§6.2) — never a single pooled number.

---

## 5. Pre-registered analysis plan (sample size, power, stopping rule, demand curve)

### 5.1 Sample size / minimum detectable effect (planning figures, not data)
Sizing is fixed **before** launch. For a primary commitment rate, to detect a target absolute difference between two price arms at **α = 0.05 (two-sided), power = 0.80**, required paywall views **per arm** are approximated by:

```
n_per_arm ≈ (z_α/2 · sqrt(2·p̄·(1−p̄)) + z_β · sqrt(p₁(1−p₁)+p₂(1−p₂)))²  /  (p₁ − p₂)²
```

The operator fills `p₁, p₂` from a realistic baseline (e.g. an assumed reference commitment rate and the smallest price-elasticity difference worth acting on) and records the resulting `n_per_arm` here as the **recruitment target** before any spend. *(Worked only as the NON-DATA fixture in §6.6.)* An **underpowered** run that cannot reach `n_per_arm` is reported as *inconclusive*, not spun into a price recommendation.

### 5.2 Decision rule
- **Primary:** per-arm **net** commitment rate (§4.2) with 95% CIs (§6.1); a price difference is credible only if the pairwise difference CI (§6.2) excludes 0 at the pre-registered `n`.
- **Overlapping CIs → no credible price difference.** A flat demand curve across the tested range is a valid, reportable outcome ("commitment is price-insensitive across $29.99–$59.99; set price from TASK-038 margin/positioning, not from a demand difference we did not observe"), not a prompt to over-spend until noise separates the arms.

### 5.3 Stopping rule (anti-peeking)
Fix `n_per_arm` (or a fixed calendar window) in advance; **do not stop the moment one price looks better.** If interim looks are operationally required, pre-register a sequential boundary (alpha-spending / a fixed number of looks) so the reported α is honest. Early stopping on an unplanned peek inflates false positives and is disallowed. Real-money arms also require a minimum refund-observation window to elapse before S4 is read.

### 5.4 Demand curve & value estimate (full 3-arm run)
With all three arms, plot **net commitment rate vs price** (a Gabor-Granger-style revealed-demand curve) and compute, per arm, an **expected value-per-paywall-view = net commitment rate × annual price** (pre-fee, pre-refund-of-later-periods). The arm maximizing this revealed value is the *evidence-based* price candidate handed to **TASK-038**, which applies store commission, refunds, CAC and renewal to turn it into a contribution figure. This test does **not** itself output the final price — it outputs the demand points TASK-038 needs.

---

## 6. Analysis framework (empty result slots — populated only from a real run)

**Cells are intentionally empty; they fill only from a real, pre-registered run (§3–§5).**

### 6.1 Per-arm results (acceptance: "actual commitment behavior … measured" at ≥2 price points, with confidence limits)

| Price arm | Reached paywall (S0) | Committed (S3) | Net committed (S4) | Net commitment rate = S4/S0 | 95% CI (Wilson) | Expected value/view (§5.4) |
|---|---:|---:|---:|---:|---:|---:|
| **A1 — $29.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **A2 — $39.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **A3 — $59.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.2 Pairwise price comparisons (commitment-rate difference with 95% CI)

| Comparison | Δ net commitment (pp) | 95% CI of difference (Newcombe) | Credible at pre-registered n? |
|---|---:|---:|---|
| A1 − A2 | _(from data)_ | _(from data)_ | _(from data)_ |
| A1 − A3 | _(from data)_ | _(from data)_ | _(from data)_ |
| A2 − A3 | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.3 Abandonment funnel (acceptance: "abandonment measured") — per arm

| Price arm | S0→S1 drop (offer rejected) | S1→S2 drop (checkout-entry) | S2→S3 drop (in-checkout) | S3→S4 drop (early refund/cancel) |
|---|---:|---:|---:|---:|
| **A1 — $29.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **A2 — $39.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| **A3 — $59.99/yr** | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.4 Validity & balance checks (reported alongside results)
- **Allocation balance:** achieved split vs the equal-allocation target (a skew flags a broken randomizer).
- **Same-exposure-point check:** confirm all arms hit the paywall at the same journey moment (a warmer cohort confounds price).
- **Honesty-gate audit:** confirm H1–H8 (§3.3) held for every arm in production; any breach marks the run invalid.
- **Power achieved:** actual `n_per_arm` vs §5.1 target; mark the run *inconclusive* if short.
- **Refund-window elapsed:** confirm the minimum observation window passed before S4 was read.

### 6.5 Limitations to state in the final synthesis
- **Stated ≠ revealed.** Any Mechanism-C (no-charge) number or §4.4 survey number is intent, not payment, and over-predicts real WTP; it is labelled and never substituted for the §4.2 real-money rate.
- **Commitment ≠ retained revenue.** A first-year commitment is not renewal; LTV, refunds beyond the window, and renewal are TASK-038, not this test. A price can win commitment and lose on margin or churn.
- **Audience & channel generalizability:** a pre-order (B) or reservation (C) cohort, or a single acquisition channel, may not match real App Store intent traffic; name the mechanism/channel and caveat.
- **Warm-up dependency:** commitment depends heavily on the quality of the free-loop experience before the paywall; a weak core loop depresses all arms equally and is a product signal, not a price signal.
- **Small-sample caution:** at low commitment rates, per-arm CIs are wide; honor §5.1 sizing before claiming a price winner.

### 6.6 NON-DATA determinism fixture (labelled; zero evidential weight)
To prove the §4.6 Wilson arithmetic and §5.1 sizing are deterministic *before* any real run, invented mini-cases are worked here. **These are fixtures, not results; they appear in no table above and inform no decision.**
- *Fixture (constructed): x = 25 commitments in n = 500 paywall views → p̂ = 0.050.* Wilson 95% CI ≈ **[0.0341, 0.0728]** (center ≈ 0.0534, half-width ≈ 0.0193). Any analyst applying the §4.6 formula to (25, 500) must reproduce this interval — that is all this fixture demonstrates.
- *Sizing fixture (constructed): p₁ = 0.060, p₂ = 0.040, p̄ = 0.050, α = 0.05, power = 0.80 → n_per_arm ≈ 1,863 paywall views.* A planning figure for a worked example only; the real target is set at pre-registration (§5.1) from a realistic baseline.
- *Value fixture (constructed): if A1 net-commits at 6.0% × $29.99 = $1.80/view and A3 at 4.0% × $59.99 = $2.40/view, the higher price yields more revealed value per view in this invented case* — illustrating only that §5.4 is an arithmetic the operator will run on real rates; it is **not** a claim about HerRays.

---

## 7. Standards upheld (CLAUDE.md / PRD)

### 7.1 Honesty & "no misleading charges" (acceptance; TASK-004 anti-patterns)
The entire §3.3 honesty gate (H1–H8) exists to satisfy "no misleading charges": real price and renewal shown up front, one-step cancel, no fake urgency/scarcity, no phantom-anchor discounts, no simulated charge for a non-existent product, free and non-punitive decline, and prompt real refunds. A run that violated any of these is reported invalid, not as a result.

### 7.2 Zero-Guilt carried into the paywall (CLAUDE.md §1)
No countdown timers, no "you'll lose your progress / your world" loss-framing, no shaming the prospect who declines, no nag loop, no downgraded free experience as punishment. Declining premium leaves a genuinely useful one-habit free app (PRD §7). The paywall sells an *upgrade*, never relief from a manufactured anxiety.

### 7.3 Health-claim integrity (CLAUDE.md §3; `prevention-action-evidence-rubric.md` §5)
Premium is described in **feature terms only** (more journeys, personalization, insights, progression) — never "pay to prevent disease," "premium improves your health outcomes," "unlock better health," or any quantified/timeline/disease-risk claim. The offer sells software capability, not a medical outcome — the same claim boundary the product and store copy must hold (TASK-024/042/017).

### 7.4 The three non-negotiable gates override commercial viability (PRD scorecard)
A concept can win on willingness-to-pay and still be rejected if it fails a gate: **(1) credible real-world behavior-change evidence, (2) meaningful desirability, (3) safe/trustworthy health guidance.** Strong WTP for a concept whose behavioral evidence is weak (still gated on blocked TASK-008/009/040) does **not** advance on the money alone. This test feeds the commercial-viability input to TASK-019; it does not out-vote the gates.

### 7.5 Privacy & payment-data minimization (TASK-041)
Payment is handled entirely by Apple / the processor; the app records only anonymous outcome events (§4.5) — no card data, no PII, no health detail tied to the purchase. Consent and data handling follow TASK-041.

---

## 8. Definition of done (what closes TASK-018 honestly)

TASK-018 may move to `in_review` **only** when all of the following exist:
1. **A real, pre-registered run** (§3.4) using an honest mechanism (§3.1–§3.3) that passed the §3.3 honesty gate, with ≥2 of the PRD §7 price arms, equal sticky allocation, and the same paywall exposure point.
2. **Actual commitment behavior recorded** per price arm from the TASK-033 events (§4.2, §4.5), tabulated in §6.1 with 95% Wilson CIs (§4.6) and pairwise difference CIs in §6.2.
3. **Abandonment recorded** per funnel step per arm (§4.1, §4.3), tabulated in §6.3, plus the early-refund rate for real-money arms.
4. **No-misleading-charges evidence:** the §6.4 honesty-gate audit (H1–H8) confirmed to have held in production for every arm.
5. **Decision, demand curve, power-achieved, and limitations** (§5.2, §5.4, §6.4–§6.5) completed and carried to TASK-019 (viability input), TASK-038 (price/conversion inputs) and TASK-043 (pricing assumptions).

Until item 1 exists, the task is blocked, not done. This framework satisfies the *design* of items 2–5 and specifies the offer and prices under test (§2); it cannot satisfy item 1. The QA pass (§3.4) and any honesty-gate fixes it produces are logged here before fielding.

---

## 9. Blocker statement & acceptance-criterion status

> **TASK-018 is BLOCKED pending a real paid-commitment run with live users.** An honest, *behavioral* willingness-to-pay test (PRD §4: "not just survey intent") requires real prospects making real commitment decisions against a genuine, honest checkout at real price points, accrued over days — a live/TestFlight StoreKit purchase surface or a funded pre-order processor, plus an equalized prospect cohort. None of that exists in an autonomous overnight build: no live prices are configured, no payment sheet is invoked, no prospect commits, and therefore there is no commitment rate, no abandonment funnel, and no demand curve to report. Per the Reviewer's 2026-11-22 rulings on TASK-008/009/016/017, synthetic records must **not** be advanced through a decision gate as if empirical; fabricating per-price commitment and abandonment numbers here would corrupt TASK-019 (concept selection), TASK-038 (economics model) and TASK-043 (launch plan), and would violate CLAUDE.md §3. This deliverable therefore ships the **field-ready experiment design** — the concrete price arms and offer (§2), the honest commitment mechanisms and the enforceable "no misleading charges" gate (§3), the commitment/abandonment metric definitions (§4), the pre-registered analysis with a stated Wilson-CI method, stopping rule and demand-curve estimation (§5), and the result tables with empty slots (§6) — so execution is turnkey, and leaves the empirical requirement **open**.
>
> **Unblock path:** a human operator pre-registers the test (§3.4), stands up one honest mechanism (StoreKit once a build + App Store Connect prices are live, or a funded, disclosed pre-order pre-launch), routes an equalized prospect cohort to the paywall at a fixed journey moment with equal sticky allocation across ≥2 of the PRD §7 prices, accrues to the pre-registered `n_per_arm` (§5.1) under the §5.3 stopping rule and the refund-observation window, then populates §6.1–§6.3 from the TASK-033 events (commitment, abandonment, refunds, Wilson CIs, pairwise difference CIs), confirms the §6.4 honesty-gate audit, and completes the §6.5 limitations. No offer or instrument redesign is required.

| TASK-018 acceptance requirement | Status |
|---|---|
| **At least two price points** | **Framework ready** — three PRD §7 arms defined (§2.2); minimum run A1+A3, full run A1+A2+A3. |
| **Actual commitment behavior measured** | **OPEN / BLOCKED** — requires a real paid-commitment run (§9). §4.2/§4.5 define it; §6.1 awaits real events. No synthetic stand-in is presented as satisfying this (the §6.6 fixture is explicitly labelled NON-DATA). |
| **Abandonment measured** | **Framework ready, data pending** — §4.1/§4.3 define the per-step funnel; §6.3 template (empty cells) awaits a real run. |
| **No misleading charges** | **Framework ready & enforceable** — the §3.3 honesty gate (H1–H8) + §6.4 production audit; this is a design guarantee verifiable only once a real checkout is fielded. |
| **Reported *per price point*** | **Framework ready** — §6.1 is one row per price across commitment/CI/value; §6.3 is per-price abandonment; §6.2 is pairwise. |

**Status routing note (disclosed deviation):** per the standard workflow this step would set TASK-018 to `in_review`. As with TASK-008/009/016/017, routing a non-completable empirical task through the gate as "done" would require fabricating the per-price commitment and abandonment data the criterion demands and would re-arm the synthetic-data reject loop the Reviewer has repeatedly closed. TASK-018 is therefore set to **`blocked`** with a `blocked_reason`, surfacing the blocker honestly — the terminal state the Reviewer sanctioned for this autonomous context. The next pending task, TASK-019 (concept selection decision record), **depends on the results of the blocked TASK-016/017/018 desirability/WTP studies** and so cannot be honestly completed until those unblock; the first truly autonomous-executable pending work is the Experience-workstream build (e.g. TASK-020 "Your Little Win Today" card). Flagged for human triage.

**Verification note:** Research/instrument-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed **exit 0** (strict `tsc -b && vite build`, zero warnings). No `[TBD]`/Lorem ipsum/placeholder/TODO/FIXME content; no synthetic data presented as findings (the §6.6 fixture is explicitly labelled NON-DATA). Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
