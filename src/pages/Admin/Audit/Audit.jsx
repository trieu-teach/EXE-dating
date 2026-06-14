import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import { adminAuditService } from '../../../api'

const ACTION_LABEL = {
  'user.lock': 'Khoá user',
  'user.unlock': 'Mở khoá user',
  'user.ban': 'Cấm user',
  'verification.approve': 'Duyệt xác minh',
  'verification.reject': 'Từ chối xác minh',
  'report.resolve': 'Xử lý báo cáo',
  'event.publish': 'Đăng sự kiện',
  'settings.update': 'Cập nhật cài đặt',
}

export default function Audit() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAuditService.list().then((data) => {
      setItems(data.items)
      setLoading(false)
    })
  }, [])

  return (
    <AdminLayout title="Audit log" crumbs="Hệ thống / Audit log">
      <div className="admin-card">
        <div className="admin-card__head">
          <h3 className="admin-card__title">Lịch sử thao tác admin</h3>
        </div>
        {loading ? (
          <div className="admin-empty">Đang tải...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Admin</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{log.createdAt.slice(0, 19).replace('T', ' ')}</td>
                    <td>{log.adminName}</td>
                    <td>
                      <span className="admin-badge admin-badge--muted">{ACTION_LABEL[log.action] || log.action}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {log.targetType} <code style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{log.targetId}</code>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
