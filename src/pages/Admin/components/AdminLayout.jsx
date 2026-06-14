import { Navigate } from 'react-router-dom'
import { isAdminLoggedIn } from '../../../utils/adminSession.js'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

export default function AdminLayout({ title, crumbs, onSearch, children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }
  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-main">
        <TopBar title={title} crumbs={crumbs} onSearch={onSearch} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
