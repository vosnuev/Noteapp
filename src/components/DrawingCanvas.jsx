import { useRef, useEffect, useCallback } from 'react'

export default function DrawingCanvas({ isActive, penColor, penWidth, penTool, penOpacity = 1, eraserMode = 'pixel', strokes, onChange, onDrawStart, onDrawEnd }) {
  const canvasRef   = useRef(null)
  const isDown      = useRef(false)
  const currentPts  = useRef([])
  const dpr         = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
  const strokesRef  = useRef(strokes)
  strokesRef.current = strokes

  /* ── Draw one stroke ── */
  const drawStroke = (ctx, stroke) => {
    if (!stroke.points?.length) return
    ctx.save()
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth   = stroke.width * 5
    } else if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha  = stroke.opacity ?? 0.3
      ctx.strokeStyle  = stroke.color
      ctx.lineWidth    = stroke.width
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha  = 1
      ctx.strokeStyle  = stroke.color
      ctx.lineWidth    = stroke.width
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    const pts = stroke.points
    if (pts.length === 1) {
      ctx.beginPath()
      ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i+1].x) / 2
        const my = (pts[i].y + pts[i+1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y)
      ctx.stroke()
    }
    ctx.restore()
  }

  /* ── Redraw all strokes ── */
  const redraw = useCallback((extra = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    // Clear in CSS-pixel space
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    strokesRef.current.forEach(s => drawStroke(ctx, s))
    if (extra) drawStroke(ctx, extra)
  }, [dpr])

  /* ── Resize canvas to cover FULL parent scrollHeight ── */
  const applySize = useCallback(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!parent) return

    const w = parent.getBoundingClientRect().width
    const h = parent.scrollHeight          // ← full content height, not just visible

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`      // override the CSS 100%
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
    }
    redraw()
  }, [dpr, redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    applySize()
    const ro = new ResizeObserver(applySize)
    ro.observe(canvas.parentElement)
    return () => ro.disconnect()
  }, [applySize])

  // Redraw when strokes change from outside (undo/clear)
  useEffect(() => { redraw() }, [strokes, redraw])

  /* ── Pointer helpers ── */
  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure ?? 0.5,
    }
  }

  const onPointerDown = useCallback((e) => {
    if (!isActive) return
    e.preventDefault()
    applySize()                              // re-measure in case content grew
    isDown.current = true
    canvasRef.current.setPointerCapture(e.pointerId)
    currentPts.current = [getPos(e)]
    onDrawStart?.()
  }, [isActive, applySize, onDrawStart])

  /* ── Stroke eraser: pointer 위치와 가장 가까운 stroke를 통째로 삭제 ── */
  const distToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    const projX = x1 + t * dx
    const projY = y1 + t * dy
    return Math.hypot(px - projX, py - projY)
  }

  const findHitStroke = (pos, radius) => {
    const px = pos.x, py = pos.y
    for (let si = strokesRef.current.length - 1; si >= 0; si--) {
      const s = strokesRef.current[si]
      const pts = s.points || []
      const r = radius + (s.width || 1) / 2
      for (let i = 0; i < pts.length - 1; i++) {
        if (distToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) <= r) {
          return s.id
        }
      }
    }
    return null
  }

  const onPointerMove = useCallback((e) => {
    if (!isDown.current || !isActive) return
    e.preventDefault()
    const pos = getPos(e)
    // ── 스트로크 지우개: pointer 이동 시 hit한 stroke 통째로 제거 ──
    if (penTool === 'eraser' && eraserMode === 'stroke') {
      const hitId = findHitStroke(pos, penWidth)
      if (hitId) {
        const next = strokesRef.current.filter(s => s.id !== hitId)
        strokesRef.current = next
        redraw()
        onChange(next)
      }
      return
    }
    currentPts.current.push(pos)
    redraw({ points: currentPts.current, color: penColor, width: penWidth, tool: penTool, opacity: penTool === 'highlighter' ? penOpacity : 1 })
  }, [isActive, penColor, penWidth, penTool, penOpacity, eraserMode, redraw, onChange])

  const onPointerUp = useCallback((e) => {
    if (!isDown.current) return
    isDown.current = false
    if (currentPts.current.length > 0) {
      const stroke = {
        id: Date.now() + Math.random(),
        points: [...currentPts.current],
        color: penColor, width: penWidth, tool: penTool,
        opacity: penTool === 'highlighter' ? penOpacity : 1,
      }
      onChange([...strokesRef.current, stroke])
      onDrawEnd?.()
    }
    currentPts.current = []
  }, [penColor, penWidth, penTool, onChange, onDrawEnd])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        top:           0,
        left:          0,
        pointerEvents: isActive ? 'all' : 'none',
        cursor:        isActive ? (penTool === 'eraser' ? 'cell' : 'crosshair') : 'default',
        touchAction:   'none',
        zIndex:        10,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
