# Launch Experiment Plan — HerRays (PRD Stage-8 Launch & Advocacy)

**Task:** TASK-043 (design deliverable — see §0) · **Workstream:** Validation & Growth
**Owner:** Growth & monetization lead (per PRD team table) · **Reviewers:** Data / experimentation scientist (attribution & inference validity), Behavioral scientist + Principal UX designer (Zero-Guilt share mechanics), Preventive-health specialist (acquisition-claim limits), Privacy/security (consent & minimization)
**Grounds:** PRD §8 (*"Test creator partnerships, organic content, referrals, App Store discovery and paid acquisition **separately**. Scale only when retention and unit economics justify it."*), §7 (retention + economics targets), §9 (Apple editorial readiness), Principle 4 (frictionless, non-shaming)
**Consumes:** `subscription-economics` model (TASK-038, `lib/subscriptionEconomics.ts`) for the CAC ceiling; cohort retention (TASK-034, `lib/cohortRetention.ts`) for the behavior-retention gate; activation events (TASK-033, `lib/activation.ts`) for the first-action anchor; privacy/consent (TASK-041, `lib/privacy.ts`) for the no-tracking attribution constraint; the App Store editorial package (TASK-042, `docs/strategy/app-store-editorial-package/`) for listing assets; the prevention-action rubric (TASK-006) + claims ladder for creative copy limits
**Feeds (once real runs exist):** the scale/no-scale investment decision (PRD §8 "scale only when…"), the TASK-038 economics inputs (observed CAC / conversion replace assumptions), the TASK-042 proposition lock (TASK-017 winner)
**Date:** 2026-11-23

---

## 0. What this document is — and what it is not (read first)

This is the **launch experiment plan** for TASK-043: four **independent** acquisition experiments — **Organic**, **Referral**, **Creator**, and **Paid** — each specified as a pre-committed design so that, the moment the app is live, each can be run, read honestly, and killed or scaled on pre-registered rules rather than vibes.

**TASK-043's acceptance criterion is a design deliverable, and this document satisfies it in full.** The criterion requires that **each channel has (1) a hypothesis, (2) a budget cap, (3) an attribution method, (4) a success threshold, and (5) a stop condition.** All five are specified for all four channels in §3–§6 and cross-checked in the §11 matrix. A budget cap, a success threshold and a stop condition are **plan parameters** — design choices that are legitimately written *before* any spend — exactly like the eligibility, outcome window and stopping rules of a pre-registered experiment (cf. the TASK-036 reminder-reduction pre-registration). Writing them now is the task; it fabricates nothing.

**This is categorically different from the blocked live-traffic tasks (TASK-017 App Store proposition test, TASK-018 willingness-to-pay).** Those were `blocked` because their acceptance criteria demand *empirical records from a real run* — per-variant CTR, commitment behavior, confidence limits — that cannot be honestly produced without live traffic. TASK-043 demands no such record. It demands the **plan**, which is a durable artifact and is delivered here in full. Accordingly this task advances to **`in_review`, not `blocked`.**

What this document does **not** do, and does not claim to: it reports **no results**. There is no live listing, no spend, no impression, no install — therefore no measured CTR, CAC, k-factor or retention curve, and none is invented. Every outcome table in §9 is an **empty result slot** to be populated **only** from a real post-launch run. The one place numbers appear with a channel attached — the illustrative budget caps and CAC ceilings in §3–§6 — are **planning figures the operator locks at launch**, derived transparently from the TASK-038 economics model, clearly labelled as assumptions-to-validate, and carrying zero evidential weight as "results." Where arithmetic is worked to prove a cap is auditable, it is flagged **NON-DATA**, mirroring §9.6 of the reminder-reduction pre-registration.

This plan is also **gated on upstream decisions that are not yet made**: the winning concept (TASK-019, `blocked`), the winning App Store proposition (TASK-017, `blocked`), and a retention signal strong enough to justify *any* scale spend (TASK-040 pilot, `blocked`). §7.3 states this dependency honestly: **no paid scale-up is authorized until a real retention signal exists.** The plan is complete and runnable; its *execution past the learning phase* waits on evidence that only a real cohort can supply.

---

