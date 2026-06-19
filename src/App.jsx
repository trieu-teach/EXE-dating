import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { InventoryProvider } from './context/InventoryContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import SessionGuard from './components/User/SessionGuard/SessionGuard.jsx'
import OnboardingGuard from './components/User/OnboardingGuard/OnboardingGuard.jsx'
import AppShell from './components/User/AppShell/AppShell.jsx'
import ToastViewport from './components/User/Toast/ToastViewport.jsx'
import NotFound from './components/User/NotFound.jsx'

import Login from './pages/User/Login/Login.jsx'
import Register from './pages/User/Register/Register.jsx'
import VerifyOtp from './pages/User/VerifyOtp/VerifyOtp.jsx'
import ForgotPassword from './pages/User/ForgotPassword/ForgotPassword.jsx'
import ResetPassword from './pages/User/ResetPassword/ResetPassword.jsx'
import CreateProfile from './pages/User/CreateProfile/CreateProfile.jsx'
import OnboardingPreferences from './pages/User/OnboardingPreferences/OnboardingPreferences.jsx'
import OnboardingLocation from './pages/User/OnboardingLocation/OnboardingLocation.jsx'
import OnboardingVerify from './pages/User/OnboardingVerify/OnboardingVerify.jsx'
import AccountVerification from './pages/User/AccountVerification/AccountVerification.jsx'
import Discovery from './pages/User/Discovery/Discovery.jsx'
import Matches from './pages/User/Matches/Matches.jsx'
import Search from './pages/User/Search/Search.jsx'
import Chat from './pages/User/Chat/Chat.jsx'
import Profile from './pages/User/Profile/Profile.jsx'
import LoveTree from './pages/User/LoveTree/LoveTree.jsx'
import Tasks from './pages/User/Tasks/Tasks.jsx'
import MeetUpPlan from './pages/User/MeetUpPlan/MeetUpPlan.jsx'
import DailyConnection from './pages/User/DailyConnection/DailyConnection.jsx'
import Premium from './pages/User/Premium/Premium.jsx'
import Events from './pages/User/Events/Events.jsx'
import EventDetail from './pages/User/EventDetail/EventDetail.jsx'
import EventHistory from './pages/User/EventHistory/EventHistory.jsx'
import EventReward from './pages/User/EventReward/EventReward.jsx'
import MatchSuccess from './pages/User/MatchSuccess/MatchSuccess.jsx'
import Safety from './pages/User/Safety/Safety.jsx'
import SafetyCheckin from './pages/User/SafetyCheckin/SafetyCheckin.jsx'
import SafetyPinSetup from './pages/User/SafetyPinSetup/SafetyPinSetup.jsx'
import SafetyPinForgot from './pages/User/SafetyPinForgot/SafetyPinForgot.jsx'
import SafetyPinOtp from './pages/User/SafetyPinOtp/SafetyPinOtp.jsx'
import EmergencyAlert from './pages/User/EmergencyAlert/EmergencyAlert.jsx'
import SettingsHub from './pages/User/Settings/SettingsHub.jsx'
import ChangePassword from './pages/User/Settings/ChangePassword/ChangePassword.jsx'
import Devices from './pages/User/Settings/Devices/Devices.jsx'
import DiscoverySettings from './pages/User/Settings/DiscoverySettings/DiscoverySettings.jsx'
import Interests from './pages/User/Settings/Interests/Interests.jsx'
import SecuritySettings from './pages/User/Settings/SecuritySettings/SecuritySettings.jsx'
import Logout from './pages/User/Logout/Logout.jsx'

function PublicOrShell({ children, variant }) {
  return <AppShell variant={variant}>{children}</AppShell>
}

