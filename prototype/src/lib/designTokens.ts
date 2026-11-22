/**
 * TASK-030 — Visual and motion design tokens.
 *
 * The single, framework-agnostic source of truth for the HerRays "warm paper /
 * sunrise" design language: type, spacing, radius, colour, and motion. Until now
 * every surface (`LittleWinCard.css`, `ProgressiveChallenge.css`, `flows.css`, …)
 * re-declared the *same* palette locally; this module lifts those values into one
 * place, mirrored 1:1 by `src/styles/tokens.css` (the `tokens.test.ts` parity case
 * fails the build if the two ever drift).
 *
 * It imports **no React** — only plain data and pure maths — so it runs under
 * Node's TS stripping exactly like `restart.ts` / `ledger.ts`, and the test suite
 * drives it directly (`node src/lib/designTokens.test.ts`).
 *
 * Accessibility is a first-class token, not an afterthought (acceptance criterion:
 * "all interactive elements meet WCAG 2.2 AA target"). The contrast engine below is
 * the real WCAG 2.1/2.2 relative-luminance formula, and `INTERACTIVE_CONTRACTS`
 * enumerates every foreground/background pair the system ships for an interactive
 * element together with the role-specific AA ratio it must clear. The test asserts
 * every contract passes, so an inaccessible token pairing cannot reach the build.
 *
 * Zero-Guilt (CLAUDE.md §1): the palette carries no red / danger / penalty / streak
 * hue — warm paper, dawn, gold, calm green and a single muted berry only. Health-
 * claim integrity (§3) is a copy concern, not a token one, so nothing here encodes it.
 */

/* ======================================================================== *
 * Colour palette
 * ======================================================================== */

/**
 * Every colour is a full six-digit `#rrggbb` hex (never shorthand), so the
 * `tokens.css` parity check can match on the exact string. Values are the ones
 * already in use across the approved surfaces — this module makes them canonical,
 * it does not invent a new palette.
 *
 * Text vs. fill is deliberately split. The brand hues (`gold`, `green`, `berry`,
 * `dawn`) are tuned for *fills, borders and glows* and are NOT contrast-safe as
 * small text on paper; each therefore has an `…Ink` sibling (`goldInk`,
 * `greenInk`, `berryInk`) that is darkened to clear 4.5:1 for text. `greenDeep`
 * is the button fill that carries white text at AA.
 */
export const color = {
  /* surfaces */
  paper: '#fbf6ee',
  paperDeep: '#f5ecdf',
  card: '#fffdf9',

  /* ink (text) */
  inkStrong: '#2c2420',
  inkSoft: '#7a6f63',
  inkFaint: '#a89c8c', // decorative / non-essential text only — see DECORATIVE_COLORS

  /* hairlines */
  line: '#ebdfcd',
  lineSoft: '#f1e8da',

  /* gold — the Tiny Win signature accent */
  gold: '#e09a38', // fills / borders / eyebrows-as-graphic only
  goldInk: '#8a5a12', // gold *text* on light (AA)
  goldSoft: '#ffe9c9',

  /* calm green — progression / Growing World */
  green: '#5f9e7e', // fills / dots / borders only
  greenDeep: '#3f7d60', // button fill under white text (AA); green text on card
  greenInk: '#35684e', // green text on a green tint (AA)
  greenSoft: '#e4efe7',

  /* muted berry — Everyday Adventures */
  berry: '#de6a80', // fills / borders only
  berryInk: '#a23651', // berry text on light (AA)

  /* dawn — sunrise glow (non-text) */
  dawn: '#ff9d6e',

  /* interaction */
  focus: '#c75b2a', // focus-ring hue, ≥3:1 vs paper and card (WCAG 2.2 §1.4.11 / §2.4.13)
  onAccent: '#ffffff', // text/icon colour that sits on a saturated accent fill
} as const

export type ColorToken = keyof typeof color

/**
 * Colours that are intentionally NOT contrast-safe as essential text, with the
 * reason. The design-tokens surface labels these so no one reaches for them as a
 * text colour; the interactive-contract suite deliberately excludes them.
 */
