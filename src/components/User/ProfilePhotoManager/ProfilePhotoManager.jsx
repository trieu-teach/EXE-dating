import { useRef, useState } from 'react'
import { profileService } from '../../../api'
import { isImage, fileToDataUrl } from '../../../utils/imageFile.js'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'

/**
 * Quản lý ảnh: upload (multipart), đặt primary, xoá, sắp xếp lại.
 */
export default function ProfilePhotoManager({ photos, onChange }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState([])
  const toast = useToast()

  const handleFiles = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isImage(file)) {
      toast.error('Vui lòng chọn file ảnh.')
      return
    }
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
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSetPrimary = async (id) => {
    try {
      await profileService.setPrimary(id)
      toast.success('Đã đặt làm ảnh chính.')
      onChange?.()
    } catch (err) {
      toast.error(err.message || 'Không thể đặt ảnh chính.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá ảnh này?')) return
    try {
      await profileService.deletePhoto(id)
      toast.success('Đã xoá ảnh.')
      onChange?.()
    } catch (err) {
      toast.error(err.message || 'Không thể xoá ảnh.')
    }
  }

  const allPhotos = [
    ...previews.map((p) => ({ id: `preview-${p}`, url: p, isPrimary: false, isPreview: true })),
    ...(Array.isArray(photos) ? photos : []),
  ]

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong>Ảnh của tôi</strong>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <span className="spinner" /> : '+ Thêm ảnh'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFiles}
        />
      </header>

      {allPhotos.length === 0 && (
        <div className="empty">Chưa có ảnh nào. Hãy thêm ít nhất 1 ảnh để mở khoá Discovery.</div>
      )}

      <div className="photo-grid">
        {allPhotos.map((p) => (
          <div
            key={p.id}
            className={`photo-grid-item${p.isPrimary ? ' is-primary' : ''}`}
            style={{ backgroundImage: `url(${resolveImageUrl(p.url)})` }}
          >
            {!p.isPreview && (
              <div className="photo-grid-actions">
                {!p.isPrimary && (
                  <button type="button" onClick={() => handleSetPrimary(p.id)}>Đặt chính</button>
                )}
                <button type="button" onClick={() => handleDelete(p.id)}>Xoá</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
