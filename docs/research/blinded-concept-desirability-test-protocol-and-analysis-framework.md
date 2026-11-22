# Blinded Concept Desirability Test — Protocol & Analysis Framework (HerRays Stage-4)

**Task:** TASK-016 (instruments only — see §0) · **Workstream:** Concepts
**Owner:** UX researcher (per PRD team table) · **Reviewers:** Product strategist (preference validity), Behavioral scientist (comprehension coding), Brand/visual director (distinctiveness read)
**Recruits via:** `user-recruitment-screener.md` (TASK-007) · **Stimuli:** the three approved first-session prototypes (TASK-015, `prototype/src/flows/`) + static App Store-style stills
**Feeds (once real data exists):** TASK-014 scorecard (Desirability criterion, 20% weight), TASK-019 (concept selection decision record), TASK-017/018 (proposition & willingness-to-pay)
**Date:** 2026-11-22

---

## 0. What this document is — and what it is not (read first)

This is the **field-ready instrument and analysis framework** for TASK-016: the blinding design, the identical test script, the preference / comprehension / qualitative-reason instruments, their coding schemes, and the analysis workflow with empty result slots. These are the reusable, durable deliverables.

**This document does NOT contain the results of a test run on ≥18 participants that TASK-016's acceptance criterion requires, and it does not claim to.** A blinded desirability test with real people cannot be conducted inside an autonomous overnight build — there are no recruited participants, no consent process, no scheduled moderated sessions, and no observed preferences here. Every preference tally, comprehension rate, and reason-frequency cell below is an **empty template** waiting on real sessions.

This mirrors the Reviewer's repeated, explicit rulings on the Research workstream (PROGRESS.md, 2026-11-22): human-subject empirical deliverables (TASK-008 interviews, TASK-009 diary study) were **blocked**, and constructed/synthetic human records were **forbidden** from being advanced through a decision gate as if empirical. TASK-016 is the same class of work — it was named in the TASK-015 completion note as "a human-subject study; likely a same-class blocker as TASK-008/009 unless scoped to instruments." Fabricating 18 preference records would corrupt TASK-019 (concept selection), which is the single most consequential gate in the whole plan, and would violate CLAUDE.md §3.

**Status of TASK-016: `blocked` — requires human-subject research.** The empirical requirement (≥18 participants, same script, preference + comprehension + qualitative reasons recorded) remains **open**. This framework is published now so that the moment real sessions can run, there is nothing to design — only to execute, observe, code, and tabulate. See §8 for the definition-of-done and §9 for the blocker statement and unblock path.

Everything below is genuine instrument design grounded in the PRD (§3 three concepts, §4 desirability testing, Concept-selection scorecard), the three approved concept briefs in `docs/strategy/`, the TASK-015 prototypes, and the TASK-007 screener. No synthetic data is presented as findings anywhere. §4.4 and §6.3 contain **labelled NON-DATA fixtures** used only to prove the coding and scoring are deterministic; they are not participant records and carry zero evidential weight.

---

## 1. Objective, scope, and the three stimuli

### 1.1 The question this test answers (and the ones it does not)

PRD §4 (Desirability testing) splits into three instruments on equivalent audiences. **TASK-016 owns exactly one of them — the blinded comparison of the three concepts** — and must not silently absorb the others:

| PRD §4 instrument | Owning task | In scope here? |
|---|---|---|
| Five-second comprehension / distinctiveness test | **TASK-016** | **Yes** (§5.2) |
| Blinded concept **preference** + qualitative reasons | **TASK-016** | **Yes** (§5.3–§5.4) |
| App Store proposition / headline variant test | TASK-017 | **No** — referenced, not run here |
| Behavioral willingness-to-pay test | TASK-018 | **No** — no price, no checkout, no charge in this protocol |
| 7-day voluntary-return test | TASK-040 pilot | **No** |

