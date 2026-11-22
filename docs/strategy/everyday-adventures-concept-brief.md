# Concept Brief — **Everyday Adventures**

**Task:** TASK-013 · **Workstream:** Concepts · **Stage:** Independent concept generation (PRD §3)
**Author:** Principal Product Builder & Strategist (HerRays)
**Date:** 2026-11-22
**Concept family:** 3 of 3 (sibling briefs: TASK-011 *The Tiny Win* ✅, TASK-012 *The Growing World* ✅)

---

## 0. How to read this brief (status & evidence discipline)

This is a **concept hypothesis**, not a selected winner (PRD §3: "These are hypotheses, not preselected winners"). It is written to an equivalent spec as its two siblings so that TASK-014 (scorecard) and TASK-016 (blinded desirability test) can compare them fairly, and so TASK-019 can make an evidence-based go/no-go.

Two evidence standards are kept strictly separate here, because the Reviewer gate depends on it:

- **Graded behavioral mechanisms** (cited `EVIDENCE §x.x`) come from `docs/research/behavior-change-evidence-register.md` (TASK-005) and carry an A–D grade. These are the load-bearing claims; I build on them in proportion to their grade.
- **Barrier priors** (cited `B1`–`B7`) come from the *a-priori hypotheses* in `docs/research/behavioral-interview-protocol-and-analysis-framework.md` §3 and the diary framework (TASK-008/009). **TASK-008 and TASK-009 are `blocked` — no interviews or diaries have been run.** Every `B#` reference is therefore a **prior to test, not a finding**, and is labelled as such. No claim here may be advanced by any decision gate (TASK-016/019) as empirical user evidence.

Health framing throughout obeys `docs/research/prevention-action-evidence-rubric.md` (TASK-006): HerRays recommends real, low-risk, general-benefit actions and makes **no individual disease-risk or prevention claim** (CLAUDE.md §3).

**One honesty note specific to this concept, stated up front — and it is the single most important thing the scorecard must weigh:** Everyday Adventures' central bet — *that novelty and situational relevance lower resistance to acting* — runs into a **direct, structural tension with the strongest evidence in the register**. Habit automaticity is built by **repetition in a *stable* context** (§3.1 cues, A; §3.6 automaticity, B): the cue has to recur for the behavior to run without deliberate intent. Novelty is, by definition, the *opposite* of a stable recurring cue — and in the register, novelty/variety is closer to a grade-C/D *engagement* lever than a graded *behavior-change* mechanism. So this concept's core claim is **more evidentially exposed than Tiny Win and differently exposed than Growing World**: it may lower the resistance to *starting* (an initiation win) while *undermining the stable-cue repetition that durable habit formation requires*. I state this in §0 rather than bury it. The concept's entire design problem — and §3.5's firewall — is how to get novelty's initiation benefit **without** destroying automaticity. I do **not** paper over this gap with borrowed grades.

---

## 1. One-page thesis

### 1.1 The idea in one sentence
**Everyday Adventures is a habit app that never gives you the same instruction twice in a row: each day it offers one tiny, situationally-relevant "mission" tuned to where you are and what your day looks like — so acting feels like a small, fresh invitation rather than the same chore on a checklist.**

### 1.2 The bet (PRD §3 hypothesis, verbatim)
> "Contextual tiny missions embedded in ordinary life. **Hypothesis: novelty and situational relevance lower resistance.**"

Everyday Adventures takes the PRD's third direction literally. Where Tiny Win bets on **subtraction** (one unchanging action, reduced choice) and Growing World bets on **benign attachment** (a permanent world you grow), Everyday Adventures bets on **freshness and fit**: resistance to a habit is highest when the ask feels repetitive, irrelevant to the moment, or disconnected from real life — so vary the *surface* of the ask and anchor it to the user's actual situation, and the activation energy to begin drops.

Its ancestor is the adjacent-category insight the audit already routed here (TASK-002 §4.2, §6): **Pokémon GO made the real world the cue and movement a by-product of play.** Everyday Adventures asks: what if ordinary context — "you're about to make coffee," "it's a clear afternoon," "you've been sitting a while" — became the gentle prompt for one tiny health action, framed as a small adventure rather than a recurring task?

### 1.3 Why "the cue stays, the mission changes" is the whole strategy, not a gimmick
The naïve version of this concept — *a random new thing every day* — would **fail on the register's own evidence**: random cues never stabilize, so no automaticity ever forms (§3.1 limitation; §3.6), and endless novelty is a known engagement treadmill, not a behavior-change engine. That version would also be exhausting, not delightful.

So the strategy is a single load-bearing design constraint that resolves the §0 tension, from which everything else follows:

> **Keep the *anchor* stable; vary the *mission within it*.** The situational trigger the user commits to ("after my morning coffee," "when I get home") stays constant — preserving the stable-cue repetition automaticity needs — while the specific tiny action offered *at* that anchor rotates within a small, personally-relevant, bounded set. Novelty lives in the *content* of the mission, never in the *timing of the cue*. Over weeks the rotation itself becomes the habit: "at this moment, I do my little adventure."

This is what separates Everyday Adventures from both a random-mission toy and from a static tracker, and it is why the concept is *ours to build*: it is a disciplined attempt to capture novelty's initiation benefit **on top of** a stable-cue foundation, rather than trading one for the other.

