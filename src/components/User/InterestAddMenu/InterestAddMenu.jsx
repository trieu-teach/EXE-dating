import { useEffect, useRef, useState } from 'react'
import './InterestAddMenu.css'

export default function InterestAddMenu({
  onEditAtTop,
  onEditInSidebar,
  topLabel = 'Chỉnh ở đầu trang',
  sidebarLabel = 'Chỉnh tại bộ lọc',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function choose(handler) {
    handler?.()
    setOpen(false)
  }

  return (
    <div className={`interest-add-menu ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="interest-add-menu__trigger"
        aria-label="Thêm hoặc chỉnh sở thích"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        +
      </button>
      {open && (
        <div className="interest-add-menu__menu" role="menu">
          <button type="button" role="menuitem" onClick={() => choose(onEditAtTop)}>
            {topLabel}
          </button>
          {onEditInSidebar && (
            <button type="button" role="menuitem" onClick={() => choose(onEditInSidebar)}>
              {sidebarLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
