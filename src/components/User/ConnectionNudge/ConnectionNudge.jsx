import './ConnectionNudge.css'

function ConnectionNudge({
  nudge,
  onAction,
  onDismiss,
  onMeetup,
  compact = false,
}) {
  if (!nudge) return null

  const toneClass = nudge.tone ? `connection-nudge--${nudge.tone}` : ''

  return (
    <div className={`connection-nudge ${toneClass}${compact ? ' connection-nudge--compact' : ''}`}>
      <div className="connection-nudge__icon" aria-hidden="true">
        {nudge.icon}
      </div>
      <div className="connection-nudge__body">
        <strong>{nudge.title}</strong>
        {!compact && <p>{nudge.desc}</p>}
      </div>
      <div className="connection-nudge__actions">
        {nudge.showMeetupCard && onMeetup ? (
          <button type="button" className="connection-nudge__btn connection-nudge__btn--primary" onClick={onMeetup}>
            {nudge.actionLabel}
          </button>
        ) : (
          <button type="button" className="connection-nudge__btn connection-nudge__btn--primary" onClick={() => onAction?.(nudge)}>
            {nudge.actionLabel}
          </button>
        )}
        <button
          type="button"
          className="connection-nudge__btn connection-nudge__btn--ghost"
          onClick={() => onDismiss?.(nudge)}
          aria-label="Bỏ qua nhắc nhở"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ConnectionNudge
