/**
 * Tiny validators shared by forms. Returning the error string (or undefined
 * for "ok") keeps the call sites concise.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Vui lòng nhập email'
  if (!EMAIL_RE.test(v)) return 'Email không hợp lệ'
  return undefined
}

export function validatePassword(value) {
  const v = value ?? ''
  if (!v) return 'Vui lòng nhập mật khẩu'
  if (v.length < 8) return 'Mật khẩu tối thiểu 8 ký tự'
  if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) {
    return 'Mật khẩu cần chữ hoa, chữ thường và số'
  }
  return undefined
}

export function validateRequired(value, label = 'Trường này') {
  if (value === undefined || value === null || value === '') return `${label} là bắt buộc`
  return undefined
}

export function validateDateOfBirth(value) {
  if (!value) return 'Vui lòng nhập ngày sinh'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Ngày sinh không hợp lệ'
  const now = new Date()
  const minAge = 18
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  if (age < minAge) return `Cần từ ${minAge} tuổi trở lên`
  if (age > 100) return 'Ngày sinh không hợp lệ'
  return undefined
}

export function validateOtp(value) {
  const v = (value ?? '').toString().trim()
  if (!v) return 'Vui lòng nhập mã OTP'
  if (!/^\d{4,8}$/.test(v)) return 'OTP gồm 4-8 chữ số'
  return undefined
}

export function validatePin(value) {
  const v = (value ?? '').toString()
  if (!v) return 'Vui lòng nhập mã PIN'
  if (!/^\d{4,6}$/.test(v)) return 'PIN gồm 4-6 chữ số'
  return undefined
}
