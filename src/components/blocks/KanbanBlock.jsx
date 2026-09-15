import { useState } from 'react'

const COL_COLORS = ['#6d28d9', '#ea580c', '#0f766e']

export default function KanbanBlock({ block, onChange }) {
  const [newCards, setNewCards] = useState({})
  const columns = block.columns || [
    { id: 'c1', title: 'To Do', cards: [] },
    { id: 'c2', title: 'In Progress', cards: [] },
    { id: 'c3', title: 'Done', cards: [] },
  ]

  const addCard = (colId) => {
    const text = (newCards[colId] || '').trim()
    if (!text) return
    onChange({
      ...block, columns: columns.map(col =>
        col.id === colId ? { ...col, cards: [...col.cards, { id: Date.now() + '', text }] } : col
      )
    })
    setNewCards(n => ({ ...n, [colId]: '' }))
  }
  const delCard = (colId, cardId) => onChange({
    ...block, columns: columns.map(col =>
      col.id === colId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    )
  })
  const updateTitle = (colId, title) => onChange({
    ...block, columns: columns.map(col => col.id === colId ? { ...col, title } : col)
  })

  return (
    <div className="block-kanban">
      <div className="block-label-row">
        <span className="block-label">📋 Kanban</span>
      </div>
      <div className="kanban-cols">
        {columns.map((col, ci) => (
          <div key={col.id} className="kanban-col">
            <div className="kanban-col-header" style={{ borderTopColor: COL_COLORS[ci % COL_COLORS.length] }}>
              <input
                className="kanban-col-title"
                value={col.title}
                onChange={e => updateTitle(col.id, e.target.value)}
              />
              <span className="kanban-count">{col.cards.length}</span>
            </div>
            <div className="kanban-cards">
              {col.cards.map(card => (
                <div key={card.id} className="kanban-card">
                  <span>{card.text}</span>
                  <button className="del-row-btn" onClick={() => delCard(col.id, card.id)}>×</button>
                </div>
              ))}
            </div>
            <div className="kanban-add-row">
              <input
                className="kanban-new-input"
                value={newCards[col.id] || ''}
                onChange={e => setNewCards(n => ({ ...n, [col.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCard(col.id)}
                placeholder="+ 카드 추가"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
