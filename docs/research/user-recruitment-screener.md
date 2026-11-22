# User Recruitment Screener — HerRays Behavioral Discovery

**Task:** TASK-007 · **Workstream:** Research · **Status:** in_review
**Owner:** UX researcher (per PRD team table) · **Reviewers:** Preventive-health specialist (safety/exclusion gates), Product strategist (segment fit)
**Feeds:** TASK-008 (behavioral interviews), TASK-009 (14-day diary study), TASK-010 (primary audience & JTBD), TASK-039 (onboarding usability), TASK-040 (30-day pilot)
**Last reviewed:** 2026-11-22 · **Next due:** before first interview invite is sent

---

## 1. Purpose and scope

This screener is the single intake instrument that routes candidates into HerRays' Stage-2 discovery work (PRD §2): the ~15 behavioral interviews (TASK-008) and the 14-day diary study (TASK-009). Its job is narrow and specific:

1. **Classify** each respondent into exactly one of three target segments — or screen them out — using behavior they report, not aspirations they endorse.
2. **Enforce safety and integrity exclusions** so we never recruit people for whom tiny-habit prompting is inappropriate, or whose presence would bias findings (industry insiders, serial study participants).
3. **Stay neutral.** The screener must not telegraph what HerRays is, which answers are "good," or that a habit/wellness app is involved, because Stage-2's entire value is observing *real* decisions rather than coached ones (PRD §2, §4 "without coaching participants toward the intended reaction").

**Out of scope:** this is a recruitment filter, not an interview guide or consent form. The interview protocol (TASK-008) and diary instructions (TASK-009) are separate documents. Informed consent and data handling are governed by TASK-041; this screener collects the *minimum* needed to classify and schedule, and nothing of optional health detail.

---

## 2. Design principles (why this screener looks the way it does)

| # | Principle | How it shows up here |
|---|---|---|
| D1 | **Behavior over intention.** | Segment questions ask what the respondent *did* in the last 1–12 months (installed, abandoned, sustained), never whether they "want to be healthier." |
| D2 | **Blind to the hypothesis.** | Framed as a generic "study about daily routines and everyday technology." The words *habit*, *streak*, *wellness*, *HerRays* never appear. No answer is visibly rewarded. |
| D3 | **Balanced option sets.** | Multiple-choice options present success and failure as equally normal (e.g., "I kept it up" sits beside "I stopped within a couple of weeks" with no positive/negative styling). |
| D4 | **Zero-guilt even in recruitment.** | Nothing implies that stopping an app, missing days, or "failing" at habits is a deficiency. This is consistent with CLAUDE.md §1 — the attitude starts at first contact. |
| D5 | **Safety first, non-diagnostic.** | Health exclusions (E5–E6) are phrased as eligibility logistics, not a health interrogation; they screen *out* without collecting diagnoses or implying risk, consistent with the prevention-action evidence rubric (`prevention-action-evidence-rubric.md`) and TASK-041. |
| D6 | **Quota-aware, not first-come.** | Classification supports the PRD's deliberately mixed sample (abandoners, successful builders, busy beginners) rather than whoever answers fastest. |

---

## 3. Segment definitions

Three mutually exclusive target segments, derived from the PRD §2 participant list and the differentiation thesis (habit apps help people *track*; HerRays removes the *work of creating*). Each candidate is assigned to the **first** segment whose inclusion rule they satisfy, in the priority order below; if none match, they are a soft screen-out ("not a fit for this round").

### Segment A — Abandoned-app users ("the lapsed")
- **Definition:** Has installed at least one habit-, routine-, fitness-, or wellness-tracking app in the **last 12 months** and **stopped using it within roughly 30 days** of starting.
- **Why we need them:** They are the core commercial opportunity and the population most likely to reveal the friction, guilt, and effort failures catalogued in `competitor-anti-patterns.md`. They tell us what breaks.
- **Inclusion signal:** Q4 = installed in last 12 mo **AND** Q5 = "stopped within a few days / within a couple of weeks / within about a month."
- **Target quota:** interviews ~6 of 15; diary ~4 of 10.

