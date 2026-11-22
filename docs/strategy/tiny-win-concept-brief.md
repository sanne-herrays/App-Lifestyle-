# Concept Brief — **The Tiny Win**

**Task:** TASK-011 · **Workstream:** Concepts · **Stage:** Independent concept generation (PRD §3)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22
**Concept family:** 1 of 3 (sibling briefs: TASK-012 *The Growing World*, TASK-013 *Everyday Adventures*)

---

## 0. How to read this brief (status & evidence discipline)

This is a **concept hypothesis**, not a selected winner (PRD §3: "These are hypotheses, not preselected winners"). It is written to an equivalent spec as its two siblings so that TASK-014 (scorecard) and TASK-016 (blinded desirability test) can compare them fairly, and so TASK-019 can make an evidence-based go/no-go.

Two evidence standards are kept strictly separate in this document, because the Reviewer gate depends on it:

- **Graded behavioral mechanisms** (cited `EVIDENCE §x.x`) come from `docs/research/behavior-change-evidence-register.md` (TASK-005) and carry an A–D grade. These are the load-bearing claims and I build on them in proportion to their grade.
- **Barrier priors** (cited `B1`–`B7`) come from the *a-priori hypotheses* in `docs/research/behavioral-interview-protocol-and-analysis-framework.md` §3 and the diary framework (TASK-008/009). **TASK-008 and TASK-009 are `blocked` — no interviews or diaries have been run.** Every `B#` reference here is therefore a **prior to test, not a finding**, and is labelled as such. No claim in this brief may be advanced by any decision gate (TASK-016/019) as empirical user evidence; it is design rationale awaiting the research that the blocked tasks will supply.

Health framing throughout obeys `docs/research/prevention-action-evidence-rubric.md` (TASK-006): HerRays recommends real, low-risk, general-benefit actions and makes **no individual disease-risk or prevention claim** (CLAUDE.md §3).

---

## 1. One-page thesis

### 1.1 The idea in one sentence
**The Tiny Win is a habit app with almost no app in it: one absurdly easy real-world action each day, completed in a single satisfying gesture, and then it gets out of your way.**

### 1.2 The bet (PRD §3 hypothesis, verbatim)
> "One absurdly easy daily action, a satisfying interaction and almost no dashboard. **Hypothesis: reduced choice and effort increase consistency.**"

The Tiny Win takes the PRD's hypothesis literally and refuses the category's reflex to add. Where competitors differentiate by adding surface — more habits, richer dashboards, deeper gamification, social layers — Tiny Win differentiates by **subtraction**. Its entire product surface on a normal day is: *one card, one gesture, one honest moment of "that felt good," gone in under two seconds.*

### 1.3 Why subtraction is the strategy, not a shortcut
The feature inventory (TASK-003 §4.3) found that of the category's six outright-rejected capabilities, five are pure pressure/guilt mechanics (brittle streak F19, XP economy F24, leaderboards F29, time-window F17, early paywall F41) — and these are precisely the category's **most common retention tools**. Most habit apps are load-bearing on mechanics HerRays has already barred. Tiny Win's thesis is that once you remove them, the honest remainder is not a thinner product but a *different, calmer* one — and that the calm itself is the desirability.

This also directly attacks the two barrier priors the Stage-1 evidence predicts will be most load-bearing (interview framework §3, *prior not finding*): **B1 — effort/friction exceeds value**, and **B3 — decision/goal-setting burden**. If reduced choice and effort really do increase consistency, Tiny Win should win on exactly the users every other app loses: the lapsed (Segment A) and the overwhelmed busy beginner (Segment C), per the recruitment screener (TASK-007 §3).

### 1.4 What makes it difficult to copy
Not any single feature — all of them are in the TASK-003 "✅-adopt" column and individually copyable. The defensible advantage is **restraint as an identity**: a competitor with a points economy, a social feed and an upsell funnel cannot credibly strip them out without breaking its own business model and brand. Tiny Win's moat is that it is willing to be *small*, including the hardest commercial expression of smallness — **habit graduation (F26), absent in all 20 audited products** (TASK-003 §4.2) — where success means the user needs the app *less*.

