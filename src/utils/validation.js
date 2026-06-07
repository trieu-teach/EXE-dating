const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DISPLAY_NAME_REGEX = /^[\p{L}\s'.-]+$/u
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

export function validateEmail(email) {
  const value = email.trim()
  if (!value) return 'Email không được để trống'
  if (!EMAIL_REGEX.test(value)) return 'Email không đúng định dạng (vd: ten@gmail.com)'
  if (value.length > 254) return 'Email quá dài'
  return ''
}

/** Tên hiển thị / họ tên — không chứa số */
export function validateDisplayName(name) {
  const value = name.trim()
  if (!value) return 'Tên hiển thị không được để trống'
  if (value.length < 2) return 'Tên hiển thị phải có ít nhất 2 ký tự'
  if (value.length > 50) return 'Tên hiển thị không được quá 50 ký tự'
  if (/\d/.test(value)) return 'Tên hiển thị không được chứa số'
  if (!DISPLAY_NAME_REGEX.test(value)) return 'Tên hiển thị chỉ được chứa chữ cái và khoảng trắng'
  return ''
}

/** @deprecated — dùng validateDisplayName */
export function validateName(name) {
  return validateDisplayName(name)
}

export function validateUsername(username) {
  const value = username.trim().toLowerCase()
  if (!value) return 'Username không được để trống'
  if (/\s/.test(username)) return 'Username không được chứa khoảng trắng'
  if (/[A-Z]/.test(username)) return 'Username chỉ dùng chữ thường'
  if (!USERNAME_REGEX.test(value)) {
    return 'Username: 3–20 ký tự, chỉ chữ thường, số và gạch dưới (_)'
  }
  return ''
}

export function validatePassword(password, { forRegister = false, requireSpecial = false } = {}) {
  if (!password) return 'Mật khẩu không được để trống'
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
  if (password.length > 64) return 'Mật khẩu không được quá 64 ký tự'
  if (/\s/.test(password)) return 'Mật khẩu không được chứa khoảng trắng'

  const strict = forRegister || requireSpecial

  if (strict) {
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường'
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa'
    if (!/[0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ số'
    if (!SPECIAL_CHAR_REGEX.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$…)'
    }
  }

  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Vui lòng xác nhận mật khẩu'
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp'
  return ''
}

export function validateAge(age) {
  const raw = String(age).trim()
  if (!raw) return 'Tuổi không được để trống'
  const n = Number(raw)
  if (!Number.isInteger(n) || String(n) !== raw) return 'Tuổi phải là số nguyên'
  if (n < 18) return 'Bạn phải từ 18 tuổi trở lên'
  if (n > 99) return 'Tuổi không hợp lệ'
  return ''
}

export function validateCity(city) {
  const value = city.trim()
  if (!value) return 'Thành phố không được để trống'
  if (value.length < 2) return 'Thành phố quá ngắn'
  if (value.length > 80) return 'Thành phố không được quá 80 ký tự'
  return ''
}

export function validateOccupation(occupation) {
  const value = occupation.trim()
  if (!value) return ''
  if (value.length > 80) return 'Nghề nghiệp không được quá 80 ký tự'
  return ''
}

export function validateBio(bio) {
  const value = bio.trim()
  if (!value) return ''
  if (value.length > 300) return 'Giới thiệu không được quá 300 ký tự'
  return ''
}

export function validateSexualOrientation(orientation, { share } = {}) {
  if (!share) return ''
  if (!orientation) return ''
  return ''
}

export function validateProfileForm(values) {
  return {
    displayName: validateDisplayName(values.displayName),
    username: validateUsername(values.username),
    age: validateAge(values.age),
    city: validateCity(values.city),
    occupation: validateOccupation(values.occupation),
    bio: validateBio(values.bio),
    sexualOrientation: validateSexualOrientation(values.sexualOrientation, {
      share: values.shareSexualOrientation,
    }),
  }
}

export function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  }
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  return {
    name: validateDisplayName(name),
    email: validateEmail(email),
    password: validatePassword(password, { forRegister: true }),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  }
}

export function validateOtp(code) {
  const value = code.trim()
  if (!value) return 'Mã OTP không được để trống'
  if (!/^\d{6}$/.test(value)) return 'Mã OTP phải gồm đúng 6 chữ số'
  return ''
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
