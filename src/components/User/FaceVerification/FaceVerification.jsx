import { useCallback, useEffect, useRef, useState } from 'react'
import { profileService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useSelfieCapture } from '../../../hooks/useSelfieCapture.js'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const POLL_INTERVAL_MS = 15_000

const STATUS_TONE = {
  Approved: 'approved',
  Pending: 'pending',
  Rejected: 'rejected',
  None: 'empty',
}

const STATUS_META = {
  Approved:   { emoji: '✅', title: 'Đã xác minh',                desc: 'Khuôn mặt của bạn đã khớp với ảnh chính.' },
  Pending:    { emoji: '⏳', title: 'Đang chờ quản trị viên duyệt', desc: 'Hệ thống không tự động khớp — admin sẽ xem xét thủ công trong ít phút.' },
  Rejected:   { emoji: '❌', title: 'Xác minh không thành công',   desc: 'Selfie không khớp với ảnh chính. Hãy thử lại ở nơi đủ sáng.' },
  None:       { emoji: '📸', title: 'Chưa xác minh khuôn mặt',    desc: 'Bạn vẫn dùng app bình thường, nhưng sẽ thiếu tích xanh và uy tín tối đa 65.' },
}

function normalizeStatus(input) {
  if (!input) return 'None'
  const raw = (input.status || 'None').toString()
  if (raw === 'None' || raw === 'NotSubmitted') return 'None'
  if (raw in STATUS_META) return raw
  return 'None'
}

function isVerified(input) {
  if (!input) return false
  if (typeof input.isPhotoVerified === 'boolean') return input.isPhotoVerified
  return normalizeStatus(input) === 'Approved'
}

/**
 * FaceVerification — full flow for /api/profile/verify-face.
 *
 * Props:
 *   - variant: 'onboarding' | 'settings'  (controls copy + retry button)
 *   - onVerified: optional callback fired when the user successfully submits
 *                 or when the status becomes Approved.
 *   - onContinue: optional callback for "Continue" button (used by onboarding
 *                 shell). If omitted, no continue button is rendered.
 *   - continueLabel: label for the continue button
 *
 * The component owns:
 *   - polling GET /api/profile/verification when status === 'Pending'
 *   - camera lifecycle (start/stop via useSelfieCapture)
 *   - preview / re-shoot / submit state machine
 */
