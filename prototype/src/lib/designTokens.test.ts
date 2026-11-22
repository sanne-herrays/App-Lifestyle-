/// <reference types="node" />
/**
 * TASK-030 — Deterministic test cases for the visual & motion design tokens.
 *
 * Acceptance criterion (tasks.json TASK-030):
 *   "Tokens specify type, spacing, color, motion and contrast; all interactive
 *    elements meet WCAG 2.2 AA target."
 *
 * Dependency-free, self-contained (the prototype has no test runner), matching
 * the TASK-025…029 pattern. It is:
 *   • type-checked by the build — `tsc -b` compiles all of `src` strictly; and
 *   • directly executable — `node src/lib/designTokens.test.ts` runs it under
 *     Node's native TypeScript stripping (the engine is imported with a `.ts`
 *     specifier and imports no React). On any failure the process exits non-zero.
 *
 * Coverage maps 1:1 to the five things the criterion names:
 *   type     → the type ramp is present, well-formed and strictly ascending.
 *   spacing  → the spacing & radius ramps are present and strictly ascending.
 *   color    → every palette value is a valid six-digit hex.
 *   motion   → durations ascending, reduced-motion target is 0, easings present.
 *   contrast → the WCAG engine is correct against reference values, AND every
 *              INTERACTIVE_CONTRACT clears its WCAG 2.2 AA ratio (the machine-
 *              checkable form of "all interactive elements meet AA").
 * Plus a CSS-parity case that reads `styles/tokens.css` and asserts the TS source
 * of truth and the shipped custom properties cannot drift.
 */

/*
 * The CSS-parity case reads `styles/tokens.css` from disk, so it needs Node's
 * built-ins. The app tsconfig (`tsconfig.app.json`) is browser-scoped and omits
 * `@types/node`, so the `/// <reference types="node" />` directive at the top of
 * this file opts just this test into those types for `tsc -b`, while it still
 * runs under Node's native TS stripping (`node src/lib/designTokens.test.ts`).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  AA_THRESHOLD,
  DECORATIVE_COLORS,
  INTERACTIVE_CONTRACTS,
  REDUCED_MOTION_DURATION,
  color,
  contrastRatio,
  easing,
  fontFamily,
  hexToRgb,
  isHexColor,
  meetsAA,
  motionDurations,
  radiusScale,
  relativeLuminance,
  spaceScale,
  typeScale,
} from './designTokens.ts'

let passed = 0
const failures: string[] = []
function check(name: string, cond: boolean): void {
  if (cond) passed++
  else failures.push(name)
}
function approx(a: number, b: number, eps = 0.01): boolean {
  return Math.abs(a - b) <= eps
}
function strictlyAscending(nums: readonly number[]): boolean {
  return nums.every((n, i) => i === 0 || n > (nums[i - 1] ?? Number.NEGATIVE_INFINITY))
}

/* ---- contrast engine correctness (reference values) ---------------------- */
check('luminance of black is 0', relativeLuminance('#000000') === 0)
check('luminance of white is 1', relativeLuminance('#ffffff') === 1)
check('black vs white is 21:1', approx(contrastRatio('#000000', '#ffffff'), 21, 0.05))
check('identical colours are 1:1', contrastRatio('#ffffff', '#ffffff') === 1)
check('contrast is symmetric', approx(contrastRatio('#2c2420', '#fffdf9'), contrastRatio('#fffdf9', '#2c2420'), 1e-9))
check('hexToRgb parses full hex', hexToRgb('#2c2420').join(',') === '44,36,32')
check('hexToRgb expands shorthand', hexToRgb('#abc').join(',') === '170,187,204')
check('isHexColor accepts valid', isHexColor('#fffdf9') && isHexColor('#abc'))
check('isHexColor rejects invalid', !isHexColor('#xyz') && !isHexColor('fffdf9') && !isHexColor('#ff'))

/* The guard must be non-trivial: the legacy "white on light green #5f9e7e" pair
   really fails AA normal text (~3.1:1), while the fixed "white on #3f7d60" passes. */
check('engine catches the failing legacy button pair', meetsAA(color.onAccent, '#5f9e7e', 'text-normal') === false)
check('engine confirms the fixed button pair', meetsAA(color.onAccent, color.greenDeep, 'text-normal') === true)

/* ---- contrast: EVERY interactive contract meets WCAG 2.2 AA -------------- */
check('there are interactive contracts to check', INTERACTIVE_CONTRACTS.length >= 10)
const ratioReport: string[] = []
for (const c of INTERACTIVE_CONTRACTS) {
  const ratio = contrastRatio(c.fg, c.bg)
  const need = AA_THRESHOLD[c.role]
  ratioReport.push(`    ${c.id.padEnd(22)} ${ratio.toFixed(2)}:1  (needs ${need}:1, ${c.role})`)
  check(`AA · ${c.id} (${c.fg} on ${c.bg}) >= ${need}:1`, ratio >= need)
  check(`AA · ${c.id} agrees with meetsAA`, meetsAA(c.fg, c.bg, c.role) === true)
}

