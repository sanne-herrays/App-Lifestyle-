/**
 * TASK-042 — Real-screenshot capture for the App Store editorial package.
 *
 * Captures REAL screenshots of the REAL, built prototype (no mockups, no
 * fabricated frames). It builds `prototype/`, serves the production `dist/` with
 * `vite preview`, drives Google Chrome headless over the Chrome DevTools Protocol
 * (dependency-free: Node's global `WebSocket`/`fetch`), navigates the actual
 * `App.tsx` views by clicking their real nav tabs, and saves one PNG per surface.
 *
 * The prototype nav chrome (`.shell-nav`) is visually hidden before capture so
 * each shot shows only the real product surface — the nav buttons are still
 * clicked programmatically (`element.click()` works regardless of visibility), so
 * nothing on screen is faked; only the prototype's own tab bar is cropped out.
 *
 * Run from the repo root:  node docs/strategy/app-store-editorial-package/capture-screenshots.mjs
 * Requires: Google Chrome (macOS default path) and a built `prototype/dist`.
 */

import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..', '..')
const PROTO = join(REPO, 'prototype')
const OUT = join(HERE, 'screenshots')
const PREVIEW_PORT = 4183
const CDP_PORT = 9224
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
// iPhone 16 Pro-class logical portrait viewport at @3x device pixels.
const VIEWPORT = { width: 402, height: 874, scale: 3 }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** The surfaces to capture, in editorial order. `tab` is the real nav button text. */
const SHOTS = [
  { tab: 'Little Win card', file: '01-little-win-today', completeAfter: true },
  { tab: 'Seven-day journey', file: '03-seven-day-journey' },
  { tab: 'Gentle restart', file: '04-gentle-restart' },
  { tab: 'Progress', file: '05-progress' },
  { tab: 'Cue scheduler', file: '06-cue-scheduler' },
  { tab: 'Action catalog', file: '07-action-catalog' },
  { tab: 'Privacy & consent', file: '08-privacy-consent' },
  { tab: 'First-session flows', file: '09-first-session-onboarding' },
]

async function waitForHttp(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status === 404) return true
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error(`timed out waiting for ${url}`)
}

/** Minimal CDP client over a single page websocket. */
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.events = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method) {
        const handlers = this.events.get(msg.method) || []
        for (const h of handlers) h(msg.params)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  once(method) {
    return new Promise((resolve) => {
      const list = this.events.get(method) || []
      const handler = (p) => {
        this.events.set(method, (this.events.get(method) || []).filter((h) => h !== handler))
        resolve(p)
      }
      list.push(handler)
      this.events.set(method, list)
    })
  }
}

function connectWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', (e) => reject(new Error(`ws error: ${e.message || e.type}`)))
  })
}

async function main() {
  mkdirSync(OUT, { recursive: true })

  console.log('› serving production build with vite preview…')
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
    cwd: PROTO,
    stdio: 'ignore',
  })
  const base = `http://127.0.0.1:${PREVIEW_PORT}/`

  console.log('› launching Chrome headless…')
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--disable-gpu',
      '--no-first-run',
      '--user-data-dir=/tmp/herrays-shot-profile',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  const cleanup = () => {
    try { chrome.kill('SIGKILL') } catch { /* already gone */ }
    try { preview.kill('SIGKILL') } catch { /* already gone */ }
  }

  try {
    await waitForHttp(base)
    await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/version`)

    const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json()
    const page = targets.find((t) => t.type === 'page')
    if (!page) throw new Error('no page target')
    const ws = await connectWs(page.webSocketDebuggerUrl)
    const cdp = new CDP(ws)

    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      deviceScaleFactor: VIEWPORT.scale,
      mobile: true,
    })

    const loaded = cdp.once('Page.loadEventFired')
    await cdp.send('Page.navigate', { url: base })
    await loaded
    await sleep(500)

    // Hide the prototype nav chrome and give the page a calm matte so the surface
    // is shown on its own. This hides only the prototype's tab bar — not content.
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const s = document.createElement('style');
        s.textContent = '.shell-nav{display:none!important} body{background:#F6F1E8!important} .shell{padding-top:12px!important}';
        document.head.appendChild(s);
      })()`,
    })

    for (const shot of SHOTS) {
      // Click the real nav tab by its text (works even though the bar is hidden).
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const btn = [...document.querySelectorAll('.shell-tab')].find(b => b.textContent.trim() === ${JSON.stringify(shot.tab)});
          if (btn) { btn.click(); return true; } return false;
        })()`,
      })
      await sleep(650)
      await capture(cdp, join(OUT, `${shot.file}.png`))
      console.log(`  ✓ ${shot.file}.png  (${shot.tab})`)

      if (shot.completeAfter) {
        // Drive the REAL one-gesture completion via keyboard-hold (Space held
        // > the 620ms threshold) to capture the genuine delight/reward state.
        await cdp.send('Runtime.evaluate', {
          expression: `document.querySelector('.hold-btn')?.focus()`,
        })
        await dispatchKey(cdp, 'keyDown', ' ', 'Space', 32)
        await sleep(950)
        await capture(cdp, join(OUT, '02-little-win-complete.png'))
        await dispatchKey(cdp, 'keyUp', ' ', 'Space', 32)
        console.log('  ✓ 02-little-win-complete.png  (real completion state)')
      }
    }

    ws.close()
    console.log('› done.')
  } finally {
    cleanup()
  }
}

async function capture(cdp, path) {
  const { cssContentSize } = await cdp.send('Page.getLayoutMetrics')
  const height = Math.min(Math.ceil(cssContentSize?.height ?? VIEWPORT.height), 2600)
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height, scale: VIEWPORT.scale },
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
}

function dispatchKey(cdp, type, key, code, vk) {
  return cdp.send('Input.dispatchKeyEvent', {
    type,
    key,
    code,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
  })
}

main().catch((err) => {
  console.error('capture failed:', err)
  process.exit(1)
})