**Primary question:** *Shown three genuinely different directions without being coached toward any of them, which concept do busy, lapsed, and sustaining users actually prefer, do they understand what each one asks of them, and — in their own words — why?*

**Explicit non-goals:** this test does **not** measure real-world behavior change (that is the TASK-040 pilot), does **not** measure willingness to pay (TASK-018), and does **not** by itself select a concept — it is one weighted input (Desirability, 20%) to the TASK-019 decision, which also weighs behavioral effectiveness, differentiation, UX, retention, economics and craft, and is overridden by the three non-negotiable gates (§7.3).

### 1.2 The three stimuli (equivalent, real, already built)

The concepts are the PRD §3 directions, each with an approved equivalent brief and an **already-built, independently navigable clickable first-session prototype** (TASK-015, approved). Using the real prototypes — not slideware — is what makes this a desirability test of the *experience*, per PRD §4 ("high-fidelity clickable prototypes").

| # | Concept | PRD §3 hypothesis (the bet) | First-session stimulus (TASK-015) | Static still (5-sec test) |
|---|---|---|---|---|
| **S1** | **The Tiny Win** | Reduced choice and effort increase consistency (subtraction) | `TinyWinFlow` — Welcome → goal whisper → one proposed action (+easier variant) → optional when-then → first win *now* (hold-to-complete) → gentle close | The "Your Little Win Today" action card, mid-hold |
| **S2** | **The Growing World** | Attachment and visual progress improve repetition (benign, **no-decay** accrual) | `GrowingWorldFlow` — same spine; completion plants the first permanent seed in the SVG world; close states the no-decay promise | The world canvas after one planted seed |
| **S3** | **Everyday Adventures** | Novelty and situational relevance lower resistance (stable anchor, **rotating mission**) | `EverydayAdventuresFlow` — Welcome → goal → stable anchor set → declared context → one fitted mission (+"suggest a different one") → first adventure *now* → gentle close | A single contextual mission card tied to an anchor |

**Equivalence controls (so the test is fair, not a rigged demo):** all three stimuli are entered from an identical neutral launcher; each is driven to the **same depth** (entry → goal → first real action → completion); each uses the same reduced-motion and accessibility defaults; none carries price, brand superlatives, or a "recommended" marker. Any stimulus asymmetry discovered in piloting (§3.4) is a confound to fix *before* fielding, logged in §8.

---

## 2. Participants and sample size

### 2.1 Sample size and rationale

- **n = 18 minimum** (acceptance floor), target **n = 24** to absorb no-shows and keep counterbalancing balanced (§3.2). This is a **within-subjects** design — every participant sees all three concepts — so 18 participants yield 18 three-way preference judgements and 54 concept-level comprehension/desirability observations.
- Purposive and **non-representative by design** (inherits the screener §3 stance). n=18 is sized to surface *directional* preference and *comprehension failures* across the target segments, **not** to produce a statistically powered market estimate. Preference differences are reported with confidence intervals (§6.1) and explicitly caveated (§6.5); a narrow or split result is a valid, reportable outcome — not a reason to over-recruit until a favorite "wins."

### 2.2 Segment quotas (bound to the TASK-007 screener)

Participants are drawn **only** through `user-recruitment-screener.md`. Quotas preserve the three lived experiences and let preference be read *per segment* (a concept may win overall yet lose with its own intended primary audience — a result TASK-019 must see):

| Segment | Screener definition | Quota (of 18) | Why they matter to this test |
|---|---|---:|---|
| **A — Abandoned-app users (lapsed)** | Installed a habit/wellness app ≤12 mo; stopped ≤~30 days | **7** | Burned by guilt/decay mechanics; the sharpest judges of whether S2's no-decay promise and S1's anti-dashboard actually read as different |
| **B — Successful habit builders (sustainers)** | 3+ months sustained daily routine (app-free welcome) | **4** | Hold the stable-cue blueprint; the best detectors of whether S3's novelty would erode their kind of consistency |
| **C — Busy beginners (time-starved)** | High time pressure; no sustained routine | **7** | The primary launch-audience hypothesis for all three briefs; the hardest test of comprehension-at-a-glance and <2-second appeal |

