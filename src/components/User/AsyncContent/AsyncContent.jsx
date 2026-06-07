import './AsyncContent.css'

function AsyncContent({
  loading,
  error,
  onRetry,
  loadingLabel = 'Đang tải...',
  children,
  empty,
  isEmpty,
}) {
  if (loading) {
    return (
      <div className="async-content async-content--loading" role="status">
        <span className="async-content__spinner" aria-hidden="true" />
        <p>{loadingLabel}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="async-content async-content--error" role="alert">
        <p>{error.message}</p>
        {onRetry && (
          <button type="button" className="async-content__retry" onClick={onRetry}>
            Thử lại
          </button>
        )}
      </div>
    )
  }

  if (isEmpty && empty) {
    return <div className="async-content async-content--empty">{empty}</div>
  }

  return children
}

export default AsyncContent