### 1.5 Core promise, hypothesis, storyboard, failure modes
The four acceptance-criterion elements have dedicated sections: **user promise → §2**, **behavior hypothesis → §3**, **7-day storyboard → §6**, **failure modes → §9**.

---

## 2. User promise

### 2.1 The promise, in the user's language
> **"You don't need to change your life. Just one little piece of today — and it'll feel good before you've even finished."**

(Aligned to the PRD §8 launch story: "You don't need to change your life. Just a little piece of today.")

### 2.2 The promise, decomposed into commitments
A promise is only real if every word maps to a buildable, falsifiable commitment:

| Promise fragment | What we commit to | Measured / enforced by |
|---|---|---|
| "one little piece" | Exactly **one** action is ever shown for today. No list, no dashboard, no choosing. | TASK-020 today card; free tier = 1 habit (PRD §7) |
| "of today" | Same-day, proximal goal only; no distal targets, no "21-day" promises. | EVIDENCE §3.3 goals (A/B), §3.6 (no timeline promise) |
| "it'll feel good" | An immediate, sensory, non-variable completion moment tied to the **real** action. | EVIDENCE §3.4 reinforcement (B); TASK-020/021/030 |
| "before you've even finished" | The whole completion interaction is **< 2 seconds, one gesture** (CLAUDE.md §2). | TASK-020 acceptance; TASK-039 time-to-first-action |
| "you don't need to change your life" | Missing a day is ordinary and never penalized; any day can be day one. | CLAUDE.md §1; EVIDENCE §3.10/§3.11; TASK-027 |

### 2.3 The anti-promise (what we deliberately do NOT promise)
Stating the non-promises is part of the brief, because the category's desirability is built on promises Tiny Win refuses:
- **No** "transform yourself in N days" (forbidden by EVIDENCE §3.6 — the automaticity timeline is high-variance, 18–254 days in the one study that exists).
- **No** disease-prevention or individual health-risk reduction (TASK-006 claim ladder; CLAUDE.md §3).
- **No** "don't break your streak" loss-aversion hook (barred, TASK-004; it is the B2 barrier we design against).
- **No** completeness/productivity fantasy ("track all your habits in one place") — that is the opposite concept.

### 2.4 Who the promise is for (launch audience)
The screener (TASK-007 §3) defines three segments; Tiny Win is aimed first at the two the category underserves:
- **Primary — Segment C, busy beginners:** high time pressure, no sustained routine. The promise's "one little piece / under two seconds" is engineered for their constraint. (Formal JTBD selection is TASK-010, currently `blocked`; this brief states the intended fit as a hypothesis, not as the decided segment.)
- **Secondary — Segment A, abandoned-app users:** burned by streak guilt and dashboard overwhelm. The anti-promise (§2.3) is written to them.
- **Segment B, sustainers:** not a target, but their protective behaviors (interview framework §3.1) are the blueprint — they already practice flexible consistency and tiny anchoring.

---

## 3. Behavior hypothesis

### 3.1 Primary hypothesis (falsifiable)
> **H1.** For users who have struggled to sustain habits, **removing the choice of *what* to do and minimizing the effort to *do and record* it will increase the frequency of real-world action** relative to a conventional multi-habit tracker — without using streak pressure, points, or guilt.

### 3.2 The behavior engine behind the hypothesis
Tiny Win instantiates the exact loop assembled in EVIDENCE §4.1, using only grade-A/B links as load-bearing and treating grade-C links as explicitly test-gated:

```
  ONE self-set tiny goal        stable routine-anchored cue + when-then plan        ONE tiny action
      (EVIDENCE §3.3 A/B)  ──────►      (EVIDENCE §3.1 A, §3.2 A)             ──────►   (EVIDENCE §3.7 B)
   "today's little win"            "after I pour my morning coffee, I'll…"        ability engineered up
                                                                                        │  (< 2 s, one gesture)
                                                                                        ▼
    graduation / taper          resilient, glanceable self-monitoring          immediate honest reward
      (EVIDENCE §3.6 B)  ◄──────      (EVIDENCE §3.5 A, §3.10 B)        ◄──────    (EVIDENCE §3.4 B; affect §3.8 C*)
   needs the app less             "19 of the last 30 days," never a chain              one "that felt good" beat
                                                                                        │
                              gentle restart on a lapse (EVIDENCE §3.11 B) ◄────────────┘
            all wrapped in autonomy support (EVIDENCE §3.9 A/B) + optional, user-authored identity (§3.12 C*)
```
`*` grade-C mechanisms (celebration as a causal accelerator §3.8; identity framing §3.12) are built as **testable hypotheses**, wired to TASK-016/040 — never shipped as efficacy claims.

