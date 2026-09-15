// 블록 → 마크다운 변환 (노트 공유용)

function escapeMd(text) {
  if (!text) return ''
  // Markdown 제어 문자 이스케이프 (코드블록, 표는 별도 처리)
  return text.replace(/([\\`*_{}\[\]<>])/g, '\\$1')
}

export function pageToMarkdown(page) {
  if (!page) return ''
  const out = []
  if (page.name) out.push(`# ${page.name}\n`)
  for (const block of page.blocks || []) {
    out.push(blockToMd(block))
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

function blockToMd(block) {
  switch (block.type) {
    case 'heading': {
      const lvl = Math.min(3, Math.max(1, block.level || 1))
      return `${'#'.repeat(lvl)} ${escapeMd(block.text || '')}\n`
    }
    case 'text': {
      // 텍스트 블록에 저장된 innerHTML은 단순 텍스트로 정규화 (md 변환용)
      const text = stripHtml(block.text || '')
      return text + '\n'
    }
    case 'divider':
      return '---\n'
    case 'code':
      return '```' + (block.language || '') + '\n' + (block.code || '') + '\n```\n'
    case 'math':
      return `$$${block.formula || ''}$$\n`
    case 'markdown':
      return (block.text || '') + '\n'
    case 'todo': {
      const items = (block.items || []).map(it => `- [${it.done ? 'x' : ' '}] ${escapeMd(it.text)}`)
      return items.join('\n') + '\n'
    }
    case 'table': {
      const headers = block.headers || []
      const rows = block.rows || []
      let md = '| ' + headers.map(escapeMd).join(' | ') + ' |\n'
      md += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
      md += rows.map(r => '| ' + r.map(c => escapeMd(c || '')).join(' | ') + ' |').join('\n') + '\n'
      return md
    }
    case 'kanban': {
      const cols = block.columns || []
      let md = ''
      cols.forEach(col => {
        md += `### ${escapeMd(col.title || '')}\n`
        ;(col.cards || []).forEach(card => {
          md += `- ${escapeMd(card.text || '')}\n`
        })
        md += '\n'
      })
      return md
    }
    case 'calendar':
      return ''  // 캘린더 블록은 md로 표현 안 함
    case 'image':
      return block.url ? `![${escapeMd(block.caption || '')}](${block.url})\n` : ''
    case 'pdf':
      return block.url ? `[📄 ${escapeMd(block.name || 'PDF')}](${block.url})\n` : ''
    default:
      return ''
  }
}

function stripHtml(html) {
  if (!html) return ''
  // 매우 단순한 변환: 태그 제거 + 줄바꿈 보존
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function downloadMarkdown(page, filename) {
  const md = pageToMarkdown(page)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (filename || page?.name || 'note') + '.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function buildShareLink(page) {
  if (!page) return ''
  const url = new URL(window.location.href)
  url.hash = `page=${page.id}`
  return url.toString()
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy'); return true } catch { return false }
    finally { document.body.removeChild(ta) }
  }
}