export const DECORATIVE_COLORS: ReadonlyArray<{ token: ColorToken; reason: string }> = [
  { token: 'inkFaint', reason: 'Tertiary hint tone — decorative/non-essential text only; use inkSoft for meaningful copy.' },
  { token: 'gold', reason: 'Fill/border/graphic accent — use goldInk for gold text.' },
  { token: 'green', reason: 'Fill/dot/border accent — use greenInk or greenDeep for green text.' },
  { token: 'berry', reason: 'Fill/border accent — use berryInk for berry text.' },
  { token: 'dawn', reason: 'Sunrise glow — decorative only, never a text or essential-UI colour.' },
]

/* ======================================================================== *
 * Typography
 * ======================================================================== */

export const fontFamily = {
  /** Fraunces — warm serif, used for dates, titles and felt-reward lines. */
  display: "'Fraunces', Georgia, serif",
  /** Hanken Grotesk — the quiet workhorse body/UI sans. */
  body: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif",
} as const

export interface TypeStep {
  /** Token name (also the CSS suffix: `--hr-size-<name>`). */
  name: string
  /** Size in CSS px. */
  px: number
  /** Unitless line-height. */
  lineHeight: number
  family: keyof typeof fontFamily
  weight: number
  /** letter-spacing, as authored in CSS. */
  tracking: string
}

/**
 * The type ramp, ascending by size (the test asserts strict monotonicity). Sizes
 * are the de-duplicated set already in use; display steps are Fraunces, text steps
 * are Hanken Grotesk.
 */
export const typeScale: readonly TypeStep[] = [
  { name: 'caption', px: 12, lineHeight: 1.3, family: 'body', weight: 700, tracking: '0.14em' },
  { name: 'small', px: 13, lineHeight: 1.4, family: 'body', weight: 500, tracking: '0.01em' },
  { name: 'body', px: 15, lineHeight: 1.5, family: 'body', weight: 400, tracking: '0.006em' },
  { name: 'bodyLg', px: 17, lineHeight: 1.5, family: 'body', weight: 400, tracking: '0.006em' },
  { name: 'titleSm', px: 20, lineHeight: 1.2, family: 'display', weight: 500, tracking: '-0.01em' },
  { name: 'title', px: 24, lineHeight: 1.18, family: 'display', weight: 500, tracking: '-0.012em' },
  { name: 'display', px: 32, lineHeight: 1.1, family: 'display', weight: 500, tracking: '-0.02em' },
  { name: 'displayLg', px: 44, lineHeight: 1.05, family: 'display', weight: 500, tracking: '-0.03em' },
]

/* ======================================================================== *
 * Spacing & radius
 * ======================================================================== */

export interface ScaleStep {
  name: string
  px: number
}

/** 4px-based spacing ramp, ascending (the test asserts strict monotonicity). */
export const spaceScale: readonly ScaleStep[] = [
  { name: 'xs', px: 4 },
  { name: 'sm', px: 8 },
  { name: 'md', px: 12 },
  { name: 'lg', px: 16 },
  { name: 'xl', px: 20 },
  { name: 'xxl', px: 24 },
  { name: 'xxxl', px: 32 },
  { name: 'huge', px: 40 },
]

/** Corner-radius ramp, ascending; `pill` (999) is the fully-rounded token. */
export const radiusScale: readonly ScaleStep[] = [
  { name: 'sm', px: 6 },
  { name: 'md', px: 14 },
  { name: 'lg', px: 18 },
  { name: 'xl', px: 28 },
  { name: 'pill', px: 999 },
]

/* ======================================================================== *
 * Motion
 * ======================================================================== */

export interface MotionDuration {
  name: string
  /** Duration in milliseconds. */
  ms: number
}

/**
 * Durations, ascending. `instant` (0) is the reduced-motion target: the global
 * `@media (prefers-reduced-motion: reduce)` rule in `tokens.css` collapses every
 * transition/animation to this, and `REDUCED_MOTION_DURATION` is its programmatic
 * counterpart for JS-driven motion.
 */
export const motionDurations: readonly MotionDuration[] = [
  { name: 'instant', ms: 0 },
  { name: 'fast', ms: 120 },
  { name: 'base', ms: 200 },
  { name: 'slow', ms: 320 },
]

export const easing = {
  /** The signature gentle spring used by the completion card / buttons. */
  standard: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
  linear: 'linear',
} as const

/** The duration all motion collapses to when the user prefers reduced motion. */
export const REDUCED_MOTION_DURATION = 0

