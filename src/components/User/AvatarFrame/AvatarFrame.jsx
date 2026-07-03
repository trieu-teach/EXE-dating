import './AvatarFrame.css'

/**
 * Bọc quanh một avatar tròn bằng khung hiệu ứng động kiểu game.
 * frame: 'Fire' | 'Ice' | 'Gold' | 'Electric' | null (không khung — trả thẳng children).
 */
export default function AvatarFrame({ frame, size = 'md', children }) {
  if (!frame) return children

  return (
    <span className={`avatar-frame avatar-frame-${frame.toLowerCase()} avatar-frame-${size}`}>
      {children}
    </span>
  )
}