## 1. Objective, principles and the non-negotiable constraints

### 1.1 The question this plan answers

*Through which channel(s) can HerRays acquire users who actually perform the real-world behavior and are worth more than they cost — and at what point does the evidence justify spending to scale?* The plan does **not** assume any channel works; each is a falsifiable hypothesis with a kill switch. PRD §8 is explicit on both halves: test the channels **separately**, and **scale only when retention and unit economics justify it**.

### 1.2 Five principles carried from the product into its growth

1. **Acquire the behavior, not the install.** An install that never completes a real-world action is a vanity number. Every channel is judged on **activation** (first action within 24 h — TASK-033) and **behavior retention** (TASK-034), never on installs alone.
2. **Independent, parallel-but-separable experiments.** Each channel has its own hypothesis, budget, attribution and kill switch, so a win or loss in one is not confounded by another (PRD §8). §7 handles cross-channel confounding.
3. **Zero-Guilt extends to growth.** Share and referral mechanics obey CLAUDE.md §1: no guilt-to-share, no fake scarcity, no streak-shaming, no dark-pattern nags. The shareable moment is a *gift*, not a debt (§8.1).
4. **Privacy-first attribution.** Attribution uses first-party, aggregated, consent-respecting signals only — consistent with the TASK-041 "no tracking, nothing optional collected by default" posture. No cross-app tracking, no IDFA dependence (§2.2).
5. **Honest claims in every creative.** All acquisition copy clears the TASK-006 claims ladder and the Zero-Guilt `isGuiltFree` guard — the same gates the TASK-042 editorial package uses. No disease-prevention or individual-risk promise appears in any ad, caption, or referral line (§8.2).

### 1.3 The economic anchor (from the real TASK-038 model, not invented)

The paid channel's budget cap and stop condition are anchored to the project's own economics model (`lib/subscriptionEconomics.ts`), which reproduces the PRD §7 worked example to the cent. Under the **base assumptions** (price $39.99/yr, 5% install→paid conversion, 15% store commission, refunds/support at 0 — "before refunds and operating costs"):

| Quantity (base assumptions) | Value | Role in this plan |
|---|---:|---|
| First-year **proceeds per install** | **≈ $1.70** | The absolute first-year **break-even eCPA ceiling** — paying more than this per install loses money in year one before any other cost. |
| First-year **contribution per install** at $1.50 CAC | **≈ $0.20** | The PRD's illustrative healthy-margin point; the paid channel's *target* eCPA sits **below** this. |

> **NON-DATA note.** $1.70 and $0.20 are *model outputs of stated assumptions*, not observed results; the assumptions (especially 5% conversion and 15% commission — PRD §7 flags commission as *"require[s] verification"*) are themselves unproven and are the first things a real run replaces. They are used here only to set a *defensible, auditable* ceiling, not to predict performance.

### 1.4 Shared definitions used by every channel

| Term | Definition | Source of truth |
|---|---|---|
| **Install** | A first app open on a device, de-duplicated. | App Store Connect |
| **Activated user** | Completed the **first real-world action within 24 h** of first open (PRD §7 headline metric). | TASK-033 `first_action_completed` |
| **Activation rate** | Activated users ÷ installs, per channel cohort. | TASK-033 ÷ App Store Connect |
| **Behavior retention (D1/D7/D30/D90)** | Fraction of a channel cohort completing ≥ 1 real-world action in each window — **separate** from app-open retention. | TASK-034 `cohortRetention.ts` |
| **eCPA** | Effective cost per **install** = channel spend ÷ installs. | spend ÷ App Store Connect |
| **eCPActivated** | Cost per **activated** user = channel spend ÷ activated users. The honest unit — an install that never acts is not bought value. | spend ÷ TASK-033 |
| **k-factor** (referral) | New installs generated **per existing user**, via first-party referral redemptions. | §4 attribution |

**Organic baseline.** Before any paid or creator spend, the Organic cohort (§3) establishes the **baseline activation rate and D7/D30 behavior retention**. Every other channel's acquired cohort is judged *relative to this baseline* — a channel that buys installs which activate and retain **materially below** organic is buying the wrong users, and its stop condition fires (§5–§6) even if eCPA looks cheap.

---

