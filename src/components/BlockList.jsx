import CodeBlock from './blocks/CodeBlock.jsx'
import MathBlock from './blocks/MathBlock.jsx'
import MarkdownBlock from './blocks/MarkdownBlock.jsx'
import TableBlock from './blocks/TableBlock.jsx'
import TodoBlock from './blocks/TodoBlock.jsx'
import KanbanBlock from './blocks/KanbanBlock.jsx'
import CalendarBlock from './blocks/CalendarBlock.jsx'
import ImageBlock from './blocks/ImageBlock.jsx'
import PdfBlock from './blocks/PdfBlock.jsx'

export default function BlockList({ blocks, onChange, isDrawMode }) {
  const updateBlock = (id, updated) => onChange(blocks.map(b => b.id === id ? updated : b))
  const deleteBlock = (id) => onChange(blocks.filter(b => b.id !== id))

  return (
    <div className="block-list">
      {blocks.map((block) => (
        <div key={block.id} className={`block-wrapper ${isDrawMode ? 'no-interact' : ''}`}>
          <div className="block-del-btn-wrap">
            <button className="block-del-btn" onClick={() => deleteBlock(block.id)} title="블록 삭제">✕</button>
          </div>

          {block.type === 'text' && (
            <div
              className="block-text"
              contentEditable={!isDrawMode}
              suppressContentEditableWarning
              onBlur={e => updateBlock(block.id, { ...block, text: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: block.text || '' }}
            />
          )}
          {block.type === 'heading' && (
            <div
              className={`block-heading h${block.level || 1}`}
              contentEditable={!isDrawMode}
              suppressContentEditableWarning
              onBlur={e => updateBlock(block.id, { ...block, text: e.currentTarget.textContent })}
            >
              {block.text}
            </div>
          )}
          {block.type === 'divider' && <hr className="block-divider" />}
          {block.type === 'code' && <CodeBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'math' && <MathBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'markdown' && <MarkdownBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'table' && <TableBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'todo' && <TodoBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'kanban' && <KanbanBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'calendar' && <CalendarBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'image' && <ImageBlock block={block} onChange={b => updateBlock(block.id, b)} />}
          {block.type === 'pdf' && <PdfBlock block={block} onChange={b => updateBlock(block.id, b)} />}
        </div>
      ))}
    </div>
  )
}