### Segment B — Successful habit builders ("the sustainers")
- **Definition:** Has a **self-reported daily or near-daily routine behavior they have sustained for 3+ months** — with or without an app (app-free sustainers are explicitly welcome and valuable).
- **Why we need them:** They reveal the real-world cues, restart tactics, and graduation moments that evidence (`behavior-change-evidence-register.md`) says drive automaticity — the mechanisms HerRays wants to engineer (PRD Principle 5, habit graduation).
- **Inclusion signal:** Q6 = "yes, 3 months or longer" for at least one everyday routine.
- **Target quota:** interviews ~4 of 15; diary ~3 of 10.

### Segment C — Busy beginners ("the time-starved aspirants")
- **Definition:** Self-reports **high day-to-day time pressure** (work, caregiving, study, shift patterns) **and** has **not** sustained a deliberate daily routine in the last 3 months, but is open to small changes.
- **Why we need them:** This is HerRays' "ridiculously small first action" thesis under its hardest test — people with the least spare attention (PRD Principle 1, <2-second completion in CLAUDE.md §2).
- **Inclusion signal:** Q7 indicates frequent time pressure **AND** Q6 = "no" (no 3-month sustained routine).
- **Target quota:** interviews ~5 of 15; diary ~3 of 10.

**Priority order when multiple match:** A → B → C. Rationale: a lapsed user who is *also* currently busy is most informative as an abandoner; a sustainer who is busy is most informative as a sustainer. This keeps segments clean for coded synthesis in TASK-008/010.

**Deliberately mixed, not representative.** This is a qualitative discovery sample sized for insight saturation, not statistical representativeness; quotas ensure each lived experience is present, and the sample's non-representativeness is an explicit limitation carried forward to TASK-010.

---

## 4. Exclusion rules

Applied **before** segment classification. Any single trigger screens the candidate out of this round. Screen-out copy is always warm and non-committal ("Thanks so much — you're not quite the fit for this particular study, but we'd love to keep your details for future research if you're open to it.").

| ID | Exclusion | Rule / trigger | Rationale |
|---|---|---|---|
| E1 | **Under 18** | Q1 age band = "Under 18." | Consent, safeguarding, and App Store audience scope; HerRays' launch audience is adults. |
| E2 | **Industry insider / competitor bias** | Q2 = works (now or in last 2 yrs) in habit/wellness/fitness app product, UX, behavioral-design, or market research. | Insiders answer through a professional lens, contaminating naïve-user observation (D2). |
| E3 | **Serial study participant** | Q3 = participated in 3+ paid user-research studies in the last 6 months. | "Professional respondents" give performative, rehearsed answers; dilutes authenticity (PRD §2 "observe real decisions"). |
| E4 | **No eligible smartphone** | Q8 = does not personally use a smartphone daily. | The diary study and future prototype are phone-based; non-users can't complete tasks. |
| E5 | **Health context requiring clinical oversight** | Q9 = respondent indicates a current condition, pregnancy, or clinician instruction under which changing daily physical activity, diet, hydration, or breathing routines should be guided by a professional. | Safety. HerRays makes **no** individual disease-risk or treatment claims (`prevention-action-evidence-rubric.md` §5; CLAUDE.md §3); we must not recruit people into tiny-action discovery where even general actions warrant medical guidance. Phrased as eligibility, collects no diagnosis. |
| E6 | **Active eating-disorder / disordered-eating sensitivity** | Q9 self-select "I'd prefer routines around food/exercise not be a focus for me right now." | Zero-guilt and do-no-harm; routine/food tracking can be harmful for this group. Non-judgmental opt-out, no detail requested. |
| E7 | **Unreachable / unavailable in window** | Q10 = cannot commit to a 45-min session (interviews) or ~2 min/day for 14 days (diary) in the study window. | Protects completion rate (TASK-009 needs ≥10 complete diaries). |
| E8 | **Internal / conflicted** | Free-text or known-email match to HerRays team, investors, or their households. | Confidentiality and bias. Checked against the project contact list at scheduling. |

**Quota-full is not an exclusion.** If a candidate is eligible but their segment quota is filled, they are *waitlisted*, not screened out, and told so honestly.

