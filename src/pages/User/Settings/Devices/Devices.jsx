import AppShell from '../../../../components/User/AppShell/AppShell.jsx'
import PageHeader from '../../../../components/User/PageHeader/PageHeader.jsx'
import '../../../../styles/settings-shared.css'
import './Devices.css'

const DEVICES = [
  {
    id: 'iphone',
    name: 'iPhone 15 Pro',
    location: 'Hà Nội, Việt Nam',
    active: true,
  },
  {
    id: 'macbook',
    name: 'MacBook Air M2',
    location: 'Hà Nội, Việt Nam',
    active: false,
  },
  {
    id: 'ipad',
    name: 'iPad Pro 11-inch',
    location: 'Đà Nẵng, Việt Nam',
    active: false,
  },
  {
    id: 'windows',
    name: 'Windows PC',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    active: false,
  },
]

function Devices() {
  return (
    <AppShell activeNav="profile">
      <div className="settings-page">
        <PageHeader title="Quản lý thiết bị" backTo="/settings" />

        <div className="settings-panel devices-panel">
          <section className="devices-section">
            <h2 className="settings-section__title">Thiết bị hiện tại</h2>
            {DEVICES.filter((d) => d.active).map((device) => (
              <article key={device.id} className="device-card device-card--current">
                <div>
                  <h3>{device.name}</h3>
                  <p>{device.location}</p>
                </div>
                <span className="device-card__status">Đang hoạt động</span>
              </article>
            ))}
          </section>

          <section className="devices-section">
            <h2 className="settings-section__title">Thiết bị khác</h2>
            {DEVICES.filter((d) => !d.active).map((device) => (
              <article key={device.id} className="device-card">
                <div>
                  <h3>{device.name}</h3>
                  <p>{device.location}</p>
                </div>
                <button type="button" className="settings-btn-outline device-card__logout">
                  Đăng xuất
                </button>
              </article>
            ))}
          </section>

          <button type="button" className="devices-logout-all">
            Đăng xuất khỏi tất cả các thiết bị khác
          </button>
        </div>
      </div>
    </AppShell>
  )
}

export default Devices