## 2. Shared measurement spine and attribution architecture

### 2.1 One spine, four channels

All four experiments report through the **same** already-built, privacy-reviewed instrumentation, so results are comparable and no channel invents its own metric:

- **Activation** — TASK-033 activation events (anonymous install key, timestamp, schema version, coarse goal bucket only; **no raw health detail**, enforced structurally by `carriesRawHealthDetail`). The `first_action_completed` milestone is the activation anchor.
- **Behavior retention** — TASK-034 cohort dashboard, which computes **app-open vs. real-world-behavior retention separately** (PRD §7), by cohort, with immature cohorts flagged.
- **Economics** — TASK-038 model: observed per-channel eCPA and conversion are fed back in to replace assumptions, and the first-year contribution recomputes.
- **Privacy** — TASK-041 consent registry governs what may be collected; attribution may use **only** first-party and aggregated signals (§2.2).

### 2.2 The privacy-safe attribution rule (binds all four channels)

HerRays collects **no tracking data and nothing optional by default** (TASK-041). Attribution therefore must **never** rely on cross-app identifiers (IDFA), third-party pixels, or device fingerprinting. Each channel's attribution method (§3–§6) is restricted to one or more of these four privacy-preserving mechanisms:

| Mechanism | What it is | Privacy property |
|---|---|---|
| **App Store Connect source types** | Apple's first-party breakdown of impressions → product-page views → installs by source (App Store Search, Browse, Referrer, Web). | Aggregated, no user-level identity. |
| **Custom Product Pages (CPP) + unique URLs** | Distinct App Store page variants, each with a unique link, assignable per creator/campaign. | Aggregated per-page install counts; no user tracking. |
| **First-party referral codes / deferred deep links** | A code or link minted *inside* the app and redeemed *inside* the app — a first-party relationship, no third party. | No IDFA; redemption is a first-party event under TASK-041. |
| **SKAdNetwork / AdAttributionKit** | Apple's privacy-preserving ad-attribution: aggregated, delayed, no cross-app identity, works without App Tracking Transparency consent. | Install/conversion counts are aggregated by design. |

This is a real constraint, not a disclaimer: it rules out the entire class of user-level ad-tracking attribution and forces every channel onto aggregated, first-party evidence. Where a channel's measurement is therefore **lower-resolution** (e.g., organic social cannot be deterministically attributed), the plan says so and uses a **holdout / geo / time-series** design instead of pretending to per-user attribution (§3.3).

### 2.3 Common experiment hygiene (applies to every channel)

- **Pre-registered before spend.** Each channel's hypothesis, cap, threshold and stop condition are locked (this document) before its first dollar or first post. No post-hoc threshold edits; any change is a dated, logged amendment.
- **One primary metric per channel**, with explicit **guardrail metrics** that can independently trigger a stop.
- **No peeking-to-win.** Caps and durations are fixed in advance; a channel that cannot reach its pre-set decision sample within its budget cap is reported **inconclusive**, never spun into a "promising" result.
- **Immature cohorts are marked immature** (TASK-034), never read as final — D30/D90 claims wait for the window to close.

---

## 3. Channel A — Organic (content + App Store discovery)

*PRD §8: "organic content … App Store discovery". The zero-cost baseline against which every paid channel is judged.*

### 3.1 Hypothesis
**H-ORG:** A non-shaming, genuinely useful **shareable moment** ("You don't need to change your life. Just a little piece of today." — PRD §8) plus a well-optimized App Store listing (TASK-042) can produce a **self-sustaining organic install flow that activates at or above the PRD §7 target**, at **zero marginal acquisition cost**. Sub-hypothesis **H-ORG-ASO:** the TASK-017-winning proposition on the live listing converts store *views → installs* at a rate that makes organic discovery compounding rather than flat.

### 3.2 Design (two sub-experiments, run separately)
- **A1 — App Store discovery (ASO).** Ship the TASK-042 listing with the TASK-017-winning subtitle/screenshots. Measure store **impression → product-page-view → install** conversion by source type. Iterate keywords/screenshots in pre-registered, one-variable-at-a-time steps (never conflate two changes). *This is distinct from the TASK-017 proposition test, which selects the headline; A1 measures the chosen listing's live funnel.*
- **A2 — Organic content / shareable moment.** Publish the built, non-shaming share artifact (the "that felt good" completion moment, Zero-Guilt per §8.1) on owned + organic social. Because organic social cannot be deterministically attributed under §2.2, use a **geo or time-series holdout** (publish into some regions/weeks and not others) and read the **lift** in organic installs, not a per-post attribution.