---

## 5. Screener questions (11 items)

Administer in order. Items are deliberately generic until Q4. All multiple-choice option sets are presented in neutral, non-evaluative styling (no green/red, no "recommended"). Routing logic is in brackets `[ ]` and is **not** shown to respondents.

**Intro shown to respondent:**
> "Thanks for your interest! We're running a short study about everyday routines and the apps and tools people use (or don't) in daily life. This 2-minute questionnaire just helps us see who's a fit for this round. There are no right or wrong answers — we're genuinely interested in how things actually go for you."

---

**Q1. Which age range are you in?**
☐ Under 18  ☐ 18–24  ☐ 25–34  ☐ 35–44  ☐ 45–54  ☐ 55–64  ☐ 65+
*[E1: "Under 18" → screen out. Capture band for sample balance.]*

**Q2. Do you currently work — or have you worked in the past two years — in any of the following? (Select all that apply)**
☐ Designing, building, or researching mobile apps
☐ Health, fitness, wellness, or behavior-change products or services
☐ Market or user research
☐ None of these
*[E2: any of the first three → screen out.]*

**Q3. In the last 6 months, how many paid research studies, surveys, or product tests have you taken part in?**
☐ None  ☐ 1–2  ☐ 3–5  ☐ 6 or more
*[E3: "3–5" or "6 or more" → screen out.]*

**Q4. In the last 12 months, have you installed any app meant to help you build a routine, track something you do daily, or support exercise, food, sleep, or wellbeing?**
☐ Yes, one  ☐ Yes, more than one  ☐ No  ☐ Not sure
*[Segment-A gate part 1. "No"/"Not sure" → skip Q5, continue.]*

**Q5. (If you installed one or more) Thinking of the most recent one — how long did you end up using it?**
☐ I tried it for a few days
☐ I used it for a couple of weeks
☐ I used it for about a month
☐ I've used it for a few months or more
☐ I still use it regularly
*[Segment-A gate part 2. First three options → eligible for Segment A. Last two → not A; continue to B/C logic. Neutral framing: stopping is presented as ordinary.]*

**Q6. Is there something you do for yourself most days — like a short walk, drinking water, stretching, reading, tidying, breathing, journaling — that you've kept up for a while?**
☐ Yes, and I've kept it up for 3 months or longer
☐ Yes, but for less than 3 months so far
☐ Not really at the moment
☐ I'd like to, but haven't managed to yet
*[Segment-B gate: first option → eligible for B. "Not really"/"I'd like to" → feeds Segment C. App NOT required — deliberately.]*

**Q7. How would you describe most of your days lately?**
☐ Packed — I rarely have spare time
☐ Busy, but I find small pockets of time
☐ A mix — some days full, some open
☐ Usually fairly open
*[Segment-C gate: first two options = "high time pressure." Combined with Q6 = no sustained routine → eligible for C.]*

**Q8. Do you personally use a smartphone on a typical day?**
☐ Yes, most days  ☐ Sometimes  ☐ No
*[E4: "No" → screen out. "Sometimes" → flag for scheduler, not auto-exclude.]*

**Q9. A couple of quick logistics so we match you to the right study. Do any of the following apply? (Select all that apply — this just helps us place you appropriately.)**
☐ A doctor or health professional has advised me to get guidance before changing my physical activity, diet, or similar daily routines
☐ I'm currently pregnant
☐ I'd prefer that routines involving food or exercise not be a focus for me right now
☐ None of these apply
*[E5: options 1 or 2 → screen out (routed to a future study with appropriate design, not this discovery round). E6: option 3 → screen out of any food/exercise-themed diary; may still qualify for non-food routine discovery if quota allows. Non-diagnostic: no condition, dosage, or detail is requested.]*

**Q10. This round involves either a single 45-minute video conversation, or a 14-day activity where you note a few things about your day (about 2 minutes daily). Over the next three weeks, could you take part in at least one of these?**
☐ Yes, the 45-minute conversation
☐ Yes, the 14-day activity
☐ Yes, either one
☐ Not during that window
*[E7: "Not during that window" → waitlist/screen out of this round. Others → route to interview vs. diary pool.]*

