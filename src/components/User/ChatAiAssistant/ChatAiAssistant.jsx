import './ChatAiAssistant.css'

function ChatAiAssistant({
  insight,
  suggestions = [],
  loading,
  onSelect,
  onRefresh,
  disabled,
}) {
  return (
    <section className="chat-ai" aria-label="Trợ lý AI gợi ý tin nhắn">
      <div className="chat-ai__head">
        <div className="chat-ai__title">
          <span className="chat-ai__icon" aria-hidden="true">
            ✨
          </span>
          <div>
            <strong>SameMess AI</strong>
            <span>Gợi ý nên nói gì tiếp theo</span>
          </div>
        </div>
        <button
          type="button"
          className="chat-ai__refresh"
          onClick={onRefresh}
          disabled={loading || disabled}
          aria-label="Làm mới gợi ý"
        >
          {loading ? '...' : '↻'}
        </button>
      </div>

      {loading && !suggestions.length ? (
        <p className="chat-ai__loading">Đang đọc tin nhắn và tạo gợi ý...</p>
      ) : (
        <>
          {insight && <p className="chat-ai__insight">{insight}</p>}
          <div className="chat-ai__pills">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                className="chat-ai__pill"
                onClick={() => onSelect(s.text)}
                disabled={disabled}
                title={s.tone ? `Tone: ${s.tone}` : undefined}
              >
                {s.text}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default ChatAiAssistant
