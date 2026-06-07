import './FieldNote.css'

export default function FieldNote({ children, id }) {
  if (!children) return null
  return (
    <p className="field-note" id={id}>
      {children}
    </p>
  )
}
