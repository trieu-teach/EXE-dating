import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminDashboardService } from '../../../api'
import './Dashboard.css'

const METRIC_LABELS = {
  users: 'Người dùng mới',
  matches: 'Lượt match',
  messages: 'Tin nhắn',
}

function StatCard({ label, value, delta, icon, suffix = '' }) {
  const isUp = (delta ?? 0) >= 0
  return (
    <div className="admin-stat">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="admin-stat__label">{label}</span>
        <span className="admin-stat__icon" aria-hidden="true">{icon}</span>
      </div>
      <span className="admin-stat__value">{value}{suffix}</span>
      {delta != null ? (
        <span className={`admin-stat__delta ${isUp ? 'admin-stat__delta--up' : 'admin-stat__delta--down'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(delta)}% so với tháng trước
        </span>
      ) : null}
    </div>
  )
}

function Chart({ points, metric }) {
  if (!points || points.length === 0) return <div className="admin-empty">Không có dữ liệu</div>
  const max = Math.max(...points.map((p) => p.value), 1)
  return (
    <div className="admin-chart">
      {points.map((p) => (
        <div
          key={p.date}
          className="admin-chart__bar"
          style={{ height: `${(p.value / max) * 100}%` }}
          title={`${p.date}: ${p.value} ${METRIC_LABELS[metric] || ''}`}
        >
          <span className="admin-chart__bar-tip">{p.date}: {p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chart, setChart] = useState({ points: [], metric: 'users' })
  const [metric, setMetric] = useState('users')
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      setLoading(true)
      try {
        const [s, c] = await Promise.all([
          adminDashboardService.overview(),
          adminDashboardService.chart({ metric, range }),
        ])
        if (!cancel) {
          setStats(s)
          setChart(c)
        }
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [metric, range])

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : '—')

  return (
    <AdminLayout title="Dashboard" crumbs="Tổng quan hệ thống">
      {loading && !stats ? (
        <div className="admin-empty">Đang tải...</div>
      ) : (
        <>
          <div className="admin-stats">
            <StatCard label="Tổng người dùng" value={fmt(stats?.users?.total)} delta={stats?.users?.growthPercent} icon="👥" />
            <StatCard label="Hoạt động 24h" value={fmt(stats?.users?.active24h)} icon="⚡" />
            <StatCard label="Đang chờ xác minh" value={fmt(stats?.verifications?.pending)} icon="✅" />
            <StatCard label="Báo cáo mới" value={fmt(0)} icon="🚨" />
            <StatCard label="Match hôm nay" value={fmt(stats?.matches?.today)} icon="💞" />
            <StatCard label="Tin nhắn hôm nay" value={fmt(stats?.conversations?.messagesToday)} icon="💬" />
            <StatCard label="Subscriber Premium" value={fmt(stats?.revenue?.premiumSubscribers)} icon="💎" />
            <StatCard label="Doanh thu tháng" value={fmt(stats?.revenue?.monthVnd)} suffix=" ₫" icon="💰" />
          </div>

          <div className="admin-card" style={{ marginTop: 8 }}>
            <div className="admin-card__head">
              <h3 className="admin-card__title">Biểu đồ hoạt động</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="admin-select" value={metric} onChange={(e) => setMetric(e.target.value)} style={{ width: 160 }}>
                  <option value="users">Người dùng mới</option>
                  <option value="matches">Lượt match</option>
                  <option value="messages">Tin nhắn</option>
                </select>
                <select className="admin-select" value={range} onChange={(e) => setRange(e.target.value)} style={{ width: 120 }}>
                  <option value="7d">7 ngày</option>
                  <option value="30d">30 ngày</option>
                  <option value="90d">90 ngày</option>
                </select>
              </div>
            </div>
            <div className="admin-card__body">
              <Chart points={chart.points} metric={metric} />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