### 1.4 What makes it difficult to copy
Not situational missions as a feature — that is individually copyable (it is **F34 contextual cueing**, a category ⭕ open gap; TASK-003 §3.5). The defensible advantages are two:
- **A situational recommendation engine grounded in a *reviewed, safety-graded* catalog (TASK-024/025), not a random content firehose.** Anyone can serve a random tip; serving the *right tiny, safe, relevant* action for a moment — honoring exclusions and the claim ladder — is the hard, trust-bearing part, and it is the differentiation thesis the PRD names ("remove the work of creating habits").
- **Graduation (F26, absent in all 20 audited products; TASK-003 §3.3)** expressed as **the rotation collapsing into the user's own ritual**: once a situational action is automatic, Everyday Adventures stops offering variety *for that anchor* and lets it become a quiet, self-run habit — then optionally opens a new anchor. A novelty engine that is designed to make itself unnecessary is the opposite of an engagement treadmill.

### 1.5 Core promise, hypothesis, storyboard, failure modes
The acceptance-criterion elements have dedicated sections: **mission-selection logic → §5.4 (+ §4 onboarding, §7.1)**, **7-day storyboard → §6**, **failure modes → §9**. For equivalence with the sibling briefs: user promise → §2, behavior hypothesis → §3, reward mechanics → §5.1–§5.3.

---

## 2. User promise

### 2.1 The promise, in the user's language
> **"Each day, one small adventure that fits your day — never the same chore twice, always something you can actually do right now, and never a problem if you skip it."**

(Aligned to the PRD §8 launch story: "You don't need to change your life. Just a little piece of today.")

### 2.2 The promise, decomposed into commitments
A promise is only real if every word maps to a buildable, falsifiable commitment:

| Promise fragment | What we commit to | Measured / enforced by |
|---|---|---|
| "one small adventure" | Exactly **one** mission is offered at a time — a tiny (20 s–2 min) real-world action, framed warmly, never a list. | F16 single salient prompt (✅); TASK-020 card; free tier = 1 anchor (PRD §7) |
| "that fits your day" | The mission is chosen for **situational relevance** — time, declared context, goal, constraints — not served at random. | F34 contextual cueing (⭕); F36 recommendation (⭕); TASK-025 rules; §5.4 M1–M7 |
| "never the same chore twice" | The **mission content rotates** within a bounded, relevant set; the *anchor* stays stable (§1.3). | §5.4 M4 variety rule; EVIDENCE §3.1 (stable cue preserved) |
| "something you can actually do right now" | Every mission has an immediate, low-effort form and an easier variant; nothing requires special equipment or a trip. | EVIDENCE §3.7 action simplicity (B); F12 easier-variant (⭕); TASK-022/024 |
| "never a problem if you skip it" | Declining or missing is a first-class neutral state; no streak, no penalty, warm restart. | CLAUDE.md §1; EVIDENCE §3.10/§3.11; F11 Skip (✅); TASK-027 |

### 2.3 The anti-promise (what we deliberately do NOT promise)
Naming the non-promises is part of the brief, because this concept's family of ideas (missions, novelty, context) is adjacent to several mechanics we refuse:
- **No** "new quest every day or you fall behind" urgency, and **no** time-boxed availability window (the barred BeReal F17 mechanic; TASK-004) — a mission is available whenever the user arrives, for as long as they like.
- **No** random-content firehose or "tip of the day" with no grounding — every mission comes from the reviewed catalog (TASK-024) and honors exclusions (TASK-025).
- **No** location tracking as the price of relevance (see §5.4 M1 and F-7): context is **user-declared by default**, privacy-first (TASK-041).
- **No** disease-prevention or individual health-risk claim (TASK-006 claim ladder; CLAUDE.md §3). A mission is a gentle real action, never framed as a health outcome.
- **No** "transform yourself in N days" timeline (EVIDENCE §3.6 — automaticity is high-variance).

### 2.4 Who the promise is for (launch audience)
The screener (TASK-007 §3) defines three segments:
- **Primary — Segment C, busy beginners:** high time pressure, no sustained routine, and — the reason this concept targets them — **bored or defeated by repetitive trackers**. The "fits your day / never the same chore" promise is engineered for the person for whom a static checklist reads as one more obligation. (Formal JTBD selection is TASK-010, currently `blocked`; stated here as a hypothesis, not the decided segment.)
- **Secondary — Segment A, abandoned-app users:** people who quit because the habit felt stale or irrelevant to their actual life; situational relevance is written to re-earn them.
- **Segment B, sustainers:** not a target, but their behavior is instructive in a *cautionary* way — sustainers typically rely on a **stable, boring, repeated cue** (interview framework §3.1, *protective-factor prior*), which is exactly what pure novelty would erode. Their pattern is why §1.3's "stable anchor" constraint exists.

---

## 3. Behavior hypothesis

### 3.1 Primary hypothesis (falsifiable)
> **H1.** For users who have struggled to sustain habits, **offering a tiny, situationally-relevant mission whose content varies day-to-day — while holding a stable personal cue constant — will lower the resistance to *starting* and increase the frequency of real-world action** relative to a conventional fixed-action tracker, *without* using urgency windows, novelty-for-its-own-sake, or guilt.

### 3.2 The behavior engine behind the hypothesis
Everyday Adventures instantiates the loop assembled in EVIDENCE §4.1, using grade-A/B links as load-bearing and treating the *novelty-lowers-resistance* link as explicitly test-gated:

