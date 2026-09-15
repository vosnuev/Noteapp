import { useState, useEffect, useRef } from 'react'
import hljs from 'highlight.js'

const LANGUAGES = ['javascript','typescript','python','html','css','json','sql','bash','java','cpp','rust','go','markdown','plaintext']

export default function CodeBlock({ block, onChange }) {
  // 커서가 textarea 안에 있으면 편집, 밖(blur)면 자동 저장 + syntax highlight 미리보기
  const [focused, setFocused] = useState(!block.code)
  const codeRef = useRef(null)

  useEffect(() => {
    if (!focused && codeRef.current) {
      codeRef.current.innerHTML = hljs.highlight(block.code || '', {
        language: block.language || 'plaintext',
        ignoreIllegals: true,
      }).value
    }
  }, [focused, block.code, block.language])

  const showEditor = focused || !block.code

  return (
    <div className="block-code">
      <div className="block-code-header">
        <select
          value={block.language || 'javascript'}
          onChange={e => onChange({ ...block, language: e.target.value })}
          className="code-lang-select"
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <span className="block-hint">
          {showEditor ? '입력 중 — 바깥 클릭 시 자동 저장' : '클릭해서 편집'}
        </span>
      </div>

      {showEditor ? (
        <textarea
          className="code-textarea"
          value={block.code || ''}
          onChange={e => onChange({ ...block, code: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="코드를 입력하세요..."
          spellCheck={false}
          autoFocus={!block.code}
          rows={Math.max(4, (block.code || '').split('\n').length + 1)}
        />
      ) : (
        <pre
          className="code-pre"
          onClick={() => setFocused(true)}
          tabIndex={0}
          onFocus={() => setFocused(true)}
        >
          <code ref={codeRef} />
        </pre>
      )}
    </div>
  )
}
