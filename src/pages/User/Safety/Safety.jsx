import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api/index.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { useMutation } from '../../../hooks/useMutation.js'
import PageHeader from '../../../components/User/PageHeader/PageHeader.jsx'
import Toggle from '../../../components/User/Toggle/Toggle.jsx'
import '../../../styles/settings-shared.css'
import './Safety.css'

function Safety() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useAsync(() => safetyService.getSettings(), [])
  const { mutate: saveSettings, loading: saving } = useMutation((payload) =>
    safetyService.saveSettings(payload),
  )

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [safeZone, setSafeZone] = useState(true)
  const [safeTime, setSafeTime] = useState('15:00')

  useEffect(() => {
    if (!data) return
    setContactName(data.contactName)
    setContactPhone(data.contactPhone)
    setSafeZone(data.safeZone)
    setSafeTime(data.safeTime)
  }, [data])

  async function handleSave() {
    await saveSettings({ contactName, contactPhone, safeZone, safeTime })
    navigate('/safety-pin-setup')
  }

  return (
    <AppShell activeNav="safety">
      <div className="settings-page safety-page">
        <PageHeader title="An toàn & Khẩn cấp" backTo="/profile" />

        <AsyncContent loading={loading} error={error} onRetry={refetch}>
        <div className="safety-layout">
          <div className="settings-panel safety-panel">
            <section className="safety-section">
              <h2 className="safety-section__title">
                <span aria-hidden="true">👤</span>
                Người thân tin cậy
              </h2>
              <label className="settings-field">
                <span>Tên người thân</span>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </label>
              <label className="settings-field">
                <span>Số điện thoại</span>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </label>
            </section>

            <section className="safety-section">
              <Toggle
                label="Theo dõi vùng an toàn"
                checked={safeZone}
                onChange={setSafeZone}
              />
              <p className="safety-section__hint">
                Hệ thống sẽ thông báo nếu bạn rời khỏi khu vực hẹn đã đặt.
              </p>
            </section>

            <section className="safety-section">
              <h2 className="safety-section__title">
                <span aria-hidden="true">⏱️</span>
                Hẹn giờ an toàn
              </h2>
              <p className="safety-section__hint">
                Nếu bạn không phản hồi sau 15 phút kể từ khi hẹn kết thúc, người thân sẽ được
                thông báo.
              </p>
              <label className="settings-field">
                <span>Thời gian kết thúc hẹn</span>
                <input
                  type="time"
                  value={safeTime}
                  onChange={(e) => setSafeTime(e.target.value)}
                />
              </label>
            </section>

            <button
              type="button"
              className="settings-btn-primary safety-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt an toàn'}
            </button>

            <nav className="safety-quick-links" aria-label="Liên kết an toàn">
              <Link to="/safety-pin-setup">Thiết lập mã PIN →</Link>
              <Link to="/safety-checkin">Xác nhận an toàn →</Link>
              <Link to="/emergency-alert">Thông báo khẩn cấp →</Link>
            </nav>
          </div>

          <aside className="safety-map-card">
            <h2 className="safety-map-card__title">
              <span aria-hidden="true">📍</span>
              Vùng an toàn
            </h2>
            <div className="safety-map-visual">
              <div className="safety-map-visual__pin" />
              <div className="safety-map-visual__ring" />
            </div>
            <p className="safety-map-card__radius">
              Bán kính: {data?.radiusMeters ?? 500}m quanh điểm hẹn
            </p>
            <ul className="safety-map-tips">
              <li>Chia sẻ vị trí với người thân trước khi đi hẹn</li>
              <li>Chọn địa điểm công cộng, đông người</li>
              <li>Luôn mang theo điện thoại đầy pin</li>
            </ul>
          </aside>
        </div>
        </AsyncContent>
      </div>
    </AppShell>
  )
}

export default Safety