Exclusions E1–E8 (screener §4) are applied **before** scheduling; eligibility-sensitive respondents (E5 clinician-advised/pregnant, E6 food/exercise sensitivity) are screened out upstream so **no health-claim content is elicited** — consistent with `prevention-action-evidence-rubric.md` and TASK-041. Quota-balance each of the six presentation orders (§3.2) across segments as far as recruitment allows; record the achieved order×segment matrix in §6.4.

---

## 3. Blinding design (the heart of "blinded")

"Blinded" has a precise, enforceable meaning here: **neither the participant nor the moderator may learn which concept is HerRays' internal favorite, and nothing in the materials or the moderator's language may steer preference.** PRD §4 is explicit: test "without coaching participants toward the intended reaction." Four mechanisms enforce it.

### 3.1 Concept blinding (no internal favorite leaks)

- **Neutral in-test labels.** The three concepts are presented to participants as **"Experience ①", "Experience ②", "Experience ③"** (or three equivalently-weighted invented product names drawn from a single neutral naming set — never the internal codenames "Tiny Win / Growing World / Everyday Adventures", which encode the thesis). The label→concept mapping is randomized per participant (§3.2) and recorded only in the session key.
- **No ranking cues.** Identical framing sentence for all three; no "new", "improved", "our pick", star ratings, or ordering that implies priority. No concept is described using its own hypothesis language (e.g. the moderator never says "this one grows a world" or "this is the simplest").
- **Equal airtime.** Each stimulus gets the same introduction script, the same task, and the same time box (§5).

### 3.2 Order blinding (counterbalancing)

Three concepts → **six presentation orders** (all permutations of S1/S2/S3). Assign participants round-robin across the six orders so each order is seen ~3× at n=18, balanced across segments where possible. This neutralizes primacy/recency and fatigue effects that would otherwise masquerade as preference. The achieved order distribution is reported (§6.4); any imbalance is a stated limitation.

### 3.3 Moderator blinding (no coaching)

- The moderator works from the **verbatim script (§5)** and the **non-leading probe list (§5.5)**; improvised evaluative language is prohibited.
- The moderator is, as far as operationally possible, **blind to the internal favorite** — ideally the moderator is not the concept author. Where full moderator-blinding is impractical, sessions are audio-recorded and a **neutrality audit** (§6.4) scans the moderator's utterances for leading/evaluative language using the forbidden-word list (§5.5), exactly as the screener §7 audits its own copy.
- **No coaching, no rescue.** If a participant misunderstands a concept, the moderator records the misunderstanding (it is data — a comprehension failure) and does **not** explain the concept until the post-test debrief (§5.6).

### 3.4 Pilot before fielding (confound removal)

Run **2 pilot sessions (not counted toward n=18)** to verify: the neutral labels carry no accidental valence, the three stimuli are driven to equal depth, the 5-second stills are legible, and the script is unambiguous. Fix any stimulus asymmetry or leading phrasing, log the fix in §8, then field the real n≥18.

---

## 4. Instruments (what is recorded) and their coding schemes

Three measures, each mapped to an acceptance word: **preference**, **comprehension**, **qualitative reasons**. Each has a capture instrument and a deterministic coding scheme so two coders converge.

### 4.1 Comprehension (the five-second test) — coding scheme

For each concept, the still (§1.2) is shown for **5 seconds**, then hidden, then the participant answers two open prompts (§5.2). Two coders independently assign:

