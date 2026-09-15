import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './blocks-extra.css'

// ── 최후 폴백: CSS 로드 실패 / React 마운트 실패 / 비동기 에러도 무조건 화면에 표시 ──
function showBootFallback(title, detail) {
  try {
    if (document.getElementById('boot-fallback')) return
    const div = document.createElement('div')
    div.id = 'boot-fallback'
    // 인라인 스타일: 외부 CSS 의존 없이 어떤 상태에서도 반드시 표시됨
    div.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'padding:20px 24px',
      'background:#1f1147',
      'color:#f4ecff',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
      'font-size:13px',
      'line-height:1.5',
      'white-space:pre-wrap',
      'word-break:break-word',
      'z-index:2147483647',
      'box-shadow:0 6px 24px rgba(0,0,0,.4)',
      'border-bottom:2px solid #ea580c',
    ].join(';')
    const h = document.createElement('div')
    h.style.cssText = 'color:#ea580c;font-weight:700;margin-bottom:8px;font-size:14px;'
    h.textContent = `⚠️ ${title}`
    const pre = document.createElement('pre')
    pre.style.cssText = 'margin:0;white-space:pre-wrap;'
    pre.textContent = String(detail || '')
    div.appendChild(h)
    div.appendChild(pre)
    document.body && document.body.prepend(div)
  } catch {
    /* 정말로 DOM 조작도 불가능하면 포기 */
  }
}

window.addEventListener('error', (ev) => {
  showBootFallback(
    'Window error',
    `${ev.message || 'Unknown error'}\n  at ${ev.filename || ''}:${ev.lineno || 0}:${ev.colno || 0}`,
  )
})
window.addEventListener('unhandledrejection', (ev) => {
  const reason = ev.reason
  const msg = reason && reason.message ? reason.message : String(reason)
  const stack = reason && reason.stack ? `\n\n${reason.stack}` : ''
  showBootFallback('Unhandled rejection', msg + stack)
})

try {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    showBootFallback('Boot failed', '#root element not found in DOM')
  } else {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    )
  }
} catch (e) {
  showBootFallback('Boot failed', `${e.message || e}\n\n${e.stack || ''}`)
}
