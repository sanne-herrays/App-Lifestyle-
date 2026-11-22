# Concept Brief — **The Growing World**

**Task:** TASK-012 · **Workstream:** Concepts · **Stage:** Independent concept generation (PRD §3)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22
**Concept family:** 2 of 3 (sibling briefs: TASK-011 *The Tiny Win* ✅, TASK-013 *Everyday Adventures*)

---

## 0. How to read this brief (status & evidence discipline)

This is a **concept hypothesis**, not a selected winner (PRD §3: "These are hypotheses, not preselected winners"). It is written to an equivalent spec as its two siblings so that TASK-014 (scorecard) and TASK-016 (blinded desirability test) can compare them fairly, and so TASK-019 can make an evidence-based go/no-go.

Two evidence standards are kept strictly separate here, because the Reviewer gate depends on it:

- **Graded behavioral mechanisms** (cited `EVIDENCE §x.x`) come from `docs/research/behavior-change-evidence-register.md` (TASK-005) and carry an A–D grade. These are the load-bearing claims; I build on them in proportion to their grade.
- **Barrier priors** (cited `B1`–`B7`) come from the *a-priori hypotheses* in `docs/research/behavioral-interview-protocol-and-analysis-framework.md` §3 and the diary framework (TASK-008/009). **TASK-008 and TASK-009 are `blocked` — no interviews or diaries have been run.** Every `B#` reference is therefore a **prior to test, not a finding**, and is labelled as such. No claim here may be advanced by any decision gate (TASK-016/019) as empirical user evidence.

Health framing throughout obeys `docs/research/prevention-action-evidence-rubric.md` (TASK-006): HerRays recommends real, low-risk, general-benefit actions and makes **no individual disease-risk or prevention claim** (CLAUDE.md §3).

**One honesty note specific to this concept, stated up front:** Growing World's central bet — *that emotional attachment to a virtual world improves real-world repetition* — is **not** directly covered by a grade-A/B mechanism in the register. Its closest graded support is **self-monitoring** (visual progress; §3.5, A) and **positive affect** (§3.8, C*). The attachment-drives-behavior claim is itself largely a **grade-C / to-be-tested hypothesis**. I say this in §0 rather than bury it, because it is the single most important thing the scorecard must weigh: this concept is more evidentially exposed than Tiny Win, and its desirability upside is correspondingly higher. I do **not** paper over that gap with borrowed grades.

---

## 1. One-page thesis

### 1.1 The idea in one sentence
**The Growing World is a habit app where every real little action you take in the real world makes a small, living world on your phone a little more beautiful — a world that only ever grows, and never withers, no matter how many days you miss.**

### 1.2 The bet (PRD §3 hypothesis, verbatim)
> "Actions gradually build a beautiful, playful world. **Hypothesis: attachment and visual progress improve repetition.**"

The Growing World takes the category's most emotionally powerful engine — a world you are building and grow attached to (Forest's forest, Habitica's avatar, Pokémon GO's collection) — and **removes the loss**. Every one of those products weaponizes attachment with a punishment: the tree dies, the avatar loses HP, the streak resets. Growing World's thesis is that *attachment without punishment* is not a weaker hook but a **cleaner and more durable** one — warmth you return to, not a hostage you rescue.

### 1.3 Why "a world that cannot wither" is the whole strategy, not a nicety
The anti-pattern library (TASK-004) found the category runs on four manufactured anxieties — loss, urgency, comparison, judgment — and that the richest world-building products are the worst offenders: Forest's withering/dying tree and Habitica's HP damage are named exemplars of **progression/streak guilt**, the exact harm family CLAUDE.md §1 bars. The naïve version of this concept — "keep your garden alive!" — would be a Zero-Guilt violation by construction.

So the strategy is a single, load-bearing design constraint from which everything else follows:

> **The world only ever accrues. Missing days pause growth; they never reverse, wilt, darken, or destroy it. There is no state of the world that communicates "you failed."**

This is what separates Growing World from every world-builder that came before it (TASK-003 §4.2), and it is why the concept is *ours to build* rather than a reskin of Forest: competitors cannot drop the withering mechanic without losing the loss-aversion retention it was designed to extract.

### 1.4 What makes it difficult to copy
Not the art — art is copyable. The defensible advantages are two:
- **A guilt-free accrual model (F22) tied strictly to real action (F15/F25 ⭕).** Incumbents are structurally committed to decay/loss mechanics and in-app "tending" loops; stripping those out breaks their retention math and their store economy (F42 gacha). We are free to make growth a *consequence of behavior*, not a game you can play without acting.
- **Graduation (F26, absent in all 20 audited products; TASK-003 §4.2)** expressed *through the world*: the world can reach a calm, complete, self-sustaining state that signals "this is yours now," rather than demanding infinite tending. A world designed to become peaceful is the opposite of an engagement treadmill.

