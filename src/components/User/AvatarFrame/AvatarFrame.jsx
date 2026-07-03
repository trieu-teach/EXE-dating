import { Children, cloneElement } from 'react'
import { Flame, Snowflake, Sparkles, Zap } from 'lucide-react'
import './AvatarFrame.css'

const THEME_ICON = { fire: Flame, ice: Snowflake, gold: Sparkles, electric: Zap }
const FLAME_COUNT = { sm: 1, md: 2, lg: 3, xl: 5 }

/**
 * Phủ hiệu ứng động (lửa/băng/vàng/điện) NGAY BÊN TRONG phần tử avatar/ảnh được bọc.
 * Dùng cloneElement để chèn overlay làm con của chính phần tử đó — luôn khớp khít
 * kích thước, bo góc và bị cắt theo overflow của phần tử gốc, không bao giờ lệch ra ngoài.
 * frame: 'Fire' | 'Ice' | 'Gold' | 'Electric' | null (không khung — trả thẳng children).
 */
export default function AvatarFrame({ frame, size = 'md', children }) {
  if (!frame) return children

  const child = Children.only(children)
  const theme = frame.toLowerCase()
  const Icon = THEME_ICON[theme] || Flame
  const count = FLAME_COUNT[size] || 2

  const fx = (
    <span key="avatar-frame-fx" className={`avatar-frame-fx avatar-frame-fx-${theme} avatar-frame-fx-${size}`} aria-hidden="true">
      <span className="avatar-frame-fx-glow" />
      {Array.from({ length: count }).map((_, i) => (
        <Icon
          key={i}
          className="avatar-frame-fx-icon"
          style={{ left: `${((i + 1) / (count + 1)) * 100}%`, animationDelay: `${(i * 0.23).toFixed(2)}s` }}
        />
      ))}
    </span>
  )

  return cloneElement(child, {
    className: `${child.props.className || ''} avatar-frame-host avatar-frame-host-${theme}`.trim(),
    children: (
      <>
        {child.props.children}
        {fx}
      </>
    ),
  })
}
