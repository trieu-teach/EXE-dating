import './OnboardingShell.css'

/**
 * Shared layout for the 4-step onboarding flow.
 *
 * Steps:
 *   1. Preferences (match criteria)
 *   2. Location (GPS / coordinates)
 *   3. Profile (info, photos)
 *   4. Face Verification
 *
 * The shell renders a sidebar with brand + stepper and a main panel
 * with a progress bar, eyebrow, title, body and action row.
 */
const STEPS = [
  { key: 'preferences', label: 'Tiêu chí', emoji: '💞' },
  { key: 'location', label: 'Vị trí', emoji: '📍' },
  { key: 'profile', label: 'Hồ sơ', emoji: '🪪' },
  { key: 'verify', label: 'Xác minh', emoji: '🛡️' },
]

export default function OnboardingShell({
  step,           // 'preferences' | 'location' | 'profile' | 'verify'
  eyebrow,
  title,
  subtitle,
  heroTitle,
  heroText,
  heroEmoji,
  children,
  actions,        // node
  progress,       // number 0-100 (optional, auto-calculated if omitted)
  loading = false,
}) {
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === step),
  )
  const percent = progress != null
    ? progress
    : Math.round(((currentIndex + 1) / STEPS.length) * 100)

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell">
        <aside className="onboarding-aside">
          <div className="onboarding-brand">
            <div className="onboarding-brand-mark">💗</div>
            <span>SameMess</span>
          </div>

          <div className="onboarding-hero">
            {heroEmoji && <div className="onboarding-hero-illu" aria-hidden>{heroEmoji}</div>}
            {heroTitle && <h2>{heroTitle}</h2>}
            {heroText && <p>{heroText}</p>}
          </div>

          <ol className="onboarding-step-list" aria-label="Tiến trình onboarding">
            {STEPS.map((s, i) => {
              const isActive = i === currentIndex
              const isDone = i < currentIndex
              return (
                <li
                  key={s.key}
                  className={`onboarding-step${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                >
                  <span className="onboarding-step-num" aria-hidden>
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span>{s.emoji} {s.label}</span>
                </li>
              )
            })}
          </ol>
        </aside>

        <section className="onboarding-main">
          <div className="onboarding-progress">
            <div className="onboarding-progress-meta">
              <span>Bước {currentIndex + 1} / {STEPS.length}</span>
              <span>{percent}%</span>
            </div>
            <div
              className="onboarding-progress-bar"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="onboarding-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {(eyebrow || title || subtitle) && (
            <header className="onboarding-title">
              {eyebrow && <span className="onboarding-eyebrow">{eyebrow}</span>}
              {title && <h1>{title}</h1>}
              {subtitle && <p>{subtitle}</p>}
            </header>
          )}

          <div className="onboarding-body">
            {loading ? (
              <div className="loading-block">
                <span className="spinner" />
                <span style={{ marginLeft: 8 }}>Đang tải…</span>
              </div>
            ) : (
              children
            )}
          </div>

          {actions && <div className="onboarding-actions">{actions}</div>}
        </section>
      </div>
    </main>
  )
}
