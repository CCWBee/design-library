// Mechanical scan of CSS against a design token scale: sizes, weights, spacing, radii, shadows,
// blur, caps, tracking, easing, colours, gradients and endless motion. Heuristic, so it names
// suspects with line numbers; a person or an agent decides, and accepted exceptions go in an allow
// file. Zero dependencies, Node 22.
//
//   node scan.mjs <file.css | dir> [...] [--tokens tokens.json] [--allow design-allow.txt] [--check]
//
//   --tokens <file>  the project's scale, as JSON (see tokens.example.json); without it the
//                    built-in default scale below applies, which is generic and will flag more
//   --allow <file>   accepted exceptions, one per line: "<path suffix> :: <text the finding contains>"
//   --check          exit 1 if any suspect is not in the allow file; this is the CI form
//
// Promoted from cruise-passport/tools/qa/scan.mjs, whose token values were baked in; that copy
// stays in place as that project's own. Add a genuine exception to the allow file with its reason
// rather than widening the scanner.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const DEFAULT_TOKENS = {
  fontSize: ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px', '48px'],
  spacing: ['0', '0px', '1px', '2px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px', 'auto'],
  radius: ['0', '0px', '2px', '4px', '8px', '12px', '16px', '999px', '50%', 'inherit'],
  fontWeight: ['400', '500', '600', '700', 'normal', 'inherit'],
  colour: '^(var\\(--[\\w-]+\\)|transparent|currentColor|inherit|none|#fff|#ffffff|#000|#000000)$',
  shadow: ['none'],
  easing: ['var(--e-out)'],
  ignore: ['tokens.css'],
  flags: { backdropFilter: true, uppercase: true, tracking: true, easing: true, gradient: true, endlessMotion: true },
}

const args = process.argv.slice(2)
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 && args[i + 1] !== undefined ? args[i + 1] : d }
const check = args.includes('--check')
const flagValues = new Set(['--tokens', '--allow'].flatMap((k) => { const i = args.indexOf(k); return i > -1 ? [args[i + 1]] : [] }))
const targets = args.filter((a) => !a.startsWith('--') && !flagValues.has(a))
if (!targets.length) {
  console.error('usage: node scan.mjs <file.css | dir> [...] [--tokens tokens.json] [--allow design-allow.txt] [--check]')
  process.exit(2)
}

const tokensFile = opt('--tokens')
const T = { ...DEFAULT_TOKENS, ...(tokensFile ? JSON.parse(readFileSync(tokensFile, 'utf8')) : {}) }
T.flags = { ...DEFAULT_TOKENS.flags, ...(T.flags || {}) }
const FONT_OK = new Set(T.fontSize)
const SPACE_OK = new Set(T.spacing)
const RADIUS_OK = new Set(T.radius)
const WEIGHT_OK = new Set(T.fontWeight.map(String))
const SHADOW_OK = new Set(T.shadow)
const EASING_OK = T.easing
const COLOR_OK = new RegExp(T.colour, 'i')

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))

