import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { authService } from '../../../api'
import './BanGate.css'

/**
 * Khi tài khoản bị admin ban, user vẫn đăng nhập được 1 lần cuối và bị chặn bởi
 * popup này. Bấm "Thoát" → xoá vĩnh viễn tài khoản + đăng xuất → về landing.
 */
export default function BanGate() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (user?.status !== 'Banned') return null

  const handleExit = async () => {
    if (busy) return
    setBusy(true)
    try { await authService.deleteAccount() } catch { /* xoá kể cả khi lỗi mạng */ }
    try { await logout() } catch { /* dọn phiên cục bộ */ }
    navigate('/', { replace: true })
  }

  return (
    <div className="bangate-backdrop" role="dialog" aria-modal="true">
      <div className="bangate-modal">
        <div className="bangate-icon">🚫</div>
        <h1 className="bangate-title">Tài khoản đã bị cấm</h1>
        <p className="bangate-text">
          Tài khoản của bạn đã bị <strong>cấm vĩnh viễn</strong> do vi phạm tiêu chuẩn cộng đồng SameMess.
        </p>
        <p className="bangate-sub">
          Khi bấm <strong>Thoát</strong>, tài khoản và toàn bộ dữ liệu của bạn sẽ bị
          {' '}<strong>xoá vĩnh viễn</strong> và không thể khôi phục.
        </p>
        <button type="button" className="bangate-btn" onClick={handleExit} disabled={busy}>
          {busy ? <span className="spinner" /> : 'Thoát'}
        </button>
      </div>
    </div>
  )
}
