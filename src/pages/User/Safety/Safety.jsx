import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { safetyService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import {
  ShieldIcon, PinIcon, BellIcon, CheckIcon, PhoneIcon,
  ChevronRightIcon, AlertIcon, HeartIcon
} from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import './Safety.css'

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn('safety-toggle', checked && 'is-on')}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span className="safety-toggle-thumb" />
    </button>
  )
}

const FEATURES = [
  {
    Icon: PinIcon,
    iconCls: 'pin',
    title: 'PIN bảo vệ',
    desc: 'Bảo vệ app bằng mã PIN khi mở từ thiết bị lạ.',
    link: '/safety-pin-setup',
    linkLabel: 'Đặt PIN',
    action: null,
  },
  {
    Icon: BellIcon,
    iconCls: 'alert',
    title: 'Cảnh báo khẩn',
    desc: 'Gửi tin nhắn khẩn cấp đến danh bạ tin cậy ngay lập tức.',
    link: '/emergency-alert',
    linkLabel: 'Thiết lập',
    action: null,
  },
  {
    Icon: HeartIcon,
    iconCls: 'checkin',
    title: 'Check-in an toàn',
    desc: 'Nhắc xác nhận sau mỗi cuộc hẹn để đảm bảo an toàn.',
    link: '/safety-checkin',
    linkLabel: 'Check-in ngay',
    action: null,
  },
  {
    Icon: PhoneIcon,
    iconCls: 'contacts',
    title: 'Danh bạ khẩn cấp',
    desc: 'Quản lý danh sách liên hệ được thông báo khi cần.',
    link: '/emergency-alert',
    linkLabel: 'Quản lý',
    action: null,
  },
]

export default function Safety() {
  const navigate = useNavigate()
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [emergency, setEmergency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [s, e] = await Promise.all([
        safetyService.getSettings().catch(() => null),
        safetyService.getEmergency().catch(() => null),
      ])
      setSettings(s)
      setEmergency(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const update = async (patch) => {
    setSaving(true)
    try {
      const updated = await safetyService.updateSettings(patch)
      setSettings(updated)
      toast.success('Đã lưu cài đặt an toàn.')
    } catch (err) {
      toast.error(err?.message || 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="safety-root">
      {/* Hero */}
      <div className="safety-hero">
        <div className="safety-hero-inner">
          <div className="safety-hero-icon">
            <ShieldIcon size={28} />
          </div>
          <h1 className="safety-hero-title">An toàn & Bảo mật</h1>
          <p className="safety-hero-subtitle">
            Bảo vệ bản thân và yên tâm kết nối với những người xung quanh
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="safety-features">
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            className="safety-feature-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={cn('safety-feature-icon', f.iconCls)}>
              <f.Icon size={22} />
            </div>
            <div className="safety-feature-title">{f.title}</div>
            <div className="safety-feature-desc">{f.desc}</div>
            <Link to={f.link} className="safety-feature-link">
              {f.linkLabel}
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick toggles */}
      <div className="safety-toggle-card" style={{ margin: '0 16px 16px' }}>
        <div className="safety-toggle-row">
          <div className="safety-toggle-info">
            <div className="safety-toggle-label">Bật PIN</div>
            <div className="safety-toggle-desc">Yêu cầu PIN mỗi lần mở app</div>
          </div>
          <Toggle
            checked={Boolean(settings?.pinEnabled)}
            onChange={(v) => update({ pinEnabled: v })}
            disabled={saving}
          />
        </div>
        <div className="safety-toggle-row">
          <div className="safety-toggle-info">
            <div className="safety-toggle-label">Cảnh báo khẩn cấp</div>
            <div className="safety-toggle-desc">Gửi tin nhắn khẩn cấp đến danh bạ</div>
          </div>
          <Toggle
            checked={Boolean(settings?.emergencyAlertEnabled)}
            onChange={(v) => update({ emergencyAlertEnabled: v })}
            disabled={saving}
          />
        </div>
        <div className="safety-toggle-row">
          <div className="safety-toggle-info">
            <div className="safety-toggle-label">Check-in an toàn</div>
            <div className="safety-toggle-desc">Nhắc xác nhận sau mỗi cuộc hẹn</div>
          </div>
          <Toggle
            checked={Boolean(settings?.checkinEnabled)}
            onChange={(v) => update({ checkinEnabled: v })}
            disabled={saving}
          />
        </div>
      </div>

      {/* Emergency contacts */}
      <div style={{ padding: '0 16px 64px' }}>
        <div className="safety-contacts-card">
          {emergency?.contacts?.length ? (
            <div className="safety-contacts-list">
              {emergency.contacts.map((c, i) => (
                <div key={i} className="safety-contact">
                  <div className="safety-contact-avatar">{c.name?.[0] || '?'}</div>
                  <div>
                    <div className="safety-contact-name">{c.name}</div>
                    <div className="safety-contact-meta">
                      {c.phoneNumber}
                      {c.relationship ? ` · ${c.relationship}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="safety-empty">Chưa có liên hệ nào trong danh bạ.</div>
          )}
          <button
            type="button"
            className="safety-card-btn-full"
            onClick={() => navigate('/emergency-alert')}
          >
            Quản lý danh bạ & tin nhắn khẩn cấp
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
