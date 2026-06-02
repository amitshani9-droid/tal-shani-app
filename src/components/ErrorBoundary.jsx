import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  handleClearStorage = () => {
    if (confirm('פעולה זו תמחק את כל הנתונים השמורים מקומית (פוסטים, טיוטות, לוח). להמשיך?')) {
      localStorage.clear()
      location.reload()
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--bg-page)', direction: 'rtl'
      }}>
        <div style={{
          maxWidth: 480, width: '100%', background: 'var(--white)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: 32, boxShadow: 'var(--shadow-md)', textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 20px',
            background: '#FEF2F2', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
          }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
            משהו השתבש
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
            האפליקציה נתקלה בשגיאה בלתי צפויה. אפשר לרענן את הדף או לנסות לאפס את המצב.
          </p>
          {this.state.error?.message && (
            <pre style={{
              fontSize: 11, background: 'var(--bg-page)', padding: 12, borderRadius: 8,
              border: '1px solid var(--border)', color: 'var(--text-light)',
              textAlign: 'left', overflow: 'auto', marginBottom: 20, direction: 'ltr'
            }}>{this.state.error.message}</pre>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => location.reload()} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
              רענני את האפליקציה
            </button>
            <button onClick={this.handleClearStorage} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
              איפוס נתונים
            </button>
          </div>
        </div>
      </div>
    )
  }
}
