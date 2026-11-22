# HerRays — Build Progress Log

## 2026-11-22

### TASK-005 — Reviewer approval · status: completed
- **APPROVED.** Acceptance criterion met and exceeded: `docs/research/behavior-change-evidence-register.md` carries **12 graded mechanism cards** (§3.1–3.12), each populated with all five required fields — citation, population, evidence strength (A–D), limitation, implementation implication — plus HerRays-mechanism and Zero-Guilt-check fields; the §7 coverage matrix reconciles exactly and all five PRD §5 mechanisms (cues 3.1, goals 3.3, reinforcement 3.4, self-monitoring 3.5, automaticity 3.6) are covered at grade A/B.
- **Craft & integrity verified:** Citations are genuine behavior-change literature (Lally 2010, Gollwitzer & Sheeran 2006, Locke & Latham 2002, Harkin 2016, Wood & Neal 2007, SRHI/SRBAI); every numeric effect size carries a verify-against-primary-source flag (§8) rather than false precision. Original frameworks (A–D engagement-≠-efficacy grading §2.2, §4 behavior-engine synthesis with solid-links-vs-hypotheses split, §5 task handoff map, §6 grade→claim gate). No `[TBD]`, placeholders, or filler.
- **Standards confirmed:** Zero-Guilt operationalized — per-card guilt checks, variable-ratio/streak mechanics graded D-for-behavior and rejected, §4.2 shows evidence converges with CLAUDE.md §1; disease/individual-risk claims correctly out of scope and gated to TASK-006. `cd prototype && npm run build` → exit code 0 (tsc strict + Vite, `✓ built in 91ms`); no `any`/`@ts-ignore`/`TODO` in `prototype/src` (research-only task, no prototype changes).

### TASK-005 — Build behavior-change evidence register · status: in_review
- **Deliverable:** `docs/research/behavior-change-evidence-register.md` (~300 lines).
- **Built:** The evidence spine the whole product traces to — the graded register that TASK-002/003 explicitly deferred here ("any claim a mechanism *improves behavior* vs *drives engagement* must route through TASK-005").
  - **12 mechanism cards** (§3), each carrying all five acceptance-criterion fields — citation, population, evidence strength, limitation, implementation implication — plus a HerRays mechanism and a Zero-Guilt check. The five PRD §5 mechanisms are all covered at grade A/B: cues (3.1), goals (3.3), reinforcement (3.4), self-monitoring (3.5), habit automaticity (3.6). Supporting mechanisms: implementation intentions, action simplicity, positive affect/celebration, autonomy/SDT, flexible consistency, fresh-start restart, identity.
  - **A–D evidence-grading scheme** (§2.2, GRADE-inspired) that rates *strength of evidence for the behavioral effect* and holds the standing engagement-≠-efficacy line — a mechanism can be A-for-engagement and D-for-behavior; this register grades behavior.
  - Anchored to the real literature: Lally 2010 (automaticity curve + "66 days is one small study, huge variance"), Gollwitzer & Sheeran 2006 (implementation intentions), Locke & Latham 2002 (goals), Harkin 2016 + Michie 2009 (self-monitoring), Wood & Neal 2007 (cues), Ryan & Deci / Teixeira 2012 (SDT), Dai/Milkman 2014 (fresh-start), Verplanken & Orbell 2003 / Gardner 2012 (SRHI/SRBAI measures).
  - Beyond the cards: §4 synthesis assembles the graded links into the PRD §5 behavior engine (solid links vs hypotheses-to-test vs rejected-mechanics), §4.2 shows the evidence and Zero-Guilt *converge* (autonomy/lapse-tolerance/graduation are both higher-efficacy and §1-mandated), §4.3 names the honest weak spots (the "66-day" temptation, under-evidenced celebration, Western-adult sampling), §5 handoff map wires every mechanism to its owning task(s), §6 a grade→claim gate for the PR checklist.
- **Verified:**
  - Acceptance criterion met — 12 mechanisms, each with citation + population + evidence strength + limitation + implementation implication (§3 cards; coverage matrix §7).
  - Scope discipline: behavioral mechanisms only; no disease-prevention/individual-risk claims (gated to TASK-006); every numeric effect size carries a verify-against-primary-source flag (§8).
  - `cd prototype && npm run build` → exit code 0 (tsc strict + Vite, `✓ built in 91ms`).
