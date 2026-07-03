import { useEffect, useRef, useState } from 'react'
import { profileService } from '../../../api'
import { isImage, fileToDataUrl } from '../../../utils/imageFile.js'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { StarIcon, XIcon } from '../../ui/CustomIcons.jsx'
import AvatarFrame from '../AvatarFrame/AvatarFrame.jsx'

/**
 * Quản lý ảnh: upload, kéo-thả đổi thứ tự (ô lớn đầu tiên = ảnh đại diện), xoá.
 */
export default function ProfilePhotoManager({ photos, onChange, avatarFrame }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [items, setItems] = useState(Array.isArray(photos) ? photos : [])
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const toast = useToast()

  // Đồng bộ khi parent nạp lại ảnh
  useEffect(() => { setItems(Array.isArray(photos) ? photos : []) }, [photos])

  const handleFiles = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isImage(file)) { toast.error('Vui lòng chọn file ảnh.'); return }
    setUploading(true)
    try {
      const preview = await fileToDataUrl(file)
      setPreviews((p) => [...p, preview])
      await profileService.uploadPhoto(file)
      toast.success('Đã upload ảnh.')
      onChange?.()
    } catch (err) {
      toast.error(err.message || 'Upload thất bại.')
    } finally {
      setUploading(false)
      setPreviews([])
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá ảnh này?')) return
    setBusyId(id)
    try {
      await profileService.deletePhoto(id)
      toast.success('Đã xoá ảnh.')
      onChange?.()
    } catch (err) {
      toast.error(err.message || 'Không thể xoá ảnh.')
    } finally {
      setBusyId(null)
    }
  }

  // ── Kéo-thả đổi thứ tự ──
  const persistOrder = async (next) => {
    const ids = next.map((p) => p.id)
    try {
      await profileService.reorder(ids)
      // Ảnh đầu tiên (ô lớn) làm ảnh đại diện
      if (next[0]?.id) await profileService.setPrimary(next[0].id)
      onChange?.()
    } catch (err) {
      toast.error(err?.message || 'Không lưu được thứ tự ảnh.')
      onChange?.() // nạp lại trạng thái đúng từ server
    }
  }

  const onDragStart = (i) => setDragIndex(i)
  const onDragOver = (e, i) => { e.preventDefault(); if (i !== overIndex) setOverIndex(i) }
  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setOverIndex(null); return }
    const next = [...items]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    setItems(next)
    setDragIndex(null)
    setOverIndex(null)
    persistOrder(next)
  }
  const onDragEnd = () => { setDragIndex(null); setOverIndex(null) }

  const previewTiles = previews.map((p) => ({ id: `preview-${p}`, url: p, isPreview: true }))
  const all = [...items, ...previewTiles]
  const MAX = 6
  const emptySlots = Math.max(0, MAX - all.length)

  return (
    <section className="photo-mgr">
      <header className="photo-mgr-head">
        <div>
          <strong className="photo-mgr-title">Ảnh của tôi</strong>
          <span className="photo-mgr-hint">Kéo để đổi chỗ · ảnh lớn đầu tiên là ảnh đại diện · tối đa {MAX} ảnh</span>
        </div>
      </header>

      <div className="photo-mgr-grid">
        {all.map((p, i) => {
          const tile = (
            <div
              className={`photo-tile${i === 0 ? ' is-featured' : ''}${p.isPreview ? ' is-preview' : ''}${dragIndex === i ? ' is-dragging' : ''}${overIndex === i && dragIndex !== null ? ' is-over' : ''}`}
              style={{ backgroundImage: `url(${resolveImageUrl(p.url)})` }}
              draggable={!p.isPreview}
              onDragStart={() => !p.isPreview && onDragStart(i)}
              onDragOver={(e) => !p.isPreview && onDragOver(e, i)}
              onDrop={() => !p.isPreview && onDrop(i)}
              onDragEnd={onDragEnd}
            >
              {i === 0 && !p.isPreview && (
                <span className="photo-tile-badge"><StarIcon size={11} /> Ảnh đại diện</span>
              )}
              {p.isPreview ? (
                <div className="photo-tile-uploading"><span className="spinner" /></div>
              ) : (
                <button
                  type="button"
                  className="photo-tile-del"
                  title="Xoá ảnh"
                  disabled={busyId === p.id}
                  onClick={() => handleDelete(p.id)}
                >
                  <XIcon size={15} />
                </button>
              )}
            </div>
          )

          return (
            <AvatarFrame key={p.id} frame={i === 0 && !p.isPreview ? avatarFrame : null} size="xl">
              {tile}
            </AvatarFrame>
          )
        })}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <button
            key={`add-${i}`}
            type="button"
            className="photo-tile photo-tile-add"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading && i === 0 ? <span className="spinner" /> : <span className="photo-tile-add-plus">+</span>}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFiles} />
    </section>
  )
}