### 3.3 Mechanism-by-mechanism rationale
| Design move | Mechanism (grade) | Why it serves H1 |
|---|---|---|
| Show exactly one action; recommend it, don't make the user pick | Goals tiny/proximal (A/B, §3.3); rule-based recommendation (F36 ⭕) | Directly removes the B3 decision-burden *prior*; "specific + proximal + tiny" beats "specific + challenging" for low-self-efficacy users |
| "After [existing routine], I will [action]" composer, not a clock picker | Cues (A, §3.1) + implementation intentions (A, §3.2) | The single highest-leverage, cleanest-evidence lever (meta-analytic *d*≈0.65); attacks B4 brittle-cue *prior* |
| 20-second floor + always an easier variant | Action simplicity (B, §3.7) | Keeps ability high so motivation needn't be; attacks B1 friction *prior*; every catalog action has an easier variant (TASK-024/022) |
| One-gesture completion with sensory delight, tied to the real action | Reinforcement (B, §3.4) + affect (C*, §3.8) | Rewards *behavior not tapping* (PRD §3); < 2 s (CLAUDE.md §2); attacks B5 disconnected-reward *prior* |
| Consistency shown as resilient accumulation ("19 of 30"), never a breakable chain | Self-monitoring (A, §3.5) + flexible consistency (B, §3.10) | Monitoring raises attainment (*d*≈0.40) *without* the B2 streak-guilt that monitoring usually smuggles in |
| Warm ≤2-tap restart after any gap; any day is day one | Fresh-start / restart (B, §3.11) | Pre-empts the abstinence-violation ("what-the-hell") spiral; attacks B6 no-recovery *prior* |
| Opt-in, taperable notifications; success-only tone | Autonomy (A/B, §3.9) | Avoids B7 notification fatigue; controlling prompts predict dropout |
| Graduation: reduce prompting once automatic | Automaticity (B, §3.6) + measurement SRBAI (A) | The product's north-star inverts engagement-maxxing (PRD Principle 5) |

### 3.4 Secondary / competing hypotheses this concept must survive
Honest concept generation names the ways the bet could be *wrong in principle*, for the scorecard to weigh:
- **H2 (desirability risk).** Subtraction may read as *boring / unfinished* rather than *calm*. One card may not generate enough "I want this" at discovery (PRD §4 five-second test). → tested TASK-016/017.
- **H3 (efficacy ceiling).** An action "too tiny to feel worth it" (EVIDENCE §3.7 limitation) may produce completion without any felt benefit, capping intrinsic motivation. → tested TASK-040; mitigated by the easier-variant *scaling up* on good days (TASK-029, user-initiated only).
- **H4 (commercial risk).** One free habit + graduation may cap willingness-to-pay and LTV. → tested TASK-018, modeled TASK-038.

