const COLORS = [
  { value: '#1c1c1e', label: '검정' },
  { value: '#007AFF', label: '파랑' },
  { value: '#FF3B30', label: '빨강' },
  { value: '#34C759', label: '초록' },
  { value: '#FF9500', label: '주황' },
  { value: '#AF52DE', label: '보라' },
  { value: '#FF2D55', label: '핑크' },
]

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
  </svg>
)

const HighlightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l-6 6v3h3l6-6"/><path d="M22 4l-3-3-9 9 3 3 9-9z"/>
  </svg>
)

const EraserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7-1.5 1.5"/><path d="M6.5 17.5l5-5"/>
  </svg>
)

const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export default function Toolbar({
  isDrawMode, onToggleMode,
  penColor, onColorChange,
  penWidth, onWidthChange,
  penTool, onToolChange,
  onUndo, onClear,
  breadcrumb, hasStrokes,
  theme, onToggleTheme,
}) {
  return (
    <div className="toolbar">
      <span className="toolbar-logo">✦ NoteCanvas</span>

      {/* Breadcrumb */}
      <div className="toolbar-breadcrumb">
        {breadcrumb.notebook && <><span>{breadcrumb.notebook}</span><span className="sep">/</span></>}
        {breadcrumb.section && <><span>{breadcrumb.section}</span><span className="sep">/</span></>}
        {breadcrumb.page && <span className="current">{breadcrumb.page}</span>}
      </div>

      <div className="toolbar-divider" />

      {/* Theme toggle — light/dark */}
      <button
        className="tb-icon-btn theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      {/* Mode toggle */}
      <div className="toolbar-group">
        <button className={`tb-btn ${!isDrawMode ? 'active' : ''}`} onClick={() => isDrawMode && onToggleMode()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button className={`tb-btn ${isDrawMode ? 'active' : ''}`} onClick={() => !isDrawMode && onToggleMode()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/></svg>
          Draw
        </button>
      </div>

      {/* Draw tools — only visible in draw mode */}
      {isDrawMode && (
        <>
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <button className={`tb-icon-btn ${penTool === 'pen' ? 'active' : ''}`} onClick={() => onToolChange('pen')} title="펜">
              <PenIcon />
            </button>
            <button className={`tb-icon-btn ${penTool === 'highlighter' ? 'active' : ''}`} onClick={() => onToolChange('highlighter')} title="형광펜">
              <HighlightIcon />
            </button>
            <button className={`tb-icon-btn ${penTool === 'eraser' ? 'active' : ''}`} onClick={() => onToolChange('eraser')} title="지우개">
              <EraserIcon />
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Colors */}
          <div className="toolbar-group">
            {COLORS.map(c => (
              <div
                key={c.value}
                className={`color-swatch ${penColor === c.value ? 'selected' : ''}`}
                style={{ background: c.value }}
                onClick={() => onColorChange(c.value)}
                title={c.label}
              />
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Width */}
          <div className="toolbar-group">
            <input
              type="range" min="1" max="12" value={penWidth}
              onChange={e => onWidthChange(Number(e.target.value))}
              className="width-slider"
              title={`굵기: ${penWidth}`}
            />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 16, textAlign: 'center' }}>{penWidth}</span>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button className="tb-icon-btn" onClick={onUndo} title="실행취소 (Ctrl+Z)" disabled={!hasStrokes} style={{ opacity: hasStrokes ? 1 : .35 }}>
              <UndoIcon />
            </button>
            <button className="tb-icon-btn" onClick={onClear} title="필기 전체 지우기" disabled={!hasStrokes} style={{ opacity: hasStrokes ? 1 : .35, color: hasStrokes ? 'var(--danger)' : undefined }}>
              <TrashIcon />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
