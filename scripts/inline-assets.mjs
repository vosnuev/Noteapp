// Post-build script: dist/index.html 안의 외부/상대경로 자산을 base64 data URL로 인라인.
// KaTeX 폰트(woff2) 같은 큰 바이너리가 vite-plugin-singlefile이 inline 못 하는 경우가 있어
// 빌드 후 한 번 더 돌려서 완벽히 자급자족하는 단일 HTML로 만든다.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distIndex = path.join(root, 'dist', 'index.html')
const katexFontsDir = path.join(root, 'node_modules', 'katex', 'dist', 'fonts')

if (!fs.existsSync(distIndex)) {
  console.error('[inline-assets] dist/index.html 없음 — 빌드 먼저 실행 필요')
  process.exit(1)
}

let html = fs.readFileSync(distIndex, 'utf8')
const before = html.length

// KaTeX 폰트 매핑: 폰트 패밀리별 정규식 매칭용
const katexFontMap = {
  'KaTeX_AMS-Regular': 'KaTeX_AMS-Regular',
  'KaTeX_Caligraphic-Bold': 'KaTeX_Caligraphic-Bold',
  'KaTeX_Caligraphic-Regular': 'KaTeX_Caligraphic-Regular',
  'KaTeX_Fraktur-Bold': 'KaTeX_Fraktur-Bold',
  'KaTeX_Fraktur-Regular': 'KaTeX_Fraktur-Regular',
  'KaTeX_Main-Bold': 'KaTeX_Main-Bold',
  'KaTeX_Main-BoldItalic': 'KaTeX_Main-BoldItalic',
  'KaTeX_Main-Italic': 'KaTeX_Main-Italic',
  'KaTeX_Main-Regular': 'KaTeX_Main-Regular',
  'KaTeX_Math-BoldItalic': 'KaTeX_Math-BoldItalic',
  'KaTeX_Math-Italic': 'KaTeX_Math-Italic',
  'KaTeX_SansSerif-Bold': 'KaTeX_SansSerif-Bold',
  'KaTeX_SansSerif-Italic': 'KaTeX_SansSerif-Italic',
  'KaTeX_SansSerif-Regular': 'KaTeX_SansSerif-Regular',
  'KaTeX_Size1-Regular': 'KaTeX_Size1-Regular',
  'KaTeX_Size2-Regular': 'KaTeX_Size2-Regular',
  'KaTeX_Size3-Regular': 'KaTeX_Size3-Regular',
  'KaTeX_Size4-Regular': 'KaTeX_Size4-Regular',
  'KaTeX_Typewriter-Regular': 'KaTeX_Typewriter-Regular',
}

function mimeFor(filename) {
  if (filename.endsWith('.woff2')) return 'font/woff2'
  if (filename.endsWith('.woff')) return 'font/woff'
  if (filename.endsWith('.ttf')) return 'font/ttf'
  if (filename.endsWith('.otf')) return 'font/otf'
  if (filename.endsWith('.eot')) return 'application/vnd.ms-fontobject'
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  if (filename.endsWith('.gif')) return 'image/gif'
  return 'application/octet-stream'
}

let replacedCount = 0
let totalSavedBytes = 0

// 1) url("...") 또는 url('...') 또는 url(...) 패턴에서 파일명만 추출해서 base64로 치환
html = html.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (match, quote, rawUrl) => {
  // 이미 data: URL 이면 그대로
  if (rawUrl.startsWith('data:')) return match
  // 절대 http(s) URL은 그대로 둠 (Google Fonts 등은 의도적 외부 의존)
  if (/^https?:\/\//i.test(rawUrl)) return match

  // URL에서 파일명만 추출 (e.g. "./fonts/Foo.woff2" → "Foo.woff2", "../fonts/Foo.woff2" → "Foo.woff2")
  const basename = decodeURIComponent(rawUrl.split('/').pop().split('?')[0].split('#')[0])
  if (!basename) return match

  // KaTeX 폰트 매칭
  let candidate = null
  for (const family of Object.keys(katexFontMap)) {
    if (basename.startsWith(family)) {
      candidate = path.join(katexFontsDir, basename)
      break
    }
  }

  // 매칭 안 되면 node_modules에서 광범위 탐색 (안전장치)
  if (!candidate || !fs.existsSync(candidate)) {
    const found = tryFindInNodeModules(basename)
    if (found) candidate = found
  }

  if (!candidate || !fs.existsSync(candidate)) {
    // 못 찾으면 그대로 둠
    return match
  }

  const buf = fs.readFileSync(candidate)
  const b64 = buf.toString('base64')
  totalSavedBytes += buf.length
  replacedCount += 1
  return `url(${quote}data:${mimeFor(basename)};base64,${b64}${quote})`
})

function tryFindInNodeModules(filename) {
  const nm = path.join(root, 'node_modules')
  if (!fs.existsSync(nm)) return null
  const stack = [nm]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const ent of entries) {
      if (ent.name === filename) {
        return path.join(dir, ent.name)
      }
    }
    // 너무 깊이 안 들어가도록 첫 단계만
  }
  return null
}

if (replacedCount > 0) {
  fs.writeFileSync(distIndex, html)
  const after = html.length
  console.log(
    `[inline-assets] ${replacedCount}개 자산 인라인 완료 — dist/index.html ${before} → ${after} 바이트 (+${after - before})`,
  )
} else {
  console.log('[inline-assets] 인라인할 자산 없음 — 그대로 둠')
}
