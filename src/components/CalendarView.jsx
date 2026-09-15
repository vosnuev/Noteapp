import { useState, useMemo, useRef, useEffect } from 'react'

const uid = () => Math.random().toString(36).slice(2)

const KOREAN_DAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']
const KOREAN_MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

/* ── Date helpers ── */
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const startOfWeek = (d) => {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0,0,0,0)
  return x
}
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const addMonths = (d, n) => {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}
const isSameDay = (a, b) => a && b && ymd(a) === ymd(b)

/* ── Mini calendar ── */
function MiniCalendar({ selectedDate, onSelectDate, today }) {
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const firstDay = startOfMonth(viewMonth)
  const startGrid = startOfWeek(firstDay)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(startGrid, i))

  return (
    <div className="cal-mini">
      <div className="cal-mini-header">
        <button className="cal-mini-nav" onClick={() => setViewMonth(addMonths(viewMonth, -1))}>‹</button>
        <div className="cal-mini-title">{viewMonth.getFullYear()}년 {KOREAN_MONTHS[viewMonth.getMonth()]}</div>
        <button className="cal-mini-nav" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>›</button>
      </div>
      <div className="cal-mini-weekdays">
        {KOREAN_DAYS_SHORT.map(d => <div key={d} className="cal-mini-wd">{d}</div>)}
      </div>
      <div className="cal-mini-grid">
        {cells.map((c, i) => {
          const inMonth = c.getMonth() === viewMonth.getMonth()
          const isToday = isSameDay(c, today)
          const isSelected = isSameDay(c, selectedDate)
          return (
            <div
              key={i}
              className={`cal-mini-cell ${inMonth ? '' : 'out'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(new Date(c))}
            >
              {c.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Event editor modal ── */
function EventEditor({ event, defaultDate, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate ?? ymd(new Date()))
  const [startTime, setStartTime] = useState(event?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(event?.endTime ?? '10:00')
  const [color, setColor] = useState(event?.color ?? '#007AFF')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const COLORS = [
    '#6d28d9',  // Deep Purple
    '#ea580c',  // Deep Orange
    '#0f766e',  // Teal
    '#15803d',  // Forest Green
    '#a16207',  // Amber
    '#1e40af',  // Navy
    '#9f1239',  // Wine
    '#4a044e',  // Plum
  ]

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!title.trim()) return
    onSave({
      ...(event || {}),
      id: event?.id ?? uid(),
      title: title.trim(),
      date,
      startTime,
      endTime,
      color,
      notes: notes.trim(),
    })
  }

  return (
    <div className="cal-modal-bg" onClick={onCancel}>
      <div className="cal-modal" onClick={e => e.stopPropagation()}>
        <div className="cal-modal-title">{event ? '이벤트 수정' : '새 이벤트'}</div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="cal-input"
            placeholder="이벤트 제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="cal-form-row">
            <label>날짜</label>
            <input type="date" className="cal-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="cal-form-row-split">
            <div className="cal-form-row">
              <label>시작</label>
              <input type="time" className="cal-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="cal-form-row">
              <label>종료</label>
              <input type="time" className="cal-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="cal-form-row">
            <label>색상</label>
            <div className="cal-color-picker">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`cal-color-dot ${c === color ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <textarea
            className="cal-input cal-textarea"
            placeholder="메모 (선택)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
          <div className="cal-modal-actions">
            {event && (
              <button type="button" className="cal-btn cal-btn-danger" onClick={() => onDelete(event.id)}>
                삭제
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="cal-btn" onClick={onCancel}>취소</button>
            <button type="submit" className="cal-btn cal-btn-primary">{event ? '저장' : '추가'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Month view ── */
function MonthView({ selectedDate, events, onSelectDate, onEventClick }) {
  const firstDay = startOfMonth(selectedDate)
  const startGrid = startOfWeek(firstDay)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(startGrid, i))

  return (
    <div className="cal-month">
      <div className="cal-month-weekdays">
        {KOREAN_DAYS_SHORT.map(d => <div key={d} className="cal-month-wd">{d}</div>)}
      </div>
      <div className="cal-month-grid">
        {cells.map((c, i) => {
          const inMonth = c.getMonth() === selectedDate.getMonth()
          const isToday = isSameDay(c, new Date())
          const isSelected = isSameDay(c, selectedDate)
          const dayEvents = events.filter(e => e.date === ymd(c))
          return (
            <div
              key={i}
              className={`cal-month-cell ${inMonth ? '' : 'out'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(new Date(c))}
            >
              <div className="cal-month-cell-num">{c.getDate()}</div>
              <div className="cal-month-cell-events">
                {dayEvents.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    className="cal-event-chip"
                    style={{ background: e.color }}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick(e) }}
                  >
                    {e.startTime && <span className="cal-event-time">{e.startTime}</span>}
                    <span className="cal-event-title">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="cal-event-more">+{dayEvents.length - 3}개 더</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Week view ── */
function TimeGridView({ days, events, onCellClick, onEventClick }) {
  const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0~23
  const HOUR_HEIGHT = 48 // px per hour

  return (
    <div className="cal-timegrid-wrap">
      <div
        className="cal-timegrid-header"
        style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
      >
        <div className="cal-timegrid-corner" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, new Date())
          return (
            <div key={i} className={`cal-timegrid-day-h ${isToday ? 'today' : ''}`}>
              <div className="cal-timegrid-day-dow">{KOREAN_DAYS_SHORT[d.getDay()]}</div>
              <div className="cal-timegrid-day-num">{d.getDate()}</div>
            </div>
          )
        })}
      </div>
      <div className="cal-timegrid-scroll">
        <div
          className="cal-timegrid-body"
          style={{ position: 'relative', gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
        >
          <div className="cal-timegrid-time-col">
            {HOURS.map(h => (
              <div key={h} className="cal-timegrid-hour-label" style={{ height: HOUR_HEIGHT }}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
              </div>
            ))}
          </div>
          {days.map((d, di) => {
            const dayEvents = events.filter(e => e.date === ymd(d))
            return (
              <div key={di} className="cal-timegrid-col" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const y = e.clientY - rect.top
                const hour = Math.max(0, Math.min(23, Math.floor(y / HOUR_HEIGHT)))
                const mm = Math.round((y % HOUR_HEIGHT) / HOUR_HEIGHT * 60 / 15) * 15
                onCellClick(d, hour, mm)
              }}>
                {HOURS.map(h => (
                  <div key={h} className="cal-timegrid-hour-row" style={{ height: HOUR_HEIGHT }}>
                    <div className="cal-timegrid-half-line" />
                  </div>
                ))}
                {dayEvents.map(ev => {
                  const [sh, sm] = (ev.startTime || '00:00').split(':').map(Number)
                  const [eh, em] = (ev.endTime || '23:59').split(':').map(Number)
                  const top = (sh + sm/60) * HOUR_HEIGHT
                  const height = Math.max(24, ((eh + em/60) - (sh + sm/60)) * HOUR_HEIGHT)
                  return (
                    <div
                      key={ev.id}
                      className="cal-timegrid-event"
                      style={{ top, height, background: ev.color }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                    >
                      <div className="cal-tg-ev-title">{ev.title}</div>
                      <div className="cal-tg-ev-time">{ev.startTime} – {ev.endTime}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Main view ── */
export default function CalendarView({ events, onEventsChange }) {
  const [view, setView] = useState('month') // 'month' | 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editing, setEditing] = useState(null) // null | {mode:'new', date, hour, minute} | event

  const today = useMemo(() => new Date(), [])

  const addEvent = (ev) => {
    onEventsChange([...events, ev])
    setEditing(null)
  }
  const updateEvent = (ev) => {
    onEventsChange(events.map(e => e.id === ev.id ? ev : e))
    setEditing(null)
  }
  const deleteEvent = (id) => {
    onEventsChange(events.filter(e => e.id !== id))
    setEditing(null)
  }

  // Day / week date ranges
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [selectedDate])
  const dayList = useMemo(() => [selectedDate], [selectedDate])

  // Navigation handlers
  const goToday = () => setSelectedDate(new Date())
  const goPrev = () => {
    if (view === 'month') setSelectedDate(d => addMonths(d, -1))
    else if (view === 'week') setSelectedDate(d => addDays(d, -7))
    else setSelectedDate(d => addDays(d, -1))
  }
  const goNext = () => {
    if (view === 'month') setSelectedDate(d => addMonths(d, 1))
    else if (view === 'week') setSelectedDate(d => addDays(d, 7))
    else setSelectedDate(d => addDays(d, 1))
  }

  const title = view === 'month'
    ? `${selectedDate.getFullYear()}년 ${KOREAN_MONTHS[selectedDate.getMonth()]}`
    : view === 'week'
    ? `${weekDays[0].getMonth()+1}월 ${weekDays[0].getDate()}일 – ${weekDays[6].getMonth()+1}월 ${weekDays[6].getDate()}일, ${selectedDate.getFullYear()}`
    : `${selectedDate.getFullYear()}년 ${KOREAN_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}일 (${KOREAN_DAYS_SHORT[selectedDate.getDay()]})`

  const handleCellClick = (date, hour, minute) => {
    const startH = String(hour).padStart(2,'0')
    const startM = String(minute).padStart(2,'0')
    const endH = String(Math.min(23, hour+1)).padStart(2,'0')
    setEditing({
      mode: 'new',
      date: ymd(date),
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${startM}`,
    })
  }

  const handleNewEventToday = () => {
    setEditing({
      mode: 'new',
      date: ymd(selectedDate),
      startTime: '09:00',
      endTime: '10:00',
    })
  }

  const handleEditEvent = (ev) => {
    setEditing(ev)
  }

  return (
    <div className="cal-view">
      <div className="cal-toolbar">
        <button className="cal-tb-btn" onClick={goToday}>오늘</button>
        <button className="cal-tb-icon" onClick={goPrev} aria-label="이전">‹</button>
        <button className="cal-tb-icon" onClick={goNext} aria-label="다음">›</button>
        <div className="cal-tb-title">{title}</div>
        <div style={{ flex: 1 }} />
        <button className="cal-tb-btn cal-tb-primary" onClick={handleNewEventToday}>+ 새 이벤트</button>
        <div className="cal-view-switch">
          <button className={`cal-vs-btn ${view==='month'?'active':''}`} onClick={() => setView('month')}>월</button>
          <button className={`cal-vs-btn ${view==='week'?'active':''}`} onClick={() => setView('week')}>주</button>
          <button className={`cal-vs-btn ${view==='day'?'active':''}`} onClick={() => setView('day')}>일</button>
        </div>
      </div>

      <div className="cal-body">
        <div className="cal-sidebar">
          <MiniCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            today={today}
          />
          <div className="cal-sidebar-summary">
            <div className="cal-sum-title">이번 달 일정</div>
            <div className="cal-sum-count">{events.filter(e => {
              const d = new Date(e.date)
              return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth()
            }).length}개</div>
          </div>
        </div>

        <div className="cal-main">
          {view === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              events={events}
              onSelectDate={setSelectedDate}
              onEventClick={handleEditEvent}
            />
          )}
          {(view === 'week' || view === 'day') && (
            <TimeGridView
              days={view === 'week' ? weekDays : dayList}
              events={events}
              onCellClick={handleCellClick}
              onEventClick={handleEditEvent}
            />
          )}
        </div>
      </div>

      {editing && (
        <EventEditor
          event={editing.mode === 'new' ? null : editing}
          defaultDate={editing.date}
          onSave={editing.mode === 'new' ? addEvent : updateEvent}
          onCancel={() => setEditing(null)}
          onDelete={deleteEvent}
        />
      )}
    </div>
  )
}