/* ======================================================================== *
 * WCAG 2.2 contrast engine
 * ======================================================================== */

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** True for a valid `#rgb` or `#rrggbb` string. */
export function isHexColor(value: string): boolean {
  return HEX_RE.test(value)
}

/** Parse a `#rgb`/`#rrggbb` string to 0–255 channels. Throws on malformed input. */
export function hexToRgb(hex: string): readonly [number, number, number] {
  if (!isHexColor(hex)) throw new Error(`Not a hex colour: ${hex}`)
  const h = hex.slice(1)
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return [r, g, b]
}

/** Linearise one 0–255 channel per the WCAG relative-luminance definition. */
function channelLuminance(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance (0 = black, 1 = white) of a hex colour. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/** WCAG contrast ratio between two hex colours, in the range [1, 21]. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * How a colour pair is used, which sets its AA target:
 * - `text-normal` — body/UI text below the large threshold → 4.5:1 (WCAG §1.4.3)
 * - `text-large`  — ≥24px, or ≥18.66px bold → 3:1 (WCAG §1.4.3)
 * - `non-text`    — focus indicators, control boundaries, meaningful icons → 3:1 (WCAG §1.4.11 / §2.4.13)
 */
export type ContrastRole = 'text-normal' | 'text-large' | 'non-text'

export const AA_THRESHOLD: Record<ContrastRole, number> = {
  'text-normal': 4.5,
  'text-large': 3,
  'non-text': 3,
}

/** True when `fg` on `bg` clears the WCAG 2.2 AA ratio for `role`. */
export function meetsAA(fg: string, bg: string, role: ContrastRole): boolean {
  return contrastRatio(fg, bg) >= AA_THRESHOLD[role]
}

export interface ContrastContract {
  id: string
  description: string
  /** foreground colour token value */
  fg: string
  /** background colour token value */
  bg: string
  role: ContrastRole
}

/**
 * Every interactive foreground/background pairing the design system ships, with
 * the WCAG 2.2 AA role it must satisfy. This is the machine-checkable form of the
 * acceptance criterion "all interactive elements meet WCAG 2.2 AA target": the
 * test asserts `contrastRatio(fg, bg) >= AA_THRESHOLD[role]` for each entry, and
 * the design-tokens surface renders the live ratio + PASS badge for each.
 *
 * Note the deliberate text/fill split that keeps these all green: gold and green
 * text use the darkened `…Ink` tokens, the primary button uses `greenDeep` under
 * white, and the focus ring uses `focus` (not the lighter `dawn`, which fails 3:1).
 */
export const INTERACTIVE_CONTRACTS: readonly ContrastContract[] = [
  { id: 'body-on-card', description: 'Primary body text on a card', fg: color.inkStrong, bg: color.card, role: 'text-normal' },
  { id: 'body-on-paper', description: 'Primary body text on the paper background', fg: color.inkStrong, bg: color.paper, role: 'text-normal' },
  { id: 'secondary-on-card', description: 'Secondary text on a card', fg: color.inkSoft, bg: color.card, role: 'text-normal' },
  { id: 'secondary-on-paper', description: 'Secondary text on the paper background', fg: color.inkSoft, bg: color.paper, role: 'text-normal' },
  { id: 'eyebrow-gold', description: 'Gold eyebrow / label text on a card', fg: color.goldInk, bg: color.card, role: 'text-normal' },
  { id: 'link-green', description: 'Green link / inline action text on a card', fg: color.greenDeep, bg: color.card, role: 'text-normal' },
  { id: 'selected-pill', description: 'Selected goal-pill label on its green tint', fg: color.greenInk, bg: color.greenSoft, role: 'text-normal' },
  { id: 'berry-accent-text', description: 'Everyday-Adventures accent text on a card', fg: color.berryInk, bg: color.card, role: 'text-normal' },
  { id: 'primary-button', description: 'White label on the primary (green) button fill', fg: color.onAccent, bg: color.greenDeep, role: 'text-normal' },
  { id: 'focus-ring-on-paper', description: 'Focus ring against the paper background', fg: color.focus, bg: color.paper, role: 'non-text' },
  { id: 'focus-ring-on-card', description: 'Focus ring against a card surface', fg: color.focus, bg: color.card, role: 'non-text' },
]