export default function FaceVerification({
  variant = 'onboarding',
  onVerified,
  onContinue,
  continueLabel = 'Vào Discovery 💞 →',
}) {
  const toast = useToast()
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState('view') // view | camera | preview | submitting
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [bannerError, setBannerError] = useState(null)
  const [prereq, setPrereq] = useState({ checked: false, hasPhoto: false, message: '' })
  const fileInputRef = useRef(null)

  const { videoRef, status: camStatus, error: camError, start, stop, capture } = useSelfieCapture()

  const load = useCallback(async () => {
    try {
      const [v, profile] = await Promise.all([
        profileService.verification().catch(() => null),
        profileService.me().catch(() => null),
      ])
      setVerification(v || { status: 'None' })
      const photos = profile?.photos || []
      const primary = profile?.primaryPhotoUrl || profile?.primaryPhotoId
      const hasPhoto = photos.length > 0 || Boolean(primary)
      setPrereq({
        checked: true,
        hasPhoto,
        message: hasPhoto
          ? ''
          : 'Bạn cần thêm ít nhất 1 ảnh hồ sơ và đặt làm ảnh chính trước khi xác minh.',
      })
    } catch {
      setVerification({ status: 'None' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const status = normalizeStatus(verification)
  const verified = isVerified(verification)

  // Polling while Pending
  useEffect(() => {
    if (status !== 'Pending') return undefined
    const id = setInterval(async () => {
      try {
        const v = await profileService.verification()
        setVerification(v)
        if (normalizeStatus(v) !== 'Pending') {
          toast.success('Có cập nhật mới về trạng thái xác minh.')
          onVerified?.(v)
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [status, toast, onVerified])

  // Open / close camera when entering / leaving camera stage
  useEffect(() => {
    if (stage === 'camera') {
      start()
    } else {
      stop()
    }
  }, [stage, start, stop])

  // Revoke preview URL on cleanup / re-shoot
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const enterCamera = () => {
    setBannerError(null)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setPreviewFile(null)
    setStage('camera')
  }

  const onShoot = async () => {
    setBannerError(null)
    const file = await capture()
    if (!file) {
      setBannerError(camError || 'Không chụp được ảnh, hãy thử lại.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    stop()
    setStage('preview')
  }

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-pick
    if (!file) return
    setBannerError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setBannerError('Định dạng không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setBannerError(`Ảnh vượt quá ${MAX_SIZE_MB}MB. Hãy chọn ảnh nhỏ hơn.`)
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    stop()
    setStage('preview')
  }

  const onSubmit = async () => {
    if (!previewFile) {
      setBannerError('Chưa có ảnh để gửi.')
      return
    }
    setStage('submitting')
    setBannerError(null)
    try {
      const fd = new FormData()
      fd.append('file', previewFile, 'selfie.jpg')
      const res = await profileService.verifyFace(previewFile)
      setVerification(res)
      const next = normalizeStatus(res)
      if (next === 'Approved') {
        toast.success(res?.message || 'Xác minh khuôn mặt thành công!')
        onVerified?.(res)
      } else if (next === 'Pending') {
        toast.info(res?.message || 'Đã gửi selfie — chờ admin duyệt.')
        onVerified?.(res)
      } else {
        toast.warn(res?.message || 'Xác minh không thành công.')
      }
      setStage('view')
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
      setPreviewFile(null)
    } catch (err) {
      // 400/409/etc. — message comes from http.js
      setBannerError(err?.message || 'Không gửi được selfie. Vui lòng thử lại.')
      setStage('preview')
    }
  }

  const onRetry = () => {
    setBannerError(null)
    setStage('view')
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setPreviewFile(null)
  }

  if (loading) {
    return <div className="loading-block"><span className="spinner" /></div>
  }

  const meta = STATUS_META[status]

  return (
    <div className="fv-shell">
      {/* ===== Status card ===== */}
      <div className={`fv-status-card is-${STATUS_TONE[status]}`}>
        <div className="fv-status-emoji" aria-hidden>{meta.emoji}</div>
        <div className="fv-status-text">
          <strong>
            {meta.title}
            {verified && <span className="fv-badge" style={{ marginLeft: 8 }}>Đã xác minh ✓</span>}
          </strong>
          <span>{verification?.message || meta.desc}</span>
          {verification?.submittedAt && (
            <small>Gửi lúc: {new Date(verification.submittedAt).toLocaleString()}</small>
          )}
          {verification?.reviewedAt && (
            <small>Duyệt lúc: {new Date(verification.reviewedAt).toLocaleString()}</small>
          )}
        </div>
      </div>

      {/* ===== Prerequisite gate ===== */}
      {!prereq.hasPhoto && (
        <div className="fv-banner is-warn">
          <span aria-hidden>⚠️</span>
          <span>{prereq.message}</span>
        </div>
      )}

      {/* ===== Camera / preview area ===== */}
      {stage === 'view' && !verified && prereq.hasPhoto && (
        <div className="fv-placeholder">
          <div className="fv-placeholder-emoji" aria-hidden>🤳</div>
          <strong style={{ color: 'var(--color-text)' }}>Sẵn sàng chụp selfie?</strong>
          <small>Đảm bảo khuôn mặt nằm trong khung, đủ sáng, không đeo kính râm.</small>
        </div>
      )}

      {stage === 'view' && verified && (
        <div className="fv-placeholder">
          <div className="fv-placeholder-emoji" aria-hidden>🎉</div>
          <strong style={{ color: 'var(--color-text)' }}>Hồ sơ của bạn đã được xác minh!</strong>
          <small>Bạn sẽ nhận tích xanh và điểm uy tín đầy đủ.</small>
        </div>
      )}

      {stage === 'camera' && (
        <div className="fv-camera">
          <video ref={videoRef} playsInline muted autoPlay />
          <div className="fv-camera-overlay">
            <div className="fv-camera-frame" />
          </div>
          <div className="fv-camera-hint">
            {camStatus === 'requesting' ? 'Đang mở camera…' : 'Đặt khuôn mặt vào khung rồi bấm Chụp'}
          </div>
        </div>
      )}

      {stage === 'preview' && previewUrl && (
        <div className="fv-camera">
          <img src={previewUrl} alt="Selfie preview" />
        </div>
      )}

      {stage === 'submitting' && (
        <div className="fv-placeholder">
          <div className="fv-placeholder-emoji" aria-hidden>⏳</div>
          <strong style={{ color: 'var(--color-text)' }}>Đang gửi selfie…</strong>
          <small>Có thể mất vài giây tùy tốc độ mạng.</small>
        </div>
      )}

      {camError && stage === 'camera' && (
        <div className="fv-banner is-error">
          <span aria-hidden>🚫</span>
          <span>
            {camError} Bạn có thể <a href="#" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}>chọn ảnh từ thiết bị</a> thay thế.
          </span>
        </div>
      )}

      {bannerError && (
        <div className="fv-banner is-error">
          <span aria-hidden>⚠️</span>
          <span>{bannerError}</span>
        </div>
      )}

      {/* ===== Hidden file input fallback ===== */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        onChange={onPickFile}
        style={{ display: 'none' }}
      />

      {/* ===== Action row ===== */}
      <div className={`fv-actions${stage === 'preview' ? ' is-row' : ''}`}>
        {stage === 'view' && !verified && prereq.hasPhoto && (
          <button type="button" className="btn btn-primary" onClick={enterCamera}>
            📸 {status === 'Pending' ? 'Gửi lại selfie' : status === 'Rejected' ? 'Thử lại' : 'Xác minh khuôn mặt'}
          </button>
        )}

        {stage === 'view' && !verified && !prereq.hasPhoto && (
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => fileInputRef.current?.click()}
          >
            🖼️ Chọn ảnh đại diện trước
          </button>
        )}

        {stage === 'view' && verified && onContinue && (
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            {continueLabel}
          </button>
        )}

        {stage === 'camera' && (
          <>
            <button type="button" className="btn btn-primary" onClick={onShoot} disabled={camStatus !== 'live'}>
              {camStatus === 'live' ? '📸 Chụp' : <span className="fv-spinner-row"><span className="spinner" /> Đang mở camera…</span>}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onRetry}>Hủy</button>
            <button type="button" className="btn btn-soft" onClick={() => fileInputRef.current?.click()}>
              📁 Chọn ảnh từ thiết bị
            </button>
          </>
        )}

        {stage === 'preview' && (
          <>
            <button type="button" className="btn btn-primary" onClick={onSubmit}>
              ✅ Gửi để xác minh
            </button>
            <button type="button" className="btn btn-ghost" onClick={enterCamera}>
              🔄 Chụp lại
            </button>
          </>
        )}
      </div>

      {status === 'Pending' && stage === 'view' && (
        <div className="fv-helper">
          <span className="fv-helper-emoji" aria-hidden>🔄</span>
          <span>Đang tự động kiểm tra cập nhật mỗi 15 giây…</span>
        </div>
      )}

      {variant === 'onboarding' && status !== 'Approved' && onContinue && (
        <div className="fv-helper">
          <span className="fv-helper-emoji" aria-hidden>💡</span>
          <span>
            Bạn có thể bỏ qua — ảnh không khớp vẫn dùng app bình thường, chỉ thiếu tích xanh và uy tín tối đa 65.
          </span>
        </div>
      )}
    </div>
  )
}
