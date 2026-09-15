import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
    this.setState({ info })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  handleCopy = async () => {
    const { error, info } = this.state
    const text =
      `Error: ${error?.message || String(error)}\n` +
      `Stack: ${error?.stack || ''}\n` +
      `ComponentStack: ${info?.componentStack || ''}`
    try {
      await navigator.clipboard.writeText(text)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 1500)
    } catch {
      /* ignore */
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f7f5fb',
          color: '#1f1147',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 640,
            width: '100%',
            background: '#ffffff',
            border: '1px solid #e5e0f0',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 6px 24px rgba(109, 40, 217, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#ea580c',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            NoteCanvas — Runtime Error
          </div>
          <h1 style={{ fontSize: 22, margin: '0 0 12px', lineHeight: 1.3 }}>
            화면을 렌더링하다가 문제가 생겼어요.
          </h1>
          <p style={{ margin: '0 0 16px', color: '#4b3b78', fontSize: 14 }}>
            새로고침으로 대부분 해결됩니다. 계속 보이면 아래 오류 메시지를
            복사해서 보내주세요.
          </p>

          <pre
            style={{
              background: '#1f1147',
              color: '#f4ecff',
              padding: 14,
              borderRadius: 10,
              fontSize: 12,
              lineHeight: 1.5,
              overflow: 'auto',
              maxHeight: 260,
              margin: '0 0 16px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {String(this.state.error?.message || this.state.error)}
            {this.state.error?.stack ? `\n\n${this.state.error.stack}` : ''}
          </pre>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReload}
              style={{
                background: '#6d28d9',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              새로고침
            </button>
            <button
              onClick={this.handleCopy}
              style={{
                background: 'white',
                color: '#6d28d9',
                border: '1px solid #6d28d9',
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {this.state.copied ? '복사됨!' : '오류 복사'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}
