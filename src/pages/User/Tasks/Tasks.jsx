import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../../context/ToastContext.jsx'
import { useTasksAndInventory } from '../../../hooks/useTasksAndInventory.js'
import {
  MATERIAL_META,
  MATERIALS,
  TASK_TYPE_META,
  TASK_TYPE_ORDER,
} from '../../../constants/gamification.js'

/**
 * Tasks / Gamification page.
 *
 * - GET /api/tasks (auto-increments check-in task)
 * - GET /api/inventory
 * - Display 3 groups (Daily / Weekly / Achievement) with progress bars.
 * - Pull-to-refresh by touch/mouse drag at the top.
 */
export default function Tasks() {
  const toast = useToast()
  const { tasks, inventory, loading, refreshing, error, refresh } = useTasksAndInventory()
  const [pullDistance, setPullDistance] = useState(0)
  const [pulling, setPulling] = useState(false)
  const containerRef = useRef(null)
  const startY = useRef(0)

  // ====== Pull-to-refresh gesture (mouse + touch) ======
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const onStart = (y) => {
      if (window.scrollY > 0 || el.scrollTop > 0) return
      startY.current = y
      setPulling(true)
    }
    const onMove = (y) => {
      if (!pulling) return
      const dist = Math.max(0, Math.min(120, y - startY.current))
      setPullDistance(dist)
    }
    const onEnd = () => {
      if (!pulling) return
      if (pullDistance > 60) refresh()
      setPulling(false)
      setPullDistance(0)
    }

    const onTouchStart = (e) => onStart(e.touches[0].clientY)
    const onTouchMove  = (e) => onMove(e.touches[0].clientY)
    const onTouchEnd   = () => onEnd()
    const onMouseDown  = (e) => { startY.current = e.clientY; setPulling(true) }
    const onMouseMove  = (e) => { if (pulling) onMove(e.clientY) }
    const onMouseUp    = () => onEnd()

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: true })
    el.addEventListener('touchend',   onTouchEnd)
    el.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [pulling, pullDistance, refresh])

  // ====== Group tasks by type ======
  const grouped = useMemo(() => {
    const out = { Daily: [], Weekly: [], Achievement: [] }
    for (const t of tasks) {
      const type = (t.type || '').toString()
      if (out[type]) out[type].push(t)
    }
    return out
  }, [tasks])

  // ====== Manual refresh via button ======
  const handleRefresh = async () => {
    await refresh()
    toast.info('Đã cập nhật nhiệm vụ.')
  }

  if (loading) {
    return <div className="loading-block"><span className="spinner" /></div>
  }

  return (
    <div
      ref={containerRef}
      className="tasks-page"
      style={{
        transform: pullDistance ? `translateY(${pullDistance * 0.4}px)` : undefined,
        transition: pulling ? 'none' : 'transform 0.2s ease',
      }}
    >
      <div className="tasks-header">
        <div className="tasks-header-text">
          <h1>🌟 Nhiệm vụ</h1>
          <p>
            Hoàn thành nhiệm vụ để nhận nguyên liệu tưới cây. Phần thưởng tự động cộng vào kho khi đạt mục tiêu.
          </p>
        </div>
        <div className="tasks-header-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <span className="spinner" /> : '🔄 Làm mới'}
          </button>
        </div>
      </div>

      {error && <div className="onboarding-banner">{error}</div>}

      {/* ====== Inventory ====== */}
      <div className="tasks-inventory" aria-label="Kho nguyên liệu">
        {MATERIALS.map((m) => {
          const meta = MATERIAL_META[m]
          return (
            <div key={m} className="tasks-inventory-card" data-mat={m}>
              <div className="tasks-inventory-emoji" aria-hidden>{meta.emoji}</div>
              <div className="tasks-inventory-qty">{inventory[m] ?? 0}</div>
              <div className="tasks-inventory-label">{meta.label}</div>
            </div>
          )
        })}
      </div>

      {/* ====== Pull hint ====== */}
      <div className={`tasks-pull-hint${pullDistance > 0 ? ' is-pulling' : ''}`}>
        {pullDistance > 60
          ? 'Thả để làm mới…'
          : 'Kéo xuống để làm mới'}
      </div>

      {/* ====== Groups ====== */}
      {TASK_TYPE_ORDER.map((type) => {
        const list = grouped[type] || []
        if (list.length === 0) return null
        const meta = TASK_TYPE_META[type]
        const done = list.filter((t) => t.completed).length
        return (
          <section key={type} className="tasks-group">
            <header className="tasks-group-header">
              <span className="tasks-group-emoji" aria-hidden>{meta.emoji}</span>
              <span className="tasks-group-title">{meta.label}</span>
              <span className="tasks-group-count">
                <strong>{done}</strong>/{list.length} đã xong
              </span>
            </header>
            <div className="tasks-group-list">
              {list.map((t) => (
                <TaskCard key={t.code} task={t} />
              ))}
            </div>
          </section>
        )
      })}

      {tasks.length === 0 && !loading && (
        <div className="tasks-empty">
          Hiện chưa có nhiệm vụ nào. Hãy quay lại sau nhé 💞
        </div>
      )}
    </div>
  )
}

/* =========================================================
 * Single task card — title, progress bar, reward chip
 * ========================================================= */
function TaskCard({ task }) {
  const target = Math.max(1, Number(task.target ?? 1))
  const progress = Math.max(0, Math.min(target, Number(task.progress ?? 0)))
  const pct = Math.round((progress / target) * 100)
  const done = Boolean(task.completed)
  const rewardMeta = MATERIAL_META[task.rewardMaterial] || { emoji: '🎁', label: task.rewardMaterial }
  const rewardQty = Number(task.rewardQty ?? 0)

  return (
    <div className={`task-card${done ? ' is-done' : ''}`} role="group" aria-label={task.description || task.code}>
      <div className="task-card-icon" aria-hidden>
        {done ? '✓' : rewardMeta.emoji}
      </div>
      <div className="task-card-body">
        <div className="task-card-title">
          {task.description || task.code}
        </div>
        {task.code && task.description && (
          <div className="task-card-desc">{task.code}</div>
        )}
        <div className="task-card-progress">
          <div className="task-card-progress-bar" aria-hidden>
            <div className="task-card-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="task-card-progress-meta">
            <span><strong>{progress}</strong>/{target}</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
      <div className="task-card-reward" aria-label={`Thưởng: ${rewardQty} ${rewardMeta.label}`}>
        <div className="task-card-reward-emoji" aria-hidden>{rewardMeta.emoji}</div>
        <div className="task-card-reward-qty">+{rewardQty}</div>
      </div>
    </div>
  )
}
