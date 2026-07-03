import { useState } from 'react'
import AvatarFrame from './AvatarFrame.jsx'
import './AvatarFramePicker.css'

const OPTIONS = [
  { value: null, label: 'Không dùng' },
  { value: 'Fire', label: 'Lửa' },
  { value: 'Ice', label: 'Băng' },
  { value: 'Gold', label: 'Hoàng kim' },
  { value: 'Electric', label: 'Điện' },
]

/** Cho Admin chọn/đổi khung hiệu ứng avatar — xem trước ngay từng lựa chọn. */
export default function AvatarFramePicker({ value, onSelect, avatarUrl, initial }) {
  const [busy, setBusy] = useState(false)

  const handlePick = async (frame) => {
    if (frame === value || busy) return
    setBusy(true)
    try { await onSelect(frame) } finally { setBusy(false) }
  }

  return (
    <div className="frame-picker">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value ?? 'none'}
          type="button"
          className={`frame-picker-item${value === opt.value ? ' is-active' : ''}`}
          disabled={busy}
          onClick={() => handlePick(opt.value)}
          title={opt.label}
        >
          <AvatarFrame frame={opt.value} size="sm">
            <span
              className="frame-picker-swatch"
              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
            >
              {!avatarUrl && (initial || '?')}
            </span>
          </AvatarFrame>
          <span className="frame-picker-label">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