### 1.5 Core promise, hypothesis, storyboard, failure modes
The four acceptance-criterion elements have dedicated sections: **user promise → §2**, **behavior hypothesis → §3**, **7-day storyboard → §6**, **failure modes → §9**. **Progression rules** (called for in this task's acceptance criteria specifically) are in **§5.4 + §7.1**, and **reward mechanics** in **§5.1–§5.3**.

---

## 2. User promise

### 2.1 The promise, in the user's language
> **"Do one tiny thing in the real world, and watch a little world of your own quietly grow more beautiful — one that's always waiting for you, and never falls apart when life gets in the way."**

(Aligned to the PRD §8 launch story: "You don't need to change your life. Just a little piece of today.")

### 2.2 The promise, decomposed into commitments
A promise is only real if every word maps to a buildable, falsifiable commitment:

| Promise fragment | What we commit to | Measured / enforced by |
|---|---|---|
| "do one tiny thing in the real world" | Growth is driven **only** by a verified real-world action, never by tapping, tending, or opening the app. | F15/F25 (⭕); PRD Principle 3; TASK-026 ledger is the sole growth trigger |
| "watch a little world grow more beautiful" | Each completion yields one visible, permanent increment of the world, rendered with Apple-grade craft. | F22 accruing artifact (✅); EVIDENCE §3.4 reinforcement (B); TASK-030 motion |
| "of your own" | The world is personal, authored by the user's real choices; no two look alike; no comparison to others. | F32 cosmetic authorship (✅); no F29 leaderboard / F30 feed |
| "always waiting for you" | The world persists indefinitely; return is invitational, never a rescue mission. | EVIDENCE §3.11 fresh-start (B); TASK-027 gentle restart |
| "never falls apart" | **No decay, no withering, no death, no reset — ever.** Missing days pause growth only. | CLAUDE.md §1; TASK-004 guardrails; §1.3 constraint |

### 2.3 The anti-promise (what we deliberately do NOT promise)
Naming the non-promises is part of the brief, because the category's world-builders are built on promises we refuse:
- **No** "don't let your garden die / keep your streak alive" loss hook (the Forest/Habitica mechanic; barred by TASK-004 — it is the B2 barrier we design against).
- **No** in-app currency, store, or gacha the world runs on (F24/F42 🚫/⚠️) — the world cannot be bought, only grown by real action.
- **No** disease-prevention or individual health-risk claim (TASK-006 claim ladder; CLAUDE.md §3). A more beautiful world is not a health outcome and is never framed as one.
- **No** "transform yourself in N days" timeline (EVIDENCE §3.6 — automaticity is high-variance).

### 2.4 Who the promise is for (launch audience)
The screener (TASK-007 §3) defines three segments:
- **Primary — Segment A, abandoned-app users:** people who *felt the pull* of a world-builder (that pull is why they installed one) but were **burned by its loss mechanic** — the dead tree, the lost streak. The entire anti-promise (§2.3) is written to them: here is the warmth without the punishment. (Formal JTBD selection is TASK-010, currently `blocked`; stated here as a hypothesis, not the decided segment.)
- **Secondary — Segment C, busy beginners:** the "always waiting, never falls apart" promise is engineered for interrupted lives; growth survives a chaotic week.
- **Segment B, sustainers:** not a target, but their flexible-consistency behavior (interview framework §3.1, *protective-factor prior*) is the blueprint the no-decay model institutionalizes.

---

## 3. Behavior hypothesis

### 3.1 Primary hypothesis (falsifiable)
> **H1.** For users who have struggled to sustain habits, **tying a permanent, beautiful, personally-authored visual world to real-world actions — where the world only ever accrues and never decays — will increase the frequency of real-world action** relative to a conventional tracker, *by building benign attachment and making consistency visible*, and **without** using loss, decay, streak pressure, or in-app economies.

### 3.2 The behavior engine behind the hypothesis
Growing World instantiates the loop assembled in EVIDENCE §4.1, using grade-A/B links as load-bearing and treating the attachment/affect links as explicitly test-gated:

```
  ONE self-set tiny goal         stable routine-anchored cue + when-then plan        ONE real tiny action
      (EVIDENCE §3.3 A/B)  ──────►      (EVIDENCE §3.1 A, §3.2 A)             ──────►   (EVIDENCE §3.7 B)
   "what will your world grow from"   "after I pour my coffee, I'll…"          ability engineered up
                                                                                        │  (< 2 s, one gesture)
                                                                                        ▼
    graduation: a calm,          world as resilient, glanceable                immediate reward = ONE
    self-sustaining world         self-monitoring — it only grows              permanent, beautiful increment
      (EVIDENCE §3.6 B)  ◄──────   (EVIDENCE §3.5 A, §3.10 B; F22)   ◄──────   of the world (EVIDENCE §3.4 B)
   "this world is yours now"      "look how far it's come," never a chain       + felt "that's mine" (affect §3.8 C*;
                                                                                   ATTACHMENT = H1 test-gated)
                                                                                        │
                              gentle restart on a lapse (EVIDENCE §3.11 B) ◄────────────┘
            all wrapped in autonomy support (EVIDENCE §3.9 A/B) + user-authored world (identity §3.12 C*)
```
`*` The **attachment** engine — that caring about the world *causes* more real action — and the grade-C mechanisms (celebration §3.8, identity §3.12) are built as **testable hypotheses**, wired to TASK-016/040. They are never shipped as efficacy claims, and they are the concept's main evidential risk (§0).

### 3.3 Mechanism-by-mechanism rationale
| Design move | Mechanism (grade) | Why it serves H1 |
|---|---|---|
| One real action → one permanent, visible world increment | Reinforcement, immediate & affective (B, §3.4); accruing artifact F22 | Makes progress *immediate even when health benefits take years* (PRD Principle 2); reward is for behavior, not tapping (Principle 3) |
| The world **only accrues** — no decay/wilt/death/reset | Flexible consistency (B, §3.10); fresh-start (B, §3.11) | The design embodiment of Zero-Guilt; converts the category's loss mechanic into benign attachment; attacks B2 streak-guilt + B6 no-recovery *priors* |
| Growth is a glanceable map of consistency ("your world over 30 days") | Self-monitoring (A, §3.5) | Monitoring raises attainment (*d*≈0.40) — and a world is a *non-numeric*, non-shaming monitor: no "19/30" to read as "failed 11 times" |
| Action chosen from reviewed catalog; recommend one, don't make them pick | Goals tiny/proximal (A/B, §3.3); rule-based recommendation F36 (⭕) | Removes the B3 decision-burden *prior*; keeps entry friction low so the world is easy to start |
| "After [existing routine], I'll [action], and my world grows" composer | Cues (A, §3.1) + implementation intentions (A, §3.2, *d*≈0.65) | The cleanest-evidence lever; anchors the behavior that feeds the world; attacks B4 brittle-cue *prior* |
| 20-second floor + always an easier variant; easier variant **still grows the world** | Action simplicity (B, §3.7) | Keeps ability high; a hard-day action yields a smaller-but-real increment, never nothing — attacks B1 friction *prior* |
| World is personal and authored, never ranked or compared | Autonomy (A/B, §3.9); identity (C*, §3.12) | "Of your own" supports intrinsic motivation; no social-comparison pressure (F29/F30 barred) |
| Graduation: the world can become calm and self-sustaining | Automaticity (B, §3.6) + SRBAI measure (A) | Inverts engagement-maxxing (PRD Principle 5); a *finished-feeling* world is the anti-treadmill |

### 3.4 Secondary / competing hypotheses this concept must survive
Honest concept generation names how the bet could be *wrong in principle*:
- **H2 (engagement ≠ efficacy — the sharpest risk for THIS concept).** A beautiful growing world may reward **opening the app to watch it** rather than doing the real action — exactly the decoupling PRD Principle 3 forbids. If world-tending becomes the loop, we've built a pretty tracker that drives app opens, not behavior. → tested TASK-040 (real-action frequency vs app opens, separated per TASK-034); mitigated by §3.5 design rules.
- **H3 (attachment is shallow or absent).** Users may simply not care about the world enough for attachment to drive behavior — the grade-C core (§0) fails to materialize. → tested TASK-016 (desirability) + TASK-040 (does world-attachment predict persistence?).
- **H4 (attachment curdles into obligation).** Even without decay, a sufficiently loved world can generate self-imposed guilt ("I'm neglecting my world"), re-creating the harm through the back door. → monitored in TASK-039/040 affect probes; mitigated by invitational-only copy and no neglect signals.
- **H5 (craft cost / complexity).** A world rich enough to attach to may be impossible to render at Apple-grade craft while keeping the core loop < 2 s and accessible (reduced-motion, low-vision). → tested TASK-030/037-adjacent prototyping.

### 3.5 The engagement-≠-efficacy firewall (how H2 is designed against, not just measured)
Because H2 is this concept's defining risk, the mitigations are first-class design rules, not afterthoughts:
1. **The ledger is the only source of growth.** The world grows *if and only if* a real action is recorded (TASK-026). There is no tap, tend, water, or timer inside the app that advances the world. Opening the app to look is free and changes nothing.
2. **Growth is a consequence shown, not a game played.** The growth animation is the *receipt* of the real action's completion moment — it plays once, then rests. There is no idle loop, no resource to harvest, no collection to chase that could substitute for behavior.
3. **No anti-decay pressure.** Since the world never withers, there is no "log in to save it" incentive — removing the most common reason world-builders drive compulsive opens.
4. **Measured separately, always.** TASK-034 reports app retention and behavior retention as distinct series; the kill criterion (§3.6) is about *behavior*, not app opens.

### 3.6 Kill criteria (pre-committed, so we can't rationalize)
Growing World should be **rejected or substantially reworked** at TASK-019 if, in testing:
1. It does **not** beat a conventional tracker on *real-action frequency* (not app opens) over the TASK-040 window — H1's core claim fails; **or**
2. Behavior retention and app retention **diverge in the wrong direction** (app opens high, real actions flat) — H2 confirmed, the world is an engagement toy; **or**
3. Blinded desirability (TASK-016) shows attachment does not form (users describe the world as "cute but I don't care") *and* comprehension is high — H3 confirmed; **or**
4. Affect probes (TASK-039/040) surface world-neglect guilt at a materially higher rate than Tiny Win — H4 confirmed and un-mitigable.

---

## 4. Onboarding ("I can do this") — target < 75 seconds to first growth

Design principle: **plant something real before asking for anything.** The category's world-builders front-load avatar/world creation (F07) as a long setup funnel; Growing World inverts it — the world *starts from your first real action*, so creation and first win are the same moment.

| Step | Screen | What happens | Evidence / feature | Zero-Guilt / <2s check |
|---|---|---|---|---|
| 1 | Welcome | One warm line: "Let's grow a little world — starting with one real thing today." No sign-up wall. | F08 quick-start (✅) | No account required to reach value |
| 2 | Goal whisper (optional) | "What would you like your world to grow from?" 4 warm chips (Move a little · Feel calmer · Drink water · Step outside) + Skip. | F02 intention framing (✅); EVIDENCE §3.3 | Skip is first-class (autonomy §3.9) |
| 3 | The suggestion | App *proposes one* tiny action from the reviewed catalog (TASK-024), e.g. **"Two minutes outside. That's it."** with a visible easier variant ("20 seconds on a hard day — your world still grows"). | F36 recommendation (⭕); EVIDENCE §3.7; TASK-025 rules | Removes B3 decision burden *(prior)*; no blank world to fill |
| 4 | When-then plan (optional) | "When do you already do something every day?" → composes *"After I pour my coffee, I'll step outside for two minutes — and my world grows a little."* | F04 anchoring (✅); EVIDENCE §3.1/§3.2 (A) | User authors it; declining still proceeds |
| 5 | **First growth, now** | "Want to do it right now?" → complete the action in one gesture → **the first seed of the world appears and grows**, rendered with care. This is the first reward moment. | TASK-020/021; F22; EVIDENCE §3.4 | **First real action within onboarding**, one gesture, < 2 s |
| 6 | Gentle close | "That's the first piece of your world. It'll be right here tomorrow — and it won't go anywhere if life gets busy." Notifications offered, **opt-in**, taperable. | EVIDENCE §3.9/§3.11; TASK-023/036 | No streak started; the no-decay promise is stated at the outset |

**Onboarding non-negotiables:** no health-risk framing (TASK-006); no long world-creation funnel before first value (inverts F07); no paywall before the first growth (F41 barred); the no-decay promise is made explicitly in step 6 so attachment forms around safety, not fear. Comprehension and time-to-first-action are measured in TASK-039.

---

## 5. Daily interactions & reward mechanics (the core loop)

### 5.1 The normal day (the 95% case) — reward mechanics
1. **Cue fires** — a routine-anchored, opt-in nudge (or the user opens the app). Copy is invitational: *"Ready to grow your world today?"* Never *"Your world is waiting / wilting."*
2. **One card** — "Your Little Win Today" (TASK-020): the tiny action, its easier variant, and a single primary gesture, framed against a glimpse of the world-so-far. Nothing else demands attention.
3. **One gesture** — tap-and-hold (or swipe) to complete the **real action**. Immediately: one permanent increment of the world appears and settles — a new sprout, a warmer light, one more detail — with a soft success-only haptic (TASK-021) and a restrained motion beat (TASK-030). **< 2 s, done.**
4. **Honest reward** — the increment *is* the reward (EVIDENCE §3.4, B). One optional line the user can personalize: *"That's yours."* No points, no currency, no number goes up.
5. **Rests** — the world settles into a calm state and stops animating. No idle loop to harvest, no next-habit upsell. The *stillness* after growth is the design (and the H2 firewall, §3.5).

### 5.2 The hard day
- The easier variant is always one tap away (TASK-022): "20 seconds is a full win — your world still grows." The hard-day action yields a **smaller but real** increment, **never nothing and never a lesser-looking mark** (EVIDENCE §3.7 guilt check). Switching is ≤ 2 taps and counts fully.
- "Not today" is a first-class, non-failing state (F11 ✅): the world simply doesn't grow today. It does **not** shrink, dim, or signal absence.

### 5.3 The missed day(s) — the concept's defining moment
- **Nothing happens to the world.** No wilting, no dead leaves, no grey sky, no "your world misses you" notification (the barred Forest/Duolingo mechanic, TASK-004). The world looks exactly as beautiful as the user left it.
- The next open shows the **gentle restart** (TASK-027): *"Welcome back — want to add to your world today?"* in ≤ 2 taps, for 1 / 3 / 7-day gaps alike. Past growth is permanent (EVIDENCE §3.10/§3.11; CLAUDE.md §1).
- This is where Growing World wins or loses its thesis: attachment must pull the user *back toward warmth*, never *away from punishment*.

### 5.4 Progression rules (acceptance-criterion item) — how the world grows
Deterministic, auditable rules so the world's growth is fair, legible, and guilt-free:

| Rule | Specification |
|---|---|
| **R1 — Growth source** | The world advances **only** on a recorded real action (TASK-026). No other input (opening the app, tapping the world, time passing) advances it. |
| **R2 — One action, one increment** | Each completed action yields exactly **one** growth increment. Duplicate taps do not double-grow (dedupe via TASK-026 event IDs). |
| **R3 — Monotonic accrual** | World state is **non-decreasing**. No rule, anywhere, can reduce, wilt, darken, or reset it. Missing days are a no-op on the world. |
| **R4 — Hard-day parity** | An easier-variant completion grows the world by a **real, non-lesser** increment (may differ in kind, never in dignity). |
| **R5 — Legible history** | The world *is* the self-monitoring surface: its shape encodes how many actions, roughly when — a non-numeric, non-shaming record (EVIDENCE §3.5). An optional screen-reader summary narrates it ("a garden with twenty-three plants, newest added today"). |
| **R6 — Variety, not escalation** | Over time the world gains *variety and detail*, not difficulty. Growth never silently escalates the required action (that is user-led only, §7.1). |
| **R7 — Graduation state** | When SRBAI automaticity is high (TASK-035), the world can reach a **calm, self-sustaining "tended" state** that the user is told they've earned — it keeps its beauty with or without daily additions (PRD Principle 5; EVIDENCE §3.6). |

### 5.5 Interaction inventory (what the concept actually ships as daily surface)
Assembled only from the TASK-003 §4.4 ✅/⭕ "bill of materials": F15 real-action-as-input (⭕) · F09 one-gesture completion · F10 sensory delight · F22 accruing permanent artifact (the world) · F25 world progression tied to action (⭕) · F11 first-class Skip · F12 easier-variant · F32 cosmetic authorship · F27 optional lightweight world-dweller companion (reactive, never nagging) · F37 accessibility-first. Explicitly **excluded**: F19 streak, F20 streak-freeze, F24 XP economy, F42 gacha store, F29/F30 leaderboard/feed, F41 paywall, and **any decay/withering/death state whatsoever**.

---

## 6. Seven-day storyboard

The arc the concept promises: the daily action stays tiny and constant; what changes is the **world's accumulating beauty** and the user's growing, *benign* attachment to it. The storyboard deliberately includes a **missed day (Day 4)** to show that the world stays whole — the single most important beat for proving the thesis is not a disguised loss mechanic.

| Day | Moment (PRD §6 six-moment frame) | What the user experiences | What the system does | Mechanism / check |
|---|---|---|---|---|
| **1** | Discovery → first action | Installs; is offered *one* action; does it inside onboarding; **the first seed of their world appears and grows.** First "that's mine." | Recommends action (TASK-025), composes when-then plan, renders first growth increment. | EVIDENCE §3.2/§3.4; F22; < 2 s first growth |
| **2** | Return | Morning: a gentle, anchored invitation. Completes before coffee's done; a second element joins the world. | Same single card + world glimpse; records real action (TASK-026); applies R1/R2. | EVIDENCE §3.1 cue; §3.5 monitoring (the world) |
| **3** | Completion, deepening | Starts to *notice* the world — "it's starting to look like something." Optionally names it or recolors it. | Offers optional cosmetic authorship (F32); increment adds variety not difficulty (R6). | EVIDENCE §3.8 C* (test-gated); §3.9 autonomy; §3.12 C* |
| **4** | **Missed day** | Busy, forgets. Opens the phone later; **the world is exactly as lovely as yesterday** — no wilt, no grey, no guilt push. | No growth applied; **R3 monotonic** — world unchanged; no notification implying neglect. | CLAUDE.md §1; TASK-004 guardrails; H4 check |
| **5** | **Gentle restart** | Opens the app: *"Welcome back — want to add to your world today?"* Adds one element in ≤ 2 taps; the world grows from where it was, intact. | Gentle restart flow (TASK-027); growth resumes from preserved state. | EVIDENCE §3.11 fresh-start (B); ≤ 2 taps |
| **6** | Progression (optional, user-led) | On an easy day, is *offered* (not pushed) a slightly bigger action: "Feel like five minutes? Your world will show it." Can accept, decline, revert. | Progressive challenge selector (TASK-029); no auto-escalation ever (R6). | EVIDENCE §3.3/§3.9; H-escalation guard |
| **7** | "This is part of me now" | Glances at a world that is visibly, warmly *theirs* — a week of real actions made beautiful, with a whole missed day invisible in the result. Feels quietly capable and attached. | World reflects 6 real actions as accrued beauty (R5); begins silent SRBAI tracking (TASK-035). | EVIDENCE §3.5 (A); §3.6 automaticity (B) |

**What day 7 is NOT:** it is not a "7-day streak 🔥" trophy, not a "level 2 unlocked" economy, not a world you must log in to save, and not a health-outcome claim. It is a calm, honest, beautiful record of real consistency — and the on-ramp to the long arc: eventual **graduation** (TASK-028 / R7), where the world becomes self-sustaining because the behavior has become the user's own.

---

## 7. Progression & retention model

### 7.1 Progression (rich surface, gentle mechanics)
Growing World is the **richest** of the three concepts on the surface and must stay the **gentlest** underneath. Effort accumulates as:
- a **monotonically growing world** (F22) — the primary progression surface, governed by R1–R7 (§5.4): it only ever gains beauty and variety;
- a **resilient, non-numeric consistency signal** — the world's fullness *is* the "19 of 30," but rendered as accrued detail, never a breakable chain (F21 logic, never F19 streak);
- **user-led difficulty** (F35/TASK-029) only — a bigger action makes a more striking world element, but is never required and never auto-triggered, especially not after a miss (R6).

The end state is **graduation (F26 / R7)**: when SRBAI automaticity (TASK-035) is high, the world reaches a calm "tended" state and the app proposes reducing prompting and optionally starting a *new* region of the world from a second tiny action — celebrating the user outgrowing the need for daily nudges (PRD Principle 5; EVIDENCE §3.6).

### 7.2 Retention model — three separate outcomes (PRD §7)
We refuse to conflate these, and for this concept the discipline is *especially* critical (H2):
1. **App retention** — return to grow the world. Supported by benign attachment + the growth moment, **not** by decay-rescue or streak lock-in. *This is the number most at risk of being flattered by a pretty world; we read it skeptically.*
2. **Behavior retention** — the real action persists *even when app prompting tapers* (TASK-034 separates it; TASK-036 taper experiment). **This is the true goal and the real success metric.**
3. **Commercial retention** — subscription renewal (§8).

> **The honest tension, stated plainly:** A beautiful world is the strongest app-retention hook of the three concepts — and therefore the most dangerous, because strong app retention can *masquerade* as behavior change (H2). We treat a large app-vs-behavior retention gap as a **red flag, not a win** (§3.6 kill criterion 2), and we design the firewall (§3.5) precisely so that the pretty number cannot be gamed. Hypothesized targets to validate, not assume (PRD §7): first action within 24 h ≥ 65%, D7 ≥ 45%, D30 ≥ 30% — but **behavior** retention, not app opens, is the one that must hold.

---

## 8. Commercial hypothesis

- **Free tier (PRD §7):** one active habit → **one world**. The free world is genuinely beautiful and complete, not a crippled demo; generosity at the core drives the PRD §8 shareable, non-shaming moment (a world is inherently more shareable than a checkmark — a real asset for organic growth, TASK-017/043).
- **Premium (hypothesis):** *multiple worlds / regions* for multiple parallel little wins, richer world themes and seasonal detail (cosmetic, never pay-to-progress — the world is earned by real action only, never bought, so F42 gacha stays barred), adaptive recommendation, and the graduation "start a new region" path. Gated by a clean entitlement check (TASK-037), **never** an early hard paywall (F41 barred).
- **Price points to test:** $29.99 / $39.99 / $59.99 annual (PRD §7), via an honest WTP test with no deceptive checkout (TASK-018).
- **The commercial opportunity, named:** Growing World's visual, personal, screenshot-worthy asset is plausibly the **strongest monetization and word-of-mouth surface** of the three concepts — cosmetic world-themes are a Zero-Guilt-compatible premium lever (styling, not pressure). **The commercial risk, named:** the no-decay promise forbids the category's most reliable monetizer (loss-rescue + currency), and graduation caps LTV. Whether earned-only cosmetic breadth converts is the open question for TASK-018/038 — not assumed away. Mitigation hypotheses to test: premium as *more worlds for graduates*, seasonal cosmetic themes, and gift/family framing.

---

## 9. Failure modes

Each failure mode names the risk, the barrier/evidence it maps to, the early signal, and the designed mitigation.

### 9.1 Behavioral failure modes (the bet is wrong)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-1 | **Engagement ≠ efficacy.** The world rewards *opening the app to look*, not real action; app opens rise while behavior stays flat (H2; PRD Principle 3). | §3.5; §3.4 | App retention ≫ behavior retention gap (TASK-034/040) | The §3.5 firewall: ledger-only growth (R1), consequence-not-game, no idle loop; kill criterion §3.6(2) |
| F-2 | **Attachment never forms.** Users find the world "cute but I don't care"; the grade-C core (§0) fails (H3). | §3.8 C*; §3.12 C* | Low D7 return despite high comprehension (TASK-016) | Invest in genuine craft (TASK-030); user authorship (F32) for ownership; if absent at TASK-016, kill §3.6(3) |
| F-3 | **Recommendation misfires.** The one suggested action doesn't fit; with no menu the user can't start their world. | B3 prior; F36; §3.9 | "This isn't for me" drop at onboarding step 3 (TASK-039) | Rules honor exclusions + no-match fallback (TASK-025); one-tap "suggest a different one" preserves autonomy |
| F-4 | **Cue never fires in real life.** Unstable anchor routine (travel, shift work) → no trigger, so the world stalls (B4 prior; §3.1 limitation). | §3.1; B4 | Growth clusters then vanishes after a context change | Routine-anchored (not clock-only) cues, editable; contextual roadmap (F34/TASK-023); world's permanence makes return low-stakes |

### 9.2 Zero-Guilt / trust failure modes (we accidentally become what we oppose)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-5 | **Attachment curdles into obligation.** Even with no decay, a loved world generates self-imposed "I'm neglecting it" guilt — the harm through the back door (H4). | §3.11; B2; B6 | Affect probes report world-neglect guilt (TASK-039/040) above Tiny Win baseline | Invitational-only copy (never "waiting/missing you"); no neglect signals of any kind; monitored as kill criterion §3.6(4) |
| F-6 | **Decay creeps back in "for engagement."** Under retention pressure, someone proposes a gentle wilt, a "freshness" meter, a seasonal die-back. | CLAUDE.md §1; TASK-004 | Any PR introducing a non-monotonic world state | **R3 monotonic accrual** is an invariant enforced in TASK-026/032 + the TASK-004 reviewer red-flag checklist as a merge gate |
| F-7 | **Notifications slide into nagging.** Even gentle prompts, repeated, become pressure (B7 prior; §3.9). | B7; §3.9 | Notification opt-out spikes; disable-then-churn | Opt-in only, taperable by default, success-toned; taper is a *feature* (TASK-036), never re-escalated after a miss |
| F-8 | **Restart that still shames.** "Welcome back" lands as passive-aggressive if copy or art implies the gap was bad. | §3.11; B6 | Users describe restart as "guilt-trippy" (TASK-039) | Copy reviewed against TASK-004 forbidden-word list; world shown intact and warm; ≤ 2 taps, no catch-up |

### 9.3 Health-integrity failure modes (CLAUDE.md §3)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-9 | **The world implies a health outcome.** A lush world reads as "you are getting healthier / preventing disease." | TASK-006 claim ladder | Claims review flags outcome-implying art or copy | The world represents *consistency of action*, never a health result; only pre-cleared, grade-licensed phrasing ships (TASK-006 §5); claims gate at TASK-042 |
| F-10 | **Unsafe action for some users.** A "tiny" action is contraindicated for a subgroup. | TASK-006 safety tiers; TASK-024 | Catalog review; support reports | Catalog actions carry contraindications + easier variant + review date (TASK-024); recommendation hard-excludes (TASK-025); eligibility screened upstream (TASK-007 E5/E6) |

### 9.4 Commercial & craft failure modes
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-11 | **Earned-only cosmetics don't convert.** Without loss-rescue or purchasable progress, premium breadth may not sell (§8). | §8; TASK-038 | WTP test: no viable contribution at $29.99 (TASK-018) | Premium = more worlds for *graduates* + seasonal themes + gift/family; if unviable at lowest price → kill §3.6 economics |
| F-12 | **Craft/complexity cost.** A world rich enough to love can't render at Apple-grade craft while keeping < 2 s + reduced-motion + low-vision support (H5). | §3.4; TASK-030/037 | Prototype can't hit < 2 s or WCAG 2.2 AA (TASK-030/039) | Scope the world to *restrained, layered detail* over spectacle; reduced-motion renders growth as a static state change; accessibility-first from day one (F37) |

### 9.5 The meta-failure mode
**F-13 — We re-weaponize attachment.** Under retention pressure, the team adds "just a little" decay, a freshness meter, or a login-to-save hook — and Growing World becomes Forest with nicer art: the exact loss-aversion product it was built to replace. *Mitigation:* the R3 monotonic-accrual invariant, the kill criteria (§3.6), the TASK-004 red-flag checklist as a merge gate, and this brief on record: **if attachment can't drive real behavior without punishment, Growing World should be rejected at TASK-019, not quietly converted into the thing it was built to replace.**

---

## 10. Scorecard pre-read (hand-off to TASK-014 / TASK-019)

How Growing World is *expected* to score on the PRD §9 weighted criteria — a hypothesis for the scorecard to confirm or overturn with real test data, **not** a self-grade:

| Criterion (weight) | Expected relative strength | Rationale |
|---|---|---|
| Desirability (20%) | **High** | A beautiful, personal, growing world is the most immediately "I want this" of the three at first glance (PRD §4 five-second test) |
| Behavioral effectiveness (20%) | **Medium / contested** | Graded cue/action/monitoring spine is solid, but the *attachment-drives-behavior* core is grade-C / to-be-tested (§0) and exposed to the H2 engagement≠efficacy risk |
| Differentiation (15%) | **High** | Guilt-free accrual + real-action-only growth + graduation-through-the-world; incumbents can't drop decay without breaking their model |
| User experience (15%) | **Medium / High** | Emotionally rich and warm, but carries the most craft/accessibility/latency risk (F-12) to keep the loop < 2 s |
| Retention potential (10%) | **High (app) / contested (behavior)** | Strongest app-retention hook of the three — which is exactly why we read it skeptically (§7.2) |
| Economics (10%) | **Medium** | Best word-of-mouth + cosmetic-theme surface of the three, but no-decay forbids the category's reliable monetizer; graduation caps LTV |
| Apple-level craft (10%) | **High (if F-12 solved)** | A living, accessible, restrained world is a showcase for Apple-grade motion/haptics — contingent on hitting the craft bar |

**Three non-negotiable gates (PRD §9):** (1) credible real-world behavior-change evidence — *the open question, because the attachment core is test-gated (§0)*; (2) meaningful desirability — *strong, by construction*; (3) safe/trustworthy health guidance — *held by TASK-006/024, plus the world-implies-no-outcome rule (F-9)*.

**How this differs from its siblings (for a fair blinded comparison):** Tiny Win bets on **subtraction** (strong evidence, contested desirability); Growing World bets on **benign attachment** (strong desirability, contested/test-gated evidence). They are deliberate opposites so TASK-016/019 compare real alternatives, not variations on one idea. The world here is kept genuinely rich precisely so Tiny Win's minimal accruing artifact (its §7.1) remains a distinct, thinner thing.

---

## 11. Coverage checklist (acceptance criteria)

Acceptance criterion: *"Brief contains progression rules, 7-day storyboard, reward mechanics and failure modes."*

- [x] **Progression rules** — §5.4 (R1–R7: ledger-only growth, one-action-one-increment, monotonic accrual, hard-day parity, legible history, variety-not-escalation, graduation state) + §7.1.
- [x] **7-day storyboard** — §6 (seven days across the PRD §6 six-moment frame, including a missed day + gentle restart that proves the no-decay thesis).
- [x] **Reward mechanics** — §5.1–§5.3 (the world increment *is* the reward; real-action-only growth; hard-day and missed-day behavior) with the §3.5 engagement≠efficacy firewall.
- [x] **Failure modes** — §9 (thirteen, grouped behavioral / trust / health / commercial / meta, each with mapping, early signal, mitigation).
- [x] *Beyond the criterion, to match the PRD §3 equivalent-brief standard and enable fair comparison with TASK-011/013:* one-page thesis (§1), user promise (§2), behavior hypothesis with competing hypotheses H2–H5 + kill criteria (§3), onboarding (§4), daily interactions (§5), progression & retention (§7), commercial hypothesis (§8), scorecard pre-read (§10).
- [x] **Evidence discipline** — graded mechanisms (A–D) cited to TASK-005; the attachment core honestly flagged as grade-C / test-gated (§0); barrier `B#` references labelled *priors-to-test* (TASK-008/009 blocked), not findings; health claims bounded by TASK-006; no `[TBD]`/placeholder text.

**Status:** Concept-generation deliverable (strategy). No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).