| Field | Values | Rule |
|---|---|---|
| **Comprehension accuracy** | `correct` / `partial` / `incorrect` | `correct` = names *both* that it's about a tiny daily real-world action *and* the concept's distinctive move (S1 one easy action/no dashboard; S2 a world that grows and never shrinks; S3 a different small mission that fits the moment). `partial` = gets the tiny-action gist but misses the distinctive move. `incorrect` = wrong mental model (e.g. "a fitness tracker", "a to-do list"). |
| **Distinctiveness (first word)** | verbatim + theme code | The single first impression word/phrase, coded to a distinctiveness theme (calm / playful / simple / game / effort / confusing…). Flags concepts read as generic. |
| **Effort read** | `feels tiny` / `neutral` / `feels like work` | Does the glance convey the <2-second, ridiculously-small promise? A concept read as "work" at a glance has a desirability problem regardless of preference. |

### 4.2 Desirability (per concept, before the forced choice) — rating instrument

Immediately after completing each concept's first-session flow, and **before** seeing the next, the participant rates that concept in isolation (reduces the anchoring that pure ranking introduces):

- **"How much would you want to use this tomorrow?"** 0–10 (0 = not at all, 10 = can't wait). Recorded per concept per participant.
- **"How different does this feel from apps you've tried?"** 0–10 distinctiveness self-report (triangulates §4.1).
- One-line **"what is this for, in your words?"** (a second comprehension probe *after full exposure* — catches concepts that are clear at a glance but confusing in use, and vice-versa).

### 4.3 Preference (after all three) — forced-choice instrument

Once all three flows are complete and rated, with all three still visible as neutral thumbnails:

- **Forced first choice:** "If you could only keep **one** to use starting tomorrow, which?" (one of ①/②/③ — no "none", to force a signal; a genuine "none appeals" is captured in the reason probe and flagged).
- **Full rank:** 1st / 2nd / 3rd (captures second-choice structure — a concept that is rarely 1st but never last is a different bet than one that polarizes).
- **Preference strength:** "How sure are you about your top pick?" 0–10 (a weak, near-tie preference must not be read as a mandate).

### 4.4 Qualitative reasons — reason-code scheme (R1–R8)

Every "why?" is transcribed verbatim and coded. The scheme maps reasons **one-to-one onto the PRD Concept-selection scorecard criteria** (so TASK-019 can route qualitative evidence to the right weighted line) and onto each concept's hypothesis (so we learn *whether the bet landed*):

| Code | Reason family | Observable signal in participant's words | Scorecard line it informs |
|---|---|---|---|
| **R1** | **Effort / simplicity** | "looks easy", "I wouldn't have to think", "too much going on" | Desirability · UX |
| **R2** | **Emotional pull / warmth** | "it's cute", "I'd feel bad leaving it", "it made me smile" | Desirability |
| **R3** | **Novelty / boredom** | "I'd get bored", "something different each day", "same thing every day is fine" | Behavioral effectiveness (S3 bet) · Retention |
| **R4** | **Relevance / fit to my day** | "fits when I actually have a second", "not for someone like me" | Desirability · Behavioral effectiveness |
| **R5** | **Progress / visible payoff** | "I can see it building", "nothing to show for it" | Retention · Desirability (S2 bet) |
| **R6** | **Guilt / pressure read** | "it won't nag me", "feels like it'd guilt-trip me", "another thing to fail at" | **Gate: safe/trustworthy** · Zero-Guilt (CLAUDE.md §1) |
| **R7** | **Trust / credibility** | "seems legit / gimmicky", "would this actually help" | **Gate: credible behavior-change** · Behavioral effectiveness |
| **R8** | **Craft / aesthetic** | "looks beautiful", "looks cheap", "feels like an Apple app" | Apple-level craft · Desirability |

A reason is coded for a participant **only when they voice it**, never inferred from their choice. Two-coder convention: independent coding, disagreements resolved by the behavioral scientist; capture one de-identified illustrative verbatim per load-bearing reason per concept for the synthesis appendix.

---

## 5. The test script (identical for every participant — the "same script" requirement)

**Format:** 30-minute moderated 1:1 session (remote or in-person), screen-shared clickable prototypes. Fully scripted; the only variation permitted is the counterbalanced order (§3.2) and the participant's own answers. **Consent, recording, and debrief are mandatory (§5.1, §5.6).**

### 5.1 Open (verbatim)
> "Thanks for being here. I'm going to show you three early app experiences, one at a time. There are **no right answers and none of these is 'the finished one' or 'my favorite'** — I genuinely want your honest reactions. I didn't design these, so you won't hurt my feelings. Is it OK if I record audio and screen so I don't have to take notes? You can stop anytime, and I'll answer any questions at the very end."
*(Consent recorded. De-identification per §5.7.)*

### 5.2 Five-second comprehension test (per concept, in counterbalanced order)
> "I'll show you a single screen for five seconds, then hide it. Just tell me afterwards: **(a) what do you think this app is for?** and **(b) what would you do with it each day?**"
*(Show still 5 s → hide → capture verbatim → code to §4.1. No feedback given.)*

### 5.3 Hands-on first session (same concept)
> "Now go ahead and use it as if it were on your phone this morning. Think aloud — tell me what you're seeing and expecting. I'll stay quiet."
*(Participant drives the TASK-015 flow entry → goal → first action → completion. Moderator stays silent except the §5.5 non-leading probes. Record task completion, any dead-end/confusion, think-aloud verbatim.)*

### 5.4 Per-concept rating (same concept, before moving on)
> "In your own words — what's this one for? … How much would you want to use this *tomorrow*, 0 to 10? … How different does it feel from things you've tried, 0 to 10?"
*(Capture to §4.2. Then move to the next concept and repeat §5.2–§5.4.)*

### 5.5 Preference + reasons (after all three)
> "Here are all three again. **If you could keep only one starting tomorrow, which?** … Now rank them 1-2-3. … How sure are you about your top pick, 0 to 10? … **Tell me why your top one — what made it the one?** … What made you rule the last-place one out?"
*(Capture to §4.3; code the "why/rule-out" to §4.4 R1–R8.)*

**Non-leading probes (use sparingly; never evaluative).** *"Say more about that?" · "What made you expect that?" · "What were you looking for just then?"*
**Forbidden moderator words** (neutrality audit §6.4): *habit, streak, HerRays, simple, fun, beautiful, better, best, should, recommend, grow, adventure, win* — each either primes a concept's thesis or telegraphs a verdict. (Extends the screener §7 and interview-framework §2.2 neutrality rule.)

### 5.6 Debrief (after all data captured)
Only now may the moderator explain each concept, answer questions, and correct any misunderstanding. Thank + incentive per TASK-041 consent terms.

### 5.7 Consent & privacy
Record only with explicit consent; store under opaque IDs (P01…P18+); strip names/re-identifiable detail at transcription; no health diagnosis/severity/history solicited (eligibility screened upstream, §2.2); data handling per TASK-041.

---

## 6. Analysis framework (empty result slots — populated only from real sessions)

### 6.1 Preference tally (acceptance: "preference recorded")

**Cells are intentionally empty; they fill only from real forced-choice data (§4.3).** Report first-choice counts with a 95% confidence interval and the mean preference-strength, overall and per segment.

| Concept | 1st-choice n (of 18) | % | 95% CI | Mean rank (1–3) | Mean preference strength (0–10) |
|---|---:|---:|---:|---:|---:|
| ① The Tiny Win (S1) | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| ② The Growing World (S2) | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| ③ Everyday Adventures (S3) | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

**Per-segment preference (A/B/C)** reported in the same shape — a concept winning overall but losing with its intended primary segment (§1.2 / brief §2.4) is a flagged, decision-relevant result for TASK-019.

### 6.2 Comprehension summary (acceptance: "comprehension recorded")

| Concept | correct | partial | incorrect | "feels tiny" at glance | Most common first-word theme |
|---|---:|---:|---:|---:|---|
| ① Tiny Win | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| ② Growing World | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |
| ③ Everyday Adventures | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ | _(from data)_ |

### 6.3 Qualitative reason frequency (acceptance: "qualitative reasons recorded")

Per concept, count participants voicing each R-code (§4.4) as a *reason for* vs *against*, with an illustrative verbatim. Empty until coded.

| R-code | ① for / against | ② for / against | ③ for / against | Illustrative verbatim (de-identified) |
|---|---|---|---|---|
| R1 Effort/simplicity | _/_ | _/_ | _/_ | _(from data)_ |
| R2 Emotional pull | _/_ | _/_ | _/_ | _(from data)_ |
| R3 Novelty/boredom | _/_ | _/_ | _/_ | _(from data)_ |
| R4 Relevance/fit | _/_ | _/_ | _/_ | _(from data)_ |
| R5 Progress/payoff | _/_ | _/_ | _/_ | _(from data)_ |
| R6 Guilt/pressure | _/_ | _/_ | _/_ | _(from data)_ |
| R7 Trust/credibility | _/_ | _/_ | _/_ | _(from data)_ |
| R8 Craft/aesthetic | _/_ | _/_ | _/_ | _(from data)_ |

### 6.4 Blinding-integrity & balance checks (reported alongside results)
- **Order balance:** achieved order×segment matrix vs the six-permutation target (§3.2).
- **Moderator-neutrality audit:** count of forbidden-word (§5.5) utterances across sessions — target zero; any occurrence logged as a confound.
- **Favorite-leak check:** post-session, did any participant infer which was "the real one"? If yes, that session's preference is flagged.

### 6.5 Limitations to state in the final synthesis
- **Stated preference ≠ behavior** (PRD §4 / Principle 3): this measures what people *say* they'd use, not what they *do*. The TASK-040 pilot and TASK-018 WTP exist precisely because a desirability winner can still fail on real-action frequency. TASK-019 must weight this test at its 20% Desirability line only, never as the whole decision.
- **Prototype-depth confound:** only the first session is shown; a concept that delights on day 1 may fatigue by day 7 (that is the 7-day return test, out of scope here).
- **Purposive, non-representative** (screener §3); n=18 directional, not a market estimate; report CIs and resist over-recruiting to a favorite.
- **Novelty bias toward S3 and spectacle bias toward S2** at first exposure are known risks — they are *why* the behavioral gates (§7.3) override a raw desirability win.

### 6.6 NON-DATA determinism fixtures (labelled; zero evidential weight)
To prove the scheme is deterministic *before* real sessions, two invented mini-cases are coded here. **These are fixtures, not participants; they appear in no table above.**
- *Fixture P (constructed):* glance at ② → "a little garden game, it grows when you do stuff" → comprehension `correct`, first-word *playful*, effort `feels tiny`. Forced choice ②; "why" = "I'd feel attached, and it won't punish me" → **R2 for, R6 for**. Both coders converge.
- *Fixture Q (constructed):* glance at ③ → "some kind of daily challenge thing?" → comprehension `partial` (gets tiny-action, misses stable-anchor move), first-word *game*, effort `neutral`; ranks ③ last; "why not" = "feels like it'd be a different random thing I'd forget" → **R3 against**. Deterministic; no sentiment-only codes.

---

## 7. Decision linkage (how this feeds TASK-019 — without pre-deciding it)

### 7.1 Into the TASK-014 scorecard
This test supplies the **Desirability (20%)** evidence line and triangulates **UX (15%)** and **Apple-level craft (10%)**. The scores entered must be *observed* (preference + comprehension + reason data), not internal aesthetics (PRD §4 gate: "Do not choose by internal aesthetics alone").

### 7.2 Into the TASK-019 decision record
TASK-019 combines this desirability evidence with behavioral-effectiveness evidence (which is **still gated on the blocked TASK-008/009/040** — so TASK-019 cannot fully close until that empirical base exists either). This test alone cannot select a concept.

### 7.3 The three non-negotiable gates override preference (PRD scorecard)
A concept can win preference here and still be rejected if it fails any gate: **(1) credible real-world behavior-change evidence, (2) meaningful desirability, (3) safe/trustworthy health guidance.** R6 (guilt/pressure) and R7 (trust) are the early read on gates 3 and 1; a concept that wins on novelty (R3) but reads as untrustworthy (R7) or pressuring (R6) does **not** advance on the preference number alone.

---

## 8. Definition of done (what closes TASK-016 honestly)

TASK-016 may move to `in_review` **only** when all of the following exist:
1. **≥18 real participants** recruited via the TASK-007 screener to the A×7 / B×4 / C×7 quotas, each run through the **identical script** (§5) in a counterbalanced order (§3.2), with consent and recording.
2. **Preference recorded** — forced first choice, full rank, and strength per participant (§4.3), tabulated in §6.1 with CIs, overall and per segment.
3. **Comprehension recorded** — five-second accuracy + effort read per concept per participant (§4.1), tabulated in §6.2.
4. **Qualitative reasons recorded** — "why" coded to R1–R8 (§4.4), tabulated in §6.3 with illustrative verbatims.
5. **Blinding-integrity checks** (§6.4) and **limitations log** (§6.5) completed and carried to TASK-019.

Until item 1 exists, the task is blocked, not done. This framework satisfies the *design* of items 2–5; it cannot satisfy item 1. The 2 pilot sessions (§3.4) and any stimulus/phrasing fixes they produce are logged here before fielding.

---

## 9. Blocker statement & acceptance-criterion status

> **TASK-016 is BLOCKED pending human-subject research.** Running a blinded desirability test on ≥18 real participants is out of scope for an autonomous overnight build — no recruited/consented participants, no moderated sessions, no observed preferences exist here. Per the Reviewer's 2026-11-22 rulings on TASK-008/009, synthetic human records must **not** be advanced through a decision gate as if empirical; doing so for TASK-016 would corrupt the TASK-019 concept-selection decision. This deliverable therefore ships the **field-ready instruments** (blinding design §3, identical script §5, preference/comprehension/reason instruments §4, analysis framework with empty result slots §6) so execution is turnkey, and leaves the empirical requirement **open**.
>
> **Unblock path:** a human operator recruits ≥18 participants via `user-recruitment-screener.md`, runs the 2 pilots then the real sessions to the §5 script and §3.2 counterbalancing, codes preference/comprehension/reasons (two-coder, §4), populates §6.1–§6.4, completes the limitations log, then advances TASK-016 to `in_review`. No instrument redesign is required.

| TASK-016 acceptance requirement | Status |
|---|---|
| **At least 18 participants** | **OPEN / BLOCKED** — requires human-subject research (§9). No synthetic stand-in is presented as satisfying this. |
| **Same script** | **Framework ready** — §5 is a single verbatim script; only order (§3.2) and participant answers vary. |
| **Preference recorded** | **Framework ready, data pending** — §4.3 instrument + §6.1 template (empty cells). |
| **Comprehension recorded** | **Framework ready, data pending** — §4.1 five-second test + §6.2 template (empty cells). |
| **Qualitative reasons recorded** | **Framework ready, data pending** — §4.4 R1–R8 scheme + §6.3 template (empty cells). |

**Status routing note (disclosed deviation):** per the standard workflow this step would set TASK-016 to `in_review`. As with TASK-008/009, routing a non-completable empirical task through the gate as "done" would require fabricating the participant data the criterion demands and would re-arm the synthetic-data reject loop the Reviewer has twice closed. TASK-016 is therefore set to **`blocked`** with a `blocked_reason`, surfacing the blocker honestly — the terminal state the Reviewer sanctioned for this autonomous context.

**Verification note:** Research/instrument-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed exit 0 (strict `tsc -b && vite build`). Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