```
  ONE self-set tiny goal        STABLE routine-anchored cue + when-then plan        ONE tiny, RELEVANT mission
      (EVIDENCE §3.3 A/B)  ──────►      (EVIDENCE §3.1 A, §3.2 A)             ──────►   (EVIDENCE §3.7 B; situational fit F34 ⭕)
   "what pulls at you lately"    "after my coffee, I'll do today's adventure"    ability engineered up; content varies
                                   (cue STABLE — novelty is in the mission,              │  (< 2 s to complete, one gesture)
                                    NOT the timing: the §0 tension resolved)              ▼
    graduation: rotation          resilient, glanceable self-monitoring          immediate honest reward
    collapses into a ritual        (EVIDENCE §3.5 A, §3.10 B)                     = "that was a good one" beat
      (EVIDENCE §3.6 B)  ◄──────   "17 adventures over the last 30 days"  ◄──────  (EVIDENCE §3.4 B; affect §3.8 C*;
   "this is just what I do now"    never a chain                                     NOVELTY LOWERS RESISTANCE = H1 test-gated)
                                                                                        │
                              gentle restart on a lapse (EVIDENCE §3.11 B) ◄────────────┘
            all wrapped in autonomy support (EVIDENCE §3.9 A/B) + optional, user-authored framing (identity §3.12 C*)
```
`*` The **novelty/relevance** engine — that varying the mission's content *causes* lower resistance and more real action — and the grade-C mechanisms (celebration §3.8, identity §3.12) are built as **testable hypotheses**, wired to TASK-016/040. They are never shipped as efficacy claims, and the novelty link is the concept's main evidential risk (§0).

### 3.3 Mechanism-by-mechanism rationale
| Design move | Mechanism (grade) | Why it serves H1 |
|---|---|---|
| Offer **one** situationally-relevant mission, chosen for the moment; don't make the user pick | Goals tiny/proximal (A/B, §3.3); rule-based recommendation F36 (⭕); contextual cueing F34 (⭕) | Removes the B3 decision-burden *prior*; "fit" is the lever that makes a tiny action feel worth starting now |
| Hold the **cue/anchor stable**; vary only the mission content | Cues (A, §3.1) + implementation intentions (A, §3.2, *d*≈0.65) | **Preserves the stable-cue repetition automaticity needs** (the §0 tension); the user still plans "after my coffee, I'll…" |
| Vary mission *content* within a bounded, relevant rotation | Positive affect / novelty (C*, §3.8) — *test-gated* | The H1 bet: freshness lowers resistance to starting — but bounded so it never destabilizes the cue (§5.4 M4) |
| 20-second floor + always an easier variant on every mission | Action simplicity (B, §3.7) | Keeps ability high so motivation needn't be; a mission you "can actually do right now" attacks B1 friction *prior* |
| One-gesture completion with sensory delight, tied to the **real action** | Reinforcement (B, §3.4) + affect (C*, §3.8) | Rewards *behavior, not mission-collecting* (PRD §3); < 2 s (CLAUDE.md §2); attacks B5 disconnected-reward *prior* |
| Consistency shown as resilient accumulation ("17 adventures over 30 days"), never a chain | Self-monitoring (A, §3.5) + flexible consistency (B, §3.10) | Monitoring raises attainment (*d*≈0.40) without the B2 streak-guilt |
| Context is **user-declared**, missions honor exclusions and safety | Autonomy (A/B, §3.9); safety (TASK-006) | "Fit" without surveillance; respects privacy (TASK-041) and contraindications (TASK-025) |
| Graduation: the rotation collapses into the user's own ritual, prompting less | Automaticity (B, §3.6) + SRBAI (A) | Inverts engagement-maxxing (PRD Principle 5); a novelty engine designed to make itself unnecessary |

### 3.4 Secondary / competing hypotheses this concept must survive
Honest concept generation names how the bet could be *wrong in principle*:
- **H2 (novelty erodes automaticity — the sharpest risk for THIS concept).** If variety extends to the *cue* or the rotation is too wide, the behavior never stabilizes into a habit: users keep "starting" but never *automate*, so real-action frequency plateaus and then decays when the novelty wears off (hedonic adaptation). This is the §0 tension made concrete. → tested TASK-040 (does automaticity/SRBAI rise over time, or stall?); mitigated by the §1.3 stable-anchor constraint and §5.4 M4.
- **H3 (engagement ≠ efficacy).** A stream of fresh missions may reward **opening the app to see what today's adventure is** rather than doing the real action — the decoupling PRD Principle 3 forbids. → tested TASK-040 (real-action frequency vs app opens, separated per TASK-034); mitigated by §3.5.
- **H4 (relevance is shallow or creepy).** Either the "fit" isn't good enough to feel relevant (missions feel generic/random, so the whole premise fails), **or** it is good enough only by using data that feels invasive (location), trading trust for relevance. → tested TASK-016 (is the fit felt?) + TASK-039 (privacy comfort); mitigated by declared-context-first (M1) and a strong no-match fallback (M6).
- **H5 (choice paralysis returns through the back door).** "Swap this mission" and a visible rotation could re-introduce the very decision burden (B3) the concept removes. → mitigated by defaulting to *one* offered mission with swap as a quiet secondary affordance; monitored in TASK-039.

### 3.5 The automaticity-and-efficacy firewall (how H2/H3 are designed against, not just measured)
Because H2 (novelty eroding automaticity) and H3 (engagement≠efficacy) are this concept's defining risks, the mitigations are first-class design rules, not afterthoughts:
1. **Novelty is quarantined to mission *content*; the cue is sacred.** The anchor the user commits to never varies by design (§1.3, §5.4 M2). The app may vary *what* the mission is, never *when/where* the user is cued — so the stable-cue repetition the register requires (§3.1) is structurally preserved.
2. **The rotation is bounded and convergent, not infinite.** Missions are drawn from a small, personally-relevant pool (§5.4 M4), and as a mission proves it "lands," the engine *increases* its recurrence rather than chasing ever-new content — novelty is a ramp into a ritual, not a permanent state.
3. **The ledger (real action), not mission views, is the only thing that counts.** Growth of the consistency record and any reward fire **only** on a recorded real action (TASK-026). Browsing tomorrow's possible adventures, if ever surfaced, changes nothing. No mission-collection meta-game exists.
4. **Measured separately, always.** TASK-034 reports app retention and behavior retention as distinct series, and TASK-035 tracks SRBAI *over time*; the kill criteria (§3.6) are about *behavior and rising automaticity*, not app opens or mission variety.