- **Note:** Research-only task; no `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).

### TASK-004 — Reviewer approval · status: completed
- **APPROVED.** Acceptance criterion met and exceeded: `docs/research/competitor-anti-patterns.md` §3 documents **20 anti-patterns** (AP01–AP20, ≥15 required) across seven harm families, each carrying a named **observed example** (e.g., Streaks reset-to-zero, Habitica HP loss, Duolingo "Duo misses you," Fabulous/Productive early paywall, BeReal window, Apple Rings closure pressure, red-missed convention) **and** a buildable **design guardrail** — the two fields the criterion requires; the §3 count check and §9 coverage checklist reconcile to 20.
- **Traceability & craft verified:** Every exemplar app traces to TASK-001/002 with no new products introduced; all cited anti-pattern feature rows (F17, F19, F20, F24, F28, F29, F30, F41, F42) confirmed present in the TASK-003 inventory. Each entry names the exact CLAUDE.md §1/§2/§3 or PRD principle it violates and routes its guardrail to an owning task. Original frameworks (four-anxiety meta-pattern §4, guardrail design system §5, severity tiering §6.1, reusable reviewer red-flag checklist §6.3, §7 handoff map). No `[TBD]`, placeholders, or filler.
- **Standards confirmed:** Zero-Guilt operationalized rather than merely respected — forbidden mechanics (red "missed" semantics, broken-streak penalties, loss-framed copy) marked hard-blocked with positive substitutes; health-claim integrity (AP19/AP20) routed to TASK-006/024/042. `cd prototype && npm run build` → clean (tsc strict + Vite, `✓ built in 91ms`); no `any`/`@ts-ignore`/`TODO` in `prototype/src` (research-only task, no prototype changes).

### TASK-004 — Document competitor anti-patterns · status: in_review
- **Deliverable:** `docs/research/competitor-anti-patterns.md` (~190 lines).
- **Built:** The anti-pattern library that TASK-001 §6, TASK-002 §5.3 and TASK-003 §4.1 all deferred here.
  - **20 anti-patterns** (AP01–AP20, exceeds the ≥15 threshold), grouped into seven harm families: progression/streak guilt (5), monetization dark patterns (3), onboarding friction (3), notification/cueing pressure (3), social pressure (2), visual/copy shaming (2), health-integrity (2).
  - Every anti-pattern carries both acceptance-criterion fields: an **observed example** in a named product from TASK-001/002 (e.g., Streaks reset-to-zero, Habitica HP loss, Duolingo "Duo misses you", Fabulous/Productive early paywall, BeReal window, Apple Rings closure pressure, red-missed convention), and a **proposed design guardrail** — a buildable Zero-Guilt substitute.
  - Each entry names the exact constraint it violates (CLAUDE.md §1 Zero-Guilt / §2 <2-second / §3 health claims, or a PRD principle) and the HerRays task that owns the guardrail.
  - Beyond the list: §4 meta-pattern analysis (category runs on four manufactured anxieties — loss/urgency/comparison/judgment), §5 consolidated "do this instead" guardrail design system + three product-defining guardrails, §6.1 severity tiering (hard-blocked / reject-mechanism / guardrail-and-allow), §6.3 reusable reviewer red-flag checklist for the PR template, §7 handoff map to 13 downstream tasks.
- **Verified:**
  - Acceptance criterion met — 20 anti-patterns (≥15), each with an observed example and a design guardrail (§3 master tables; coverage checklist §9).
  - Fully traceable: every anti-pattern grounded in an app already in TASK-001/002/003; explicitly wired to the 🚫/⚠️ feature rows (F17, F19, F20, F24, F28, F29, F30, F41, F42); no new apps; no `[TBD]`/placeholder text.
  - Zero-Guilt alignment upheld and operationalized into a gate (§6.3); health-claim integrity (AP19/AP20) routed to TASK-006/024/042.
  - `cd prototype && npm run build` → exit code 0 (tsc strict + Vite, `✓ built in 94ms`).
- **Note:** Research-only task; no `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).

