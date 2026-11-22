import { useState } from 'react'
import './DesignTokens.css'
import { useReducedMotion } from '../flows/flowData'
import {
  AA_THRESHOLD,
  DECORATIVE_COLORS,
  INTERACTIVE_CONTRACTS,
  color,
  contrastRatio,
  easing,
  fontFamily,
  motionDurations,
  radiusScale,
  spaceScale,
  typeScale,
  type ColorToken,
  type ContrastRole,
} from '../lib/designTokens'

/**
 * TASK-030 — Visual & motion design tokens, made visible.
 *
 * A reachable specification surface for the token system in `lib/designTokens.ts`
 * / `styles/tokens.css`. It consumes the real tokens (no values are retyped here)
 * and renders them so the acceptance criterion is demonstrable, not just asserted
 * in the test:
 *   • the interactive-contrast contracts, each with its LIVE WCAG 2.2 ratio + AA
 *     verdict (the same `contrastRatio` the test uses);
 *   • the colour palette, with text tokens showing their contrast against a
 *     switchable surface and decorative tokens clearly flagged as non-text;
 *   • the type, spacing and radius ramps; and
 *   • motion samples that run on the duration/easing tokens and collapse to
 *     instant under `prefers-reduced-motion` (and the `.hr-reduce` class).
 *
 * Zero-Guilt (CLAUDE.md §1): nothing here uses an alarming red "fail" badge — a
 * below-AA pairing (shown only to justify the darker `…Ink` text tokens) reads in
 * a calm amber, never a danger colour.
 */

const DECORATIVE_SET = new Set<ColorToken>(DECORATIVE_COLORS.map((d) => d.token))
const DECORATIVE_REASON = new Map<ColorToken, string>(DECORATIVE_COLORS.map((d) => [d.token, d.reason]))

type SwatchKind = 'surface' | 'text' | 'fill' | 'line'
interface SwatchSpec {
  token: ColorToken
  label: string
  kind: SwatchKind
}

/** Ordered palette presentation — grouped, with each token's intended role. */
const PALETTE: readonly SwatchSpec[] = [
  { token: 'paper', label: 'Paper', kind: 'surface' },
  { token: 'paperDeep', label: 'Paper deep', kind: 'surface' },
  { token: 'card', label: 'Card', kind: 'surface' },
  { token: 'inkStrong', label: 'Ink', kind: 'text' },
  { token: 'inkSoft', label: 'Ink soft', kind: 'text' },
  { token: 'inkFaint', label: 'Ink faint', kind: 'text' },
  { token: 'goldInk', label: 'Gold ink', kind: 'text' },
  { token: 'greenDeep', label: 'Green deep', kind: 'text' },
  { token: 'greenInk', label: 'Green ink', kind: 'text' },
  { token: 'berryInk', label: 'Berry ink', kind: 'text' },
  { token: 'gold', label: 'Gold', kind: 'fill' },
  { token: 'goldSoft', label: 'Gold soft', kind: 'fill' },
  { token: 'green', label: 'Green', kind: 'fill' },
  { token: 'greenSoft', label: 'Green soft', kind: 'fill' },
  { token: 'berry', label: 'Berry', kind: 'fill' },
  { token: 'dawn', label: 'Dawn', kind: 'fill' },
  { token: 'line', label: 'Line', kind: 'line' },
  { token: 'lineSoft', label: 'Line soft', kind: 'line' },
  { token: 'focus', label: 'Focus', kind: 'fill' },
]

type PreviewSurface = 'card' | 'paper'

function Verdict({ ratio, role }: { ratio: number; role: ContrastRole }) {
  const need = AA_THRESHOLD[role]
  const pass = ratio >= need
  const label = role === 'non-text' ? 'AA · non-text' : 'AA · text'
  return (
    <span className={`dt-verdict${pass ? ' pass' : ' below'}`}>
      <span className="dt-ratio">{ratio.toFixed(2)}:1</span>
      <span className="dt-verdict-label">
        {pass ? `${label} ✓` : `below AA (needs ${need}:1)`}
      </span>
    </span>
  )
}