/* Decorative colours must never be used as an interactive foreground — that is
   exactly why each brand hue has an `…Ink` text sibling. */
const contractForegrounds = new Set(INTERACTIVE_CONTRACTS.map((c) => c.fg))
for (const d of DECORATIVE_COLORS) {
  const value = color[d.token]
  check(`decorative '${d.token}' exists in palette`, typeof value === 'string')
  check(`decorative '${d.token}' is never an interactive foreground`, !contractForegrounds.has(value))
}

/* ---- colour: palette well-formed ---------------------------------------- */
for (const [name, value] of Object.entries(color)) {
  check(`colour '${name}' is a valid hex`, isHexColor(value))
  check(`colour '${name}' is six-digit`, value.length === 7)
}

/* ---- type ramp ----------------------------------------------------------- */
check('type ramp is non-empty', typeScale.length >= 6)
check('type sizes strictly ascending', strictlyAscending(typeScale.map((t) => t.px)))
check('type sizes all positive', typeScale.every((t) => t.px > 0))
check('type line-heights all positive', typeScale.every((t) => t.lineHeight > 0))
check('type families resolve to a loaded family', typeScale.every((t) => t.family === 'display' || t.family === 'body'))
check('type weights in a sane range', typeScale.every((t) => t.weight >= 400 && t.weight <= 700))
check('both font families are defined', fontFamily.display.includes('Fraunces') && fontFamily.body.includes('Hanken Grotesk'))

/* ---- spacing & radius ramps ---------------------------------------------- */
check('spacing ramp is non-empty', spaceScale.length >= 6)
check('spacing strictly ascending', strictlyAscending(spaceScale.map((s) => s.px)))
check('spacing all positive', spaceScale.every((s) => s.px > 0))
check('radius ramp is non-empty', radiusScale.length >= 4)
check('radius strictly ascending', strictlyAscending(radiusScale.map((r) => r.px)))
check('radius includes a pill token', radiusScale.some((r) => r.px >= 999))

/* ---- motion -------------------------------------------------------------- */
check('motion durations strictly ascending', strictlyAscending(motionDurations.map((m) => m.ms)))
check('reduced-motion target is zero', REDUCED_MOTION_DURATION === 0)
check('instant duration exists and is zero', (motionDurations[0]?.ms ?? -1) === 0)
check('all durations non-negative', motionDurations.every((m) => m.ms >= 0))
check('standard easing is a cubic-bezier spring', easing.standard.startsWith('cubic-bezier('))
check('linear easing is defined', easing.linear === 'linear')

/* ---- CSS parity: tokens.css mirrors the TS source of truth --------------- */
const here = dirname(fileURLToPath(import.meta.url))
const cssPath = join(here, '..', 'styles', 'tokens.css')
const css = readFileSync(cssPath, 'utf8').toLowerCase()

for (const [name, value] of Object.entries(color)) {
  check(`css declares colour '${name}' (${value})`, css.includes(value.toLowerCase()))
}
for (const t of typeScale) check(`css declares type size ${t.px}px`, css.includes(`${t.px}px`))
for (const s of spaceScale) check(`css declares spacing ${s.px}px`, css.includes(`${s.px}px`))
for (const r of radiusScale) check(`css declares radius ${r.px}px`, css.includes(`${r.px}px`))
for (const m of motionDurations) check(`css declares duration ${m.ms}ms`, css.includes(`${m.ms}ms`))
check('css declares the display font', css.includes('fraunces'))
check('css declares the body font', css.includes('hanken grotesk'))
check('css declares the standard easing', css.includes('cubic-bezier(0.2, 0.9, 0.2, 1)'))
check('css honours prefers-reduced-motion', css.includes('prefers-reduced-motion: reduce'))
check('css exposes the instant/reduced duration token', css.includes('--hr-duration-instant'))

/* ---- report -------------------------------------------------------------- */
console.log('designTokens.test — interactive contrast contracts:')
for (const line of ratioReport) console.log(line)

if (failures.length) {
  console.log(`\ndesignTokens.test: ${failures.length} FAILED, ${passed} passed`)
  for (const f of failures) console.log('  ✗ ' + f)
  throw new Error(`${failures.length} design-token test case(s) failed`)
}
console.log(`\ndesignTokens.test: ${passed} passed, 0 failed`)
