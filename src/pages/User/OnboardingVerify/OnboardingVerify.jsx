import { useNavigate } from 'react-router-dom'
import OnboardingShell from '../../../components/User/OnboardingShell/OnboardingShell.jsx'
import FaceVerification from '../../../components/User/FaceVerification/FaceVerification.jsx'

export default function OnboardingVerify() {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/discovery', { replace: true })
  }

  return (
    <OnboardingShell
      step="verify"
      eyebrow="Bước 4 · Xác minh"
      title="Xác minh khuôn mặt"
      subtitle="Chụp selfie để SameMess đảm bảo ai cũng dùng ảnh thật."
      heroTitle="An toàn cho mọi người 🛡️"
      heroText="Bức ảnh selfie sẽ được so sánh với ảnh chính. Nếu khớp, tài khoản sẽ được duyệt tự động. Nếu không, admin sẽ xem xét thủ công."
      heroEmoji="🛡️"
      progress={95}
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleContinue}
        >
          Vào Discovery 💞 →
        </button>
      }
    >
      <FaceVerification
        variant="onboarding"
        onContinue={handleContinue}
        continueLabel="Vào Discovery 💞 →"
      />
    </OnboardingShell>
  )
}
