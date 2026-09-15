import { useState } from 'react'
import {
  PenIcon, EraserIcon, UndoIcon, TrashIcon, PlusIcon, XIcon,
} from './Icons.jsx'

const WIDTH_PRESETS = [1, 2, 3, 5, 8, 12]

// HEX 입력이 항상 #RRGGBB 형태가 되도록 보정
const normalizeHex = (v) => {
  if (!v) return '#000000'
  let s = String(v).trim()
  if (!s.startsWith('#')) s = '#' + s
  // #RGB → #RRGGBB 확장
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    s = '#' + s.slice(1).split('').map(c => c + c).join('')
  }
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s
  return '#000000'
}

// HEX 입력을 사용자가 보고 입력하는 형태(#RGB 또는 #RRGGBB)로 정규화
const shortHex = (v) => {
  const s = normalizeHex(v)
  if (/^#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3$/.test(s)) {
    return s.slice(1).split('').filter((_, i) => i % 2 === 0).join('')
  }
  return s.slice(1)
}

export default function FloatingDrawTools({
  drawTools, activeDrawToolId,
  eraserMode, setEraserMode,
  onSelectTool, onUpdateTool, onAddTool, onRemoveTool,
  onUndo, onClear, hasStrokes,
}) {
  const [colorPickerFor, setColorPickerFor] = useState(null) // tool id

  const pens = drawTools.filter(t => t.type === 'pen')
  const highlighters = drawTools.filter(t => t.type === 'highlighter')
  const eraser = drawTools.find(t => t.type === 'eraser')

  const renderToolChip = (tool) => {
    const isActive = tool.id === activeDrawToolId
    return (
      <div
        key={tool.id}
        className={`draw-tool-chip ${isActive ? 'active' : ''}`}
        onClick={() => onSelectTool(tool.id)}
        title={`${tool.type} · 굵기 ${tool.width}${tool.type === 'highlighter' ? ` · 투명도 ${Math.round(tool.opacity * 100)}%` : ''}`}
      >
        {tool.type === 'highlighter' ? (
          <div
            className="draw-tool-swatch highlighter"
            style={{
              background: tool.color,
              opacity: tool.opacity,
              width: Math.min(28, 8 + tool.width * 0.8),
              height: Math.min(28, 8 + tool.width * 0.8),
            }}
          />
        ) : tool.type === 'eraser' ? (
          <div className="draw-tool-swatch eraser">
            <EraserIcon size={12} />
          </div>
        ) : (
          <div
            className="draw-tool-swatch pen"
            style={{
              background: tool.color,
              width: Math.min(28, 10 + tool.width * 0.6),
              height: Math.min(28, 10 + tool.width * 0.6),
            }}
          />
        )}
        {tool.type !== 'eraser' && (
          <button
            className="draw-tool-remove"
            onClick={(e) => { e.stopPropagation(); onRemoveTool(tool.id) }}
            title="삭제"
          >
            <XIcon size={9} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="floating-draw-tools">
      {/* ── Pens ── */}
      <div className="fdt-section">
        <div className="fdt-section-header">
          <PenIcon size={11} />
          <span>펜</span>
        </div>
        <div className="fdt-chips">
          {pens.map(renderToolChip)}
          <button
            className="fdt-add"
            onClick={() => onAddTool('pen')}
            title="펜 추가"
          >
            <PlusIcon size={10} />
          </button>
        </div>

        {(() => {
          const activePen = pens.find(t => t.id === activeDrawToolId)
          if (!activePen) return null
          return (
            <div className="fdt-controls">
              <div className="fdt-control-row">
                <span className="fdt-control-label">굵기</span>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={activePen.width}
                  onChange={e => onUpdateTool(activePen.id, { width: Number(e.target.value) })}
                  className="fdt-slider"
                />
                <span className="fdt-control-val">{activePen.width}</span>
              </div>
              <div className="fdt-presets">
                {WIDTH_PRESETS.map(w => (
                  <button
                    key={w}
                    className={`fdt-preset ${activePen.width === w ? 'active' : ''}`}
                    onClick={() => onUpdateTool(activePen.id, { width: w })}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <button
                className="fdt-color-toggle"
                onClick={() => setColorPickerFor(colorPickerFor === activePen.id ? null : activePen.id)}
              >
                <span className="fdt-color-dot" style={{ background: activePen.color }} />
                색상 변경
              </button>
              {colorPickerFor === activePen.id && (
                <div className="fdt-color-grid">
                  <div className="fdt-color-custom">
                    <input
                      type="color"
                      value={normalizeHex(activePen.color)}
                      onChange={e => onUpdateTool(activePen.id, { color: e.target.value })}
                      className="fdt-color-native"
                      title="컬러 피커로 색 선택"
                    />
                    <input
                      type="text"
                      value={shortHex(activePen.color)}
                      onChange={e => {
                        const v = e.target.value
                        if (/^[0-9a-fA-F]{0,6}$/.test(v)) {
                          const full = v.length === 3 || v.length === 6 ? '#' + v : null
                          if (full) onUpdateTool(activePen.id, { color: full })
                        }
                      }}
                      placeholder="#RRGGBB"
                      maxLength={7}
                      className="fdt-color-hex"
                      spellCheck={false}
                    />
                    <button
                      className="fdt-color-done"
                      onClick={() => setColorPickerFor(null)}
                    >
                      완료
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <div className="fdt-divider" />

      {/* ── Highlighters ── */}
      <div className="fdt-section">
        <div className="fdt-section-header">
          <span className="fdt-hl-dot" />
          <span>형광펜</span>
        </div>
        <div className="fdt-chips">
          {highlighters.map(renderToolChip)}
          <button
            className="fdt-add"
            onClick={() => onAddTool('highlighter')}
            title="형광펜 추가"
          >
            <PlusIcon size={10} />
          </button>
        </div>

        {(() => {
          const activeHl = highlighters.find(t => t.id === activeDrawToolId)
          if (!activeHl) return null
          return (
            <div className="fdt-controls">
              <div className="fdt-control-row">
                <span className="fdt-control-label">굵기</span>
                <input
                  type="range"
                  min="6"
                  max="36"
                  value={activeHl.width}
                  onChange={e => onUpdateTool(activeHl.id, { width: Number(e.target.value) })}
                  className="fdt-slider"
                />
                <span className="fdt-control-val">{activeHl.width}</span>
              </div>
              <div className="fdt-control-row">
                <span className="fdt-control-label">투명도</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.7"
                  step="0.05"
                  value={activeHl.opacity}
                  onChange={e => onUpdateTool(activeHl.id, { opacity: Number(e.target.value) })}
                  className="fdt-slider"
                />
                <span className="fdt-control-val">{Math.round(activeHl.opacity * 100)}%</span>
              </div>
              <button
                className="fdt-color-toggle"
                onClick={() => setColorPickerFor(colorPickerFor === activeHl.id ? null : activeHl.id)}
              >
                <span
                  className="fdt-color-dot"
                  style={{ background: activeHl.color, opacity: activeHl.opacity }}
                />
                색상 변경
              </button>
              {colorPickerFor === activeHl.id && (
                <div className="fdt-color-grid">
                  <div className="fdt-color-custom">
                    <input
                      type="color"
                      value={normalizeHex(activeHl.color)}
                      onChange={e => onUpdateTool(activeHl.id, { color: e.target.value })}
                      className="fdt-color-native"
                      title="컬러 피커로 색 선택"
                    />
                    <input
                      type="text"
                      value={shortHex(activeHl.color)}
                      onChange={e => {
                        const v = e.target.value
                        if (/^[0-9a-fA-F]{0,6}$/.test(v)) {
                          const full = v.length === 3 || v.length === 6 ? '#' + v : null
                          if (full) onUpdateTool(activeHl.id, { color: full })
                        }
                      }}
                      placeholder="#RRGGBB"
                      maxLength={7}
                      className="fdt-color-hex"
                      spellCheck={false}
                    />
                    <button
                      className="fdt-color-done"
                      onClick={() => setColorPickerFor(null)}
                    >
                      완료
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <div className="fdt-divider" />

      {/* ── Eraser (고정 1개) ── */}
      <div className="fdt-section fdt-eraser-section">
        <div className="fdt-section-header">
          <EraserIcon size={11} />
          <span>지우개</span>
        </div>
        <div className="fdt-chips">
          {eraser && renderToolChip(eraser)}
        </div>

        {/* 모드 토글: 픽셀 / 스트로크 */}
        {eraser && (
          <div className="fdt-eraser-mode">
            <button
              className={`fdt-mode-btn ${eraserMode === 'pixel' ? 'active' : ''}`}
              onClick={() => setEraserMode('pixel')}
            >
              <span className="fdt-mode-icon pixel">
                <svg viewBox="0 0 20 20" width="11" height="11" fill="currentColor">
                  <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z"/>
                </svg>
              </span>
              픽셀 지우개
            </button>
            <button
              className={`fdt-mode-btn ${eraserMode === 'stroke' ? 'active' : ''}`}
              onClick={() => setEraserMode('stroke')}
            >
              <span className="fdt-mode-icon stroke">
                <svg viewBox="0 0 20 20" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 10 Q 5 4, 8 7 T 14 11 T 17 9" strokeLinecap="round"/>
                </svg>
              </span>
              스트로크 지우개
            </button>
          </div>
        )}

        {/* 굵기 슬라이더 (지우개 두께) */}
        {eraser && (
          <div className="fdt-controls">
            <div className="fdt-control-row">
              <span className="fdt-control-label">굵기</span>
              <input
                type="range"
                min="6"
                max="60"
                value={eraser.width}
                onChange={e => onUpdateTool(eraser.id, { width: Number(e.target.value) })}
                className="fdt-slider"
              />
              <span className="fdt-control-val">{eraser.width}</span>
            </div>
            <div className="fdt-presets">
              {[10, 18, 28, 40, 60].map(w => (
                <button
                  key={w}
                  className={`fdt-preset ${eraser.width === w ? 'active' : ''}`}
                  onClick={() => onUpdateTool(eraser.id, { width: w })}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fdt-divider" />

      {/* ── Undo / Clear ── */}
      <div className="fdt-actions">
        <button
          className="fdt-action-btn"
          onClick={onUndo}
          disabled={!hasStrokes}
          title="실행취소 (Ctrl+Z)"
        >
          <UndoIcon size={13} />
        </button>
        <button
          className="fdt-action-btn danger"
          onClick={onClear}
          disabled={!hasStrokes}
          title="전체 지우기"
        >
          <TrashIcon size={13} />
        </button>
      </div>
    </div>
  )
}
