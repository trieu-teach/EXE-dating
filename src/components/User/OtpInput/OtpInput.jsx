import { useRef } from 'react'
import './OtpInput.css'

const OTP_LENGTH = 6

function OtpInput({ value, onChange, hasError = false, disabled = false }) {
  const inputsRef = useRef([])

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  function updateValue(nextDigits) {
    onChange(nextDigits.join('').slice(0, OTP_LENGTH))
  }

  function focusInput(index) {
    inputsRef.current[index]?.focus()
  }

  function handleChange(index, inputValue) {
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    updateValue(next)

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    updateValue(pasted.split(''))
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  return (
    <div
      className={`otp-input${hasError ? ' otp-input--error' : ''}`}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          className="otp-input__box"
          aria-label={`Chữ số OTP ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  )
}

export default OtpInput
