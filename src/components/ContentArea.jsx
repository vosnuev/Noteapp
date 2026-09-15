import { useRef, useEffect, useCallback, useState } from 'react'
import DrawingCanvas from './DrawingCanvas.jsx'
import BlockList from './BlockList.jsx'
import SlashMenu from './SlashMenu.jsx'
import TextFormatBar from './TextFormatBar.jsx'
import { createBlock, TEMPLATES } from '../templates.js'

const uid = () => Math.random().toString(36).slice(2)

export default function ContentArea({
  page, isDrawMode,
  penColor, penWidth, penTool,
  onStrokesChange, onBlocksChange, onNameChange
}) {
  const scrollRef   = useRef(null)
  const titleRef    = useRef(null)
  const inputRef    = useRef(null)
  const prevPageId  = useRef(null)
  const saveTimerRef = useRef(null)

  const [saveStatus, setSaveStatus] = useState('idle')
  const [inputVal,   setInputVal]   = useState('')
  const [slash, setSlash] = useState({ open: false, x: 0, y: 0, query: '' })

  /* ── Auto-save indicator ── */
  const handleDrawStart = useCallback(() => {
    clearTimeout(saveTimerRef.current)
    setSaveStatus('drawing')
  }, [])

  const handleDrawEnd = useCallback(() => {
    setSaveStatus('saving')
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved')
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 1500)
    }, 600)
  }, [])

  useEffect(() => () => clearTimeout(saveTimerRef.current), [])

  /* ── Sync title when page changes ── */
  useEffect(() => {
    if (!page || prevPageId.current === page.id) return
    prevPageId.current = page.id
    if (titleRef.current) titleRef.current.textContent = page.name || ''
    setInputVal('')
    setSlash(s => ({ ...s, open: false }))
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [page?.id])

  /* ── Ctrl+Z undo strokes ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && isDrawMode && page) {
        e.preventDefault()
        onStrokesChange(page.strokes.slice(0, -1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDrawMode, page, onStrokesChange])

  /* ── Slash menu: open on "/" ── */
  const openSlash = useCallback((x, y) => {
    setSlash({ open: true, x, y, query: '' })
  }, [])

  const closeSlash = useCallback(() => {
    setSlash(s => ({ ...s, open: false, query: '' }))
    setInputVal('')
    inputRef.current?.focus()
  }, [])

  /* ── Insert block from slash menu ── */
  const handleSlashSelect = useCallback((type) => {
    setSlash(s => ({ ...s, open: false }))
    if (!page) {
      setInputVal('')
      return
    }

    const txt = inputVal.trim()
    let newBlocks
    if (type === 'text') {
      // 사용자가 입력한 텍스트가 있으면 그걸 새 text 블록에 넣어줌
      newBlocks = [...(page.blocks || []), { id: uid(), type: 'text', text: txt }]
    } else if (TEMPLATES[type]) {
      newBlocks = [...(page.blocks || []), ...TEMPLATES[type]()]
    } else {
      newBlocks = [...(page.blocks || []), createBlock(type)]
    }

    setInputVal('')
    onBlocksChange(newBlocks)
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      inputRef.current?.focus()
    }, 60)
  }, [page, onBlocksChange, inputVal])

  /* ── Bottom input handlers ── */
  const handleInputChange = useCallback((e) => {
    const val = e.target.value
    setInputVal(val)

    if (val.startsWith('/')) {
      const rect = e.target.getBoundingClientRect()
      setSlash({ open: true, x: rect.left, y: rect.bottom + 6, query: val.slice(1) })
    } else {
      setSlash(s => ({ ...s, open: false, query: '' }))
    }
  }, [])

  const handleInputKeyDown = useCallback((e) => {
    if (slash.open) return  // arrow / enter handled by SlashMenu

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!page) return
      const txt = inputVal.trim()
      // 입력한 텍스트가 있으면 그걸 새 text 블록에 넣어주고, 그 다음 줄에 새 빈 블록
      if (txt) {
        const newBlock = { id: uid(), type: 'text', text: txt }
        onBlocksChange([...(page.blocks || []), newBlock])
      } else {
        // 빈 Enter는 그냥 빈 텍스트 블록 하나 추가
        onBlocksChange([...(page.blocks || []), createBlock('text')])
      }
      setInputVal('')
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        inputRef.current?.focus()
      }, 30)
    }
    if (e.key === 'Escape') {
      setInputVal('')
      setSlash(s => ({ ...s, open: false }))
    }
  }, [slash.open, inputVal, page, onBlocksChange])

  /* ── Close slash on outside click ── */
  useEffect(() => {
    if (!slash.open) return
    const handler = (e) => {
      if (!e.target.closest('.slash-menu') && !e.target.closest('.page-add-input')) {
        setSlash(s => ({ ...s, open: false }))
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [slash.open])

  if (!page) return (
    <div className="content-area">
      <div className="empty-state">
        <span className="es-icon">📝</span>
        <span className="es-text">페이지를 선택하세요</span>
      </div>
    </div>
  )

  return (
    <div className="content-area">
      <div className="content-scroll" ref={scrollRef}>
        <div className="content-paper" style={{ position: 'relative' }}>

          {/* Title */}
          <div
            ref={titleRef}
            className="note-title"
            contentEditable={!isDrawMode}
            suppressContentEditableWarning
            data-placeholder="제목 없음"
            spellCheck={false}
            onBlur={e => onNameChange?.(e.currentTarget.textContent)}
          />

          {/* Blocks */}
          <BlockList
            blocks={page.blocks || []}
            onChange={onBlocksChange}
            isDrawMode={isDrawMode}
          />

          {/* Add-block input — Notion-style "/" */}
          {!isDrawMode && (
            <div className="page-add-area">
              <input
                ref={inputRef}
                className="page-add-input"
                value={inputVal}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="텍스트 입력 또는 / 로 블록 추가..."
                spellCheck={false}
              />
            </div>
          )}

          {/* Drawing canvas — on top of everything */}
          <DrawingCanvas
            isActive={isDrawMode}
            penColor={penColor}
            penWidth={penWidth}
            penTool={penTool}
            strokes={page.strokes}
            onChange={onStrokesChange}
            onDrawStart={handleDrawStart}
            onDrawEnd={handleDrawEnd}
          />
        </div>
      </div>

      {/* Slash menu (fixed-positioned) */}
      {slash.open && (
        <SlashMenu
          x={slash.x}
          y={slash.y}
          query={slash.query}
          onSelect={handleSlashSelect}
          onClose={closeSlash}
        />
      )}

      {/* Floating text-format toolbar */}
      <TextFormatBar isDrawMode={isDrawMode} />

      {/* Draw-mode banner */}
      {isDrawMode && (
        <div className={`draw-mode-banner ${saveStatus}`}>
          {saveStatus === 'drawing' && '✏️ 드로우 중...'}
          {saveStatus === 'saving'  && '💾 자동저장 중입니다...'}
          {saveStatus === 'saved'   && '✅ 저장 완료'}
          {saveStatus === 'idle'    && '✏️ Draw Mode — 콘텐츠 위에 바로 필기하세요'}
        </div>
      )}
    </div>
  )
}