### 3.3 Attribution method
**App Store Connect source types** (A1: Search / Browse / Referrer / Web split) + a **geo/time-series holdout** for A2 lift. No user-level tracking (§2.2). Activation and D7/D30 behavior retention of the organic cohort come from TASK-033/034 and **define the baseline** for all other channels.

### 3.4 Budget cap
**Marginal media spend: $0 (hard cap).** Organic is by definition unpaid; any dollar spent to amplify a post reclassifies that spend under **Paid** (§6) and is capped there. The only "cost" booked here is production/content time, capped at a pre-registered **content-production budget** (operator-locked; illustrative default: a fixed small weekly content allotment), with a hard stop if production cost per *organic* install exceeds the §1.3 break-even ceiling (**$1.70**) — i.e., even "free" organic must not cost more in production than it returns.

### 3.5 Success threshold
Primary: **organic activation rate ≥ 65%** (PRD §7 "first real action within 24 h") **and** organic **D7 behavior retention ≥ 45%** (PRD §7). Secondary (A1): a pre-registered store **view→install** conversion floor, locked at launch from Apple category norms (operator-filled; not invented here). Secondary (A2): a **statistically detectable positive lift** in the holdout.

### 3.6 Stop condition
- **Kill / rethink** if, after the pre-registered observation window, organic activation or D7 behavior retention sits **materially below** the §3.5 thresholds — this signals the *product/proposition*, not the channel, needs work, and **blocks any paid scale-up** (§7.3), because paying to pour users into a leaky funnel is the exact mistake PRD §8 warns against.
- **Hard kill (any channel)** on a Zero-Guilt or claims-ladder violation in any shared artifact (§8).
- **Scale signal:** organic meeting §3.5 is the **green light precondition** the other channels' scale decisions depend on.

---

## 4. Channel B — Referral

*PRD §8: "referrals". A first-party, Zero-Guilt invitation — never a guilt-driven growth loop.*

### 4.1 Hypothesis
**H-REF:** Users who have **personally felt a little win** will invite others when invitation is **effortless, honest, and guilt-free** — producing a **k-factor > 0** that lowers blended CAC **without** any coercive mechanic. The reward (if any) is for the *behavior already enjoyed*, not a bribe to spam contacts.

### 4.2 Design
An in-app **share-your-little-win** invitation, surfaced **only after** a genuine completion (never before value is felt), offering a first-party referral code/link. **Zero-Guilt constraints (hard requirements, §8.1):** no "invite 3 friends to unlock," no counters shaming low-referrers, no nagging re-prompts, no fake urgency. Any incentive is symmetric, modest, and never health-framed. The invite copy passes the `isGuiltFree` guard before ship.

### 4.3 Attribution method
**First-party referral codes + deferred deep links** (§2.2): a code minted inside the app, redeemed inside the app, recorded as a first-party TASK-041-governed event (opaque key, no contact-list harvesting, no third party). **k-factor** = redeemed installs ÷ sending users. No IDFA, no address-book upload.

### 4.4 Budget cap
Two pre-registered caps: (a) a **total referral-incentive budget** (operator-locked hard dollar ceiling for the test window), and (b) a **per-referred-install incentive cap** set **below the §1.3 break-even eCPA ($1.70)** so an incentivized referral can never cost more than a paid install would — if an incentive is used at all. A zero-incentive ("pure gift") variant is the preferred default and has **cap = $0**.

### 4.5 Success threshold
Primary: **k-factor ≥ a pre-registered floor** over the test window (locked at launch; a floor meaningfully > 0, i.e., referral measurably lowers blended CAC). Guardrail: **referred-cohort activation and D7 behavior retention ≥ the organic baseline** (§1.4) — referral must bring *behaving* users, not just signups. Guardrail: **zero** Zero-Guilt violations and **no rise** in opt-outs/uninstalls attributable to invite prompts.

