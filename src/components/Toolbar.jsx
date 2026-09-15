import { SunIcon, MoonIcon } from './Icons.jsx'

export default function Toolbar({
  isDrawMode, onToggleMode,
  breadcrumb,
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

      {/* Edit / Draw mode toggle */}
      <div className="toolbar-group">
        <button
          className={`tb-btn ${!isDrawMode ? 'active' : ''}`}
          onClick={() => isDrawMode && onToggleMode()}
        >
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
            <path d="M227.31 73.37 182.63 28.68a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69a15.86 15.86 0 0 0 11.31-4.69L227.32 96a16 16 0 0 0 0-22.62ZM92.69 208H48v-44.69l88-88L180.69 120ZM192 108.68 147.31 64 168 43.31 212.69 88Z"/>
          </svg>
          Edit
        </button>
        <button
          className={`tb-btn ${isDrawMode ? 'active' : ''}`}
          onClick={() => !isDrawMode && onToggleMode()}
        >
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
            <path d="m225.85 62.82-32.67-32.67a16 16 0 0 0-22.62 0l-127.7 127.7a4 4 0 0 0-1 1.72L29.34 215a8 8 0 0 0 10.7 10.7l55.39-12.57a4 4 0 0 0 1.72-1l127.7-127.7a16 16 0 0 0 0-22.62Zm-137.43 144-44 10 10-44 122.7-122.7 34 34Zm101.74-101.74L156 139.42 116.58 100l34-34 33.65 33.66Z"/>
          </svg>
          Draw
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <button
        className="tb-icon-btn theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  )
}