### 3.6 Kill criteria (pre-committed, so we can't rationalize)
Everyday Adventures should be **rejected or substantially reworked** at TASK-019 if, in testing:
1. It does **not** beat a conventional fixed-action tracker on *real-action frequency* (not app opens) over the TASK-040 window — H1's core claim fails; **or**
2. **Automaticity (SRBAI, TASK-035) fails to rise over time** while a fixed-action control's does — H2 confirmed: novelty bought initiation but blocked habit formation, the concept's worst case; **or**
3. Behavior retention and app retention **diverge in the wrong direction** (app opens / mission-checking high, real actions flat) — H3 confirmed, it's a novelty toy; **or**
4. Blinded desirability (TASK-016) shows the "fit" is **not felt** (users describe missions as "random / generic") *and* comprehension is high — H4 confirmed; **or**
5. Privacy comfort (TASK-039) shows users reject the context model, and declared-context-only produces missions too generic to feel relevant — H4 (creepy-vs-generic dilemma) un-resolvable.

---

## 4. Onboarding ("I can do this") — target < 75 seconds to first adventure

Design principle: **establish one stable anchor, then prove the first mission fits — before asking for anything.** The category's anti-pattern is an early hard paywall or a long coaching funnel (F41/F06 🚫/⚠️, TASK-003); Everyday Adventures inverts it, and uses onboarding to set the *anchor* (the thing that must stay stable) so novelty has a foundation from day one.

| Step | Screen | What happens | Evidence / feature | Zero-Guilt / <2s check |
|---|---|---|---|---|
| 1 | Welcome | One warm line: "Each day, one little adventure that fits your day. Let's find today's." No sign-up wall. | F08 quick-start (✅) | No account required to reach value |
| 2 | Goal whisper (optional) | "What's pulling at you lately?" 4 warm chips (Move a little · Feel calmer · Drink water · Step outside) + Skip. | F02 intention framing (✅); EVIDENCE §3.3 | Skip is first-class (autonomy §3.9) |
| 3 | **Anchor set (the stable part)** | "When in your day shall these little adventures live?" → user picks an existing routine: *"after my morning coffee."* This anchor **won't change** — only the missions will. | F04 anchoring (✅); EVIDENCE §3.1/§3.2 (A) | User authors it; this is the stability that protects automaticity |
| 4 | Context (optional, declared, private) | "Anything about your days we should fit around?" lightweight declared chips (mostly indoors · often on the go · little time) + Skip. **No location permission requested.** | F34 contextual cueing (⭕); TASK-041 | Declared, not sensed; Skip proceeds; privacy-first (H4) |
| 5 | The first mission | App *proposes one* situationally-relevant tiny mission from the reviewed catalog (TASK-024), e.g. **"Today's adventure: two minutes outside. That's it."** with a visible easier variant ("20 seconds on a hard day") and a quiet "suggest a different one." | F36 recommendation (⭕); EVIDENCE §3.7; §5.4 M1–M6 | Removes B3 decision burden *(prior)*; one offered, swap is secondary (H5) |
| 6 | **First adventure, now** | "Want to do it right now?" → complete in one gesture → the first completion delight fires and the consistency record opens at 1. | TASK-020/021; EVIDENCE §3.4 | **First real action within onboarding**, one gesture, < 2 s |
| 7 | Gentle close | "That's today's adventure. Tomorrow's will fit your day too — and it's no problem if you skip one." Notifications offered, **opt-in**, anchored to the step-3 cue, taperable. | EVIDENCE §3.9/§3.11; TASK-023/036 | No streak started; no urgency; no upsell |

**Onboarding non-negotiables:** no health-risk framing (TASK-006); **no location permission** as a price of entry (declared context only, step 4); no paywall before the first adventure (F41 barred); the stable anchor is set *before* any novelty so the §0 tension is handled at the outset. Comprehension, time-to-first-action, and privacy comfort are measured in TASK-039.

---

## 5. Daily interactions & reward mechanics (the core loop)

### 5.1 The normal day (the 95% case) — reward mechanics
1. **Cue fires at the *stable* anchor** — a routine-anchored, opt-in nudge (or the user opens the app). Copy is invitational: *"Ready for today's adventure?"* Never *"You haven't done X"* and never *"X minutes left."*
2. **One card** — "Your Little Win Today" (TASK-020), presented as *today's* mission: a tiny, situationally-chosen action, its easier variant, a single primary gesture, and a quiet "suggest a different one." Nothing else demands attention.
3. **One gesture** — tap-and-hold (or swipe) to complete the **real action**. A soft success-only haptic (TASK-021) and a restrained motion beat (TASK-030) fire; the consistency record ticks up by one. **< 2 s, done.**
4. **Honest reward** — one line the user can optionally personalize: *"That was a good one."* / "I feel better for that." (affect attach, EVIDENCE §3.8 C*). No points, no currency, no "mission XP."
5. **Rests** — the app returns to a calm "done for today" state. No feed of other missions to browse, no next-habit upsell. The *absence* of a collection meta-game is the design (and the H3 firewall, §3.5).