function scan(file) {
  const lines = strip(readFileSync(file, 'utf8')).split('\n')
  const out = []
  const flag = (i, why, what) => out.push({ file, line: i + 1, why, what: String(what).trim() })
  lines.forEach((line, i) => {
    const l = line.trim()
    for (const m of l.matchAll(/font-size\s*:\s*([^;]+);/g)) {
      const v = m[1].trim()
      if (/^(var|clamp|calc|min|max)\(/.test(v) || v === 'inherit') continue
      if (!FONT_OK.has(v)) flag(i, `font-size off scale (${T.fontSize.join(' ')})`, v)
    }
    for (const m of l.matchAll(/(?:^|[\s;{])(padding|margin|gap|row-gap|column-gap|top|right|bottom|left|inset)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
      for (const p of m[2].trim().split(/\s+/)) {
        if (/^(var|calc|clamp|min|max|env)\(/.test(p) || p === 'auto' || p.startsWith('-')) continue
        if (/^-?\d*\.?\d+(px)?$/.test(p) && !SPACE_OK.has(p)) flag(i, 'spacing off scale', m[0])
      }
    }
    for (const m of l.matchAll(/border(?:-[a-z-]+)?-radius\s*:\s*([^;]+);/g)) {
      for (const p of m[1].trim().split(/\s+/)) {
        if (/^(var|calc)\(/.test(p)) continue
        if (!RADIUS_OK.has(p)) flag(i, 'radius off scale', m[0])
      }
    }
    for (const m of l.matchAll(/box-shadow\s*:\s*([^;]+);/g)) {
      const v = m[1].trim()
      if (!SHADOW_OK.has(v)) flag(i, 'shadow not on the allowed list', v)
    }
    if (T.flags.backdropFilter && /backdrop-filter/.test(l)) flag(i, 'backdrop-filter (reserve it for the named glass surfaces)', l)
    if (T.flags.uppercase && /text-transform\s*:\s*uppercase/.test(l)) flag(i, 'uppercase label', l)
    if (T.flags.tracking && /letter-spacing\s*:\s*\.?0*[1-9]/.test(l) && !/letter-spacing\s*:\s*-/.test(l)) flag(i, 'tracked label', l)
    if (T.flags.easing && /cubic-bezier|linear\(|ease-in-out|\bease\b(?!-out)/.test(l) && !EASING_OK.some((e) => l.includes(e))) flag(i, `easing other than ${EASING_OK.join(' ')}`, l)
    for (const m of l.matchAll(/font-weight\s*:\s*([^;]+);/g)) {
      const v = m[1].trim()
      if (!WEIGHT_OK.has(v)) flag(i, `weight not ${T.fontWeight.join('/')}`, v)
    }
    for (const m of l.matchAll(/\bfont\s*:\s*([^;]+);/g)) {
      const w = m[1].trim().split(/\s+/)[0]
      if (/^\d+$/.test(w) && !WEIGHT_OK.has(w)) flag(i, 'weight off scale (font shorthand)', m[1].trim())
    }
    for (const m of l.matchAll(/(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|color\(display-p3[^)]*\))/gi)) {
      if (!COLOR_OK.test(m[1])) flag(i, 'colour not a token', m[1])
    }
    if (T.flags.gradient && /linear-gradient|radial-gradient|conic-gradient/.test(l)) flag(i, 'gradient (reserve it for the named surfaces)', l)
    if (T.flags.endlessMotion && /animation\s*:\s*[^;]*infinite/.test(l) && !/spin/.test(l)) flag(i, 'endless animation (spinners only)', l)
  })
  return out
}

function cssFiles(target) {
  if (!existsSync(target)) return []
  if (statSync(target).isFile()) return target.endsWith('.css') ? [target] : []
  return readdirSync(target, { recursive: true })
    .map((f) => path.join(target, String(f)))
    .filter((f) => f.endsWith('.css') && !f.includes('node_modules'))
}

const norm = (f) => f.replace(/\\/g, '/')
// The token file defines the palette and the easing, so its own literals are the tokens themselves.
const files = targets.flatMap(cssFiles).filter((f) => !T.ignore.some((ig) => norm(f).endsWith(ig)))

let allow = []
const allowFile = opt('--allow')
if (allowFile && existsSync(allowFile)) {
  allow = readFileSync(allowFile, 'utf8').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const [suffix, needle] = l.split('::').map((s) => s.trim()); return { suffix, needle } })
}
const allowed = (s) => allow.some((a) => norm(s.file).endsWith(a.suffix) && (s.why + ' ' + s.what).includes(a.needle))

let failed = 0
for (const file of files) {
  const suspects = scan(file).filter((s) => !allowed(s))
  if (!suspects.length) { if (!check) console.log(`${norm(file)}: clean`); continue }
  failed += suspects.length
  for (const s of suspects) console.log(`${norm(s.file)}:${s.line}  ${s.why}: ${s.what}`)
}
if (check) {
  if (failed) {
    console.error(`\nscan: ${failed} suspect line(s)${allowFile ? ` not in ${allowFile}` : ''}. Fix them, or record a genuine exception with its reason.`)
    process.exit(1)
  }
  console.log(`scan: ${files.length} files, clean`)
}