### 3.5 Kill criteria (pre-committed, so we can't rationalize)
Tiny Win should be **rejected or substantially reworked** at TASK-019 if, in testing:
1. It does **not** beat a conventional multi-habit control on *real-action frequency* (not app opens) over the TASK-040 window — H1's core claim fails; **or**
2. Blinded desirability (TASK-016) ranks it last on "I want this" **and** comprehension is high (i.e., people understand it and still don't want it — not a messaging fix); **or**
3. WTP (TASK-018) at the lowest tested price ($29.99/yr, PRD §7) shows no viable contribution even before graduation's LTV cap.

---

## 4. Onboarding ("I can do this") — target < 60 seconds to first win

Design principle: **reach the first real win before asking for anything.** The category's anti-pattern is an early hard paywall or a long coaching funnel (F41/F06 🚫/⚠️, TASK-003); Tiny Win inverts it — value first, configuration later, account maybe never.

| Step | Screen | What happens | Evidence / feature | Zero-Guilt / <2s check |
|---|---|---|---|---|
| 1 | Welcome | One warm line: "Let's find one little win for today." No sign-up wall. | F08 quick-start (✅) | No account required to reach value |
| 2 | Goal whisper (optional) | "What's pulling at you lately?" 4 warm chips (Move a little · Feel calmer · Drink water · Step outside) + Skip. | F02 intention framing (✅); EVIDENCE §3.3 | Skip is a first-class path (autonomy §3.9) |
| 3 | The suggestion | App *proposes one* tiny action from the reviewed catalog (TASK-024), e.g. **"Two minutes outside. That's it."** with a visible easier variant ("20 seconds on a hard day"). | F36 recommendation (⭕); EVIDENCE §3.7; TASK-025 rules | Removes B3 decision burden *(prior)*; no blank page |
| 4 | When-then plan (optional) | "When do you already do something every day?" → composes *"After I pour my morning coffee, I'll step outside for two minutes."* | F04 anchoring (✅); EVIDENCE §3.1/§3.2 (A) | User authors it; declining to plan still proceeds |
| 5 | **First win, now** | "Want to do it right now?" → the today card. Completing it is the first sensory completion moment. | TASK-020/021; EVIDENCE §3.4 | **First action within onboarding**, one gesture, < 2 s |
| 6 | Gentle close | "That's your little win today. We'll be here tomorrow — no pressure." Notifications offered, **opt-in**, taperable. | EVIDENCE §3.9; TASK-023/036 | No streak started, no guilt, no upsell |

**Onboarding non-negotiables:** no health-risk framing (TASK-006), no "science lecture" gate (F06 kept to one optional line), no paywall before the first win (F41 barred). Comprehension and time-to-first-action are measured in TASK-039.

---

## 5. Daily interactions (the core loop)

### 5.1 The normal day (the 95% case)
1. **Cue fires** — a routine-anchored, opt-in nudge (or the user simply opens the app). Copy is invitational: *"Ready for today's little win?"* Never *"You haven't done X."*
2. **One card** — "Your Little Win Today" (TASK-020): title, the tiny effort ("2 min"), the easier variant, and a single primary gesture. Nothing else on screen.
3. **One gesture** — tap-and-hold (or swipe) to complete. A ring closes, a soft haptic fires (TASK-021, success-only), a restrained motion beat plays (TASK-030). **< 2 s, done.**
4. **Honest reward** — one line the user can optionally personalize: *"That felt good."* / "I feel calmer." (affect attach, EVIDENCE §3.8 C*). No points awarded, no currency.
5. **Gone** — the app returns to a calm "done for today" state. No feed to scroll, no next-habit upsell. The *absence* of more is the design.

### 5.2 The hard day
- The card's easier variant is always one tap away (TASK-022): "20 seconds is a full win today." Switching is ≤ 2 taps and **counts fully** — never flagged as a lesser completion (EVIDENCE §3.7 guilt check).
- "Not today" is a first-class, non-failing state (F11 ✅), recorded as neutral in the ledger — not a gap to be punished.

### 5.3 The missed day(s)
- No red badge, no "streak lost," no catch-up debt (CLAUDE.md §1; B2/B6 priors). The next open shows the **gentle restart** (TASK-027): *"Welcome back — want today's little win?"* in ≤ 2 taps, for 1 / 3 / 7-day gaps alike. Past progress is never erased (EVIDENCE §3.10/§3.11).

### 5.4 Interaction inventory (what the concept actually ships as daily surface)
Assembled only from the TASK-003 §4.4 ✅/⭕ "bill of materials": F16 one-clear-thing · F09/F15 one-gesture/real-action completion · F10 sensory delight · F11 Skip · F12 easier-variant · F18 ring (glanceable only) · F21 decaying-strength (never F19 streak) · F27 optional parasocial companion (lightweight, reactive, never nagging). Explicitly **excluded**: F19 streak, F23 heavy analytics, F24 XP, F28/F29 social pressure, F41 paywall.

---

## 6. Seven-day storyboard

The arc the concept promises: the action stays tiny and constant; what changes is the user's *felt relationship* to it — from novelty, through the first real-life friction, to early ownership. The storyboard deliberately includes a **missed day (Day 4)** so the restart is shown as a normal beat, not an edge case.

| Day | Moment (PRD §6 six-moment frame) | What the user experiences | What the system does | Mechanism / check |
|---|---|---|---|---|
| **1** | Discovery → first action | Installs, is offered *one* action ("Two minutes outside"), does it inside onboarding. First "that felt good." | Recommends action (TASK-025), composes when-then plan, fires first completion delight. | EVIDENCE §3.2/§3.4; < 2 s first win |
| **2** | Return | Morning: a gentle, anchored invitation. Completes in one gesture before coffee's done. | Same single card; ring closes; records real action (TASK-026). | EVIDENCE §3.1 cue; §3.5 monitoring (1 tap) |
| **3** | Completion, deepening | Starts to feel the micro-benefit ("I actually like the two minutes"). Optionally taps the identity whisper: "the kind of person who steps outside." | Offers optional, user-authored identity line (never imposed). | EVIDENCE §3.12 C* (test-gated); §3.9 autonomy |
| **4** | **Missed day** | Busy, forgets. **No notification guilt**; no badge. Evening: nothing punishes them. | Silent neutral non-completion; no streak to break (none exists). | CLAUDE.md §1; B2/B6 priors; EVIDENCE §3.10 |
| **5** | **Gentle restart** | Opens the app: *"Welcome back — want today's little win?"* Back in action in ≤ 2 taps, feeling welcomed, not scolded. | Gentle restart flow (TASK-027); progress shows "4 of the last 5 days," intact. | EVIDENCE §3.11 fresh-start (B); ≤ 2 taps |
| **6** | Progression (optional, user-led) | On an easy day, is *offered* (not pushed) a slightly bigger version: "Feel like five minutes today?" Can accept, decline, or revert. | Progressive challenge selector (TASK-029); no auto-escalation ever. | EVIDENCE §3.3/§3.9; H3 mitigation |
| **7** | "This is part of me now" | Glances at the gentle progress view: "6 of the last 7 days," shown as resilient accumulation, warm, no chart-shame. Feels quietly capable. First hint of automaticity. | Non-punitive progress viz (TASK-032); begins (silently) tracking toward SRBAI check (TASK-035). | EVIDENCE §3.5 (A); §3.6 automaticity (B) |

**What day 7 is NOT:** it is not a "streak = 7 🔥" trophy, not a "you've unlocked level 2" economy, and not a health-outcome claim. It is a calm, honest reflection of consistency, and the on-ramp to the *long* arc the siblings dramatize differently: eventual **graduation** (TASK-028), where Tiny Win starts prompting *less* because the behavior is becoming the user's own.

---

## 7. Progression & retention model

### 7.1 Progression (deliberately shallow by design)
Tiny Win's progression is the thinnest of the three concepts — on purpose. Effort accumulates as:
- a **resilient consistency metric** (F21 decaying strength, never F19 streak) — "19 of the last 30 days," which a miss dents but never zeroes;
- an optional **accruing, never-resetting artifact** (F22) kept minimal (a small, calm visual), explicitly *not* the Growing World's elaborate world (that is TASK-012's territory — kept distinct so the blinded test compares real alternatives);
- **user-led difficulty** (F35/TASK-029) only, never automatic escalation after a miss.

