import { useState } from 'react'
import ImagePickerModal from '../ImagePickerModal/ImagePickerModal.jsx'
import './ProfilePhotoGrid.css'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function ProfilePhotoGrid({
  photos,
  maxPhotos = 6,
  onChange,
  className = '',
  showSourceBadge = true,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)

  const slots = Array.from({ length: maxPhotos }, (_, i) => photos[i] ?? null)

  function openPicker(index) {
    setActiveSlot(index)
    setPickerOpen(true)
  }

  function handleSelect(selection) {
    if (activeSlot === null || !selection) return

    const entry = {
      id: `photo-${activeSlot}-${Date.now()}`,
      preview: selection.preview,
      remoteUrl: selection.remoteUrl ?? null,
      dataUrl: selection.dataUrl ?? null,
      source: selection.source,
    }

    const next = [...slots]
    const prev = next[activeSlot]
    if (prev?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(prev.preview)
    }
    next[activeSlot] = entry
    onChange?.(next)
    setPickerOpen(false)
    setActiveSlot(null)
  }

  function removePhoto(index, event) {
    event.stopPropagation()
    const next = [...slots]
    const prev = next[index]
    if (prev?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(prev.preview)
    }
    next[index] = null
    onChange?.(next)
  }

  const sourceLabel = {
    device: 'Thiết bị',
    library: 'Thư viện',
    google: 'Google',
  }

  return (
    <div className={`profile-photo-grid-wrap ${className}`.trim()}>
      <div className="profile-photo-grid">
        {slots.map((photo, index) => (
          <div
            key={index}
            className={`profile-photo-slot${index === 0 ? ' profile-photo-slot--main' : ''}${photo ? ' profile-photo-slot--filled' : ''}`}
          >
            <button
              type="button"
              className="profile-photo-slot__btn"
              onClick={() => openPicker(index)}
              aria-label={photo ? `Đổi ảnh ${index + 1}` : `Thêm ảnh ${index + 1}`}
            >
              {photo?.preview ? (
                <img src={photo.preview} alt="" />
              ) : (
                <span className="profile-photo-slot__add">
                  <PlusIcon />
                </span>
              )}
            </button>
            {photo && (
              <>
                {showSourceBadge && photo.source && (
                  <span className="profile-photo-slot__source">{sourceLabel[photo.source] ?? photo.source}</span>
                )}
                <button
                  type="button"
                  className="profile-photo-slot__remove"
                  onClick={(e) => removePhoto(index, e)}
                  aria-label={`Xóa ảnh ${index + 1}`}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false)
          setActiveSlot(null)
        }}
        onSelect={handleSelect}
        title={activeSlot === 0 ? 'Chọn ảnh đại diện' : 'Chọn ảnh hồ sơ'}
      />
    </div>
  )
}
