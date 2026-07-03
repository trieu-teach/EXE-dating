import './AvatarFrame.css'

/**
 * Bọc quanh một avatar/ảnh bằng khung hiệu ứng động kiểu game.
 * frame: 'Fire' | 'Ice' | 'Gold' | 'Electric' | null (không khung — trả thẳng children).
 * shape: 'circle' (avatar tròn) | 'square' (ảnh đại diện bo góc).
 */
export default function AvatarFrame({ frame, size = 'md', shape = 'circle', className = '', children }) {
  if (!frame) return children

  return (
    <span className={`avatar-frame avatar-frame-${frame.toLowerCase()} avatar-frame-${size} avatar-frame-${shape} ${className}`.trim()}>
      {children}
    </span>
  )
}
