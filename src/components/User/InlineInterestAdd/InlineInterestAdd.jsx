import { useState } from 'react'
import './InlineInterestAdd.css'

export default function InlineInterestAdd({
  onAdd,
  onCancel,
  placeholder = 'Nhập sở thích mới...',
}) {
  const [value, setValue] = useState('')

  function submit() {
    const label = value.trim()
    if (!label) return
    onAdd?.(label)
    setValue('')
  }

  return (
    <div className="inline-interest-add">
      <input
        type="text"
        className="inline-interest-add__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={40}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
          if (e.key === 'Escape') onCancel?.()
        }}
      />
      <button type="button" className="inline-interest-add__save" onClick={submit}>
        Thêm
      </button>
      {onCancel && (
        <button type="button" className="inline-interest-add__cancel" onClick={onCancel}>
          Đóng
        </button>
      )}
    </div>
  )
}
