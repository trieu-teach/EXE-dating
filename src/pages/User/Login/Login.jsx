import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { validateEmail } from '../../../utils/validation.js'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'

import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    const next = {
      email: validateEmail(form.email),
      password: form.password ? undefined : 'Vui lòng nhập mật khẩu',
    }
    setErrors(next)
    return !next.email && !next.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await login({ email: form.email.trim(), password: form.password })
      toast.success('Chào mừng bạn quay lại!')
      navigate(res?.user?.role === 'Admin' ? '/admin' : '/discovery', { replace: true })
    } catch (err) {
      if (err?.status === 401) toast.error('Email hoặc mật khẩu không đúng.')
      else toast.error(err?.message || 'Đăng nhập thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Heart size={18} className="auth-logo-icon" fill="currentColor" />
          </div>
          <span className="auth-logo-text">SameMess</span>
        </div>

        {/* Hero */}
        <div className="auth-hero">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Chào bạn trở lại
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Đăng nhập để tiếp tục kết nối với những người phù hợp
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <div className="auth-pw-wrap">
            <Input
              label="Mật khẩu"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password" className="auth-link-primary">Quên mật khẩu?</Link>
          </div>

          <Button type="submit" variant="primary" size="full" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Đăng nhập'}
          </Button>
        </motion.form>

        {/* Divider */}
        <div className="auth-divider">
          <span>Hoặc</span>
        </div>

        {/* Footer */}
        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-link-bold">Đăng ký ngay</Link>
        </p>
      </motion.div>
    </div>
  )
}
