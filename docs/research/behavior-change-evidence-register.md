# Behavior-Change Evidence Register — Graded Mechanisms for HerRays

**Task:** TASK-005 · **Workstream:** Research · **Stage:** Behavioral validation (PRD §5)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22

---

## 1. Purpose

The teardowns (TASK-001/002), feature inventory (TASK-003), and anti-pattern library (TASK-004) told us what the *category builds* and what *drives engagement*. They deliberately refused to answer a different, harder question: **which of these mechanisms actually changes real-world behavior, for whom, and how strong is the evidence?** The adjacent-category audit flagged this explicitly — "any claim that a mechanism *improves behavior* (vs merely *drives engagement*) must be routed through the behavior-change evidence register (TASK-005) before adoption."

This document is that register. It is the evidence spine of the product: every behavioral claim HerRays makes in concepts (TASK-011–013), in the action engine (TASK-024/025), in the experience layer (TASK-020–032), and in editorial copy (TASK-042) must trace back to a graded entry here. Where the evidence is weak, we say so, and we treat the feature as an *experiment to run* (TASK-035/036/040), not a settled truth.

The register answers the PRD §5 mandate directly: it covers the five mechanisms the PRD names — **cues, goals, reinforcement, self-monitoring, and habit automaticity** — and the supporting mechanisms (implementation intentions, action simplicity, positive affect/celebration, identity, autonomy, flexible consistency, fresh-start restarts) that the concepts depend on.

**What this is not.** This is not a clinical evidence synthesis and not a systematic review. It is a product-grade, evidence-*graded* register built from the established behavior-change literature, written to be falsifiable and to be verified against primary sources (§8) before any health or efficacy claim ships. It distinguishes *general behavioral effects* (well studied) from *individual health-outcome or disease-prevention claims* (out of scope here, routed to TASK-006).

## 2. Method

### 2.1 What each mechanism card contains

Each entry carries the five acceptance-criterion fields, plus two HerRays-specific fields for traceability:

| Field | What it states |
|---|---|
| **Citation** | The anchor reference(s) — primary study or meta-analysis — establishing the effect |
| **Population** | Who the evidence was gathered on (so we know the limits of generalization) |
| **Evidence strength** | Graded **A–D** (see §2.2), reflecting study design, replication, and effect consistency |
| **Limitation** | The honest caveat — what the evidence does *not* show, or where it breaks down |
| **Implementation implication** | The concrete, buildable design instruction for HerRays, routed to an owning task |
| **HerRays mechanism** | The specific product form the mechanism takes |
| **Guilt check** | Confirmation the implementation survives CLAUDE.md §1 (Zero-Guilt) |

### 2.2 Evidence-strength grading scheme

A deliberately conservative, GRADE-inspired four-tier scheme. It rates *the strength of evidence for the behavioral effect*, not the size of the effect. TASK-006 will extend this into a full safety/claims rubric for health *actions*; this scheme governs *behavioral mechanisms*.

| Grade | Meaning | Typical evidence basis |
|:---:|---|---|
| **A** | Strong | Consistent meta-analyses / multiple RCTs; replicated; mechanism well understood |
| **B** | Moderate | ≥1 meta-analysis or several RCTs with some heterogeneity or moderators |
| **C** | Emerging | Mixed RCTs, mostly observational/lab, or strong theory with thin field replication |
| **D** | Weak / contested | Primarily theoretical, popular-press, or evidence of *engagement* not *behavior change* |

> **Standing caution (carried from TASK-002/003).** Engagement ≠ efficacy. A mechanism can be grade-A for *driving app use* and grade-D for *changing real-world behavior*. This register grades the second claim. Where a mechanism is strong for engagement but unproven for behavior, it is graded on behavior and flagged.

### 2.3 Scope boundary

Behavioral mechanisms only. Claims of the form "doing action X reduces your personal risk of disease Y" are explicitly **out of scope** and are forbidden until TASK-006's rubric and TASK-024's reviewed catalog exist. This register can say "self-monitoring increases goal attainment (grade A)"; it may **not** say "this app prevents diabetes."

---

## 3. The register

### 3.1 Cues — context-dependent repetition

> **PRD mechanism.** "Relevant cue → tiny real-world action." The cue is the trigger that, through repetition in a stable context, lets a behavior eventually run without deliberate intent.

| Field | Entry |
|---|---|
| **Citation** | Wood, W., & Neal, D. T. (2007). *A new look at habits and the habit–goal interface.* Psychological Review, 114(4), 843–863. Wood, W., Quinn, J. M., & Kashy, D. A. (2002). *Habits in everyday life.* JPSP, 83(6), 1281–1297. Lally & Gardner (2013), *Promoting habit formation*, Health Psych Review, 7(sup1). |
| **Population** | US/UK community and student samples; behaviors spanning eating, exercise, commuting, media use. |
| **Evidence strength** | **A** — habit-as-context-cued-response is one of the most replicated findings in behavioral psychology; ~45% of daily behavior is enacted in recurring contexts (Wood 2002). |
| **Limitation** | Evidence is strongest for *maintaining* existing behaviors in *stable* contexts; disrupted contexts (travel, life change) break cue–response links. Observational core; cue *strength* is hard to manipulate cleanly. |
| **Implementation implication** | Anchor each action to an existing stable cue the user already performs daily ("after I pour my morning coffee"), not to a clock alone. Build cue selection into the scheduler. → **TASK-023** (cue scheduler), **TASK-025** (recommendation rules weight cue stability). |
| **HerRays mechanism** | "Stack this on something you already do" step in cue setup; after-event anchors preferred over time-only reminders. |
| **Guilt check** | ✅ Cues prompt; they never shame. A missed cue silently rolls to the next opportunity (no "you missed it" badge). |

### 3.2 Implementation intentions — the "when-then" plan

> A specific sub-mechanism of cueing with unusually clean experimental support; worth its own card because it is directly buildable and high-leverage.

| Field | Entry |
|---|---|
| **Citation** | Gollwitzer, P. M. (1999). *Implementation intentions.* American Psychologist, 54(7), 493–503. Gollwitzer, P. M., & Sheeran, P. (2006). *Implementation intentions and goal achievement: a meta-analysis.* Advances in Experimental Social Psychology, 38, 69–119. |
| **Population** | 94 independent tests, n≈8,000 in the 2006 meta-analysis; health, academic, environmental, and prospective-memory behaviors; broad adult samples. |
| **Evidence strength** | **A** — meta-analytic *d* ≈ 0.65 (medium-to-large) on goal attainment, on top of goal intentions. One of the most robust effects in the field. |
| **Limitation** | Effect depends on a pre-existing goal intention (it helps you *act on* a goal, not *create* one) and on the plan being specific and the cue being encountered. Weaker where the behavior is highly aversive or the cue is unreliable. |
| **Implementation implication** | During onboarding and cue setup, structure the plan as an explicit **"When [situation], I will [tiny action]"** sentence the user composes and can see. Store it; surface it in the reminder. → **TASK-023**, **TASK-039** (test comprehension). |
| **HerRays mechanism** | The cue scheduler is literally an implementation-intention composer, not a time picker. |
| **Guilt check** | ✅ The plan is the user's own words, opt-in, and editable; declining to plan is a first-class path. |

### 3.3 Goals — specific, proximal, and self-set

| Field | Entry |
|---|---|
| **Citation** | Locke, E. A., & Latham, G. P. (2002). *Building a practically useful theory of goal setting and task motivation.* American Psychologist, 57(9), 705–717. Latham & Locke (2006 updates). |
| **Population** | 35+ years of lab and field studies; originally organizational/task performance, broadly replicated; adult working populations. |
| **Evidence strength** | **A** for the core finding (specific + challenging goals outperform vague "do your best"); **B** when transplanted to self-directed health micro-behaviors, where the "challenging" axis can backfire. |
| **Limitation** | Classic goal-setting rewards *difficulty*; HerRays' thesis is the opposite — **start ridiculously small**. High goals raise performance *and* abandonment when self-efficacy is low. Proximal (daily) goals beat distal ones for novices; distal-only goals demotivate. |
| **Implementation implication** | Use **specific + proximal + tiny**, not specific + challenging. One concrete daily action, framed as unambiguously achievable. Escalation only on explicit user readiness (no automatic difficulty ramps). → **TASK-020** (today card), **TASK-029** (progressive challenge, user-initiated only). |
| **HerRays mechanism** | "Your Little Win Today" is a single, specific, same-day goal; the Growing-World long arc is motivational scenery, never the performance target. |
| **Guilt check** | ✅ Goal is small enough that success is the default; failure is engineered to be rare and never penalized. |

### 3.4 Reinforcement & reward — immediacy, affect, and schedule

> **PRD mechanism.** "Immediate positive feedback." The PRD also insists we reward *actual behavior*, not app engagement — so this card grades the behavioral literature carefully against the engagement literature.

| Field | Entry |
|---|---|
| **Citation** | Schultz, W. (2016). *Dopamine reward prediction-error signalling.* Nat Rev Neuroscience, 17, 183–195. Milkman, K. L., Minson, J. A., & Volpp, K. G. M. (2014). *Temptation bundling.* Management Science, 60(2), 283–299. Rhodes, R. E., & Kates, A. (2015). *Can affective judgments predict physical activity?* Annals of Behavioral Medicine, 49(5). Fogg, B. J. (2019). *Tiny Habits* — "celebration"/shine (popular-press synthesis). |
| **Population** | Primate/human neuroeconomics (reward timing); US adults (temptation bundling, gym attendance RCT); PA meta-analyses (affect); self-help field reports (celebration). |
| **Evidence strength** | **B** overall. *Immediate* reward > delayed is strong (A, basic science). *Positive affect in-the-moment predicting repeated behavior* is B. *Deliberate celebration as a habit accelerator* is C/D (popular, under-tested experimentally). Variable-ratio schedules are A for *engagement*, **D for durable health behavior** and flagged as an anti-pattern risk. |
| **Limitation** | Extrinsic/variable rewards can **undermine intrinsic motivation** (see §3.9 SDT) and train app-checking rather than the target behavior. Benefit of reward collapses if reward attaches to *tapping* rather than *doing*. Celebration evidence is largely practitioner, not RCT. |
| **Implementation implication** | Deliver an **immediate, sensory, non-variable** completion moment tied strictly to the *real action's* completion (the <2s delight, haptic + motion). No points economies, no loot-box variability, no streak-driven variable reward. → **TASK-020/021** (completion + haptics), **TASK-030** (motion tokens), **TASK-032** (progress viz rewards consistency, not escalation). |
| **HerRays mechanism** | One honest, beautiful "that felt good" beat per completion; reward is the feeling, not a currency. |
| **Guilt check** | ✅ Reward is purely additive on success; its *absence* on a missed day is neutral, never a penalty. Variable-reward/streak-casino mechanics explicitly rejected (TASK-004 AP-family). |

### 3.5 Self-monitoring — tracking progress

> **PRD mechanism.** Self-monitoring is named directly. It is also the single most evidence-backed self-regulatory technique in the health-behavior literature — but with a sharp design caveat.

| Field | Entry |
|---|---|
| **Citation** | Harkin, B., et al. (2016). *Does monitoring goal progress promote goal attainment? A meta-analysis.* Psychological Bulletin, 142(2), 198–229. Michie, S., Abraham, C., Whittington, C., McAteer, J., & Gupta, S. (2009). *Effective techniques in healthy eating and physical activity interventions.* Health Psychology, 28(6), 690–701. |
| **Population** | Harkin: 138 studies, n≈19,000, broad goal domains. Michie 2009: 122 health-behavior trials (diet/PA). Adult, mostly Western samples. |
| **Evidence strength** | **A** — monitoring goal progress reliably increases attainment (Harkin meta *d* ≈ 0.40); effect larger when progress is *physically recorded* and *made public/visible*, and when paired with a goal. Michie: self-monitoring + ≥1 other self-regulatory technique was the most effective intervention combination. |
| **Limitation** | Effect is on *goal attainment*, not guaranteed on long-term habit automaticity. Over-granular tracking adds friction and can induce the very guilt we forbid (dropout when the chart shows gaps). Benefit depends on monitoring being low-effort. |
| **Implementation implication** | Provide **lightweight, glanceable** completion tracking that records the real action in one tap and **visualizes consistency without punishing gaps** (no red breaks, no zeroing). Pair tracking with the user's goal/plan. → **TASK-026** (completion ledger), **TASK-032** (non-punitive progress viz), **TASK-035** (automaticity survey as periodic self-monitor). |
| **HerRays mechanism** | The ledger + gentle progress view: completed opportunities accumulate; missed days are shown as neutral, never as failure. |
| **Guilt check** | ✅ This is the make-or-break Zero-Guilt surface. Monitoring shows *what you did*, never *what you owe*. Explicitly rejects streak-reset (TASK-004). |

### 3.6 Habit automaticity — the end state, and how we measure it

> **PRD mechanism.** "Habit automaticity, not only app opens." This is both a *mechanism* (automaticity is what makes behavior self-sustaining) and the product's north-star *outcome measure*.

| Field | Entry |
|---|---|
| **Citation** | Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). *How are habits formed: modelling habit formation in the real world.* European Journal of Social Psychology, 40(6), 998–1009. Measurement: Verplanken, B., & Orbell, S. (2003). *Self-Report Habit Index (SRHI).* J Applied Social Psychology, 33(6). Gardner, B., Abraham, C., Lally, P., & de Bruijn, G-J. (2012). *Self-Report Behavioral Automaticity Index (SRBAI).* IJBNPA, 9:102. |
| **Population** | Lally: 96 UK adults, self-chosen daily eating/drinking/activity behaviors over 12 weeks. SRHI/SRBAI validated across multiple adult health-behavior samples. |
| **Evidence strength** | **B**. The automaticity-grows-with-repetition curve is well supported; the widely-cited figures (median ~66 days to plateau; range **18–254 days**) come from a *single small study* and should be cited as illustrative, not as a law. SRHI/SRBAI are **A**-grade validated instruments. |
| **Limitation** | "66 days" is routinely over-claimed — the real finding is *high individual variability* and that missing one day does **not** meaningfully harm formation. Automaticity is harder to build for complex/effortful behaviors than for tiny ones (which supports our thesis). Self-report automaticity ≠ objective behavior. |
| **Implementation implication** | (1) Set expectations honestly: progress takes weeks-to-months and varies; never promise "21 days." (2) Measure automaticity with the **SRBAI** (4 items), labeled by instrument + version, as the behavioral north-star distinct from retention. (3) Build **habit graduation**: when automaticity is high, *reduce* prompting rather than maximizing app use. → **TASK-028** (graduation state machine), **TASK-035** (automaticity survey), **TASK-036** (reminder-reduction experiment), **TASK-034** (behavior retention ≠ app retention). |
| **HerRays mechanism** | Automaticity measured, not assumed; a "stable"→"graduated" transition that celebrates the user outgrowing the app (PRD Principle 5). |
| **Guilt check** | ✅ The product's success is defined as the user *needing it less* — the structural opposite of engagement-maxxing. |

### 3.7 Action simplicity — tiny behaviors and self-efficacy

| Field | Entry |
|---|---|
| **Citation** | Fogg, B. J. (2009). *A behavior model for persuasive design.* Persuasive '09. Bandura, A. (1977). *Self-efficacy: toward a unifying theory of behavioral change.* Psychological Review, 84(2), 191–215. Gardner, Lally & Wardle (2012). *Making health habitual.* British Journal of General Practice, 62(605), 664–666. |
| **Population** | Fogg: design/lab synthesis. Bandura: foundational, broad. Gardner: UK primary-care guidance synthesis. |
| **Evidence strength** | **B**. Self-efficacy as a predictor of initiation/persistence is **A**; "make the behavior tiny to raise the probability of action" (Fogg B=MAP) is well-reasoned and widely applied but has thinner direct RCT isolation — **B/C**. |
| **Limitation** | Fogg's model is a design framework, not an RCT-tested intervention per se; "tiny" can be *too* tiny to produce a felt benefit, risking disengagement. Self-efficacy is a mediator, not a button we press directly. |
| **Implementation implication** | Keep the default action at the **20-second-to-2-minute** floor (PRD §1); always offer an *easier* variant so ability never gates action. Early wins build self-efficacy, which carries later effort. → **TASK-022** (fallback flow), **TASK-024** (every catalog action has an easier variant), **TASK-020**. |
| **HerRays mechanism** | "Two minutes outside… or 20 seconds on a hard day." Ability is engineered up so motivation needn't be high. |
| **Guilt check** | ✅ Shrinking the action is framed as smart, not as settling; the easier variant counts fully. |

### 3.8 Positive affect & celebration — encoding the win

| Field | Entry |
|---|---|
| **Citation** | Rhodes, R. E., & Kates, A. (2015). *Affective judgments and physical activity: meta-analysis.* Annals of Behavioral Medicine, 49(5), 715–731. Van Cappellen, P., et al. (2018), positive emotions & health behavior. Fogg (2019), celebration/"shine" (popular-press). |
| **Population** | PA meta-analyses (adult); affect-and-health reviews; practitioner reports. |
| **Evidence strength** | **C**. Affective *judgments* predicting future PA is **B**; *deliberately engineered in-app celebration* as a causal habit accelerator is **C/D** — plausible, mechanistically consistent, but under-tested in isolation. Honest grade: treat as a hypothesis to test (TASK-016/040). |
| **Limitation** | Correlational core for affect→behavior; celebration's causal contribution is confounded with the reward/feedback card (§3.4). Easy to over-design into kitsch that erodes the premium feel. |
| **Implementation implication** | Make the completion moment feel *genuinely good* (craft, restraint, Apple-level polish), and let users attach a felt reason ("that was easy / I feel calmer"). A/B the celebration's presence and style. → **TASK-030** (motion/affect tokens), **TASK-021** (haptics), **TASK-016** (desirability test). |
| **HerRays mechanism** | The sub-2-second delight is affect engineering done tastefully — a small, real "that felt good." |
| **Guilt check** | ✅ Celebration only ever fires on success; never a sad/guilt animation on a miss. |

### 3.9 Autonomy & intrinsic motivation — self-determination

| Field | Entry |
|---|---|
| **Citation** | Ryan, R. M., & Deci, E. L. (2000). *Self-determination theory and the facilitation of intrinsic motivation.* American Psychologist, 55(1), 68–78. Teixeira, P. J., et al. (2012). *Exercise, physical activity, and self-determination theory: a systematic review.* IJBNPA, 9:78. Ng, J. Y. Y., et al. (2012), SDT in health contexts, meta-analysis. |
| **Population** | Teixeira: 66 PA studies; Ng: health-behavior meta-analysis; broad adult samples. |
| **Evidence strength** | **A/B**. Autonomous motivation and perceived competence reliably predict *sustained* health behavior; controlled/external motivation predicts short-term compliance and later dropout. |
| **Limitation** | SDT is a motivational-quality theory; translating "support autonomy" into specific UI is interpretive. Measuring motivation quality in-product is non-trivial. |
| **Implementation implication** | Maximize **user choice** (pick your action, your cue, your pace), provide rationale not mandates, and avoid controlling language ("you must," "don't break your streak"). Competence support = the tiny-win design (§3.7). → **TASK-025** (choice-respecting recommendations, exclusions honored), **TASK-029** (accept/decline/revert), all copy (**TASK-042**). |
| **HerRays mechanism** | The user is always the author: chooses the action, can swap it, can decline a challenge, can graduate. |
| **Guilt check** | ✅ Autonomy support *is* Zero-Guilt operationalized — pressure and shame are controlling motivators SDT predicts will backfire. |

### 3.10 Flexible consistency vs rigid streaks

> Directly adjudicates the category's favorite mechanic against the PRD's Zero-Guilt constraint — and the evidence happens to agree with our values.

| Field | Entry |
|---|---|
| **Citation** | Lally et al. (2010) — *missing a single opportunity did not materially reduce habit formation.* Armitage, C. J. (2005), adherence & lapse tolerance. Fritz et al. (2017) / Stawarz, Cox & Blandford (2015), *Beyond self-tracking and reminders: designing for habit formation*, CHI — tracking apps rarely support context cues and over-rely on streaks. |
| **Population** | Lally UK adults; HCI studies of habit-app users; adult self-trackers. |
| **Evidence strength** | **B**. The specific finding that *one miss is harmless* to formation is from the Lally dataset (B, small-n but directly on point). The broader claim that rigid all-or-nothing streaks increase dropout is supported by HCI + attrition evidence (B/C). |
| **Limitation** | "Streaks motivate some users" is true for engagement (grade A for engagement); the claim they *harm behavior* is about the dropout tail, not every user. Needs our own experiment (TASK-040) to quantify for our population. |
| **Implementation implication** | Track **consistency over time** (e.g., "19 of the last 30 days") rather than fragile consecutive-day counts; a miss never zeroes progress. Pair with the gentle restart (§3.11). → **TASK-032** (progress viz), **TASK-027** (restart), **TASK-004** guardrails. |
| **HerRays mechanism** | Progress is a resilient accumulation, not a breakable chain. |
| **Guilt check** | ✅ The founding Zero-Guilt decision; the evidence (one miss is harmless) is the scientific license for it. |

### 3.11 Fresh-start / gentle restart — re-engaging after a lapse

| Field | Entry |
|---|---|
| **Citation** | Dai, H., Milkman, K. L., & Riis, J. (2014). *The fresh start effect: temporal landmarks motivate aspirational behavior.* Management Science, 60(10), 2563–2582. Polivy & Herman (2002), *If at first you don't succeed* (abstinence-violation / what-the-hell effect). |
| **Population** | Dai: large US field datasets (gym visits, searches, commitments). Polivy & Herman: dieting/self-regulation samples. |
| **Evidence strength** | **B**. Temporal landmarks boosting re-engagement is well evidenced (B). The abstinence-violation effect (one lapse → guilt → full abandonment) is a well-established self-regulation failure mode (B). |
| **Limitation** | Fresh-start evidence is largely about *initiation timing*, not specifically about in-app restart UX; we are extending it by analogy. Needs validation (TASK-040). |
| **Implementation implication** | After missed days, offer a warm, **one-to-two-tap restart** that reframes the moment as a fresh start, not a failure — pre-empting the what-the-hell spiral. No guilt copy, no catch-up debt. → **TASK-027** (gentle restart, ≤2 taps for 1/3/7-day gaps). |
| **HerRays mechanism** | "Welcome back — want today's little win?" Any day can be day one. |
| **Guilt check** | ✅ The restart flow is where Zero-Guilt is most load-bearing; evidence shows guilt here actively causes abandonment. |

### 3.12 Identity-based motivation

| Field | Entry |
|---|---|
| **Citation** | Oyserman, D., Bybee, D., & Terry, K. (2006). *Possible selves and academic outcomes.* JPSP, 91(1). Oyserman (2015), *Identity-based motivation.* Berkman, E. T., et al. (2017), identity & behavior change. (Popular synthesis: Clear, *Atomic Habits*, 2018 — cite as practitioner, not evidence.) |
| **Population** | Adolescent/adult samples (possible selves); mixed health-behavior work. |
| **Evidence strength** | **C**. Identity-congruent framing influencing behavior is theoretically strong and has supportive studies, but field RCTs isolating "identity framing" in a habit app are sparse. The *Atomic Habits* "cast a vote for the person you want to be" framing is **D** (practitioner, not tested). |
| **Limitation** | Easy to over-promise ("become a new you") and drift into unsupported claims. Identity framing can feel inauthentic or pressuring if heavy-handed — tension with autonomy (§3.9). |
| **Implementation implication** | Light, optional identity framing ("the kind of person who steps outside each day"), user-authored, never imposed; keep it a whisper, not a sermon. Defer heavy reliance until tested. → **TASK-011/012/013** (concept voice), **TASK-016** (test resonance). |
| **HerRays mechanism** | Gentle "becoming" language the user can opt into; progress reflects an identity the user chose, not one we sold. |
| **Guilt check** | ✅ Identity used aspirationally and optionally; never "a real [X] wouldn't skip" (that is shaming). |

---

## 4. Cross-mechanism synthesis

### 4.1 The evidence-backed behavior engine

Read as a loop, the grade-A/B mechanisms assemble into exactly the engine the PRD §5 describes — and the register tells us **which links are solid and which are experiments**:

```
 self-set tiny goal        stable cue + when-then plan        tiny action (ability↑)
      (§3.3, A/B)   ───────►   (§3.1 A, §3.2 A)      ───────►     (§3.7, B)
                                                                      │
                                                                      ▼
   graduation / taper        resilient self-monitoring        immediate honest reward
      (§3.6, B)   ◄───────   (§3.5 A, §3.10 B)    ◄───────       (§3.4, B; affect §3.8 C)
                                                                      │
                              gentle restart on lapse (§3.11, B) ◄────┘
     all wrapped in autonomy support + optional identity (§3.9 A/B, §3.12 C)
```

**The strongest links** (grade A): context cues, implementation intentions, self-set proximal goals, self-monitoring of progress, autonomy support, validated automaticity measurement (SRBAI). HerRays should build on these with confidence.

**The hypotheses to test** (grade C/D): deliberate celebration as a *causal* accelerator (§3.8), identity framing (§3.12), and any claim that our *specific* flexible-consistency model beats streaks for *our* users (§3.10). These are wired to TASK-016/035/036/040 as experiments, not shipped as facts.

**The explicitly rejected** (grade D-for-behavior): variable-ratio reward economies, streak loss-aversion, and extrinsic point systems — strong for engagement, unproven or counterproductive for durable behavior and intrinsic motivation, and already barred by TASK-004.

### 4.2 Where the evidence and the Zero-Guilt constraint agree

A notable, reassuring convergence: the mechanisms the evidence supports for *durable* behavior change (autonomy, self-efficacy from tiny wins, lapse-tolerant consistency, graduation) are the same ones CLAUDE.md §1 mandates, and the mechanisms the evidence warns *undermine* durable change (controlling motivation, shame, all-or-nothing streaks) are the ones §1 forbids. **Zero-Guilt is not only an ethical stance — on this evidence it is the higher-efficacy strategy.** That is a defensible editorial claim for TASK-042 (stated as "designed around the behavior-change evidence," not as a disease claim).

### 4.3 Honest weak spots we are carrying

1. **The "66 days" temptation.** We will be pressured (by marketing instinct) to promise a timeframe. The evidence (§3.6) forbids it: one small study, huge variance. Guardrail: no numeric habit-formation promise in any copy.
2. **Celebration is under-evidenced** (§3.8). We are betting product craft on a C-grade mechanism. That is acceptable *if* we test it (TASK-016) and don't claim efficacy from it.
3. **All field evidence is largely Western-adult.** Our launch segment (TASK-010) must be checked against this population limit; generalization to other cultures/ages is an open question, not a given.
4. **Engagement metrics will look like success before behavior change does.** TASK-034 must separate app retention from behavior retention so we don't fool ourselves with a grade-A-for-engagement, grade-D-for-behavior mirage.

---

## 5. Implementation handoff map

| Mechanism (grade) | Owning task(s) | What must be built |
|---|---|---|
| Cues (A) + Implementation intentions (A) | TASK-023, TASK-025 | Cue scheduler as a "when-then" composer; recommendations weight cue stability |
| Goals — tiny/proximal (A/B) | TASK-020, TASK-029 | Single same-day action; user-initiated escalation only |
| Reinforcement (B), Affect/celebration (C) | TASK-020, TASK-021, TASK-030 | Immediate non-variable completion delight tied to real action; test it |
| Self-monitoring (A) | TASK-026, TASK-032, TASK-035 | One-tap ledger; non-punitive progress viz; periodic SRBAI |
| Automaticity (B) + measurement (A) | TASK-028, TASK-034, TASK-035, TASK-036 | Graduation state machine; behavior-vs-app retention; SRBAI survey; taper experiment |
| Action simplicity (B) | TASK-022, TASK-024 | Easier-variant fallback; every catalog action has one |
| Autonomy (A/B) | TASK-025, TASK-029, TASK-042 | Choice-first engine; non-controlling copy |
| Flexible consistency (B) | TASK-027, TASK-032 | Resilient accumulation, not breakable chains |
| Fresh-start / restart (B) | TASK-027 | ≤2-tap warm restart after 1/3/7-day gaps |
| Identity (C) | TASK-011–013, TASK-016 | Optional, user-authored "becoming" framing; test before relying |