### 4.6 Stop condition
- **Kill** if k-factor stays below its floor through the budget cap (referral is not viral here — report inconclusive, do not keep spending).
- **Hard kill (overrides economics)** on *any* evidence the mechanic induces guilt, pressure, or a shaming dynamic, or raises invite-prompt opt-outs — the Zero-Guilt gate is absolute (CLAUDE.md §1) and cannot be bought back by a good k-factor.
- **Kill** if referred-cohort retention falls materially below the organic baseline (buying the wrong users).

---

## 5. Channel C — Creator partnerships

*PRD §8: "creator partnerships". Trust-led, aligned, and claim-safe.*

### 5.1 Hypothesis
**H-CRE:** Partnering with a small set of **values-aligned creators** (calm, honest, anti-hustle — never medical-claim influencers) produces installs that **activate and retain at or above the organic baseline**, at a blended **cost per activated user below the §1.3 ceiling**, because the creator's audience already trusts a gentle, non-shaming message.

### 5.2 Design
A **small pre-registered cohort of creators** (test, not scale), each given a **unique Custom Product Page (CPP) / trackable link / promo code** and a **claims-bounded brief**: they may describe the *felt experience* ("a tiny thing that feels good"), but **may not** make any health-outcome or disease-prevention claim — the brief embeds the TASK-006 claims ladder and the forbidden-framings list, and all creator-facing copy is pre-cleared exactly as TASK-042 clears listing copy (§8.2). Creators run **separately** (each its own CPP) so per-creator performance is isolable and no single partner confounds the read.

### 5.3 Attribution method
**Per-creator Custom Product Pages + unique links/promo codes** (§2.2): App Store Connect reports installs per CPP; aggregated, no user tracking. Activation and retention of each creator cohort via TASK-033/034.

### 5.4 Budget cap
A pre-registered **total creator-partnership test budget** (operator-locked hard dollar ceiling) **plus** a **per-creator cap**, and a **per-activated-user ceiling**: **eCPActivated must stay below the §1.3 break-even ($1.70/install, and below the $0.20-contribution target point on an activated basis).** Flat/gifted partnerships are preferred over per-install payments during the learning phase to bound downside. Spend halts automatically at the cap regardless of interim enthusiasm.

### 5.5 Success threshold
Primary: **eCPActivated below the pre-registered ceiling** (§5.4) for at least one creator cohort, **and** that cohort's **D7 behavior retention ≥ organic baseline**. Secondary: qualitative brand-fit / sentiment check (no claim violations in published content).

### 5.6 Stop condition
- **Kill a creator** whose eCPActivated exceeds the ceiling or whose cohort retains materially below baseline.
- **Hard kill (overrides economics)** if a creator publishes a **health-outcome / disease-prevention claim** or any Zero-Guilt-violating framing — the claims gate is non-negotiable (CLAUDE.md §3), the partnership ends, and the content is corrected/removed.
- **Kill the channel** if no creator cohort clears §5.5 within the budget cap (report inconclusive).

---

## 6. Channel D — Paid acquisition

*PRD §8: "paid acquisition". The most expensive and most disciplined channel — authorized to **scale** only after §7.3.*

### 6.1 Hypothesis
**H-PAID:** On a privacy-preserving ad platform (e.g., Apple Search Ads), HerRays can acquire installs at an **eCPActivated below the §1.3 break-even ceiling** whose cohort **activates and retains at the organic baseline** — making paid a *profitable* scale lever, not a vanity-install pump. Until proven, paid runs **learning-only**, capped tight.

### 6.2 Design
A **small, capped learning campaign** (e.g., Apple Search Ads on brand + a few high-intent, non-medical keywords), using the TASK-017-winning proposition and TASK-042 assets. **One variable at a time**; no broad scale spend in the learning phase. Creative passes the §8.2 claims gate (no health-outcome keywords, no disease terms). Scale beyond the learning cap requires the §7.3 green light.

### 6.3 Attribution method
**SKAdNetwork / AdAttributionKit** + the platform's own aggregated reporting (Apple Search Ads attribution) (§2.2): aggregated install/activation counts, no IDFA, no cross-app tracking, consistent with TASK-041. Post-install activation/retention via TASK-033/034 by campaign cohort (aggregated).