### TASK-003 — Reviewer approval · status: completed
- **APPROVED.** Acceptance criterion met and exceeded: `docs/research/competitor-feature-inventory.md` §3 inventories **42 deduplicated features** (≥30 required) categorized across all six required dimensions — onboarding (8), action (9), progression (9), social (5), personalization (6), monetization (5); the §3.6 count check and §7 coverage checklist reconcile exactly to 42.
- **Traceability & craft verified:** All 20 exemplar apps trace to TASK-001/002 with no new apps introduced; spot-checked signature attributions against the source teardowns and confirmed verbatim — Loop's exponential-moving-average "habit strength" (F21), Way of Life's Yes/No/Skip (F11), and Atoms' "I am the kind of person who…" identity framing (F03). Real deduplication rule (§2.2 mechanism-not-art), original frameworks (three-tier map, prevalence×verdict distribution, ⭕ open-gap analysis, §4.4 bill of materials). No `[TBD]`, placeholders, or filler.
- **Standards confirmed:** Zero-Guilt upheld — brittle streak, XP economy, leaderboards, time-window and early hard paywall all scored 🚫 and routed to TASK-004; F26 habit-graduation gap surfaced as the signature differentiator per PRD Principle 5. `cd prototype && npm run build` → clean (tsc strict + Vite, `✓ built in 96ms`); no `any`/`@ts-ignore`/`TODO` in `prototype/src` (research-only task, no prototype changes).

### TASK-003 — Create competitor feature inventory · status: in_review
- **Deliverable:** `docs/research/competitor-feature-inventory.md` (~160 lines).
- **Built:** Deduplicated capability taxonomy that re-cuts the TASK-001/002 evidence base (all 20 apps) *by feature* instead of *by product*.
  - **42 features** inventoried across all six required categories: onboarding (F01–F08), action (F09–F17), progression (F18–F26), social (F27–F31), personalization (F32–F37), monetization (F38–F42) — exceeds the ≥30 acceptance threshold.
  - Each feature carries: representative exemplar apps, a prevalence label (table-stakes / common / rare-signature), a one-line mechanism pointer, and a Zero-Guilt verdict (✅ adopt / ⚠️ adapt / 🚫 reject / ⭕ open gap).
  - Explicit deduplication rule (§2.2): same-mechanism capabilities collapsed with multiple exemplars (e.g. all progress rings → F18); behaviorally-distinct metrics kept separate (brittle streak F19 ≠ decaying strength F21).
  - Cross-cutting synthesis: three-tier map (table-stakes/differentiator/anti-pattern), seven ⭕ open gaps with their HerRays home task, prevalence×verdict distribution table, and a composite "bill of materials" (§4.4) assembled only from ✅/⭕ rows.
  - Key finding surfaced: **F26 habit graduation/taper is absent in all 20 products** — HerRays' clearest differentiator (PRD Principle 5) and its hardest commercial question (routed to TASK-038).
  - Handoff table (§5) wires features to TASK-004 (anti-patterns), TASK-005 (evidence grading), TASK-011–013 (concepts), TASK-014 (scorecard), TASK-020–032 (experience), TASK-038 (economics).
- **Verified:**
  - Acceptance criterion met — ≥30 features (42) categorized across all six dimensions; count check in §3 and coverage checklist §7.
  - Fully traceable: every feature grounded in an app already documented in TASK-001/002; no new apps introduced; no `[TBD]`/placeholder text.
  - Zero-Guilt alignment upheld — 6 outright rejects (streak reset, XP economy, leaderboards, time-window, hard paywall) routed to TASK-004 with forward pointers; engagement-≠-efficacy caution restated.
  - `cd prototype && npm run build` → exit code 0 (tsc strict + Vite, `✓ built in 95ms`).
- **Note:** Research-only task; no `prototype/src` changes. Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).

### TASK-001 — Audit 12 direct habit-app competitors · status: in_review
- **Deliverable:** `docs/research/competitor-teardown-direct-habit-apps.md` (240 lines).
- **Built:** Publication-grade competitive teardown of 12 named direct habit apps (Finch, Habitica, Streaks, (Not Boring) Habits, Fabulous, Atoms, Way of Life, Productive, Habitify, HabitKit, Loop Habit Tracker, Routinery).
  - Master comparison table covering all five required dimensions (onboarding, daily loop, rewards, friction, pricing) for every app.
  - Per-app teardowns extracting signature mechanism, difficult-to-copy advantage, and a guilt/streak flag mapped to the Zero-Guilt constraint.
  - Cross-cutting analysis: time-to-first-reward tiers, four reward archetypes, streak-design spectrum, onboarding-vs-activation, contextual cueing.
  - Guilt/friction audit feeding TASK-004; positioning implications and verification notes.