### 5.2 The hard day
- The easier variant is always one tap away (TASK-022): "20 seconds is a full adventure today." Switching is ≤ 2 taps and **counts fully** — never flagged as a lesser completion (EVIDENCE §3.7 guilt check).
- If today's mission simply doesn't fit the moment, one quiet tap swaps it for another relevant one (§5.4 M5) — autonomy without re-opening full decision burden (H5).
- "Not today" is a first-class, non-failing state (F11 ✅), recorded as neutral in the ledger.

### 5.3 The missed day(s)
- No red badge, no "streak lost," no "you missed today's adventure," no catch-up debt (CLAUDE.md §1; B2/B6 priors; the barred BeReal F17 window is explicitly *not* here). The next open shows the **gentle restart** (TASK-027): *"Welcome back — here's a fresh little adventure for today."* in ≤ 2 taps, for 1 / 3 / 7-day gaps alike. Past progress is never erased (EVIDENCE §3.10/§3.11).
- A returning user gets a deliberately **easy, high-fit** mission (§5.4 M7) so the restart is a soft landing, not a cold start.

### 5.4 Mission-selection logic (acceptance-criterion item) — how a mission is chosen
Deterministic, auditable rules so that "fits your day" is a real, testable, safe behavior — not a black box. The engine is owned by **TASK-025** (recommendation rules) over the **TASK-024** reviewed catalog; these rules are its specification. It is a *deterministic ranking*, not a generative model: given the same inputs it yields the same mission, which is what makes TASK-025's test cases possible.

| Rule | Specification |
|---|---|
| **M1 — Inputs (privacy-first)** | Selection uses only: (a) the user's declared goal (§4 step 2), (b) **declared** context chips (§4 step 4), (c) coarse time-of-day bucket tied to the stable anchor, (d) the user's exclusions/contraindications, and (e) recent-mission history. **Device location is never required and off by default** (TASK-041); any future sensed signal is strictly opt-in and degrades gracefully to declared context. |
| **M2 — The anchor is invariant** | Selection may change *which mission* is offered; it may **never** change the user's committed cue/anchor (§1.3). Novelty is applied to content only — the stable-cue foundation automaticity needs (§3.1) is protected by construction. |
| **M3 — Candidate pool = reviewed catalog only** | Candidates are drawn **exclusively** from the TASK-024 evidence-reviewed catalog (each record carrying category, duration, evidence grade, contraindications, easier variant, review date). No random tips, no un-reviewed content, ever. |
| **M4 — Bounded, convergent variety (the H2 control)** | Mission content rotates within a **small, relevant pool** (target ~3–6 live missions per anchor), not an open firehose. Variety is damped over time: once a mission demonstrably "lands" for a user (completed, positively marked), the engine **raises** its recurrence so the anchor converges toward a stable ritual — novelty is a ramp into a habit, not a permanent churn. |
| **M5 — Relevance ranking** | Candidates are scored for fit to (goal × declared context × time bucket), minus a recency penalty (don't repeat yesterday's exact mission unless M4 convergence is active), yielding **one** offered mission + a short swap list. Deterministic given inputs. |
| **M6 — Safety hard-exclusions & no-match fallback** | Contraindicated or out-of-scope actions (TASK-006 safety tiers; TASK-025 exclusions) are removed **before** ranking — safety is never traded for relevance. If no mission clears the filters, fall back to a universally-safe default (e.g. "a glass of water," "one slow breath") rather than forcing a poor or unsafe fit. |
| **M7 — Gentle-restart & graduation states** | After a gap, bias selection toward an easy, high-fit, previously-successful mission (soft landing, §5.3). When SRBAI automaticity for an anchor is high (TASK-035), **stop varying** that anchor and let it graduate into a self-run ritual (F26); optionally offer to open a *new* anchor (PRD Principle 5). |

### 5.5 Interaction inventory (what the concept actually ships as daily surface)
Assembled only from the TASK-003 §4.4 ✅/⭕ "bill of materials": F34 contextual/situational cueing (⭕, the signature) · F36 rule-based recommendation (⭕) · F16 single salient prompt (✅) · F09 one-gesture completion · F10 sensory delight · F15 real-action-as-input (⭕) · F11 first-class Skip · F12 easier-variant (⭕) · F21 decaying-strength consistency (never F19 streak) · F27 optional lightweight companion (reactive, never nagging) · F37 accessibility-first. Explicitly **excluded**: F17 time-boxed window, F19 streak, F24 XP/mission-points economy, F29/F30 leaderboard/feed, F35 *automatic* difficulty escalation (user-led only), F41 paywall, and **any random-content firehose or location-gated relevance**.

---

## 6. Seven-day storyboard

The arc the concept promises: the stable anchor holds constant while the *missions* stay fresh and well-fitted — and by the end of the week the user has felt enough variety to stay un-bored, yet enough repetition at a stable cue that the ritual is starting to form. The storyboard deliberately includes a **missed day (Day 4)** so the warm restart is shown as a normal beat, and a **convergence beat (Day 7)** so the automaticity-not-just-novelty thesis (H2 mitigation) is visible.

