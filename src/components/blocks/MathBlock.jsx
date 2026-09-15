import { useState, useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export default function MathBlock({ block, onChange }) {
  // 커서가 input 안에 있으면 편집, 밖(blur)면 자동 저장 + 미리보기
  const [focused, setFocused] = useState(!block.formula)
  const [renderError, setRenderError] = useState(null)
  const renderRef = useRef(null)

  useEffect(() => {
    if (!focused && block.formula) {
      const el = renderRef.current
      if (!el) return
      try {
        // throwOnError:true로 바꿔서 에러를 우리가 잡아냄
        katex.render(block.formula, el, {
          displayMode: true,
          throwOnError: true,
          strict: false,
        })
        setRenderError(null)
      } catch (e) {
        // 실패 시 에러 메시지 + 원본 텍스트 fallback 표시
        setRenderError(e?.message || '수식 문법 오류')
      }
    }
  }, [focused, block.formula])

  const showEditor = focused || !block.formula

  return (
    <div className="block-math">
      <div className="block-math-header">
        <span className="block-label">📐 수식</span>
        <span className="block-hint">
          {showEditor ? '입력 중 — 바깥 클릭 시 자동 저장' : '클릭해서 편집'}
        </span>
      </div>

      {showEditor ? (
        <input
          className="math-input"
          value={block.formula || ''}
          onChange={e => onChange({ ...block, formula: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="LaTeX 수식 입력 (예: E = mc^2)"
          autoFocus={!block.formula}
          spellCheck={false}
        />
      ) : (
        <div
          ref={renderRef}
          className={`math-render ${renderError ? 'has-error' : ''}`}
          onClick={() => setFocused(true)}
          tabIndex={0}
          onFocus={() => setFocused(true)}
        >
          {renderError && (
            <div className="math-error-box">
              <div className="math-error-title">⚠️ 수식 문법 오류</div>
              <div className="math-error-msg">{renderError}</div>
              <div className="math-error-fallback">
                입력값: <code>{block.formula}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