- **Verified:**
  - Acceptance criterion met — comparison table with 12 named apps and all five dimensions populated.
  - No placeholder text; mechanisms (not just features) extracted per PRD §1; pricing flagged approximate/verify.
  - `cd prototype && npm run build` → exit code 0 (TypeScript strict + Vite bundle clean).
- **Note:** Deliverable existed from a prior run but task status was left `pending`; advanced to `in_review` after verification. Not committed (awaiting Reviewer approval).

### TASK-002 — Audit 8 adjacent-category products · status: in_review
- **Deliverable:** `docs/research/adjacent-category-audit.md` (~130 lines).
- **Built:** Publication-grade audit of 8 non-habit products spanning the PRD's adjacent arenas (games, learning, planning, self-care): Duolingo, Pokémon GO, Headspace, Apple Fitness (Activity Rings), Tiimo, BeReal, Ring Fit Adventure, Forest.
  - Master table (§3) with mechanism + user benefit + transfer risk for all 8, plus a Zero-Guilt adopt/adapt/reject verdict per product.
  - Per-product teardowns (§4) restating the signature mechanism, labeling the underlying behavioral principle, and giving a de-risked HerRays application.
  - Cross-cutting synthesis: 2×2 mechanism map locating HerRays' open "gentle motivation → real action" quadrant; five transferable engines (ranked by fit); four guilt/pressure engines to engineer against (feeds TASK-004); standing engagement-≠-efficacy caution routed to TASK-005.
- **Verified:**
  - Acceptance criterion met — 8 documented products, each with mechanism, user benefit and transfer risk (§3 + §4; coverage checklist §8).
  - No placeholder text; mechanisms (not just features) extracted per PRD §1; deliberately scoped to NON-habit products (direct competitors covered in TASK-001).
  - `cd prototype && npm run build` → exit code 0 (TypeScript strict + Vite bundle clean).
- **Note:** Not committed (awaiting Reviewer approval per CLAUDE.md workflow rules).

### TASK-002 — Reviewer approval · status: completed
- **APPROVED.** Acceptance criterion met: `docs/research/adjacent-category-audit.md` documents eight non-habit products (Duolingo, Pokémon GO, Headspace, Apple Fitness Activity Rings, Tiimo, BeReal, Ring Fit Adventure, Forest), each with a mechanism, user benefit and transfer risk in both the §3 master table and the §4 per-product teardowns — correctly scoped to adjacent arenas and non-overlapping with TASK-001.
- **Craft & standards verified:** Mechanism-first (not feature lists), each labeled with its behavioral principle, plus original frameworks (gentle-vs-pressure 2×2 map, five ranked transferable engines, four anti-pattern engines feeding TASK-004). Zero-Guilt upheld — names and rejects streak-loss, FOMO windows, closure-pressure and withering penalties; engagement-≠-efficacy caution routed to TASK-005. No `[TBD]`, placeholders or filler.
- **Build confirmed:** `cd prototype && npm run build` → clean (tsc strict + Vite, `✓ built in 95ms`); no `any`/`@ts-ignore`/`TODO` in `prototype/src`.

### TASK-001 — Reviewer approval · status: completed
- **APPROVED.** Acceptance criterion met: `docs/research/competitor-teardown-direct-habit-apps.md` §3 is a complete 12-app × 5-dimension (onboarding, daily loop, rewards, friction, pricing) comparison table, with every cell populated and all 12 apps real and correctly characterized.
- **Craft verified:** Extracts mechanisms over features and layers original frameworks (time-to-first-reward tiers, four reward archetypes, streak-design spectrum, onboarding-vs-activation) plus per-app defensibility reads and Zero-Guilt-mapped guilt/streak flags; honest confidence tags and a §8 verification list rather than filler. No TODOs, placeholders, or fake content.
- **Standards confirmed:** Zero-Guilt alignment upheld (names punitive streaks/HP as anti-patterns, surfaces Skip/decaying-strength/accrual as adoptable guilt-reducers); `cd prototype && npm run build` passes clean (tsc strict + Vite, no errors); no `any`/`@ts-ignore` in `prototype/src`.
