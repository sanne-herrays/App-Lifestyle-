# HerRays — Build Progress Log

## 2026-11-22

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