function AuthOnly({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth()
  if (bootstrapping) return <div className="loading-block"><span className="spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

/** Require auth + have passed face verification / onboarding. */
function Onboarded({ children }) {
  return (
    <AuthOnly>
      <OnboardingGuard>{children}</OnboardingGuard>
    </AuthOnly>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <InventoryProvider>
            <BrowserRouter>
              <SessionGuard />
              <Routes>
            {/* Auth (no shell) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />

            {/* Onboarding (chỉ cần auth, chưa cần xác minh khuôn mặt) */}
            <Route path="/onboarding/preferences" element={<AuthOnly><OnboardingPreferences /></AuthOnly>} />
            <Route path="/onboarding/location" element={<AuthOnly><OnboardingLocation /></AuthOnly>} />
            <Route path="/create-profile" element={<AuthOnly><CreateProfile /></AuthOnly>} />
            <Route path="/onboarding/verify-face" element={<AuthOnly><OnboardingVerify /></AuthOnly>} />
            <Route path="/match-success" element={<AuthOnly><MatchSuccess /></AuthOnly>} />

            {/* Main app — bắt buộc đã hoàn tất onboarding */}
            <Route path="/" element={<Navigate to="/discovery" replace />} />
            <Route path="/discovery" element={<Onboarded><PublicOrShell variant="full"><Discovery /></PublicOrShell></Onboarded>} />
            <Route path="/matches" element={<Onboarded><PublicOrShell><Matches /></PublicOrShell></Onboarded>} />
            <Route path="/search" element={<Onboarded><PublicOrShell><Search /></PublicOrShell></Onboarded>} />
            <Route path="/chat" element={<Onboarded><PublicOrShell variant="full"><Chat /></PublicOrShell></Onboarded>} />
            <Route path="/chat/:conversationId" element={<Onboarded><PublicOrShell variant="full"><Chat /></PublicOrShell></Onboarded>} />
            <Route path="/profile" element={<Onboarded><PublicOrShell><Profile /></PublicOrShell></Onboarded>} />
            <Route path="/profile/:userId" element={<Onboarded><PublicOrShell><Profile /></PublicOrShell></Onboarded>} />
            <Route path="/love-tree" element={<Onboarded><PublicOrShell variant="full"><LoveTree /></PublicOrShell></Onboarded>} />
            <Route path="/love-tree/:matchId" element={<Onboarded><PublicOrShell variant="full"><LoveTree /></PublicOrShell></Onboarded>} />
            <Route path="/tasks" element={<Onboarded><PublicOrShell><Tasks /></PublicOrShell></Onboarded>} />
            <Route path="/meet-up/:partnerId" element={<Onboarded><PublicOrShell><MeetUpPlan /></PublicOrShell></Onboarded>} />
            <Route path="/daily-connection" element={<Onboarded><PublicOrShell><DailyConnection /></PublicOrShell></Onboarded>} />
            <Route path="/premium" element={<Onboarded><PublicOrShell variant="full"><Premium /></PublicOrShell></Onboarded>} />
            <Route path="/events" element={<Onboarded><PublicOrShell variant="full"><Events /></PublicOrShell></Onboarded>} />
            <Route path="/events/history" element={<Onboarded><PublicOrShell><EventHistory /></PublicOrShell></Onboarded>} />
            <Route path="/events/reward" element={<Onboarded><PublicOrShell><EventReward /></PublicOrShell></Onboarded>} />
            <Route path="/events/:eventId" element={<Onboarded><PublicOrShell><EventDetail /></PublicOrShell></Onboarded>} />
            <Route path="/account-verification" element={<Onboarded><PublicOrShell><AccountVerification /></PublicOrShell></Onboarded>} />

            {/* Safety */}
            <Route path="/safety" element={<Onboarded><PublicOrShell><Safety /></PublicOrShell></Onboarded>} />
            <Route path="/safety-checkin" element={<Onboarded><PublicOrShell><SafetyCheckin /></PublicOrShell></Onboarded>} />
            <Route path="/safety-pin-setup" element={<Onboarded><PublicOrShell><SafetyPinSetup /></PublicOrShell></Onboarded>} />
            <Route path="/safety-pin-forgot" element={<Onboarded><PublicOrShell><SafetyPinForgot /></PublicOrShell></Onboarded>} />
            <Route path="/safety-pin-otp" element={<Onboarded><PublicOrShell><SafetyPinOtp /></PublicOrShell></Onboarded>} />
            <Route path="/emergency-alert" element={<Onboarded><PublicOrShell><EmergencyAlert /></PublicOrShell></Onboarded>} />

            {/* Settings */}
            <Route path="/settings" element={<Onboarded><PublicOrShell><SettingsHub /></PublicOrShell></Onboarded>} />
            <Route path="/settings/security" element={<Onboarded><PublicOrShell><SecuritySettings /></PublicOrShell></Onboarded>} />
            <Route path="/settings/devices" element={<Onboarded><PublicOrShell><Devices /></PublicOrShell></Onboarded>} />
            <Route path="/settings/discovery" element={<Onboarded><PublicOrShell><DiscoverySettings /></PublicOrShell></Onboarded>} />
            <Route path="/settings/interests" element={<Onboarded><PublicOrShell><Interests /></PublicOrShell></Onboarded>} />
            <Route path="/settings/change-password" element={<Onboarded><PublicOrShell><ChangePassword /></PublicOrShell></Onboarded>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
            <ToastViewport />
            </BrowserRouter>
          </InventoryProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