### 6.4 Budget cap
**Hard, pre-registered caps at three levels:** (a) a **total learning budget** (operator-locked dollar ceiling — *small*, enough to reach a decision sample, no more); (b) a **daily spend cap**; (c) a **per-install eCPA hard ceiling = the §1.3 break-even of $1.70**, with a **target eCPActivated below the $0.20-contribution point** on an activated basis. Spend **auto-pauses** at any cap. **No budget increase is permitted inside the learning phase** — raising the cap is a §7.3 scale decision, not a campaign tweak.

> **NON-DATA worked example (zero evidential weight).** If the operator locks a learning budget of, say, $X and an eCPA ceiling of $1.70, the campaign can buy at most ≈ $X ÷ $1.70 installs before the cap halts it — and is judged on how many of those *activated* (TASK-033) and *retained* (TASK-034), not on the raw install count. Numbers are illustrative to show the cap arithmetic is mechanical; the real run supplies real eCPA.

### 6.5 Success threshold
Primary: **eCPActivated below the pre-registered ceiling** (§6.4) **and** paid-cohort **D7 ≥ 45% / D30 ≥ 30% behavior retention** at or above the organic baseline (PRD §7). A cheap install that doesn't activate or retain **fails**, by design.

### 6.6 Stop condition
- **Auto-pause** at any budget cap (§6.4) — non-negotiable, enforced by the platform cap, not operator discretion.
- **Kill** if eCPActivated exceeds the §1.3 ceiling, or if paid-cohort activation/retention lands materially below the organic baseline, through the learning budget.
- **Hard kill (any channel)** on a claims-ladder or Zero-Guilt violation in paid creative (§8).
- **No scale** until §7.3 is satisfied — the default state of paid is *off at scale*.

---

## 7. Independence, sequencing, and the scale gate

### 7.1 Why the channels are run separately (PRD §8)
Each channel has its **own** cohort tag (App Store source / CPP / referral code / SKAN campaign), its **own** budget cap, and its **own** kill switch, so a result in one is not confounded by another. Where two channels run concurrently, their cohorts are **separable at the attribution layer** (§2.2); where attribution cannot separate them (e.g., organic-social lift during a paid flight), a **holdout** isolates the organic effect (§3.3). Blended CAC is reported *in addition to*, never *instead of*, per-channel numbers.

### 7.2 Recommended sequence (not a dependency, a discipline)
1. **Organic first** — establishes the activation/retention **baseline** (§1.4) at $0 marginal cost. Nothing else can be judged without it.
2. **Referral + Creator next** — low-cost, trust-led, first-party; run separately once a baseline exists.
3. **Paid last, learning-only** — the most expensive; only meaningful once there is a baseline to beat and a retention signal to protect.

### 7.3 The scale gate (the PRD §8 "scale only when…" rule, made explicit)
**No channel is authorized to spend beyond its *learning* cap until all three hold:**
- **(G1) Retention signal exists** — a real cohort (TASK-040 pilot and/or early organic) shows behavior retention consistent with the PRD §7 D7/D30 targets. *TASK-040 is currently `blocked`; until a real retention signal exists, G1 is UNMET and no paid scale-up is authorized.*
- **(G2) Unit economics clear** — observed eCPActivated for the channel is below the §1.3 break-even, with contribution positive after refunds/support in the TASK-038 model (not just the "before costs" figure).
- **(G3) Guardrails clean** — zero unresolved Zero-Guilt or claims-ladder violations in that channel.

All three are **pre-conditions**, not averages — a strong CAC cannot buy past a failed retention gate. This is the structural opposite of growth-at-all-costs, and it is the same discipline PRD §8 names.

---

## 8. Guardrails that override growth (non-negotiable)

### 8.1 Zero-Guilt carried into acquisition (CLAUDE.md §1)
The shareable moment and the referral invite are **gifts, not debts**. Banned in *all* growth surfaces: guilt-to-unlock ("invite 3 to continue"), shaming counters, fake scarcity/urgency, broken-streak or FOMO framing, nagging re-prompts, and any red/penalty chrome. The invite appears **only after** a felt win, is skippable with no cost, and every surfaced string clears the `isGuiltFree` guard before ship — the same guard the product uses. A Zero-Guilt violation is a **hard kill** for the offending mechanic regardless of its growth performance (§4.6, §5.6, §6.6).

