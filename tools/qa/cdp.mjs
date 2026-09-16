// Shared headless-Chrome harness, driven over the DevTools protocol. Zero dependencies, Node 22
// (global WebSocket and fetch). Promoted from cruise-passport/tools/qa/cdp.mjs, which stays in
// place as that project's own copy.
//
// What it hard-codes, because every hand-typed chrome.exe line got at least one of them wrong:
//   - an isolated --user-data-dir under the OS temp directory, one per run, removed afterwards.
//     A bare chrome.exe attaches to the user's already-running Chrome and silently ignores every
//     headless flag, so --screenshot writes nothing and exit code is still 0.
//   - --hide-scrollbars and --force-color-profile=srgb, so the image is the true page and true colour.
//   - --remote-debugging-port=0 plus the DevToolsActivePort file, so parallel runs never collide.
//   - real readiness polling (load event, network idle, fonts, two animation frames) in place of
//     --virtual-time-budget, which fast-forwards timers and exits without waiting for real I/O.
//   - taskkill on the captured pid only, never a broad Chrome filter.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const CHROME_CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

export function chromePath() {
  const hit = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!hit) throw new Error('chrome not found; set CHROME to the executable path')
  return hit
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Chrome lays out at 500 CSS px minimum for --window-size. Below that a plain --screenshot crops
// the right edge instead of reflowing, which reads exactly like an overflow bug. launch() opens the
// window at the floor and page() sets the real CSS viewport with Emulation.setDeviceMetricsOverride,
// which does reflow correctly.
export const WIDTH_FLOOR = 500

const GPU_ON = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']

export async function launch({ width = 1200, height = 800, gpu = true, timeout = 30000 } = {}) {
  // The profile lives in the OS temp directory and nowhere else: thousands of files inside a project
  // folder reload-storm any dev server watching the tree, and they outlive the run.
  const profile = mkdtempSync(path.join(tmpdir(), 'visual-verify-'))
  if (!path.resolve(profile).startsWith(path.resolve(tmpdir()))) {
    throw new Error(`refusing to run: profile ${profile} is outside the temp directory`)
  }

  const child = spawn(chromePath(), [
    '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    `--window-size=${Math.max(width, WIDTH_FLOOR)},${height}`,
    '--disk-cache-size=1', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-sync', '--disable-features=Translate',
    ...(gpu ? GPU_ON : ['--disable-gpu']),
    'about:blank',
  ], { stdio: 'ignore' })

  let exited = null
  child.on('exit', (code) => { exited = code })

  // DevToolsActivePort: line 1 the chosen port, line 2 the browser WebSocket path.
  const portFile = path.join(profile, 'DevToolsActivePort')
  let wsUrl
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (exited !== null) throw new Error(`chrome exited with code ${exited} before opening a debugging port`)
    if (existsSync(portFile)) {
      const [port, route] = readFileSync(portFile, 'utf8').split('\n')
      if (port && route) { wsUrl = `ws://127.0.0.1:${port.trim()}${route.trim()}`; break }
    }
    await sleep(100)
  }
  if (!wsUrl) throw new Error('chrome did not open a debugging port')

  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('could not attach to chrome')) })

  let id = 0
  const pending = new Map()
  const listeners = []
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
    } else if (msg.method) {
      for (const l of [...listeners]) l(msg)
    }
  }
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const m = ++id
    pending.set(m, { res, rej })
    ws.send(JSON.stringify({ id: m, method, params, sessionId }))
  })
  const waitFor = (method, sessionId, ms = 60000) => new Promise((res, rej) => {
    const t = setTimeout(() => { drop(); rej(new Error('timeout waiting for ' + method)) }, ms)
    const drop = () => { const i = listeners.indexOf(l); if (i > -1) listeners.splice(i, 1) }
    const l = (msg) => {
      if (msg.method !== method) return
      if (sessionId && msg.sessionId !== sessionId) return
      clearTimeout(t); drop(); res(msg.params)
    }
    listeners.push(l)
  })

  // One tab with its own storage, console capture and in-flight request count.
  async function page({ width: w = width, height: h = height, dsf = 1, mobile = false } = {}) {
    const { browserContextId } = await send('Target.createBrowserContext')
    const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
    await send('Page.enable', {}, sessionId)
    await send('Runtime.enable', {}, sessionId)
    await send('Network.enable', {}, sessionId)
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dsf, mobile }, sessionId)

    const logs = []
    // A set of request ids, not a counter: a redirect re-fires requestWillBeSent for the same id but
    // finishes once, so a counter never returns to zero and settle() waits out its whole cap.
    const inflight = new Set()
    let lastActivity = Date.now()
    listeners.push((msg) => {
      if (msg.sessionId !== sessionId) return
      if (msg.method === 'Network.requestWillBeSent') { inflight.add(msg.params.requestId); lastActivity = Date.now() }
      if (msg.method === 'Network.loadingFinished' || msg.method === 'Network.loadingFailed') { inflight.delete(msg.params.requestId); lastActivity = Date.now() }
      if (msg.method === 'Runtime.consoleAPICalled') logs.push(msg.params.type + ': ' + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
      if (msg.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text))
    })

    const p = {
      sessionId, logs,
      async eval(expr) {
        const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sessionId)
        if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text))
        return r.result.value
      },
      async goto(url, { timeout: nav = 45000 } = {}) {
        const load = waitFor('Page.loadEventFired', sessionId, nav)
        await send('Page.navigate', { url }, sessionId)
        await load
      },
      // Readiness, measured rather than assumed: network quiet, fonts resolved, two frames painted.
      async settle({ idle = 500, extra = 400, timeout: cap = 20000 } = {}) {
        const stop = Date.now() + cap
        while (Date.now() < stop) {
          if (inflight.size === 0 && Date.now() - lastActivity > idle) break
          await sleep(100)
        }
        try { await p.eval('document.fonts ? document.fonts.ready.then(() => true) : true') } catch {}
        try { await p.eval('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))') } catch {}
        if (extra > 0) await sleep(extra)
      },
      async geometry() {
        return JSON.parse(await p.eval('JSON.stringify({w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth, dh: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)})'))
      },
      async click(selector) {
        return p.eval(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true })()`)
      },
      async screenshot({ full = false, height: clipH } = {}) {
        const params = { format: 'png', captureBeyondViewport: full }
        if (full) params.clip = { x: 0, y: 0, width: w, height: Math.min(clipH || h, 16000), scale: 1 }
        const { data } = await send('Page.captureScreenshot', params, sessionId)
        return Buffer.from(data, 'base64')
      },
    }
    return p
  }

  async function close() {
    try { ws.close() } catch {}
    await new Promise((res) => {
      if (exited !== null) return res()
      child.once('exit', res)
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).on('error', () => { try { child.kill('SIGKILL') } catch {} })
      setTimeout(res, 5000).unref()
    })
    // Chrome releases the profile's locks a beat after it exits, so retry rather than leave it behind.
    for (let i = 0; i < 6; i++) {
      try { rmSync(profile, { recursive: true, force: true }); if (!existsSync(profile)) return } catch {}
      await sleep(300)
    }
    if (existsSync(profile)) console.error(`warning: could not remove the temporary profile ${profile}`)
  }

  return { page, send, close, profile }
}

// PNG geometry straight out of the IHDR chunk, so the printed size is the file's, not a claim.
export function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}
