import './AdminBadge.css'

/** Bọc tên hiển thị bằng hiệu ứng chữ bốc lửa — dùng ở khoảnh khắc user chạm trán Admin rõ nhất. */
export default function AdminFireName({ children }) {
  return <span className="admin-fire-name">{children}</span>
}
