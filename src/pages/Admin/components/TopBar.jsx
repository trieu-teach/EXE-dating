export default function TopBar({ title, crumbs, onSearch }) {
  return (
    <header className="admin-topbar">
      <div>
        <div className="admin-topbar__title">{title}</div>
        {crumbs ? <div className="admin-topbar__crumbs">{crumbs}</div> : null}
      </div>
      <div className="admin-topbar__spacer" />
      <div className="admin-topbar__search">
        <span className="admin-topbar__search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Tìm nhanh user, báo cáo, sự kiện..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <button className="admin-topbar__icon-btn" aria-label="Thông báo" type="button">
        🔔
        <span className="admin-topbar__icon-dot" />
      </button>
      <button className="admin-topbar__icon-btn" aria-label="Trợ giúp" type="button">❓</button>
    </header>
  )
}
