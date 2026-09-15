import { useState } from 'react'
import {
  downloadMarkdown, buildShareLink, copyToClipboard, pageToMarkdown,
} from '../utils/markdown.js'
import { XIcon, FileTextIcon, PdfIcon, LinkIcon } from './Icons.jsx'

export default function ShareModal({ page, onClose }) {
  const [tab, setTab] = useState('md')
  const [copied, setCopied] = useState(false)

  if (!page) return null
  const md = pageToMarkdown(page)
  const link = buildShareLink(page)

  const handleCopyLink = async () => {
    await copyToClipboard(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  const handleDownloadMd = () => downloadMarkdown(page)
  const handlePrintPdf = () => {
    onClose?.()
    setTimeout(() => window.print(), 200)
  }
  const handleCopyMd = async () => {
    await copyToClipboard(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="share-modal-bg" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-title">노트 공유</div>
          <button className="share-modal-close" onClick={onClose} title="닫기">
            <XIcon size={12} />
          </button>
        </div>
        <div className="share-modal-subtitle">
          <strong>{page.name}</strong>
          <span className="share-modal-meta">{(page.blocks?.length || 0)}개 블록</span>
        </div>

        <div className="share-tabs">
          <button className={`share-tab ${tab === 'md' ? 'active' : ''}`} onClick={() => setTab('md')}>
            <FileTextIcon size={13} /> Markdown
          </button>
          <button className={`share-tab ${tab === 'pdf' ? 'active' : ''}`} onClick={() => setTab('pdf')}>
            <PdfIcon size={13} /> PDF
          </button>
          <button className={`share-tab ${tab === 'link' ? 'active' : ''}`} onClick={() => setTab('link')}>
            <LinkIcon size={13} /> 링크
          </button>
        </div>

        <div className="share-content">
          {tab === 'md' && (
            <>
              <pre className="share-preview">{md}</pre>
              <div className="share-actions">
                <button className="share-btn primary" onClick={handleDownloadMd}>
                  <FileTextIcon size={12} /> .md 다운로드
                </button>
                <button className="share-btn" onClick={handleCopyMd}>
                  {copied ? '✓ 복사됨' : '클립보드 복사'}
                </button>
              </div>
            </>
          )}

          {tab === 'pdf' && (
            <>
              <div className="share-info">
                브라우저의 인쇄 대화상자가 열리고, PDF로 저장할 수 있어요. 미리보기 후 저장하세요.
              </div>
              <div className="share-actions">
                <button className="share-btn primary" onClick={handlePrintPdf}>
                  <PdfIcon size={12} /> 인쇄 / PDF로 저장
                </button>
              </div>
            </>
          )}

          {tab === 'link' && (
            <>
              <div className="share-info">
                이 링크를 같은 브라우저에서 열면 해당 페이지로 바로 이동해요. 클립보드에 복사해서 공유하세요.
              </div>
              <div className="share-link-row">
                <input className="share-link-input" value={link} readOnly onFocus={e => e.target.select()} />
                <button className="share-btn primary" onClick={handleCopyLink}>
                  {copied ? '✓ 복사됨' : '복사'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
