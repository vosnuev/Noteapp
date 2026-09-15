import { useState, useCallback, useEffect, useMemo } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Toolbar from './components/Toolbar.jsx'
import ContentArea from './components/ContentArea.jsx'
import CalendarView from './components/CalendarView.jsx'

const uid = () => Math.random().toString(36).slice(2)
const STORAGE_KEY = 'noteapp-data-v1'
const EVENTS_KEY = 'noteapp-events-v1'
const UI_KEY = 'noteapp-ui-v1'
const THEME_KEY = 'noteapp-theme-v1'

// Noteapp 브랜드 팔레트: deep purple 베이스 + 차분한 보조색들
// (saturation < 80%, 진한 톤 → neon 느낌 없음, 보라-주황과 어울림)
export const BRAND_PALETTE = [
  '#6d28d9',  // 1. Deep Purple (primary)
  '#ea580c',  // 2. Deep Orange (secondary)
  '#0f766e',  // 3. Teal
  '#15803d',  // 4. Forest Green
  '#a16207',  // 5. Amber
  '#1e40af',  // 6. Navy
  '#9f1239',  // 7. Wine
  '#4a044e',  // 8. Plum
]

const loadTheme = () => {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark') return t
  } catch {}
  return 'light'
}

const loadNotebooks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch (e) {
    console.warn('[noteapp] localStorage load failed:', e)
    return null
  }
}

const loadEvents = () => {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[noteapp] events load failed:', e)
    return []
  }
}

const INITIAL_DATA = [
  {
    id: 'nb1', name: 'My Notebook', icon: '📓',
    sections: [
      {
        id: 'sec1', name: 'Planning', color: '#6d28d9',
        pages: [
          {
            id: 'p1', name: 'Weekly Planner',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '📅 이 주 계획' },
              {
                id: uid(), type: 'table',
                headers: ['시간','월','화','수','목','금','토','일'],
                rows: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
                  .map(t => [t,'','','','','','',''])
              },
            ],
            strokes: []
          },
          {
            id: 'p2', name: 'Daily Notes',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: 'Daily Notes' },
              { id: uid(), type: 'todo', items: [
                { id: uid(), text: '아침 운동', done: false },
                { id: uid(), text: '이메일 확인', done: true },
                { id: uid(), text: '프로젝트 리뷰', done: false },
              ]},
            ],
            strokes: []
          },
        ]
      },
      {
        id: 'sec2', name: 'Ideas', color: '#ea580c',
        pages: [
          {
            id: 'p3', name: 'Brain Dump',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '💡 아이디어' },
              { id: uid(), type: 'markdown', text: '## 아이디어 목록\n\n- **아이디어 1**: 설명\n- **아이디어 2**: 설명\n\n> 좋은 아이디어는 기록에서 시작된다.' },
            ],
            strokes: []
          },
        ]
      },
      {
        id: 'sec3', name: 'Projects', color: '#0f766e',
        pages: [
          {
            id: 'p4', name: 'Project Board',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '🚀 프로젝트 보드' },
              { id: uid(), type: 'kanban', columns: [
                { id: 'c1', title: 'To Do', cards: [{ id: uid(), text: '기획서 작성' }, { id: uid(), text: 'UI 디자인' }] },
                { id: 'c2', title: 'In Progress', cards: [{ id: uid(), text: '개발 중' }] },
                { id: 'c3', title: 'Done', cards: [{ id: uid(), text: '요구사항 정의' }] },
              ]},
            ],
            strokes: []
          },
        ]
      },
    ]
  },
  {
    id: 'nb2', name: 'Study', icon: '📚',
    sections: [
      {
        id: 'sec4', name: 'Math', color: '#4a044e',
        pages: [
          {
            id: 'p5', name: '수식 노트',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '📐 수식 노트' },
              { id: uid(), type: 'math', formula: 'E = mc^2' },
              { id: uid(), type: 'math', formula: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
              { id: uid(), type: 'code', language: 'python', code: 'import math\nprint(math.pi)\nprint(math.e)' },
            ],
            strokes: []
          },
        ]
      },
      {
        id: 'sec5', name: 'Code', color: '#9f1239',
        pages: [
          {
            id: 'p6', name: '코드 스니펫',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '💻 코드 스니펫' },
              { id: uid(), type: 'code', language: 'javascript', code: 'const greet = (name) => {\n  return `Hello, ${name}!`\n}\nconsole.log(greet("World"))' },
            ],
            strokes: []
          },
        ]
      },
    ]
  },
  {
    id: 'nb3', name: 'Work', icon: '💼',
    sections: [
      {
        id: 'sec6', name: 'Schedule', color: '#a16207',
        pages: [
          {
            id: 'p7', name: '일정',
            blocks: [
              { id: uid(), type: 'heading', level: 1, text: '📅 일정 관리' },
              { id: uid(), type: 'calendar', year: 2026, month: 5, notes: {} },
            ],
            strokes: []
          },
        ]
      },
    ]
  },
]

