import './DateInvitePrompt.css'

function DateInvitePrompt({ partnerName, treeDisplay, locationHint, onAccept, onDecline }) {
  return (
    <div className="date-invite-prompt">
      <div className="date-invite-prompt__glow" aria-hidden="true" />
      <div className="date-invite-prompt__content">
        <span className="date-invite-prompt__badge">
          Cây cấp {treeDisplay?.level} · {treeDisplay?.stageLabel}
        </span>
        <h3>Bạn có muốn hẹn hò với {partnerName} không?</h3>
        <p>
          Cây tình yêu của hai bạn đã đủ lớn. Gặp mặt thật giúp hiểu nhau hơn — chúng mình sẽ gợi ý
          địa điểm gần chỗ hai bạn.
        </p>
        {locationHint && <p className="date-invite-prompt__location">📍 {locationHint}</p>}
        <div className="date-invite-prompt__actions">
          <button type="button" className="date-invite-prompt__yes" onClick={onAccept}>
            Có, gợi ý địa điểm gần đây
          </button>
          <button type="button" className="date-invite-prompt__later" onClick={onDecline}>
            Để sau
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateInvitePrompt
