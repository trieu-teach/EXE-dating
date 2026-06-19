import { useCallback, useEffect, useState } from 'react'
import { dailyService, gamificationService, connectionRemindersService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'

export default function DailyConnection() {
  const toast = useToast()
  const [quests, setQuests] = useState([])
  const [totalXp, setTotalXp] = useState(0)
  const [userXp, setUserXp] = useState(0)
  const [tasks, setTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, t, inv, r] = await Promise.all([
        dailyService.get(),
        gamificationService.tasks().catch(() => null),
        gamificationService.inventory().catch(() => null),
        connectionRemindersService.reminders().catch(() => null),
      ])
      setQuests(Array.isArray(d?.quests) ? d.quests : [])
      setTotalXp(d?.totalXp ?? 0)
      setUserXp(d?.userXp ?? 0)
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

  const handleComplete = async (questIds) => {
    setSubmitting(true)
    try {
      await dailyService.complete(questIds)
      toast.success('Đã nhận XP!')
      await load()
    } catch (err) {
      toast.error(err?.message || 'Không nhận được XP.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  const pct = totalXp > 0 ? Math.round((userXp / totalXp) * 100) : 0

  return (
    <div className="connection-page">
      <h1>Hằng ngày</h1>

      <section className="card">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <strong>Tiến trình hôm nay</strong>
          <span style={{ color: 'var(--color-text-soft)' }}>{userXp} / {totalXp} XP</span>
        </div>
        <div className="daily-progress" style={{ marginTop: 8 }}>
          <div className="daily-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Nhiệm vụ</h2>
        {quests.length === 0 ? (
          <div className="empty">Không có nhiệm vụ nào hôm nay.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quests.map((q) => (
              <div key={q.code || q.id} className={`quest-item${q.completed ? ' is-done' : ''}`}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{q.title || q.name}</div>
                  {q.description && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>{q.description}</div>
                  )}
                </div>
                <span className="tag tag-primary">+{q.xp ?? 0} XP</span>
                {q.completed ? (
                  <span className="tag">✓ Hoàn thành</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleComplete([q.code || q.id])}
                    disabled={submitting}
                  >
                    Nhận
                  </button>
                )}
              </div>
            ))}
            {quests.some((q) => !q.completed) && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleComplete(quests.filter((q) => !q.completed).map((q) => q.code || q.id))}
                disabled={submitting}
              >
                Nhận tất cả
              </button>
            )}
          </div>
        )}
      </section>

      {tasks.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Nhiệm vụ dài hạn</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((t) => (
              <div key={t.id || t.code} className="quest-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{t.title || t.name}</div>
                  {t.description && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>{t.description}</div>
                  )}
                </div>
                <span className="tag tag-primary">+{t.xp ?? 0} XP</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {inventory.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Kho đồ</h2>
          <div className="events-grid">
            {inventory.map((it, i) => (
              <div key={it.id || i} className="event-card">
                <div className="event-card-cover" style={{ background: 'var(--color-primary-soft)' }} />
                <div className="event-card-body">
                  <div className="event-card-title">{it.name || it.title}</div>
                  <div className="event-card-meta">SL: {it.quantity ?? 1}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {reminders.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Lời nhắc kết nối</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reminders.map((r, i) => (
              <div key={r.id || i} className="quest-item">
                <span>💡 {r.title || r.body || r.code}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
