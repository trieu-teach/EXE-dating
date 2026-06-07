import './Toggle.css'

function Toggle({ checked, onChange, label, id }) {
  const inputId = id ?? label

  return (
    <label className="toggle" htmlFor={inputId}>
      <span className="toggle__label">{label}</span>
      <input
        id={inputId}
        type="checkbox"
        className="toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  )
}

export default Toggle
