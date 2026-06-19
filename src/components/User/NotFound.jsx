import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p style={{ color: 'var(--color-text-soft)' }}>Trang bạn tìm không tồn tại.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Về trang chủ</Link>
      </div>
    </main>
  )
}