**Q11. Last one — how did you hear about this study, and is there anything you'd like us to know? (Optional, free text)**
*[E8 check: scan for internal/conflicted ties against project contact list at scheduling. Also a light source-attribution capture; not used for classification.]*

---

## 6. Classification logic (operational summary)

```
IF Q1 = Under 18                                              → SCREEN OUT (E1)
IF Q2 ∈ {app, health/wellness, research}                      → SCREEN OUT (E2)
IF Q3 ∈ {3–5, 6+}                                             → SCREEN OUT (E3)
IF Q8 = No                                                    → SCREEN OUT (E4)
IF Q9 ∈ {clinician-advised, pregnant}                         → SCREEN OUT (E5)
IF Q9 = food/exercise-sensitive                               → SCREEN OUT of food/exercise themes (E6)
IF Q10 = Not during window                                    → WAITLIST / SCREEN OUT (E7)
IF conflicted/internal (Q11 + contact-list check)             → SCREEN OUT (E8)

ELSE assign first matching segment (priority A → B → C):
  A  IF Q4 ∈ {one, more than one} AND Q5 ∈ {few days, couple weeks, about a month}
  B  IF Q6 = "3 months or longer"
  C  IF Q7 ∈ {packed, busy} AND Q6 ∈ {not really, would like to}

IF eligible but no segment matched                            → SOFT SCREEN OUT ("not a fit this round")
IF eligible AND segment matched AND segment quota full        → WAITLIST (told honestly)
ELSE                                                          → INVITE, route by Q10 to interview or diary pool
```

### Worked examples
- **R1:** 34, not industry, 1 prior study, installed a tracker 3 months ago, used it ~2 weeks, no sustained routine, busy days, smartphone daily, no health flags, available. → **Segment A** (abandoner). Clean core case.
- **R2:** 52, not industry, walks daily for 8 months (no app), moderate days, available. → **Segment B** (sustainer; app-free, deliberately valuable).
- **R3:** 29, caregiver, "packed" days, never sustained a routine, no recent app, smartphone daily, available. → **Segment C** (busy beginner).
- **R4:** 41, UX designer at a wellness app. → **Screen out (E2)** regardless of all else.
- **R5:** 38, clinician advised to get guidance before changing activity. → **Screen out (E5)**, routed warmly to a future appropriately-designed study, no diagnosis collected.

---

## 7. Neutrality & bias safeguards (self-audit)

- **No hypothesis leakage:** grep of this screener for `habit`, `streak`, `HerRays`, `wellness app`, `healthy` in respondent-facing copy → appears only in generic, balanced phrasing (Q4/Q6 list many neutral example behaviors; "wellbeing" appears once as one option among several). The product name never appears.
- **No answer is rewarded:** success and failure options are adjacent and equally weighted in every segment question (Q5, Q6, Q7). Stopping an app (Q5) is framed as ordinary, upholding Zero-Guilt from first contact (D4).
- **Health questions are eligibility, not interrogation (D5):** Q9 collects *no* diagnosis, severity, or history — only self-selected eligibility flags — and routes sensitively, consistent with the prevention-action evidence rubric and TASK-041 data-minimization.
- **Known limitations (carried to TASK-010):** self-report of past app use (Q5) is subject to recall error; "busy" (Q7) is subjective; the sample is purposive and non-representative by design. These are features of qualitative discovery, logged as explicit caveats rather than hidden.

---

## 8. Acceptance-criterion coverage

| TASK-007 acceptance requirement | Where satisfied |
|---|---|
| Segment definitions | §3 — three mutually exclusive segments (A abandoners, B sustainers, C busy beginners) with definitions, rationale, inclusion signals, quotas, and priority order. |
| Exclusion rules | §4 — eight exclusions (E1–E8) with explicit triggers and rationale; §6 operational logic. |
| 8–12 neutral questions | §5 — 11 respondent-facing questions, each audited for neutrality in §7. |

**Verification note:** Research-only deliverable; no `prototype/src` changes. `cd prototype && npm run build` confirmed exit 0. Not committed — awaiting Reviewer approval per CLAUDE.md workflow rules.
