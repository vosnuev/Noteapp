import { useState } from 'react'
import { CalendarIcon } from '../Icons.jsx'

const uid = () => Math.random().toString(36).slice(2)

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function TodoBlock({ block, onChange, onAddEvent }) {
  const [newText, setNewText] = useState('')
  const [pickerForId, setPickerForId] = useState(null)
  const [pickedDate, setPickedDate] = useState(todayISO())
  const [pickedStart, setPickedStart] = useState('09:00')
  const [pickedEnd, setPickedEnd] = useState('10:00')

  const items = block.items || []
  const doneCount = items.filter(i => i.done).length
  const progress = items.length ? Math.round(doneCount / items.length * 100) : 0

  const addItem = () => {
    const t = newText.trim()
    if (!t) return
    onChange({ ...block, items: [...items, { id: uid(), text: t, done: false }] })
    setNewText('')
  }
  const toggleItem = (id) => onChange({
    ...block, items: items.map(it => it.id === id ? { ...it, done: !it.done } : it)
  })
  const delItem = (id) => onChange({
    ...block, items: items.filter(it => it.id !== id)
  })
  const editItem = (id, text) => onChange({
    ...block, items: items.map(it => it.id === id ? { ...it, text } : it)
  })

  const openPicker = (id) => {
    setPickerForId(pickerForId === id ? null : id)
    setPickedDate(todayISO())
    setPickedStart('09:00')
    setPickedEnd('10:00')
  }
  const confirmAddEvent = (item) => {
    if (!onAddEvent) return
    onAddEvent({
      id: uid(),
      title: item.text,
      date: pickedDate,
      startTime: pickedStart,
      endTime: pickedEnd,
      color: '#6d28d9',
      notes: '',
    })
    setPickerForId(null)
  }

  return (
    <div className="block-todo">
      <div className="block-label-row">
        <span className="block-label">✅ Todo</span>
        <span className="todo-progress">{doneCount}/{items.length}</span>
      </div>

      {items.length > 0 && (
        <div className="todo-bar-bg">
          <div className="todo-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="todo-list">
        {items.map(it => (
          <div key={it.id} className={`todo-item ${it.done ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={it.done}
              onChange={() => toggleItem(it.id)}
              className="todo-check"
            />
            <input
              className="todo-text-input"
              value={it.text}
              onChange={e => editItem(it.id, e.target.value)}
            />
            <button
              className={`todo-add-event ${pickerForId === it.id ? 'active' : ''}`}
              onClick={() => openPicker(it.id)}
              title="캘린더에 일정 추가"
            >
              <CalendarIcon size={11} />
            </button>
            <button className="del-row-btn" onClick={() => delItem(it.id)}>×</button>

            {pickerForId === it.id && (
              <div className="todo-event-picker">
                <div className="tep-quick">
                  <button onClick={() => setPickedDate(todayISO())}>오늘</button>
                  <button onClick={() => setPickedDate(tomorrowISO())}>내일</button>
                </div>
                <div className="tep-row">
                  <label>날짜</label>
                  <input
                    type="date"
                    value={pickedDate}
                    onChange={e => setPickedDate(e.target.value)}
                  />
                </div>
                <div className="tep-row-split">
                  <div className="tep-row">
                    <label>시작</label>
                    <input
                      type="time"
                      value={pickedStart}
                      onChange={e => setPickedStart(e.target.value)}
                    />
                  </div>
                  <div className="tep-row">
                    <label>종료</label>
                    <input
                      type="time"
                      value={pickedEnd}
                      onChange={e => setPickedEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tep-actions">
                  <button onClick={() => setPickerForId(null)}>취소</button>
                  <button className="primary" onClick={() => confirmAddEvent(it)}>
                    <CalendarIcon size={10} /> 일정 추가
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="todo-add-row">
        <input
          className="todo-new-input"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="+ 새 항목 추가 (Enter)"
        />
      </div>
    </div>
  )
}