The end state is **graduation (F26)**: when the SRBAI automaticity signal (TASK-035) is high, the app proposes reducing prompting and optionally adding one more tiny action — celebrating the user outgrowing it (PRD Principle 5; EVIDENCE §3.6).

### 7.2 Retention model — three separate outcomes (PRD §7)
We refuse to conflate these, and Tiny Win is *designed to sometimes trade #1 for #2–3*:
1. **App retention** — return to complete the daily win. Supported by gentle cues + the pleasant completion moment, **not** by streak lock-in.
2. **Behavior retention** — the real action persists *even when app prompting tapers*. This is the true goal (TASK-034 separates it from app retention; TASK-036 taper experiment).
3. **Commercial retention** — subscription renewal (§8).

> **The honest tension, stated plainly:** Tiny Win's success criterion (behavior becomes app-independent) is in direct tension with app-retention and LTV. We treat this as a feature of the ethics and a *risk* to the economics (H4), to be modeled — not hidden — in TASK-038. Hypothesized targets to validate, not assume (PRD §7): first action within 24 h ≥ 65%, D7 ≥ 45%, D30 ≥ 30%.

---

## 8. Commercial hypothesis

- **Free tier (PRD §7):** one active habit — which for Tiny Win is *the entire core product*, not a crippled demo. The free experience is genuinely complete and delightful; this is a deliberate bet that generosity at the core drives word-of-mouth (PRD §8 shareable, non-shaming moment).
- **Premium (hypothesis):** multiple parallel little wins, adaptive recommendation, richer (still-gentle) progress views, and the graduation "add another tiny action" path. Gated by a clean entitlement check (TASK-037), **never** an early hard paywall (F41 barred).
- **Price points to test:** $29.99 / $39.99 / $59.99 annual (PRD §7), via an honest WTP test with no deceptive checkout (TASK-018).
- **The commercial risk, named:** Tiny Win's premium upsell (more habits) sits in slight tension with its own "one little piece" promise, and graduation caps LTV. This is the sharpest of the three concepts' commercial questions and must be resolved by evidence at TASK-018/038, not assumed away. Mitigation hypotheses: premium as *breadth for graduates* (users who've succeeded and want a second win), and family/gift framing — both to be tested, not claimed.

---

## 9. Failure modes

Each failure mode names: the risk, the barrier/evidence it maps to, the early signal, and the designed mitigation. Grouped by type.

### 9.1 Behavioral failure modes (the bet is wrong)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-1 | **"Too tiny to matter."** The action is so small the user feels no benefit and drifts off (EVIDENCE §3.7 limitation; H3). | §3.7; §3.8 | High completion, low self-reported benefit / falling return (TASK-040) | Easier-variant *scales up* on good days (TASK-029, user-led); attach felt-benefit line (§3.8) and test it |
| F-2 | **Subtraction reads as emptiness.** Nothing to come back *for*; the calm becomes forgettable (H2). | desirability; §3.4 | Low D7 return despite high comprehension (TASK-016) | Make the completion moment genuinely craft-worthy (TASK-030); optional lightweight companion (F27) for warmth without pressure |
| F-3 | **Recommendation misfires.** The one suggested action doesn't fit the user's goal/constraints, and with no menu they're stuck. | B3 prior; F36; §3.9 | "This isn't for me" drop at onboarding step 3 (TASK-039) | Rules honor exclusions + a no-match fallback (TASK-025); one-tap "suggest a different one" preserves autonomy without restoring full decision burden |
| F-4 | **Cue never fires in real life.** The anchor routine is unstable (travel, shift work), so the behavior has no trigger (B4 prior; §3.1 limitation). | §3.1; B4 | Completions cluster then vanish after a context change | Routine-anchored (not clock-only) cues, editable; contextual cueing roadmap (F34/TASK-023); gentle restart catches the fallout |

### 9.2 Zero-Guilt / trust failure modes (we accidentally become what we oppose)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-5 | **Progress view becomes a report card.** "19 of 30" is read as "you failed 11 times" — monitoring smuggles in guilt (EVIDENCE §3.5 limitation; B2). | §3.5; §3.10; B2 | Negative affect in usability sessions (TASK-039); drop after a visible gap | Frame as accumulation not deficit; never red, never "missed"; screen-reader summary tested; TASK-032 guardrails + TASK-004 red-flag checklist |
| F-6 | **Notifications slide into nagging.** Even gentle prompts, repeated, become pressure (B7 prior; §3.9). | B7; §3.9 | Notification opt-out spikes; disable-then-churn | Opt-in only, taperable by default, success-toned; taper is a *feature* (TASK-036), never re-escalated after a miss |
| F-7 | **Restart that still shames.** "Welcome back" lands as passive-aggressive if copy or art implies absence was bad. | §3.11; B6 | Users describe restart as "guilt-trippy" in testing | Copy reviewed against the TASK-004 forbidden-word list; art is warm/neutral; ≤ 2 taps, no catch-up debt |

### 9.3 Health-integrity failure modes (CLAUDE.md §3)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-8 | **Benefit creep in copy.** "Feel calmer" quietly drifts toward "reduces anxiety / prevents disease." | TASK-006 claim ladder | Claims review flags ungraded language | Only pre-cleared, grade-licensed phrasing ships (TASK-006 §5); claims-review gate at TASK-042; no individual-risk framing, ever |
| F-9 | **Unsafe action for some users.** A "tiny" action is contraindicated for a subgroup. | TASK-006 safety tiers; TASK-024 | Catalog review; support reports | Catalog actions carry contraindications + easier variant + review date (TASK-024); recommendation hard-excludes (TASK-025); eligibility screened upstream (TASK-007 E5/E6) |

### 9.4 Commercial failure modes
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-10 | **Generosity doesn't convert.** A complete, delightful free tier gives users no reason to pay (H4). | §8; TASK-038 | WTP test: viable contribution not reached at $29.99 (TASK-018) | Premium = breadth for *graduates* + gift/family framing; if still unviable at lowest price → kill criterion §3.5(3) |
| F-11 | **Graduation eats the business.** Successful users leave, capping LTV below CAC (TASK-038). | §7.2; F26 | Cohort model: contribution/install < paid CAC | Model honestly (TASK-038); graduation can *invite* a next tiny win (retain by breadth, not lock-in); accept lower LTV as the ethical cost if economics still clear |

### 9.5 The meta-failure mode
**F-12 — We lose our nerve and start adding.** Under retention pressure, the team re-introduces a "harmless" streak, a points nudge, a social feed — and Tiny Win becomes an average habit app. *Mitigation:* the kill criteria (§3.5), the TASK-004 reviewer red-flag checklist as a merge gate, and this brief on record: **if Tiny Win can't win by subtraction, it should be rejected at TASK-019, not quietly converted into the thing it was built to replace.**

---

## 10. Scorecard pre-read (hand-off to TASK-014 / TASK-019)

How Tiny Win is *expected* to score on the PRD §9 weighted criteria — a hypothesis for the scorecard to confirm or overturn with real test data, **not** a self-grade:

| Criterion (weight) | Expected relative strength | Rationale |
|---|---|---|
| Desirability (20%) | **Medium / contested** | Calm is desirable to the burned (Seg A/C) but may under-excite at first glance (H2) |
| Behavioral effectiveness (20%) | **High (on evidence)** | Built almost entirely on grade-A/B mechanisms targeting the predicted top barriers |
| Differentiation (15%) | **High** | Restraint-as-identity + graduation (F26, category-absent); hard to copy without breaking a rival's model |
| User experience (15%) | **High** | Fewest surfaces, < 2 s core loop, accessibility-first |
| Retention potential (10%) | **Medium** | Strong behavior retention bet; app-retention deliberately not maximized |
| Economics (10%) | **Low / risky** | Generous free tier + graduation cap LTV (H4, F-10/F-11) |
| Apple-level craft (10%) | **High** | Subtraction is the ideal canvas for restraint + Apple-grade motion/haptic polish |

**Three non-negotiable gates (PRD §9):** (1) credible real-world behavior-change evidence — *strong, by construction*; (2) meaningful desirability — *the open question, to test*; (3) safe/trustworthy health guidance — *held by TASK-006/024*.

---

## 11. Coverage checklist (acceptance criteria)

Acceptance criterion: *"Brief contains user promise, behavior hypothesis, 7-day storyboard and failure modes."*

- [x] **User promise** — §2 (promise, decomposed commitments, anti-promise, audience).
- [x] **Behavior hypothesis** — §3 (falsifiable H1, mechanism engine, per-move rationale, competing hypotheses H2–H4, pre-committed kill criteria).
- [x] **7-day storyboard** — §6 (seven days across the PRD §6 six-moment frame, including a missed day + gentle restart).
- [x] **Failure modes** — §9 (twelve, grouped behavioral / trust / health / commercial / meta, each with mapping, early signal, mitigation).
- [x] *Beyond the criterion, to match the PRD §3 equivalent-brief standard and enable fair comparison:* one-page thesis (§1), onboarding (§4), daily interactions (§5), progression & retention (§7), commercial hypothesis (§8), scorecard pre-read (§10).
- [x] **Evidence discipline** — graded mechanisms (A–D) cited to TASK-005; barrier `B#` references labelled as *priors-to-test* (TASK-008/009 blocked), not findings; health claims bounded by TASK-006; no `[TBD]`/placeholder text.

**Status:** Concept-generation deliverable (strategy). No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).
