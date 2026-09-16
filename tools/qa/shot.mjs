// One true-colour, true-width screenshot of any URL or local file. Zero dependencies, Node 22.
//
//   node shot.mjs --url <url|path> --out <file.png> [flags]
//
//   --url <url|path>   http(s):// or file:// URL, or a filesystem path (converted for you)
//   --out <file.png>   where the PNG goes; parent directories are created
//   --width <px>       CSS viewport width  (default 1200)
//   --height <px>      CSS viewport height (default 800)
//   --full             also capture the whole document height, not just the viewport
//   --wait <ms>        settle time after the page reports ready (default 400)
//   --dsf <n>          device scale factor, 2 for a retina-density image (default 1)
//   --mobile           emulate a mobile viewport (touch, mobile user agent hints)
//   --click <sel>      click this CSS selector after load, then settle again
//   --eval <js>        run this after load and print its JSON result
//   --no-gpu           drop SwiftShader; only for pages with no canvas or WebGL
//   --timeout <ms>     navigation timeout (default 45000)
//
// Prints the measured viewport, the document height, any horizontal overflow, the console errors,
// and the bytes and pixel size of every file written. Exits 1 if a file is missing or empty.
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { launch, pngSize, WIDTH_FLOOR } from './cdp.mjs'

const argv = process.argv.slice(2)
const opt = (k, d) => { const i = argv.indexOf(k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d }
const has = (k) => argv.includes(k)

const rawUrl = opt('--url')
const out = opt('--out')
if (!rawUrl || !out) {
  console.error('usage: node shot.mjs --url <url|path> --out <file.png> [--width 1200] [--height 800] [--full] [--wait 400] [--dsf 1] [--mobile] [--click sel] [--eval js] [--no-gpu] [--timeout 45000]')
  process.exit(2)
}
const url = /^[a-z]+:\/\//i.test(rawUrl) ? rawUrl : pathToFileURL(path.resolve(rawUrl)).href
const width = Number(opt('--width', 1200))
const height = Number(opt('--height', 800))
const wait = Number(opt('--wait', 400))
const dsf = Number(opt('--dsf', 1))
const timeout = Number(opt('--timeout', 45000))
const outPath = path.resolve(out)

if (width < WIDTH_FLOOR) {
  console.error(`warning: ${width}px is below Chrome's ${WIDTH_FLOOR}px --window-size floor. A plain --screenshot at this width crops the right edge instead of reflowing, which looks like an overflow bug. This run sets the CSS viewport with Emulation.setDeviceMetricsOverride, so the layout below is a true ${width}px; check the reported viewport line to confirm.`)
}

mkdirSync(path.dirname(outPath), { recursive: true })

const write = (file, buf) => {
  writeFileSync(file, buf)
  const bytes = statSync(file).size
  // Thrown, not process.exit: exit skips the finally that closes Chrome and removes the profile,
  // so the assertion would leak the very things it exists to keep tidy.
  if (bytes === 0) throw new Error(`FAILED: ${file} is empty`)
  const px = pngSize(buf)
  console.log(`wrote ${file} ${bytes} bytes${px ? ` png ${px.width}x${px.height}` : ''}`)
  return bytes
}

const chrome = await launch({ width, height, gpu: !has('--no-gpu'), timeout })
try {
  const page = await chrome.page({ width, height, dsf, mobile: has('--mobile') })
  await page.goto(url, { timeout })
  await page.settle({ extra: wait })

  const sel = opt('--click')
  if (sel) {
    const hit = await page.click(sel)
    if (!hit) console.error(`warning: nothing matched ${sel}`)
    await page.settle({ extra: wait })
  }

  const js = opt('--eval')
  if (js) console.log('eval:', JSON.stringify(await page.eval(js)))

  const g = await page.geometry()
  console.log(`viewport ${g.w}x${g.h} scrollWidth ${g.sw} docHeight ${g.dh}${g.sw > g.w ? '  HORIZONTAL OVERFLOW' : ''}`)

  write(outPath, await page.screenshot())
  if (has('--full')) {
    const fullPath = outPath.replace(/\.png$/i, '') + '-full.png'
    write(fullPath, await page.screenshot({ full: true, height: g.dh }))
  }

  const bad = page.logs.filter((l) => l.startsWith('EXC') || l.startsWith('error'))
  if (bad.length) console.log('console:\n' + bad.slice(0, 8).join('\n'))
} finally {
  await chrome.close()
}