### 8.2 Health-claim integrity in every creative (CLAUDE.md §3; TASK-006)
Every ad, caption, screenshot, creator brief and referral line is pre-cleared against the **TASK-006 claims ladder** and the forbidden-framings list, exactly as the TASK-042 editorial package clears listing copy. **No disease-prevention claim, no individual-risk-reduction claim, no "clinically proven" / medical framing** appears in any acquisition asset. Creators are contractually claim-bounded (§5.2). A health-outcome claim is a **hard kill** (§5.6).

### 8.3 Privacy & data minimization (TASK-041)
Attribution uses only the four first-party/aggregated mechanisms in §2.2 — **no IDFA, no cross-app tracking, no third-party pixel, no address-book harvesting**. Referral codes and redemptions are first-party, opaque-keyed, TASK-041-governed events. Nothing optional (health included) is collected to measure a channel. The "no tracking" promise the app makes to users is not quietly broken to measure growth.

### 8.4 Apple editorial alignment (PRD §9)
Growth tactics must not undercut the editorial story (PRD §9): no incentivized-rating schemes, no misleading creative, no mechanic that would read as manipulative to App Review or to Apple's editors. The launch narrative ("just a little piece of today") is the same in the ads, the listing, and the product.

---

## 9. Analysis framework — empty result slots (populated only from a real run)

> These tables are intentionally empty. They are populated **only** from real post-launch runs. No synthetic values will be entered. ⟨pending⟩ marks a slot awaiting a real measurement.

### 9.1 Per-channel headline (one row per channel)

| Channel | Spend | Installs | Activation rate | eCPA | eCPActivated | D7 behavior ret. | D30 behavior ret. | Primary threshold met? | Decision (kill/hold/scale) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Organic | $0 (media) | ⟨pending⟩ | ⟨pending⟩ | — | — | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ |
| Referral | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ |
| Creator | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ |
| Paid | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ |

### 9.2 Organic baseline (the reference every other channel is judged against)

| Metric | Value | Window status |
|---|---:|---|
| Activation rate (first action ≤ 24 h) | ⟨pending⟩ | ⟨pending⟩ |
| D1 / D7 / D30 / D90 behavior retention | ⟨pending⟩ | immature until window closes |
| Store view → install conversion (A1) | ⟨pending⟩ | ⟨pending⟩ |
| A2 holdout lift (organic installs) + 95% CI | ⟨pending⟩ | ⟨pending⟩ |

### 9.3 Referral

| Metric | Value |
|---|---:|
| k-factor (redeemed installs ÷ sending users) | ⟨pending⟩ |
| Referred-cohort activation / D7 behavior retention | ⟨pending⟩ |
| Incentive spend vs. cap / per-referred-install cost | ⟨pending⟩ |
| Invite-prompt opt-out / uninstall change | ⟨pending⟩ |
| Zero-Guilt violations observed | ⟨pending⟩ (target: 0) |

### 9.4 Creator (one row per creator CPP)

| Creator CPP | Installs | eCPActivated | D7 behavior ret. | Claim violation? | Decision |
|---|---:|---:|---:|---:|---:|
| ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ (target: none) | ⟨pending⟩ |

### 9.5 Paid (one row per campaign)

| Campaign | Spend vs. cap | Installs | eCPA | eCPActivated | D7 / D30 behavior ret. | Threshold met? |
|---|---:|---:|---:|---:|---:|---:|
| ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ | ⟨pending⟩ |

### 9.6 Scale-gate status (§7.3)

| Gate | Condition | Status |
|---|---|---|
| G1 Retention signal | Real cohort meets PRD §7 D7/D30 targets | **UNMET** — TASK-040 pilot `blocked`; no real retention signal exists yet |
| G2 Unit economics | eCPActivated < break-even; contribution positive after costs | ⟨pending⟩ — no spend yet |
| G3 Guardrails clean | Zero Zero-Guilt / claims violations | ⟨pending⟩ — no runs yet |

