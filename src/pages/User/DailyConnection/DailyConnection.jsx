import { useCallback, useEffect, useMemo, useState } from 'react'
import { gamificationService, connectionRemindersService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { MATERIALS, MATERIAL_META, TASK_TYPE_META, TASK_TYPE_ORDER } from '../../../constants/gamification.js'
import { SparkleIcon, HeartIcon, TrophyIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import './DailyConnection.css'

// Reset theo UTC: daily 00:00 UTC (07:00 VN), weekly Thứ 2 00:00 UTC, achievement không reset
function nextDailyResetMs(now) {
  const n = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
  return n - now
}
function nextWeeklyResetMs(now) {
  const dow = now.getUTCDay() // 0=CN..6=T7
  let days = (1 - dow + 7) % 7 // tới Thứ 2 kế
  if (days === 0) days = 7
  const n = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0))
  return n - now
}
function fmtDur(ms) {
  if (ms <= 0) return 'sắp tới'
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d} ngày ${h} giờ`
  if (h > 0) return `${h} giờ ${m} phút`
  return `${m} phút`
}

export default function DailyConnection() {
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const resetInfo = {
    Daily: `🔄 Làm mới sau ${fmtDur(nextDailyResetMs(now))} · mỗi ngày lúc 07:00`,
    Weekly: `🔄 Làm mới sau ${fmtDur(nextWeeklyResetMs(now))} · đầu tuần (Thứ 2)`,
    Achievement: '🏆 Mốc cố định — không làm mới',
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, inv, r] = await Promise.all([
        gamificationService.tasks().catch(() => null),
        gamificationService.inventory().catch(() => null),
        connectionRemindersService.reminders().catch(() => null),
      ])
      setTasks(Array.isArray(t?.tasks) ? t.tasks : (Array.isArray(t) ? t : []))
      setInventory(Array.isArray(inv?.items) ? inv.items : (Array.isArray(inv) ? inv : []))
      setReminders(Array.isArray(r?.items) ? r.items : (Array.isArray(r) ? r : []))
    } catch (err) {
      toast.error(err?.message || 'Không tải được dữ liệu hằng ngày.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  // Kho nguyên liệu (luôn hiện đủ 3 loại)
  const invByMaterial = useMemo(() => {
    const map = {}
    for (const it of inventory) map[it.material ?? it.name] = it.quantity ?? 0
    return map
  }, [inventory])

  // Nhóm nhiệm vụ theo loại Daily/Weekly/Achievement
  const tasksByType = useMemo(() => {
    const groups = {}
    for (const t of tasks) {
      const type = t.type || 'Daily'
      ;(groups[type] ??= []).push(t)
    }
    return groups
  }, [tasks])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  const doneCount = tasks.filter((t) => t.completed).length
  const dailyPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="daily-page">
      {/* ── Hero ── */}
      <motion.div
        className="daily-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="daily-hero-top">
          <div>
            <div className="daily-hero-eyebrow"><TrophyIcon size={12} /> Hằng ngày</div>
            <h1 className="daily-hero-title">Nhiệm vụ & Phần thưởng</h1>
            <p className="daily-hero-sub">Hoàn thành nhiệm vụ để nhận nguyên liệu chăm sóc Cây tình yêu 🌳</p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="daily-hero-progress">
            <div className="daily-hero-progress-head">
              <span>Nhiệm vụ đã hoàn thành</span>
              <span>{doneCount}/{tasks.length}</span>
            </div>
            <div className="daily-bar"><div className="daily-bar-fill" style={{ width: `${dailyPct}%` }} /></div>
          </div>
        )}
        <span className="hero-deco" aria-hidden>🎁</span>
      </motion.div>

      {/* ── Kho nguyên liệu ── */}
      <section className="daily-section">
        <h2 className="daily-section-title">Kho nguyên liệu</h2>
        <div className="material-row">
          {MATERIALS.map((m) => {
            const meta = MATERIAL_META[m]
            return (
              <div key={m} className="material-chip" style={{ background: meta.bg }}>
                <span className="material-emoji">{meta.emoji}</span>
                <div className="material-info">
                  <span className="material-qty" style={{ color: meta.color }}>{invByMaterial[m] ?? 0}</span>
                  <span className="material-name">{meta.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Nhiệm vụ thưởng nguyên liệu ── */}
      {tasks.length > 0 && (
        <section className="daily-section">
          <h2 className="daily-section-title">Nhiệm vụ thưởng nguyên liệu</h2>
          {TASK_TYPE_ORDER.filter((type) => tasksByType[type]?.length).map((type) => {
            const meta = TASK_TYPE_META[type]
            return (
              <div key={type} className="task-group">
                <div className="task-group-head">
                  <div className="task-group-label" style={{ background: meta.accent }}>
                    <span>{meta.emoji}</span> {meta.label}
                  </div>
                  {resetInfo[type] && <span className="task-group-reset">{resetInfo[type]}</span>}
                </div>
                <div className="task-list">
                  {tasksByType[type].map((t) => {
                    const mat = MATERIAL_META[t.rewardMaterial]
                    const target = t.target || 1
                    const prog = Math.min(t.progress ?? 0, target)
                    const pct = Math.round((prog / target) * 100)
                    return (
                      <div key={t.code || t.id} className={`task-row${t.completed ? ' is-done' : ''}`}>
                        <div className="task-row-main">
                          <div className="task-row-title">
                            {t.description || t.title}
                            {t.completed && <span className="task-check">✓</span>}
                          </div>
                          <div className="task-progress">
                            <div className="task-progress-bar">
                              <div className="task-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="task-progress-text">{prog}/{target}</span>
                          </div>
                        </div>
                        {mat && (
                          <div className="task-reward" style={{ background: mat.bg, color: mat.color }} title={`${mat.label} x${t.rewardQty}`}>
                            <span>{mat.emoji}</span>
                            <span className="task-reward-qty">×{t.rewardQty ?? 1}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* ── Lời nhắc kết nối ── */}
      {reminders.length > 0 && (
        <section className="daily-section">
          <h2 className="daily-section-title">Lời nhắc kết nối</h2>
          <div className="reminder-list">
            {reminders.map((r, i) => (
              <div key={r.matchId || r.id || i} className="reminder-item">
                <HeartIcon size={14} />
                <span>{r.message || r.title || r.body}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