| Day | Moment (PRD §6 six-moment frame) | What the user experiences | What the system does | Mechanism / check |
|---|---|---|---|---|
| **1** | Discovery → first action | Installs; sets the anchor ("after my coffee"); is offered *one* fitted mission ("two minutes outside"); does it inside onboarding. First "that was a good one." | Sets stable anchor (M2); selects first mission (M1/M3/M5); fires first completion delight. | EVIDENCE §3.2/§3.4; < 2 s first adventure |
| **2** | Return | Same anchor, **a different fitted mission** ("stand and stretch for one minute" — it's a rushed morning, declared "little time"). Feels fresh, not repetitive. | Cue fires at the stable anchor; selects a *new* relevant mission (M4/M5); records real action (TASK-026). | EVIDENCE §3.1 cue (stable); §3.8 C* novelty (test-gated) |
| **3** | Completion, deepening | Notices the app "gets" their day — today's calm-themed mission fits a stressful afternoon. Optionally taps an identity whisper: "the kind of person who takes small moments." | Selects goal-aligned mission; offers optional, user-authored framing (never imposed). | EVIDENCE §3.12 C* (test-gated); §3.9 autonomy; H4 "fit is felt" check |
| **4** | **Missed day** | Busy, forgets. **No notification guilt**, no "you missed today's adventure," no window expiring. Evening: nothing punishes them. | Silent neutral non-completion; no streak to break (none exists); M7 prepares a soft-landing mission. | CLAUDE.md §1; B2/B6 priors; EVIDENCE §3.10 |
| **5** | **Gentle restart** | Opens the app: *"Welcome back — here's a fresh little adventure for today."* An easy, high-fit mission; back in action in ≤ 2 taps, welcomed not scolded. | Gentle restart (TASK-027); M7 biases to easy/successful mission; record shows "4 of the last 6 days," intact. | EVIDENCE §3.11 fresh-start (B); ≤ 2 taps |
| **6** | Progression (optional, user-led) | On an easy day, is *offered* (not pushed) a slightly bigger version of a mission they liked: "Feel like five minutes today?" Can accept, decline, revert. | Progressive challenge selector (TASK-029); no auto-escalation ever (F35 excluded). | EVIDENCE §3.3/§3.9; H-escalation guard |
| **7** | "This is part of me now" | The "after my coffee, I'll do my adventure" **moment itself** now feels automatic — even as the mission varies. Glances at a gentle record: "6 adventures over the last 7 days," warm, no chart-shame. The anchor is becoming a ritual; a favorite mission is starting to recur by choice. | M4 convergence begins favoring landed missions; begins silent SRBAI tracking (TASK-035). | EVIDENCE §3.5 (A); §3.6 automaticity (B); **H2 convergence check** |

**What day 7 is NOT:** it is not a "7-adventure streak 🔥" trophy, not a "missions collected" economy, not a window you must catch, and not a health-outcome claim. It is a calm, honest record of real consistency at a *stabilizing* cue — and the on-ramp to the long arc: eventual **graduation** (TASK-028 / M7), where the rotation collapses into the user's own ritual and Everyday Adventures prompts *less*, because the behavior has become the user's own.

---

## 7. Progression & retention model

### 7.1 Progression (fresh surface, convergent mechanics)
Everyday Adventures' progression is distinctive: the **surface stays fresh** (varied missions) while the **underlying mechanic deliberately converges** (toward a stable ritual). Effort accumulates as:
- a **resilient, non-numeric-feeling consistency record** — "17 adventures over the last 30 days" (F21 decaying-strength logic, never F19 streak) — which a miss dents but never zeroes;
- the **mission rotation itself**, governed by §5.4 M1–M7: bounded, relevant, and *convergent over time* (M4) rather than an ever-expanding novelty catalog — this is the structural answer to H2;
- **user-led difficulty** (F35/TASK-029) only — a bigger version of a liked mission, never required, never auto-triggered after a miss.

The end state is **graduation (F26 / M7)**: when SRBAI automaticity for an anchor is high (TASK-035), the engine **stops varying** that anchor (the ritual has formed) and the app proposes reducing prompting and optionally opening a *new* anchor from a second tiny action — celebrating the user outgrowing the nudges (PRD Principle 5; EVIDENCE §3.6).

### 7.2 Retention model — three separate outcomes (PRD §7)
We refuse to conflate these, and for this concept the discipline is *especially* critical (H3):
1. **App retention** — return to see and do today's adventure. Supported by freshness + the completion moment, **not** by urgency or streak lock-in. *A stream of fresh missions is a strong app-retention hook — which is exactly why we read it skeptically.*
2. **Behavior retention** — the real action persists *even when app prompting tapers* (TASK-034 separates it; TASK-036 taper experiment). **This is the true goal and the real success metric — and the one H2 most threatens, because novelty can sustain app opens while real-behavior automaticity stalls.**
3. **Commercial retention** — subscription renewal (§8).

> **The honest tension, stated plainly:** Novelty is the strongest *app-retention* hook of this concept's three bets and the weakest-evidenced *behavior-change* lever — the mirror image of Tiny Win. A fresh mission every day can keep people opening the app while their underlying habit never stabilizes (H2/H3). We therefore treat rising **automaticity (SRBAI over time)**, not app opens or mission variety, as the real signal (§3.6 kill criteria 2–3), and we design M4's convergence precisely so novelty *ramps into* a stable habit rather than replacing one. Hypothesized targets to validate, not assume (PRD §7): first action within 24 h ≥ 65%, D7 ≥ 45%, D30 ≥ 30% — but **behavior** retention and **rising automaticity**, not app opens, are what must hold.

---

## 8. Commercial hypothesis

- **Free tier (PRD §7):** one active anchor → one daily fitted adventure. The free experience is genuinely complete and delightful, not a crippled demo; generosity at the core drives the PRD §8 shareable, non-shaming moment ("today's little adventure" is inherently more shareable and varied than a checkmark — a real asset for organic growth, TASK-017/043).
- **Premium (hypothesis):** *multiple anchors / adventure "tracks"* (e.g. a morning calm track + an afternoon movement track), richer and more finely-fitted mission variety, seasonal/thematic mission sets (cosmetic-adjacent, never pay-to-progress — missions are earned by real action, never bought), adaptive recommendation depth, and the graduation "open a new anchor" path. Gated by a clean entitlement check (TASK-037), **never** an early hard paywall (F41 barred).
- **The commercial opportunity, named:** varied, situationally-relevant missions are a plausibly strong **re-engagement and word-of-mouth** surface ("you won't get bored"), and *more variety / more anchors* is a Zero-Guilt-compatible premium lever (breadth and fit, not pressure).
- **The commercial risk, named:** content-variety operations have an ongoing cost (curating and safety-reviewing a fresh, relevant catalog — TASK-024), the no-urgency/no-streak stance forbids the category's reliable monetizers, and graduation caps LTV. Whether "more fit, more variety" converts is the open question for TASK-018/038 — not assumed away. Mitigation hypotheses to test: premium as *more anchors for graduates*, themed mission packs, and gift/family framing.

---

## 9. Failure modes

Each failure mode names the risk, the barrier/evidence it maps to, the early signal, and the designed mitigation. Grouped by type.

### 9.1 Behavioral failure modes (the bet is wrong)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-1 | **Novelty erodes automaticity.** Variety (especially if it leaks to the cue) prevents the behavior from ever stabilizing; users keep "starting" but never automate, and drop when novelty fades (H2; the §0 tension). | §3.1; §3.6; H2 | SRBAI fails to rise over time vs a fixed-action control (TASK-035/040); late-window decay | **M2** (cue invariant) + **M4** (bounded, *convergent* rotation) make novelty a ramp into a ritual; kill criterion §3.6(2) |
| F-2 | **Engagement ≠ efficacy.** Fresh missions reward *opening the app to see today's adventure*, not doing it; app opens rise while behavior stays flat (H3; PRD Principle 3). | §3.5; §3.4; H3 | App retention ≫ behavior retention gap (TASK-034/040) | The §3.5 firewall: ledger-only reward (M-logic), no mission-collection meta-game, no browse-ahead; kill criterion §3.6(3) |
| F-3 | **Relevance isn't felt — missions read as random/generic.** Declared-context-only fit is too coarse to feel tailored, so the whole premise collapses (H4). | F34; F36; H4 | Blinded desirability: "feels random" despite high comprehension (TASK-016) | Richer declared-context chips; strong relevance ranking (M5); M4 convergence toward missions the user demonstrably likes; kill criterion §3.6(4) |
| F-4 | **Cue never fires in real life.** The anchor routine is unstable (travel, shift work), so even a stable anchor has no trigger (B4 prior; §3.1 limitation). | §3.1; B4 | Completions cluster then vanish after a context change | Routine-anchored (not clock-only) cues, editable; contextual roadmap (F34/TASK-023); gentle restart (M7) catches the fallout |

### 9.2 Zero-Guilt / trust failure modes (we accidentally become what we oppose)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-5 | **Novelty becomes an urgency/FOMO hook.** "A new adventure is waiting!" or a limited window slides in "for engagement" — importing the barred BeReal mechanic. | CLAUDE.md §1; TASK-004; F17 | Any copy/feature implying a mission expires or a time limit | **No window ever** (F17 excluded by invariant); invitational copy only; TASK-004 red-flag checklist as a merge gate |
| F-6 | **Choice paralysis returns.** "Swap this mission" + a visible rotation re-introduces the B3 decision burden the concept removes (H5). | B3; §3.9; H5 | Hesitation/drop at the mission card; heavy swap usage (TASK-039) | Default to **one** offered mission; swap is a quiet secondary affordance, not a menu; monitored in TASK-039 |
| F-7 | **Relevance turns creepy.** To make "fit" better, someone adds location/sensor tracking; users feel surveilled (H4). | TASK-041; H4 | Privacy opt-out spikes; "how does it know?" discomfort (TASK-039) | **Declared-context-first, location off by default (M1)**; any sensed signal strictly opt-in and gracefully degrading; privacy controls (TASK-041) |
| F-8 | **Notifications slide into nagging.** Even gentle, *varied* prompts, repeated, become pressure (B7 prior; §3.9). | B7; §3.9 | Notification opt-out spikes; disable-then-churn | Opt-in only, anchored to the stable cue, taperable by default, success-toned; taper is a *feature* (TASK-036), never re-escalated after a miss |
| F-9 | **Restart that still shames.** "Welcome back" lands as passive-aggressive if copy implies the gap was bad. | §3.11; B6 | Users describe restart as "guilt-trippy" (TASK-039) | Copy reviewed against TASK-004 forbidden-word list; a fresh easy mission framed as a soft landing (M7); ≤ 2 taps, no catch-up |

### 9.3 Health-integrity failure modes (CLAUDE.md §3)
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-10 | **Variety outruns safety review.** The pressure to keep missions fresh tempts shipping un-reviewed or contraindicated actions. | TASK-006; TASK-024; M3/M6 | A mission appears that isn't in the reviewed catalog, or an exclusion is bypassed | **M3** (reviewed-catalog-only) + **M6** (safety hard-exclusion *before* ranking) are invariants; no variety path around them; catalog review cadence (TASK-024) |
| F-11 | **Benefit creep in mission copy.** "Feel calmer" quietly drifts toward "reduces anxiety / prevents disease" across a large, varied mission set. | TASK-006 claim ladder | Claims review flags ungraded language in a mission | Only pre-cleared, grade-licensed phrasing ships per mission (TASK-006 §5); claims-review gate at TASK-042; no individual-risk framing, ever |

### 9.4 Commercial & operational failure modes
| # | Failure mode | Maps to | Early signal | Mitigation |
|---|---|---|---|---|
| F-12 | **Variety doesn't convert.** Without urgency or purchasable progress, premium breadth/variety may not sell (§8). | §8; TASK-038 | WTP test: no viable contribution at $29.99 (TASK-018) | Premium = more anchors for *graduates* + themed packs + gift/family; if unviable at lowest price → kill §3.6 economics |
| F-13 | **Catalog-operations cost outruns value.** Continuously curating and safety-reviewing a fresh, relevant mission catalog is an ongoing cost the economics can't carry. | §8; TASK-024/038 | Content/review cost per retained user exceeds contribution (TASK-038 model) | M4's *convergence* bounds how much novelty is actually needed; scope the live pool small (~3–6/anchor); model honestly in TASK-038 |

### 9.5 The meta-failure mode
**F-14 — We chase novelty and abandon the habit.** Under retention pressure, the team widens the rotation, adds a mission-collection meta-game, or lets variety leak into the cue "because engagement is up" — and Everyday Adventures becomes a pretty novelty feed that drives app opens while no real habit ever forms. *Mitigation:* the **M2 cue-invariant** and **M4 convergence** rules as design invariants, the kill criteria (§3.6, especially the rising-automaticity gate), the TASK-004 red-flag checklist as a merge gate, and this brief on record: **if novelty can't lower resistance *without* destroying automaticity, Everyday Adventures should be rejected at TASK-019, not quietly converted into the engagement toy it was built to avoid.**

---

## 10. Scorecard pre-read (hand-off to TASK-014 / TASK-019)

How Everyday Adventures is *expected* to score on the PRD §9 weighted criteria — a hypothesis for the scorecard to confirm or overturn with real test data, **not** a self-grade:

| Criterion (weight) | Expected relative strength | Rationale |
|---|---|---|
| Desirability (20%) | **High** | "Never the same chore twice / fits your day" is immediately appealing to the bored and defeated (Seg A/C); strong five-second-test hook (PRD §4) |
| Behavioral effectiveness (20%) | **Medium / contested — the lowest-confidence of the three** | Graded cue/action/monitoring spine is solid, but the *novelty-lowers-resistance* core is test-gated **and in tension with the stable-cue automaticity evidence** (§0, H2) — the most evidentially exposed bet of the three |
| Differentiation (15%) | **High** | Contextual missions (F34 ⭕) + reviewed-catalog situational recommendation + graduation-as-ritual; the category's clearest under-used capability |
| User experience (15%) | **Medium / High** | Fresh and delightful, but carries the most logic complexity (M1–M7), the choice-paralysis risk (H5), and a privacy-comfort bar (H4) |
| Retention potential (10%) | **High (app) / contested (behavior)** | Novelty is a strong app-retention hook — which is exactly why we read it skeptically (§7.2); behavior retention is the real, threatened goal |
| Economics (10%) | **Medium / Low** | Good word-of-mouth and variety-based premium lever, but ongoing catalog-ops cost (F-13) + no-urgency stance + graduation cap LTV |
| Apple-level craft (10%) | **High** | Situational, varied, accessible missions with restrained motion/haptics are a showcase — contingent on the < 2 s loop and WCAG 2.2 AA (TASK-030) |

**Three non-negotiable gates (PRD §9):** (1) credible real-world behavior-change evidence — *the open question, because the novelty core is test-gated and in tension with the automaticity evidence (§0)*; (2) meaningful desirability — *strong, by construction*; (3) safe/trustworthy health guidance — *held by TASK-006/024, plus the M3/M6 reviewed-catalog-and-safety-first invariants (F-10)*.

**How this differs from its siblings (for a fair blinded comparison):** Tiny Win bets on **subtraction** (strong evidence, contested desirability); Growing World bets on **benign attachment** (strong desirability, test-gated evidence); Everyday Adventures bets on **novelty + situational relevance** (strong desirability, *test-gated evidence that is in direct tension with the stable-cue automaticity evidence*). The three are deliberate opposites so TASK-016/019 compare real alternatives, not variations on one idea — and this concept is intentionally kept distinct from its siblings: its variety is *content-level only* (the cue is stable, unlike a true novelty-of-timing product), and its accruing record is kept deliberately thin so it does not become Growing World's elaborate world.

---

## 11. Coverage checklist (acceptance criteria)

Acceptance criterion: *"Brief contains mission-selection logic, 7-day storyboard and failure modes."*

- [x] **Mission-selection logic** — §5.4 (M1–M7: privacy-first inputs, invariant anchor, reviewed-catalog-only pool, bounded/convergent variety, relevance ranking, safety hard-exclusions + no-match fallback, gentle-restart & graduation states), with onboarding set-up in §4 and the progression view in §7.1.
- [x] **7-day storyboard** — §6 (seven days across the PRD §6 six-moment frame, including a missed day + gentle restart and a Day-7 convergence beat that proves the automaticity-not-just-novelty thesis).
- [x] **Failure modes** — §9 (fourteen, grouped behavioral / trust / health / commercial-operational / meta, each with mapping, early signal, mitigation).
- [x] *Beyond the criterion, to match the PRD §3 equivalent-brief standard and enable fair comparison with TASK-011/012:* one-page thesis (§1), user promise (§2), behavior hypothesis with competing hypotheses H2–H5 + kill criteria (§3), reward mechanics (§5.1–§5.3), progression & retention (§7), commercial hypothesis (§8), scorecard pre-read (§10).
- [x] **Evidence discipline** — graded mechanisms (A–D) cited to TASK-005; the novelty core honestly flagged as test-gated **and in tension with the stable-cue automaticity evidence** (§0); barrier `B#` references labelled *priors-to-test* (TASK-008/009 blocked), not findings; health claims bounded by TASK-006; no `[TBD]`/placeholder text.

**Status:** Concept-generation deliverable (strategy). No `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).