export default function DesignTokens() {
  const reduced = useReducedMotion()
  const [previewSurface, setPreviewSurface] = useState<PreviewSurface>('card')
  const previewBg = color[previewSurface]

  return (
    <section className={`dt${reduced ? ' hr-reduce' : ''}`} aria-labelledby="dt-title">
      <header className="dt-head">
        <p className="dt-eyebrow">Design system · TASK-030</p>
        <h1 className="dt-title" id="dt-title">
          Visual &amp; motion tokens
        </h1>
        <p className="dt-sub">
          One source of truth for type, spacing, colour and motion — the warm-paper
          language every HerRays surface shares. Every interactive pairing below is
          verified against the WCAG&nbsp;2.2&nbsp;AA target.
        </p>
      </header>

      {/* ---- contrast contracts (the acceptance proof) --------------------- */}
      <div className="dt-block">
        <h2 className="dt-h2">Interactive contrast · WCAG 2.2 AA</h2>
        <p className="dt-note">
          Live ratios, computed from the tokens by the same engine the test suite
          uses. Normal text targets 4.5:1; large text, focus rings and control
          boundaries target 3:1.
        </p>
        <ul className="dt-contracts">
          {INTERACTIVE_CONTRACTS.map((c) => {
            const ratio = contrastRatio(c.fg, c.bg)
            return (
              <li className="dt-contract" key={c.id}>
                <span
                  className="dt-contract-chip"
                  style={{ color: c.fg, background: c.bg }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span className="dt-contract-body">
                  <span className="dt-contract-name">{c.description}</span>
                  <span className="dt-contract-meta">
                    {c.fg} on {c.bg}
                  </span>
                </span>
                <Verdict ratio={ratio} role={c.role} />
              </li>
            )
          })}
        </ul>
      </div>

      {/* ---- palette ------------------------------------------------------- */}
      <div className="dt-block">
        <div className="dt-block-head">
          <h2 className="dt-h2">Colour</h2>
          <div
            className="dt-seg"
            role="radiogroup"
            aria-label="Preview text contrast against"
          >
            {(['card', 'paper'] as const).map((s) => (
              <label className={`dt-seg-opt${previewSurface === s ? ' on' : ''}`} key={s}>
                <input
                  type="radio"
                  name="dt-preview-surface"
                  value={s}
                  checked={previewSurface === s}
                  onChange={() => setPreviewSurface(s)}
                />
                on {s}
              </label>
            ))}
          </div>
        </div>
        <ul className="dt-palette">
          {PALETTE.map((sw) => {
            const value = color[sw.token]
            const decorative = DECORATIVE_SET.has(sw.token)
            const isText = sw.kind === 'text'
            return (
              <li className="dt-swatch" key={sw.token}>
                <span
                  className="dt-swatch-chip"
                  style={
                    isText
                      ? { background: previewBg, color: value, borderColor: color.line }
                      : { background: value, borderColor: color.line }
                  }
                  aria-hidden="true"
                >
                  {isText ? 'Aa' : ''}
                </span>
                <span className="dt-swatch-body">
                  <span className="dt-swatch-label">{sw.label}</span>
                  <span className="dt-swatch-hex">{value}</span>
                  {isText && !decorative ? (
                    <Verdict ratio={contrastRatio(value, previewBg)} role="text-normal" />
                  ) : null}
                  {decorative ? (
                    <span className="dt-swatch-tag" title={DECORATIVE_REASON.get(sw.token) ?? ''}>
                      {sw.kind === 'text' ? 'decorative text' : 'non-text / fill'}
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ---- type ---------------------------------------------------------- */}
      <div className="dt-block">
        <h2 className="dt-h2">Type</h2>
        <p className="dt-note">
          {fontFamily.display.split(',')[0]?.replace(/'/g, '')} for display,{' '}
          {fontFamily.body.split(',')[0]?.replace(/'/g, '')} for body &amp; UI.
        </p>
        <ul className="dt-type">
          {[...typeScale].reverse().map((t) => (
            <li className="dt-type-row" key={t.name}>
              <span
                className="dt-type-specimen"
                style={{
                  fontFamily: fontFamily[t.family],
                  fontSize: `${t.px}px`,
                  lineHeight: t.lineHeight,
                  fontWeight: t.weight,
                  letterSpacing: t.tracking,
                }}
              >
                A little win today
              </span>
              <span className="dt-type-meta">
                {t.name} · {t.px}px · {t.family}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- spacing & radius --------------------------------------------- */}
      <div className="dt-block dt-two">
        <div>
          <h2 className="dt-h2">Spacing</h2>
          <ul className="dt-ramp">
            {spaceScale.map((s) => (
              <li className="dt-ramp-row" key={s.name}>
                <span className="dt-ramp-bar" style={{ width: `${s.px}px` }} aria-hidden="true" />
                <span className="dt-ramp-meta">
                  {s.name} · {s.px}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="dt-h2">Radius</h2>
          <ul className="dt-radii">
            {radiusScale.map((r) => (
              <li className="dt-radius-row" key={r.name}>
                <span
                  className="dt-radius-box"
                  style={{ borderRadius: `${Math.min(r.px, 28)}px` }}
                  aria-hidden="true"
                />
                <span className="dt-ramp-meta">
                  {r.name} · {r.px === 999 ? 'pill' : r.px}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- motion -------------------------------------------------------- */}
      <div className="dt-block">
        <h2 className="dt-h2">Motion</h2>
        <p className="dt-note">
          {reduced
            ? 'Reduced-motion is on — every sample below is instant.'
            : 'Hover or focus a sample to see its duration on the standard spring. All collapse to instant under “reduce motion”.'}
        </p>
        <ul className="dt-motion">
          {motionDurations.map((m) => (
            <li key={m.name}>
              <button
                type="button"
                className="dt-motion-chip"
                style={{
                  transitionDuration: reduced ? '0ms' : `${m.ms}ms`,
                  transitionTimingFunction: easing.standard,
                }}
              >
                <span className="dt-motion-dot" aria-hidden="true" />
                {m.name} · {m.ms}ms
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
