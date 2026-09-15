import { useState } from 'react'
import {
  PenIcon, EraserIcon, UndoIcon, TrashIcon, PlusIcon, XIcon,
} from './Icons.jsx'

const BRAND_COLORS = [
  '#1c1c1e', '#6d28d9', '#ea580c', '#0f766e',
  '#15803d', '#1e40af', '#9f1239', '#a16207',
]

const WIDTH_PRESETS = [1, 2, 3, 5, 8, 12]

export default function FloatingDrawTools({
  drawTools, activeDrawToolId,
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
                  {BRAND_COLORS.map(c => (
                    <button
                      key={c}
                      className={`fdt-color-pick ${c === activePen.color ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => {
                        onUpdateTool(activePen.id, { color: c })
                        setColorPickerFor(null)
                      }}
                    />
                  ))}
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
                  {BRAND_COLORS.map(c => (
                    <button
                      key={c}
                      className={`fdt-color-pick ${c === activeHl.color ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => {
                        onUpdateTool(activeHl.id, { color: c })
                        setColorPickerFor(null)
                      }}
                    />
                  ))}
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
