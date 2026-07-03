import { Flame } from 'lucide-react'
import './AdminBadge.css'

/** Huy hiệu "ADMIN" hiệu ứng lửa — hiện bên cạnh tên khi user chạm trán tài khoản Admin. */
export default function AdminBadge({ size = 'md' }) {
  return (
    <span className={`admin-fire-badge admin-fire-badge-${size}`}>
      <Flame size={size === 'sm' ? 11 : 13} className="admin-fire-icon" aria-hidden="true" />
      ADMIN
    </span>
  )
}
