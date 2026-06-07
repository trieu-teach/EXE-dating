import { Link } from 'react-router-dom'
import './PageHeader.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function PageHeader({ title, backTo, backLabel = 'Quay lại' }) {
  return (
    <header className="page-header">
      {backTo ? (
        <Link to={backTo} className="page-header__back">
          <BackIcon />
          <span>{backLabel}</span>
        </Link>
      ) : (
        <span className="page-header__spacer" />
      )}
      <h1 className="page-header__title">{title}</h1>
      <span className="page-header__spacer page-header__spacer--end" aria-hidden="true" />
    </header>
  )
}

export default PageHeader