const loadUi = () => {
  try {
    const raw = localStorage.getItem(UI_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}
const initialUi = loadUi() || {}

export default function App() {
  const [notebooks, setNotebooks] = useState(() => loadNotebooks() ?? INITIAL_DATA)
  const [events, setEvents] = useState(() => loadEvents())
  const [activeTab, setActiveTab] = useState(initialUi.activeTab ?? 'notes')
  const [selectedNotebookId, setSelectedNotebookId] = useState(initialUi.selectedNotebookId ?? 'nb1')
  const [selectedSectionId, setSelectedSectionId] = useState(initialUi.selectedSectionId ?? 'sec1')
  const [selectedPageId, setSelectedPageId] = useState(initialUi.selectedPageId ?? 'p1')
  const [sectionsOpen, setSectionsOpen] = useState(initialUi.sectionsOpen ?? true)
  const [pagesOpen, setPagesOpen] = useState(initialUi.pagesOpen ?? true)
  const [sectionsSort, setSectionsSort] = useState(initialUi.sectionsSort ?? 'default')
  const [pagesSort, setPagesSort] = useState(initialUi.pagesSort ?? 'default')
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [theme, setTheme] = useState(loadTheme)

  /* ── 드로우 도구함: 사용자 정의 펜/형광펜/지우개 ── */
  const defaultDrawTools = [
    { id: 'dt-ink',  type: 'pen',         color: '#1c1c1e', width: 3,  opacity: 1   },
    { id: 'dt-prpl', type: 'pen',         color: '#6d28d9', width: 3,  opacity: 1   },
    { id: 'dt-org',  type: 'pen',         color: '#ea580c', width: 5,  opacity: 1   },
    { id: 'dt-hl1',  type: 'highlighter', color: '#ea580c', width: 18, opacity: 0.3 },
    { id: 'dt-hl2',  type: 'highlighter', color: '#6d28d9', width: 18, opacity: 0.3 },
    { id: 'dt-er',   type: 'eraser',      color: '#000000', width: 28, opacity: 1   },
  ]
  const [drawTools, setDrawTools] = useState(defaultDrawTools)
  const [activeDrawToolId, setActiveDrawToolId] = useState('dt-ink')
  const [eraserMode, setEraserMode] = useState('pixel') // 'pixel' | 'stroke'
  const activeDrawTool = drawTools.find(t => t.id === activeDrawToolId) || defaultDrawTools[0]
  const penColor = activeDrawTool.color
  const penWidth = activeDrawTool.width
  const penTool = activeDrawTool.type
  const penOpacity = activeDrawTool.opacity ?? 1

  /* ── Persist UI state (탭/선택/토글/정렬) ── */
  useEffect(() => {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({
        activeTab, selectedNotebookId, selectedSectionId, selectedPageId,
        sectionsOpen, pagesOpen, sectionsSort, pagesSort,
      }))
    } catch (e) { console.warn('[noteapp] ui save failed:', e) }
  }, [activeTab, selectedNotebookId, selectedSectionId, selectedPageId, sectionsOpen, pagesOpen, sectionsSort, pagesSort])

  /* ── 테마 적용: <html data-theme="..."> + localStorage 영속 ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(THEME_KEY, theme) } catch {}
  }, [theme])

  /* ── Persist notebooks to localStorage on every change ── */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks))
    } catch (e) {
      console.warn('[noteapp] localStorage save failed:', e)
    }
  }, [notebooks])

  /* ── Persist calendar events ── */
  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    } catch (e) {
      console.warn('[noteapp] events save failed:', e)
    }
  }, [events])

  /* ── If selected ids are invalid after load, fall back to first available ── */
  useEffect(() => {
    if (!notebooks.length) return
    const nb = notebooks.find(n => n.id === selectedNotebookId)
    if (!nb) {
      const first = notebooks[0]
      setSelectedNotebookId(first.id)
      const sec = first.sections[0]
      setSelectedSectionId(sec?.id ?? null)
      setSelectedPageId(sec?.pages[0]?.id ?? null)
      return
    }
    const sec = nb.sections.find(s => s.id === selectedSectionId)
    if (!sec) {
      const firstSec = nb.sections[0]
      setSelectedSectionId(firstSec?.id ?? null)
      setSelectedPageId(firstSec?.pages[0]?.id ?? null)
      return
    }
    const pg = sec.pages.find(p => p.id === selectedPageId)
    if (!pg) {
      setSelectedPageId(sec.pages[0]?.id ?? null)
    }
  }, [notebooks])

  const selectedNotebook = notebooks.find(n => n.id === selectedNotebookId)
  const selectedSection = selectedNotebook?.sections.find(s => s.id === selectedSectionId)
  const selectedPage = selectedSection?.pages.find(p => p.id === selectedPageId)

  /* ── 정렬된 sections / pages ── */
  const sortedSections = useMemo(() => {
    if (!selectedNotebook) return []
    const arr = [...selectedNotebook.sections]
    if (sectionsSort === 'name')   arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    if (sectionsSort === 'pages')  arr.sort((a, b) => b.pages.length - a.pages.length)
    if (sectionsSort === 'recent') arr.sort((a, b) => {
      const aTime = Math.max(0, ...a.pages.map(p => p.updatedAt || 0))
      const bTime = Math.max(0, ...b.pages.map(p => p.updatedAt || 0))
      return bTime - aTime
    })
    return arr
  }, [selectedNotebook, sectionsSort])

  const sortedPages = useMemo(() => {
    if (!selectedSection) return []
    const arr = [...selectedSection.pages]
    if (pagesSort === 'name')    arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    if (pagesSort === 'strokes') arr.sort((a, b) => (b.strokes?.length || 0) - (a.strokes?.length || 0))
    return arr
  }, [selectedSection, pagesSort])

  const updatePage = useCallback((pageId, updater) => {
    setNotebooks(prev => prev.map(nb => ({
      ...nb,
      sections: nb.sections.map(sec => ({
        ...sec,
        pages: sec.pages.map(pg => pg.id === pageId ? updater(pg) : pg)
      }))
    })))
  }, [])

  const handleBlocksChange = useCallback((blocks) => {
    updatePage(selectedPageId, pg => ({ ...pg, blocks }))
  }, [selectedPageId, updatePage])

  const handleStrokesChange = useCallback((strokes) => {
    updatePage(selectedPageId, pg => ({ ...pg, strokes }))
  }, [selectedPageId, updatePage])

  const handleNameChange = useCallback((name) => {
    updatePage(selectedPageId, pg => ({ ...pg, name }))
    setNotebooks(prev => prev.map(nb => ({
      ...nb,
      sections: nb.sections.map(sec => ({
        ...sec,
        pages: sec.pages.map(pg => pg.id === selectedPageId ? { ...pg, name } : pg)
      }))
    })))
  }, [selectedPageId])

  // ── Create helpers ──
  const addNotebook = useCallback(() => {
    const name = window.prompt('노트북 이름:', 'New Notebook')
    if (!name) return
    const nb = { id: uid(), name, icon: '📓', sections: [] }
    setNotebooks(prev => [...prev, nb])
    setSelectedNotebookId(nb.id)
    setSelectedSectionId(null)
    setSelectedPageId(null)
  }, [])

  const addSection = useCallback(() => {
    const name = window.prompt('섹션 이름:', 'New Section')
    if (!name) return
    const colors = BRAND_PALETTE
    const sec = { id: uid(), name, color: colors[Math.floor(Math.random()*colors.length)], pages: [] }
    setNotebooks(prev => prev.map(nb =>
      nb.id === selectedNotebookId ? { ...nb, sections: [...nb.sections, sec] } : nb
    ))
    setSelectedSectionId(sec.id)
    setSelectedPageId(null)
  }, [selectedNotebookId])

  const addPage = useCallback(() => {
    const name = window.prompt('페이지 이름:', 'Untitled')
    if (!name) return
    const page = {
      id: uid(), name,
      blocks: [{ id: uid(), type: 'heading', level: 1, text: name }],
      strokes: []
    }
    setNotebooks(prev => prev.map(nb => ({
      ...nb,
      sections: nb.sections.map(sec =>
        sec.id === selectedSectionId ? { ...sec, pages: [...sec.pages, page] } : sec
      )
    })))
    setSelectedPageId(page.id)
  }, [selectedSectionId])

  const handleUndo = useCallback(() => {
    if (selectedPage) handleStrokesChange(selectedPage.strokes.slice(0, -1))
  }, [selectedPage, handleStrokesChange])

  const handleClear = useCallback(() => {
    if (selectedPage) handleStrokesChange([])
  }, [selectedPage, handleStrokesChange])

  /* ── 드로우 도구함 핸들러 ── */
  const handleSelectDrawTool = useCallback((id) => setActiveDrawToolId(id), [])
  const handleUpdateDrawTool = useCallback((id, patch) => {
    setDrawTools(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])
  const handleAddDrawTool = useCallback((type) => {
    const defaults = type === 'highlighter'
      ? { color: '#ea580c', width: 18, opacity: 0.3 }
      : { color: '#6d28d9', width: 3, opacity: 1 }
    const id = 'dt-' + Date.now().toString(36)
    setDrawTools(prev => [...prev, { id, type, ...defaults }])
    setActiveDrawToolId(id)
  }, [])
  const handleRemoveDrawTool = useCallback((id) => {
    setDrawTools(prev => {
      const next = prev.filter(t => t.id !== id)
      if (id === activeDrawToolId) {
        const fallback = next.find(t => t.type === 'pen') || next[0]
        if (fallback) setActiveDrawToolId(fallback.id)
      }
      return next
    })
  }, [activeDrawToolId])

  return (
    <div className="app">
      <Toolbar
        isDrawMode={isDrawMode}
        onToggleMode={() => setIsDrawMode(d => !d)}
        penColor={penColor}
        onColorChange={setPenColor}
        penWidth={penWidth}
        onWidthChange={setPenWidth}
        penTool={penTool}
        onToolChange={setPenTool}
        onUndo={handleUndo}
        onClear={handleClear}
        breadcrumb={
          activeTab === 'calendar'
            ? { notebook: '캘린더', section: '', page: '' }
            : {
                notebook: selectedNotebook?.name,
                section: selectedSection?.name,
                page: selectedPage?.name,
              }
        }
        hasStrokes={selectedPage?.strokes?.length > 0}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      />
      <div className="app-body">
        <Sidebar
          activeTab={activeTab}
          onSwitchTab={setActiveTab}
          notebooks={notebooks}
          selectedNotebookId={selectedNotebookId}
          selectedSectionId={selectedSectionId}
          selectedPageId={selectedPageId}
          sectionsOpen={sectionsOpen}
          pagesOpen={pagesOpen}
          sectionsSort={sectionsSort}
          pagesSort={pagesSort}
          sortedSections={sortedSections}
          sortedPages={sortedPages}
          onToggleSections={() => setSectionsOpen(o => !o)}
          onTogglePages={() => setPagesOpen(o => !o)}
          onSectionsSortChange={setSectionsSort}
          onPagesSortChange={setPagesSort}
          onSelectNotebook={(id) => {
            setSelectedNotebookId(id)
            const nb = notebooks.find(n => n.id === id)
            if (nb?.sections[0]) {
              setSelectedSectionId(nb.sections[0].id)
              setSelectedPageId(nb.sections[0].pages[0]?.id ?? null)
            } else {
              setSelectedSectionId(null)
              setSelectedPageId(null)
            }
          }}
          onSelectSection={(id) => {
            setSelectedSectionId(id)
            const sec = selectedNotebook?.sections.find(s => s.id === id)
            setSelectedPageId(sec?.pages[0]?.id ?? null)
          }}
          onSelectPage={setSelectedPageId}
          onAddNotebook={addNotebook}
          onAddSection={addSection}
          onAddPage={addPage}
        />
        {activeTab === 'notes' ? (
          <ContentArea
            page={selectedPage}
            isDrawMode={isDrawMode}
            penColor={penColor}
            penWidth={penWidth}
            penTool={penTool}
            penOpacity={penOpacity}
            eraserMode={eraserMode}
            setEraserMode={setEraserMode}
            drawTools={drawTools}
            activeDrawToolId={activeDrawToolId}
            onSelectDrawTool={handleSelectDrawTool}
            onUpdateDrawTool={handleUpdateDrawTool}
            onAddDrawTool={handleAddDrawTool}
            onRemoveDrawTool={handleRemoveDrawTool}
            onUndoStrokes={handleUndo}
            onClearStrokes={handleClear}
            onStrokesChange={handleStrokesChange}
            onBlocksChange={handleBlocksChange}
            onNameChange={handleNameChange}
          />
        ) : (
          <CalendarView
            events={events}
            onEventsChange={setEvents}
          />
        )}
      </div>
    </div>
  )
}
