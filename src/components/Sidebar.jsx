import {
  NoteIcon, CalendarIcon, NotebookIcon, FolderIcon, FileIcon,
  PlusIcon, ChevronRightIcon, CaretRightIcon, SortIcon, XIcon,
} from './Icons.jsx'

export default function Sidebar({
  activeTab, onSwitchTab,
  notebooks, selectedNotebookId, selectedSectionId, selectedPageId,
  sortedSections, sortedPages,
  sectionsOpen, pagesOpen, sectionsSort, pagesSort,
  onToggleSections, onTogglePages,
  onSectionsSortChange, onPagesSortChange,
  onSelectNotebook, onSelectSection, onSelectPage,
  onAddNotebook, onAddSection, onAddPage,
}) {
  const selectedNotebook = notebooks.find(n => n.id === selectedNotebookId)
  const selectedSection = selectedNotebook?.sections.find(s => s.id === selectedSectionId)

  return (
    <div className="sidebar-container">
      {/* ── 노트북스 패널: 탭은 항상 여기 — 캘린더 탭에서도 보임 ── */}
      <div className="sidebar-notebooks">
        <div className="sidebar-header">
          <div className="sidebar-tabs-inline">
            <button
              className={`sidebar-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => onSwitchTab('notes')}
            >
              <NoteIcon size={14} /> 노트
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => onSwitchTab('calendar')}
            >
              <CalendarIcon size={14} /> 캘린더
            </button>
          </div>
          {activeTab === 'notes' && (
            <div className="sidebar-header-label">Notebooks</div>
          )}
        </div>

        {activeTab === 'notes' && (
          <>
            <div className="sidebar-list">
              {notebooks.map(nb => (
                <div
                  key={nb.id}
                  className={`sidebar-item ${nb.id === selectedNotebookId ? 'selected' : ''}`}
                  onClick={() => onSelectNotebook(nb.id)}
                >
                  <span className="nb-icon"><NotebookIcon size={15} /></span>
                  <span className="nb-name">{nb.name}</span>
                  <span className="nb-count">{nb.sections.length}</span>
                </div>
              ))}
            </div>
            <button className="sidebar-add-btn" onClick={onAddNotebook}>
              <PlusIcon size={12} /> 새 노트북
            </button>
          </>
        )}
      </div>

      {/* ── sections 패널: 헤더 클릭으로 collapse/expand ── */}
      {activeTab === 'notes' && selectedNotebook && (
        <div className={`sidebar-sections ${sectionsOpen ? 'open' : 'closed'}`}>
          <div className="panel-header" onClick={onToggleSections}>
            <div className="panel-header-left">
              <CaretRightIcon
                size={11}
                className={`panel-chevron ${sectionsOpen ? 'rotated' : ''}`}
              />
              <span className="panel-title">Sections</span>
              <span className="panel-count">{sortedSections.length}</span>
            </div>
            <div className="panel-actions" onClick={e => e.stopPropagation()}>
              <select
                className="panel-sort"
                value={sectionsSort}
                onChange={e => onSectionsSortChange(e.target.value)}
                title="정렬"
              >
                <option value="default">기본</option>
                <option value="name">이름순</option>
                <option value="pages">페이지 많은순</option>
                <option value="recent">최근 수정순</option>
              </select>
            </div>
          </div>

          {sectionsOpen && (
            <>
              <div className="sidebar-list">
                {sortedSections.map(sec => (
                  <div
                    key={sec.id}
                    className={`section-item ${sec.id === selectedSectionId ? 'selected' : ''}`}
                    onClick={() => onSelectSection(sec.id)}
                  >
                    <span className="section-dot" style={{ background: sec.color }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sec.name}
                    </span>
                    <span style={{ fontSize: 11, opacity: .5 }}>{sec.pages.length}</span>
                  </div>
                ))}
              </div>
              <button className="sidebar-add-btn" onClick={onAddSection}>
                <PlusIcon size={12} /> 새 섹션
              </button>
            </>
          )}
        </div>
      )}

      {/* ── pages 패널: 헤더 클릭으로 collapse/expand ── */}
      {activeTab === 'notes' && selectedSection && (
        <div className={`sidebar-pages ${pagesOpen ? 'open' : 'closed'}`}>
          <div className="panel-header" onClick={onTogglePages}>
            <div className="panel-header-left">
              <CaretRightIcon
                size={11}
                className={`panel-chevron ${pagesOpen ? 'rotated' : ''}`}
              />
              <span className="panel-title">Pages</span>
              <span className="panel-count">{sortedPages.length}</span>
            </div>
            <div className="panel-actions" onClick={e => e.stopPropagation()}>
              <select
                className="panel-sort"
                value={pagesSort}
                onChange={e => onPagesSortChange(e.target.value)}
                title="정렬"
              >
                <option value="default">기본</option>
                <option value="name">이름순</option>
                <option value="strokes">필기 많은순</option>
              </select>
            </div>
          </div>

          {pagesOpen && (
            <>
              <div className="sidebar-list">
                {sortedPages.map(pg => (
                  <div
                    key={pg.id}
                    className={`page-item ${pg.id === selectedPageId ? 'selected' : ''}`}
                    onClick={() => onSelectPage(pg.id)}
                  >
                    <span className="page-icon"><FileIcon size={14} /></span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pg.name}
                    </span>
                    {pg.strokes?.length > 0 && <span style={{ fontSize: 10, opacity: .5 }}>✎</span>}
                  </div>
                ))}
              </div>
              <button className="sidebar-add-btn" onClick={onAddPage}>
                <PlusIcon size={12} /> 새 페이지
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
