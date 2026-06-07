import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { profileService } from '../../../api/index.js'
import LovePageDecor from '../../../components/User/LovePageDecor/LovePageDecor.jsx'
import Toast from '../../../components/User/Toast/Toast.jsx'
import {
  TRUST_SCORE_DELTA,
  TRUST_SCORE_UNVERIFIED,
  TRUST_SCORE_VERIFIED,
  isIdentityVerified,
  isVerificationRequired,
} from '../../../utils/identityVerification.js'
import { markOnboarded } from '../../../utils/session.js'
import './AccountVerification.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function AccountVerification() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [toast, setToast] = useState(null)
  const [cameraState, setCameraState] = useState('loading')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const required = isVerificationRequired()
  const alreadyVerified = isIdentityVerified()

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('denied')
      return false
    }

    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('active')
      return true
    } catch {
      setCameraState('denied')
      return false
    }
  }, [stopCamera])

  useEffect(() => {
    if (alreadyVerified) return undefined
    startCamera()
    return stopCamera
  }, [startCamera, stopCamera, alreadyVerified])

  function hideToast() {
    setToast(null)
  }

  function showToast(message, type = 'info') {
    setToast({ message, type, id: Date.now() })
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  async function handleRetryCamera() {
    const ok = await startCamera()
    if (!ok) {
      showToast('Không mở được camera. Hãy cho phép quyền camera trên trình duyệt.', 'error')
    }
  }

  async function handleVerify() {
    if (cameraState === 'denied') {
      await handleRetryCamera()
      return
    }

    if (cameraState !== 'active' || submitting) return

    const photo = capturePhoto()
    if (!photo) {
      showToast('Chưa lấy được ảnh. Thử căn mặt vào khung rồi bấm lại.', 'error')
      return
    }

    setSubmitting(true)
    stopCamera()
    setPreviewUrl(photo)
    setCameraState('captured')

    try {
      await profileService.submitVerification({ type: 'face', photo })
      markOnboarded()
      showToast(
        `Xác minh thành công! Uy tín của bạn: ${TRUST_SCORE_VERIFIED} (+${TRUST_SCORE_DELTA} so với chưa xác minh).`,
        'success',
      )
      setTimeout(() => navigate('/discovery'), 1200)
    } catch {
      showToast('Xác minh thất bại. Vui lòng thử lại.', 'error')
      setPreviewUrl(null)
      setCameraState('denied')
      setSubmitting(false)
    }
  }

  function handleSkip() {
    if (required) {
      showToast('Xác minh danh tính đang bật chế độ bắt buộc.', 'warning')
      return
    }
    markOnboarded()
    showToast(
      `Bạn chưa xác minh — uy tín ${TRUST_SCORE_UNVERIFIED}. Có thể xác minh sau trong Hồ sơ.`,
      'info',
    )
    navigate('/discovery')
  }

  if (alreadyVerified) {
    return (
      <div className="account-verify-page user-page">
        <LovePageDecor />
        <div className="account-verify-shell">
          <main className="account-verify-main account-verify-main--done">
            <div className="account-verify-trust-compare account-verify-trust-compare--done">
              <span className="account-verify-trust-pill account-verify-trust-pill--high">
                ✓ Đã xác minh danh tính
              </span>
              <p>
                Điểm uy tín hiện tại: <strong>{TRUST_SCORE_VERIFIED}</strong>
              </p>
            </div>
            <button
              type="button"
              className="account-verify-btn-primary"
              onClick={() => navigate('/discovery')}
            >
              Vào khám phá
            </button>
          </main>
        </div>
      </div>
    )
  }

  const badgeText =
    cameraState === 'loading'
      ? 'Đang mở camera...'
      : cameraState === 'active'
        ? 'Căn mặt vào khung oval'
        : cameraState === 'captured'
          ? 'Đã chụp — đang xác minh'
          : 'Không truy cập được camera'

  const badgeClass =
    cameraState === 'active' || cameraState === 'captured'
      ? ' account-verify-face-badge--ok'
      : cameraState === 'denied'
        ? ' account-verify-face-badge--warn'
        : ''

  const buttonLabel =
    submitting
      ? 'Đang xác minh...'
      : cameraState === 'denied'
        ? 'Thử lại camera'
        : cameraState === 'active'
          ? 'Chụp và xác minh (webcam PC)'
          : 'Đang chuẩn bị...'

  return (
    <div className="account-verify-page user-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
      <LovePageDecor />
      <div className="account-verify-shell">
        <header className="account-verify-topbar">
          <button
            type="button"
            className="account-verify-back"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <BackIcon />
          </button>
          <h1 className="account-verify-title">Xác minh danh tính</h1>
          <span className="account-verify-topbar-spacer" aria-hidden="true" />
        </header>

        <div className="account-verify-progress">
          <div className="account-verify-progress-labels">
            <span>Tiến trình xác minh</span>
            <span>2/3</span>
          </div>
          <div className="account-verify-progress-track">
            <div className="account-verify-progress-fill" style={{ width: '66.67%' }} />
          </div>
        </div>

        <main className="account-verify-main">
          <div className={`account-verify-policy${required ? ' account-verify-policy--required' : ''}`}>
            {required ? (
              <strong>Bắt buộc:</strong>
            ) : (
              <strong>Tùy chọn:</strong>
            )}{' '}
            {required
              ? 'Bạn cần xác minh webcam trước khi dùng khám phá.'
              : 'Có thể bỏ qua và xác minh sau — uy tín sẽ thấp hơn.'}
          </div>

          <div className="account-verify-trust-compare" aria-label="So sánh uy tín">
            <div className="account-verify-trust-col account-verify-trust-col--low">
              <span className="account-verify-trust-pill">○ Chưa xác minh</span>
              <strong>{TRUST_SCORE_UNVERIFIED}</strong>
              <span>điểm uy tín</span>
            </div>
            <div className="account-verify-trust-arrow" aria-hidden="true">
              →
            </div>
            <div className="account-verify-trust-col account-verify-trust-col--high">
              <span className="account-verify-trust-pill account-verify-trust-pill--high">
                ✓ Đã xác minh (webcam)
              </span>
              <strong>{TRUST_SCORE_VERIFIED}</strong>
              <span>+{TRUST_SCORE_DELTA} uy tín</span>
            </div>
          </div>

          <section className="account-verify-hero">
            <h2>
              {cameraState === 'denied'
                ? 'Cần quyền truy cập camera'
                : 'Căn mặt vào khung oval'}
            </h2>
            <p>
              {cameraState === 'denied'
                ? 'Trình duyệt đang chặn camera. Bấm "Thử lại camera" sau khi đã cho phép.'
                : 'Dùng webcam máy tính — đủ ánh sáng, không khẩu trang hay kính râm che mặt.'}
            </p>
          </section>

          <div className="account-verify-face-wrap">
            <div className="account-verify-face-frame">
              <div className="account-verify-face-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Ảnh xác minh đã chụp" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className={`account-verify-face-video${cameraState === 'active' ? ' account-verify-face-video--on' : ''}`}
                      playsInline
                      muted
                      aria-label="Camera xác minh khuôn mặt"
                    />
                    {cameraState !== 'active' && (
                      <div className="account-verify-face-placeholder">
                        <CameraIcon />
                        <span>
                          {cameraState === 'loading'
                            ? 'Đang bật webcam...'
                            : 'Camera chưa sẵn sàng'}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <span className="account-verify-face-oval" aria-hidden="true" />
              </div>
              <span className={`account-verify-face-badge${badgeClass}`}>
                {(cameraState === 'active' || cameraState === 'captured') && <CheckIcon />}
                {badgeText}
              </span>
            </div>
          </div>

          <div className="account-verify-cards">
            <article className="account-verify-card">
              <span className="account-verify-card-icon">
                <ShieldIcon />
              </span>
              <div>
                <h3>Tại sao cần xác minh?</h3>
                <p>
                  Selfie qua webcam giúp xác nhận bạn là người thật. Tài khoản đã xác minh có
                  điểm uy tín cao hơn và hiển thị huy hiệu &quot;Đã xác minh danh tính&quot;.
                </p>
              </div>
            </article>

            <article className="account-verify-card">
              <span className="account-verify-card-icon">
                <CardIcon />
              </span>
              <div>
                <h3>Lựa chọn khác</h3>
                <p>
                  Bạn cũng có thể xác minh bằng CMND/CCCD hoặc Hộ chiếu nếu không thể dùng
                  camera (sắp có).
                </p>
                <button type="button" className="account-verify-card-link" disabled>
                  Xác minh qua ID (sắp có)
                </button>
              </div>
            </article>
          </div>

          <div className="account-verify-actions">
            <button
              type="button"
              className="account-verify-btn-primary"
              onClick={handleVerify}
              disabled={submitting || cameraState === 'loading' || cameraState === 'captured'}
            >
              {buttonLabel}
            </button>
            {!required && (
              <button type="button" className="account-verify-btn-skip" onClick={handleSkip}>
                Bỏ qua — giữ uy tín {TRUST_SCORE_UNVERIFIED}
              </button>
            )}
            <p className="account-verify-disclaimer">
              Ảnh selfie chỉ dùng để xác minh. Demo: xử lý qua API mock, lưu trạng thái &amp; uy
              tín trên thiết bị.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AccountVerification