### 9.7 Limitations to state in the final synthesis
- Attribution is **aggregated and privacy-preserving by design** (§2.2) — lower resolution than user-level tracking, and honestly so; organic-social effects are read as *lift*, not per-post attribution.
- Early-cohort D30/D90 are **immature** until their windows close (TASK-034) — no long-run retention claim is made from short windows.
- Conversion and commission in the economics anchor (§1.3) are **assumptions**, replaced by observed values as runs accrue.
- Results generalize only to the **TASK-019-selected concept** and **TASK-017-winning proposition** — both currently `blocked`; this plan is runnable the moment they resolve.

---

## 10. Standards upheld (CLAUDE.md / PRD)

- **§1 Zero-Guilt** — carried into growth: share/referral are gifts not debts; no guilt-to-unlock, shaming, fake scarcity or penalty chrome; `isGuiltFree` guard on all growth copy; Zero-Guilt violation is a hard kill overriding any CAC (§8.1).
- **§3 No generic boilerplate / honesty** — concrete per-channel hypotheses, caps, attribution mechanisms, thresholds and stop conditions; **no fabricated metrics** (every outcome is an empty §9 slot; the two numeric anchors are labelled model-assumptions / NON-DATA); no `[TBD]`/lorem filler.
- **§3 Health-claim integrity** — the TASK-006 claims ladder bounds every creative; no disease-prevention/individual-risk claim in any asset; claim violation is a hard kill (§8.2).
- **Privacy (TASK-041)** — first-party/aggregated attribution only; no IDFA/cross-app tracking; the user-facing "no tracking" promise is not broken to measure growth (§8.3).
- **PRD §7/§8** — behavior retention measured separately from app opens; **scale only when retention *and* economics justify it**, made explicit and enforceable as the §7.3 three-gate rule.

---

## 11. Definition of done — acceptance matrix

TASK-043's criterion — *"Each channel has hypothesis, budget cap, attribution method, success threshold and stop condition"* — is met for **all four** channels:

| Channel | Hypothesis | Budget cap | Attribution method | Success threshold | Stop condition |
|---|---|---|---|---|---|
| **Organic** (§3) | H-ORG §3.1 | §3.4 ($0 media; capped production) | §3.3 (ASC source types + holdout) | §3.5 (65% activation / 45% D7) | §3.6 |
| **Referral** (§4) | H-REF §4.1 | §4.4 (total + per-install incentive caps) | §4.3 (first-party codes / deep links, k-factor) | §4.5 (k-factor floor + baseline retention) | §4.6 |
| **Creator** (§5) | H-CRE §5.1 | §5.4 (total + per-creator + eCPActivated cap) | §5.3 (per-creator CPP / promo codes) | §5.5 (eCPActivated < ceiling + baseline D7) | §5.6 |
| **Paid** (§6) | H-PAID §6.1 | §6.4 (total + daily + eCPA hard ceiling) | §6.3 (SKAdNetwork / Apple Search Ads) | §6.5 (eCPActivated + D7/D30 targets) | §6.6 |

All five elements × four channels are specified. The plan is **locked and runnable**. Its **execution** (populating §9 from real runs) depends on a live listing and on the upstream gates TASK-019 (concept), TASK-017 (proposition) and TASK-040 (retention signal, §7.3 G1) — none of which can be honestly produced in an autonomous build, and none of which is faked here.

---

## 12. Status

**TASK-043 → `in_review`.** The launch experiment plan (the complete acceptance deliverable: hypothesis + budget cap + attribution method + success threshold + stop condition, for Organic / Referral / Creator / Paid) is delivered in full. This task is **not** `blocked`: unlike TASK-017/018, its acceptance criterion requires a *plan*, not an *empirical record*, and the plan is a durable artifact produced above. No synthetic results appear anywhere — §9 holds empty result slots; the only channel-attached numbers are the §1.3 economics **assumptions** (from the real TASK-038 model) and the §6.4 **NON-DATA** cap-arithmetic example, both explicitly labelled and carrying zero evidential weight. The scale gate (§7.3) openly records that no paid scale-up is authorized until a real retention signal exists.
