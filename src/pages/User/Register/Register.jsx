import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validation.js'
import ThemeToggle from '../../../components/User/ThemeToggle/ThemeToggle.jsx'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'

import './Register.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const next = {
      displayName: validateRequired(form.displayName, 'Tên hiển thị'),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Mật khẩu nhập lại không khớp'
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
      })
      toast.success('Đã gửi mã OTP đến email của bạn.')
      navigate('/verify-otp', { replace: true, state: { email: form.email.trim() } })
    } catch (err) {
      toast.error(err?.message || 'Đăng ký thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <Heart size={18} className="auth-logo-icon" fill="currentColor" />
          </div>
          <span className="auth-logo-text">SameMess</span>
          <div className="auth-theme-btn">
            <ThemeToggle />
          </div>
        </div>

        <div className="auth-hero">
          <h1>Tạo tài khoản mới</h1>
          <p>Bắt đầu hành trình kết nối của bạn ngay hôm nay</p>
        </div>

        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="Tên hiển thị"
            placeholder="Tên bạn là gì?"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            maxLength={50}
            error={errors.displayName}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Số điện thoại"
            type="tel"
            autoComplete="tel"
            placeholder="+84..."
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />

          <div className="auth-pw-wrap">
            <Input
              label="Mật khẩu"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="auth-pw-wrap">
            <Input
              label="Nhập lại mật khẩu"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" variant="primary" size="full" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Tạo tài khoản'}
          </Button>
        </motion.form>

        <div className="auth-divider"><span>Hoặc</span></div>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login" className="auth-link-bold">Đăng nhập</Link>
        </p>

        <p className="auth-terms">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="#" className="auth-link-primary">Điều khoản</a> và{' '}
          <a href="#" className="auth-link-primary">Chính sách bảo mật</a>.
        </p>
      </motion.div>
    </div>
  )
}
