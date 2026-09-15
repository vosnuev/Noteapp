import { useState, useEffect, useCallback, useRef } from 'react'

const TEXT_COLORS = [
  { label: '기본',   value: '#1c1c1e' },
  { label: '빨강',   value: '#ff3b30' },
  { label: '주황',   value: '#ff9500' },
  { label: '노랑',   value: '#ffcc00' },
  { label: '초록',   value: '#34c759' },
  { label: '파랑',   value: '#007aff' },
  { label: '보라',   value: '#af52de' },
  { label: '흰색',   value: '#ffffff' },
]

const BG_COLORS = [
  { label: '없음',   value: 'transparent' },
  { label: '노랑',   value: '#ffff0080' },
  { label: '초록',   value: '#34c75940' },
  { label: '파랑',   value: '#007aff30' },
  { label: '빨강',   value: '#ff3b3040' },
  { label: '보라',   value: '#af52de40' },
  { label: '회색',   value: '#8e8e9340' },
]

const SIZES = [
  { label: '소', value: '1' },
  { label: '중', value: '3' },
  { label: '대', value: '5' },
  { label: '특대', value: '7' },
]

function AlignLeftIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg> }
function AlignCenterIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg> }
function AlignRightIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg> }

export default function TextFormatBar({ isDrawMode }) {
  const [visible, setVisible]  = useState(false)
  const [pos, setPos]          = useState({ x: 0, y: 0 })
  const [fmts, setFmts]        = useState({})
  const [showTextColors, setShowTextColors] = useState(false)
  const [showBgColors,   setShowBgColors]   = useState(false)
  const barRef = useRef(null)
  const savedRange = useRef(null)

  const refreshFmts = useCallback(() => {
    setFmts({
      bold:         document.queryCommandState('bold'),
      italic:       document.queryCommandState('italic'),
      underline:    document.queryCommandState('underline'),
      strikeThrough:document.queryCommandState('strikeThrough'),
      justifyLeft:  document.queryCommandState('justifyLeft'),
      justifyCenter:document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    })
  }, [])

  useEffect(() => {
    if (isDrawMode) { setVisible(false); return }

    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        // Don't hide immediately — allow toolbar button clicks
        setTimeout(() => {
          const sel2 = window.getSelection()
          if (!sel2 || sel2.isCollapsed) setVisible(false)
        }, 150)
        return
      }
      // Check if inside contenteditable
      let el = sel.anchorNode?.nodeType === 3
        ? sel.anchorNode.parentElement
        : sel.anchorNode
      let inEditable = false
      while (el) {
        if (el.contentEditable === 'true') { inEditable = true; break }
        el = el.parentElement
      }
      if (!inEditable) { setVisible(false); return }

      const range = sel.getRangeAt(0)
      savedRange.current = range.cloneRange()
      const rect = range.getBoundingClientRect()
      if (!rect.width) { setVisible(false); return }

      const barW = 460
      const x = Math.max(barW / 2 + 8, Math.min(rect.left + rect.width / 2, window.innerWidth - barW / 2 - 8))
      const y = rect.top - 8

      setPos({ x, y })
      setVisible(true)
      refreshFmts()
      setShowTextColors(false)
      setShowBgColors(false)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [isDrawMode, refreshFmts])

  // Close color pickers on outside click
  useEffect(() => {
    if (!showTextColors && !showBgColors) return
    const handler = (e) => {
      if (!barRef.current?.contains(e.target)) {
        setShowTextColors(false)
        setShowBgColors(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [showTextColors, showBgColors])

  const restoreSelection = () => {
    if (!savedRange.current) return
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange.current)
  }

  const exec = useCallback((cmd, value = null) => {
    restoreSelection()
    document.execCommand(cmd, false, value)
    refreshFmts()
  }, [refreshFmts])

  if (!visible) return null

  return (
    <div
      ref={barRef}
      className="text-format-bar"
      style={{ left: pos.x, top: Math.max(8, pos.y), transform: 'translate(-50%, -100%)' }}
    >
      {/* Bold / Italic / Underline / Strike */}
      <button className={`fmt-btn ${fmts.bold ? 'on' : ''}`}          onMouseDown={e => { e.preventDefault(); exec('bold') }}          title="굵게 (Ctrl+B)"><strong>B</strong></button>
      <button className={`fmt-btn ${fmts.italic ? 'on' : ''}`}        onMouseDown={e => { e.preventDefault(); exec('italic') }}        title="기울임 (Ctrl+I)"><em style={{fontFamily:'Georgia'}}>I</em></button>
      <button className={`fmt-btn ${fmts.underline ? 'on' : ''}`}     onMouseDown={e => { e.preventDefault(); exec('underline') }}     title="밑줄 (Ctrl+U)"><u>U</u></button>
      <button className={`fmt-btn ${fmts.strikeThrough ? 'on' : ''}`} onMouseDown={e => { e.preventDefault(); exec('strikeThrough') }} title="취소선"><s>S</s></button>

      <div className="fmt-sep" />

      {/* Align */}
      <button className={`fmt-btn ${fmts.justifyLeft   ? 'on' : ''}`} onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }}   title="왼쪽 정렬"><AlignLeftIcon /></button>
      <button className={`fmt-btn ${fmts.justifyCenter ? 'on' : ''}`} onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }} title="가운데 정렬"><AlignCenterIcon /></button>
      <button className={`fmt-btn ${fmts.justifyRight  ? 'on' : ''}`} onMouseDown={e => { e.preventDefault(); exec('justifyRight') }}  title="오른쪽 정렬"><AlignRightIcon /></button>

      <div className="fmt-sep" />

      {/* Font size */}
      <select
        className="fmt-select"
        defaultValue="3"
        title="텍스트 크기"
        onMouseDown={e => e.stopPropagation()}
        onChange={e => { restoreSelection(); exec('fontSize', e.target.value) }}
      >
        {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <div className="fmt-sep" />

      {/* Lists & checklist */}
      <button className="fmt-btn" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} title="글머리 기호 목록"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M80 64a8 8 0 0 1 8-8h128a8 8 0 0 1 0 16H88a8 8 0 0 1-8-8m8 72h128a8 8 0 0 0 0-16H88a8 8 0 0 0 0 16m128 56H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16M36 64a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-8a8 8 0 0 0-8-8m0 64a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-8a8 8 0 0 0-8-8m0 64a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-8a8 8 0 0 0-8-8"/></svg></button>
      <button className="fmt-btn" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} title="번호 목록"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M88 64a8 8 0 0 1 8-8h128a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m8 72h128a8 8 0 0 0 0-16H96a8 8 0 0 0 0 16m128 56H96a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16M40 56a8 8 0 0 0-8 8v8a8 8 0 0 0 7.07 8c4.74 0 8.93-3.4 8.93-8v-8a8 8 0 0 0-8-8m0 64a8 8 0 0 0-8 8v.82c0 4.6 3.19 8.18 8 8.18s8-3.58 8-8.18a8 8 0 0 0-8-8.82m0 64a8 8 0 0 0-8 8v.82c0 4.6 3.19 8.18 8 8.18s8-3.58 8-8.18a8 8 0 0 0-8-8.82"/></svg></button>
      <button className="fmt-btn" onMouseDown={e => {
        e.preventDefault()
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) return
        const text = sel.toString()
        const url = prompt('링크 URL을 입력하세요:', text.startsWith('http') ? text : 'https://')
        if (url) exec('createLink', url)
      }} title="링크 삽입"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M137.54 186.36a8 8 0 0 1 0 11.31l-9.94 10a52 52 0 0 1-73.55-73.54l24.55-24.56a52 52 0 0 1 71.07-2.28a8 8 0 1 1-10.6 12a36 36 0 0 0-49.2 1.59l-24.55 24.55a36 36 0 0 0 50.91 50.91l9.94-9.94a8 8 0 0 1 11.37 0Zm70.41-138.31a52.07 52.07 0 0 0-73.55-.01l-9.94 9.95a8 8 0 0 0 11.32 11.32l9.94-9.94a36 36 0 0 1 50.91 50.91l-24.55 24.55a36 36 0 0 1-49.2 1.59a8 8 0 0 0-10.6 12a52 52 0 0 0 71.07-2.28l24.55-24.55a52.07 52.07 0 0 0 0-73.54"/></svg></button>

      <div className="fmt-sep" />

      {/* Indent / outdent */}
      <button className="fmt-btn" onMouseDown={e => { e.preventDefault(); exec('outdent') }} title="내어쓰기"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M216 128a8 8 0 0 1-8 8H75.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L75.31 120H208a8 8 0 0 1 8 8M32 56a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8"/></svg></button>
      <button className="fmt-btn" onMouseDown={e => { e.preventDefault(); exec('indent') }} title="들여쓰기"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M216 128a8 8 0 0 1-8 8H115.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L115.31 120H208a8 8 0 0 1 8 8M32 56a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8"/></svg></button>

      <div className="fmt-sep" />

      {/* Super / sub script */}
      <button className="fmt-btn fmt-sci" onMouseDown={e => { e.preventDefault(); exec('superscript') }} title="위 첨자">A<sup>+</sup></button>
      <button className="fmt-btn fmt-sci" onMouseDown={e => { e.preventDefault(); exec('subscript') }} title="아래 첨자">A<sub>+</sub></button>

      <div className="fmt-sep" />

      {/* Text color */}
      <div className="fmt-color-wrap">
        <button
          className="fmt-btn fmt-color-btn"
          title="텍스트 색상"
          onMouseDown={e => { e.preventDefault(); setShowTextColors(v => !v); setShowBgColors(false) }}
        >
          <span className="fmt-color-a">A</span>
        </button>
        {showTextColors && (
          <div className="fmt-color-picker">
            {TEXT_COLORS.map(c => (
              <button
                key={c.value}
                className="fmt-color-dot"
                style={{ background: c.value, border: c.value === '#ffffff' ? '1px solid #ddd' : 'none' }}
                title={c.label}
                onMouseDown={e => { e.preventDefault(); exec('foreColor', c.value); setShowTextColors(false) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background / highlight color */}
      <div className="fmt-color-wrap">
        <button
          className="fmt-btn fmt-color-btn"
          title="텍스트 배경"
          onMouseDown={e => { e.preventDefault(); setShowBgColors(v => !v); setShowTextColors(false) }}
        >
          <span className="fmt-color-a fmt-color-a--bg">A</span>
        </button>
        {showBgColors && (
          <div className="fmt-color-picker">
            {BG_COLORS.map((c, i) => (
              <button
                key={i}
                className="fmt-color-dot"
                style={{
                  background: c.value === 'transparent'
                    ? 'linear-gradient(135deg,#fff 40%,#f00 40%,#f00 60%,#fff 60%)'
                    : c.value,
                  border: '1px solid #e0e0e0',
                }}
                title={c.label}
                onMouseDown={e => {
                  e.preventDefault()
                  exec('hiliteColor', c.value === 'transparent' ? 'transparent' : c.value)
                  setShowBgColors(false)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
