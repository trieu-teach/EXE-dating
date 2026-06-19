import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import FaceVerification from '../../../components/User/FaceVerification/FaceVerification.jsx'

export default function AccountVerification() {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()

  const handleVerified = (res) => {
    if (!res) return
    if (res.isPhotoVerified != null) {
      updateProfile({ isPhotoVerified: res.isPhotoVerified, verificationStatus: res.status })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <h1>Xác minh khuôn mặt</h1>
      <p style={{ color: 'var(--color-text-soft)', margin: 0 }}>
        Xác minh giúp tăng uy tín và hiển thị tích xanh cạnh tên của bạn.
      </p>
      <FaceVerification
        variant="settings"
        onVerified={handleVerified}
        onContinue={() => navigate('/profile')}
        continueLabel="Về hồ sơ"
      />
    </div>
  )
}
