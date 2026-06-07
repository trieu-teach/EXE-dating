import './ConnectionReminderList.css'

function ConnectionReminderList({ reminders = [], onOpenChat, onMeetUp }) {
  if (!reminders.length) return null

  return (
    <div className="connection-reminder-list connection-reminder-list--compact">
      <div className="connection-reminder-list__head">
        <span className="connection-reminder-list__badge">{reminders.length}</span>
        <strong>Nhớ đến nhau</strong>
      </div>

      <ul className="connection-reminder-list__items">
        {reminders.slice(0, 3).map((item) => {
          const canMeet =
            item.topNudge.id === 'ready_to_meet' || item.topNudge.id === 'weekend_push'

          return (
            <li key={item.conversationId} className="connection-reminder-list__item">
              <button
                type="button"
                className="connection-reminder-list__row"
                onClick={() => onOpenChat?.(item.conversationId)}
              >
                <span className="connection-reminder-list__avatar">
                  {item.partnerImage ? <img src={item.partnerImage} alt="" /> : '💕'}
                </span>
                <span className="connection-reminder-list__info">
                  <strong>{item.partnerName}</strong>
                  <span>{item.topNudge.title}</span>
                </span>
                {!canMeet && (
                  <span
                    className="connection-reminder-list__warmth"
                    title={`Độ gắn kết ${item.warmthScore}%`}
                  >
                    {item.warmthScore}%
                  </span>
                )}
              </button>
              {canMeet && (
                <button
                  type="button"
                  className="connection-reminder-list__meet-btn"
                  onClick={() => onMeetUp?.(item.conversationId)}
                >
                  Hẹn
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConnectionReminderList
