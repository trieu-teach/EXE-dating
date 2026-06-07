import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../../components/User/PageHeader/PageHeader.jsx'
import Toggle from '../../../../components/User/Toggle/Toggle.jsx'
import { getUser, saveUser } from '../../../../utils/session.js'
import '../../../../styles/settings-shared.css'
import './DiscoverySettings.css'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function DiscoverySettings() {
  const saved = getUser()?.discoveryPrefs ?? {}
  const [globalMode, setGlobalMode] = useState(saved.globalMode ?? false)
  const [verifiedOnly, setVerifiedOnly] = useState(saved.verifiedOnly ?? true)
  const [distance, setDistance] = useState(saved.distance ?? 100)
  const [ageMin, setAgeMin] = useState(saved.ageMin ?? 22)
  const [ageMax, setAgeMax] = useState(saved.ageMax ?? 35)
  const [showMe, setShowMe] = useState(saved.showMe ?? 'female')

  useEffect(() => {
    saveUser({
      discoveryPrefs: { globalMode, verifiedOnly, distance, ageMin, ageMax, showMe },
    })
  }, [globalMode, verifiedOnly, distance, ageMin, ageMax, showMe])

  return (
    <AppShell activeNav="discovery">
      <div className="settings-page">
        <PageHeader title="Cài đặt Khám phá" backTo="/discovery" />

        <div className="settings-panel discovery-settings-panel">
          <div className="discovery-settings-location">
            <div>
              <p className="discovery-settings-location__label">Vị trí</p>
              <p className="discovery-settings-location__value">Hà Nội, Việt Nam</p>
            </div>
            <button type="button" className="settings-btn-outline">
              Thay đổi
            </button>
          </div>

          <Toggle label="Chế độ toàn cầu" checked={globalMode} onChange={setGlobalMode} />

          <div className="settings-slider-row">
            <label>
              <span>Khoảng cách</span>
              <span>{distance} km</span>
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>

          <div className="settings-slider-row">
            <label>
              <span>Độ tuổi</span>
              <span>
                {ageMin} – {ageMax}
              </span>
            </label>
            <div className="discovery-settings-age">
              <input
                type="range"
                min="18"
                max="60"
                value={ageMin}
                onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 1))}
              />
              <input
                type="range"
                min="18"
                max="60"
                value={ageMax}
                onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 1))}
              />
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section__title">Cho tôi xem</h2>
            <div className="settings-show-options">
              {[
                { id: 'male', label: 'Nam' },
                { id: 'female', label: 'Nữ' },
                { id: 'everyone', label: 'Mọi người' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`settings-show-btn${showMe === opt.id ? ' settings-show-btn--active' : ''}`}
                  onClick={() => setShowMe(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <section className="settings-section">
            <h2 className="settings-section__title">Bộ lọc nâng cao</h2>
            <Toggle
              label="Chỉ hiện hồ sơ đã xác minh"
              checked={verifiedOnly}
              onChange={setVerifiedOnly}
            />
            <Link to="/settings/interests" className="settings-row-link">
              Sở thích
              <ChevronIcon />
            </Link>
          </section>

          <button type="button" className="settings-btn-primary">
            Áp dụng thay đổi
          </button>
        </div>
      </div>
    </AppShell>
  )
}

export default DiscoverySettings
