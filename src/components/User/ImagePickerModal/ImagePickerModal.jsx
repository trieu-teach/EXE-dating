import { useEffect, useRef, useState } from 'react'
import { searchImageLibrary, searchGoogleImages, getGoogleImageSearchUrl } from '../../../api/services/imageSearch.service.js'
import { IMAGE_LIBRARY } from '../../../data/imageLibrary.js'
import { fileToStoredPreview } from '../../../utils/imageFile.js'
import './ImagePickerModal.css'

const TABS = [
  { id: 'device', label: 'Thiết bị', icon: '📱' },
  { id: 'library', label: 'Thư viện', icon: '🖼️' },
  { id: 'google', label: 'Google', icon: '🔍' },
]

export default function ImagePickerModal({ open, onClose, onSelect, title = 'Chọn ảnh' }) {
  const fileRef = useRef(null)
  const [tab, setTab] = useState('device')
  const [libraryQuery, setLibraryQuery] = useState('')
  const [googleQuery, setGoogleQuery] = useState('')
  const [googleResults, setGoogleResults] = useState([])
  const [googleMeta, setGoogleMeta] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [fileError, setFileError] = useState('')

  const libraryItems = searchImageLibrary(libraryQuery)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setTab('device')
      setLibraryQuery('')
      setGoogleQuery('')
      setGoogleResults([])
      setGoogleMeta(null)
      setFileError('')
    }
  }, [open])

  if (!open) return null

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setFileError('')
    try {
      const stored = await fileToStoredPreview(file)
      onSelect?.({
        preview: stored.preview,
        dataUrl: stored.dataUrl,
        remoteUrl: null,
        source: 'device',
      })
      onClose?.()
    } catch (err) {
      setFileError(err.message || 'Không tải được ảnh')
    }
  }

  function pickRemote(url, source, label = '') {
    onSelect?.({
      preview: url,
      remoteUrl: url,
      dataUrl: null,
      source,
      label,
    })
    onClose?.()
  }

  async function runGoogleSearch(event) {
    event?.preventDefault()
    const q = googleQuery.trim()
    if (!q) return

    setGoogleLoading(true)
    try {
      const res = await searchGoogleImages(q)
      setGoogleResults(res.results)
      setGoogleMeta(res)
    } finally {
      setGoogleLoading(false)
    }
  }

  function openGoogleInBrowser() {
    window.open(getGoogleImageSearchUrl(googleQuery.trim() || 'portrait'), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="image-picker-modal" role="dialog" aria-modal="true" aria-labelledby="image-picker-title">
      <button type="button" className="image-picker-modal__backdrop" onClick={onClose} aria-label="Đóng" />
      <div className="image-picker-modal__panel surface-glass">
        <header className="image-picker-modal__head">
          <h2 id="image-picker-title">{title}</h2>
          <button type="button" className="image-picker-modal__close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        <div className="image-picker-modal__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`image-picker-modal__tab${tab === t.id ? ' image-picker-modal__tab--on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="image-picker-modal__body">
          {tab === 'device' && (
            <div className="image-picker-device">
              <p>Chọn ảnh từ thư viện ảnh / máy (camera roll, file ảnh trên điện thoại hoặc máy tính).</p>
              <button
                type="button"
                className="image-picker-device__btn"
                onClick={() => fileRef.current?.click()}
              >
                Mở thư viện thiết bị
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="image-picker-device__input"
                onChange={handleFileChange}
              />
              {fileError && <p className="image-picker-modal__error">{fileError}</p>}
            </div>
          )}

          {tab === 'library' && (
            <div className="image-picker-library">
              <input
                type="search"
                className="image-picker-library__search"
                placeholder="Tìm: chân dung, cafe, du lịch..."
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
              />
              <div className="image-picker-grid">
                {(libraryItems.length ? libraryItems : IMAGE_LIBRARY).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="image-picker-grid__item"
                    onClick={() => pickRemote(item.url, 'library', item.label)}
                  >
                    <img src={`${item.url}&w=280`} alt={item.label} loading="lazy" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'google' && (
            <div className="image-picker-google">
              <form className="image-picker-google__form" onSubmit={runGoogleSearch}>
                <input
                  type="search"
                  placeholder="Tìm ảnh trên Google (vd: sunset portrait)"
                  value={googleQuery}
                  onChange={(e) => setGoogleQuery(e.target.value)}
                />
                <button type="submit" disabled={googleLoading || !googleQuery.trim()}>
                  {googleLoading ? 'Đang tìm...' : 'Tìm'}
                </button>
              </form>

              {googleMeta?.message && (
                <p className="image-picker-google__hint">{googleMeta.message}</p>
              )}

              <button type="button" className="image-picker-google__external" onClick={openGoogleInBrowser}>
                Mở Google Images trong tab mới ↗
              </button>

              <div className="image-picker-grid">
                {googleResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="image-picker-grid__item"
                    onClick={() => pickRemote(item.url, item.source === 'google' ? 'google' : 'library', item.title)}
                  >
                    <img src={item.thumb} alt={item.title} loading="lazy" referrerPolicy="no-referrer" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>

              {!googleLoading && googleQuery && googleResults.length === 0 && (
                <p className="image-picker-google__empty">Không có kết quả — thử từ khóa khác hoặc mở Google Images.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