Downstream, this register is the **source of truth** TASK-006 extends (safety/claims rubric for *actions*), TASK-014 scores concepts against ("behavioral effectiveness" criterion, PRD weight 20%), and TASK-042 cites for editorial claims.

---

## 6. How to read a grade (for reviewers and downstream tasks)

- **A** → build on it now; it can anchor a design decision and (carefully worded) an editorial claim.
- **B** → build on it, but hold the strong claim; prefer "designed around evidence that…" phrasing.
- **C** → build it as a *testable hypothesis*; must be wired to an experiment before any efficacy claim.
- **D** → do not claim behavior-change benefit; either reject (if it violates §1) or ship only as undifferentiated UX with no efficacy story.

No HerRays surface may state or imply a behavioral benefit stronger than its mechanism's grade licenses. That is a reviewable gate (add to the PR checklist alongside TASK-004's red-flag list).

---

## 7. Coverage checklist (acceptance criterion)

Acceptance criterion: *"Each mechanism has a citation, population, evidence strength, limitation and implementation implication."*

| # | Mechanism | Citation | Population | Evidence strength | Limitation | Implementation implication |
|:--:|---|:--:|:--:|:--:|:--:|:--:|
| 3.1 | Cues | ✓ | ✓ | A | ✓ | ✓ |
| 3.2 | Implementation intentions | ✓ | ✓ | A | ✓ | ✓ |
| 3.3 | Goals | ✓ | ✓ | A/B | ✓ | ✓ |
| 3.4 | Reinforcement & reward | ✓ | ✓ | B | ✓ | ✓ |
| 3.5 | Self-monitoring | ✓ | ✓ | A | ✓ | ✓ |
| 3.6 | Habit automaticity | ✓ | ✓ | B (measures A) | ✓ | ✓ |
| 3.7 | Action simplicity | ✓ | ✓ | B | ✓ | ✓ |
| 3.8 | Positive affect / celebration | ✓ | ✓ | C | ✓ | ✓ |
| 3.9 | Autonomy / SDT | ✓ | ✓ | A/B | ✓ | ✓ |
| 3.10 | Flexible consistency | ✓ | ✓ | B | ✓ | ✓ |
| 3.11 | Fresh-start / restart | ✓ | ✓ | B | ✓ | ✓ |
| 3.12 | Identity | ✓ | ✓ | C | ✓ | ✓ |

**12 mechanisms**, all five required fields populated for each. The five PRD §5 mechanisms (cues 3.1, goals 3.3, reinforcement 3.4, self-monitoring 3.5, automaticity 3.6) are all covered at grade A/B.

---

## 8. Evidence & verification notes

This register is built from the established behavior-change literature as understood at authoring (knowledge current to early 2026). It is a **product-grade graded register, not a systematic review.** Before any claim built on it ships externally (TASK-042) or informs the health-action catalog (TASK-024), the following must be verified against primary sources:

1. **Exact effect sizes and citations** — the meta-analytic figures quoted (e.g., implementation-intention *d* ≈ 0.65; self-monitoring *d* ≈ 0.40; Lally median ~66 days / range 18–254) are from memory of the literature and must be checked against the original papers and any newer meta-analyses before being printed as numbers.
2. **The automaticity timeline** must never be stated as a fixed "X days" promise regardless of what verification finds — the finding is *high variance* (§3.6, §4.3).
3. **Instrument licensing/versioning** — SRHI/SRBAI wording and scoring must be reproduced exactly and attributed (feeds TASK-035).
4. **Population generalization** — field evidence is predominantly Western-adult; reconcile with the TASK-010 launch segment before claiming applicability.
5. **Engagement-vs-efficacy separation** — any mechanism graded strong-for-engagement/weak-for-behavior (variable reward, streaks) must retain that distinction in all downstream use; do not let a grade-A-engagement finding be relabeled as behavior-change evidence.
6. **No disease-prevention or individual-risk claims** derive from this document; those are categorically out of scope and gated by TASK-006.

> **Confidence tags.** Grades A/B entries: High confidence in the *direction* of effect. Grade C: Medium — plausible, build-and-test. Grade D-for-behavior: cited only to reject or to flag engagement-only value. All numeric effect sizes carry a **verify-against-primary-source** flag per note 1.

**Status:** Research-only deliverable. No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).
