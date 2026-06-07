import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AccountVerification from './pages/User/AccountVerification/AccountVerification.jsx'
import CreateProfile from './pages/User/CreateProfile/CreateProfile.jsx'
import DateSuggestions from './pages/User/DateSuggestions/DateSuggestions.jsx'
import MeetUpPlan from './pages/User/MeetUpPlan/MeetUpPlan.jsx'
import EventDetail from './pages/User/EventDetail/EventDetail.jsx'
import EventHistory from './pages/User/EventHistory/EventHistory.jsx'
import EventReward from './pages/User/EventReward/EventReward.jsx'
import Events from './pages/User/Events/Events.jsx'
import Premium from './pages/User/Premium/Premium.jsx'
import Discovery from './pages/User/Discovery/Discovery.jsx'
import MatchSuccess from './pages/User/MatchSuccess/MatchSuccess.jsx'
import Chat from './pages/User/Chat/Chat.jsx'
import DailyConnection from './pages/User/DailyConnection/DailyConnection.jsx'
import EmergencyAlert from './pages/User/EmergencyAlert/EmergencyAlert.jsx'
import LoveTree from './pages/User/LoveTree/LoveTree.jsx'
import LoveTreeLevelUp from './pages/User/LoveTreeLevelUp/LoveTreeLevelUp.jsx'
import Safety from './pages/User/Safety/Safety.jsx'
import SafetyCheckin from './pages/User/SafetyCheckin/SafetyCheckin.jsx'
import SafetyPinForgot from './pages/User/SafetyPinForgot/SafetyPinForgot.jsx'
import SafetyPinOtp from './pages/User/SafetyPinOtp/SafetyPinOtp.jsx'
import SafetyPinSetup from './pages/User/SafetyPinSetup/SafetyPinSetup.jsx'
import Search from './pages/User/Search/Search.jsx'
import Profile from './pages/User/Profile/Profile.jsx'
import ChangePassword from './pages/User/Settings/ChangePassword/ChangePassword.jsx'
import Devices from './pages/User/Settings/Devices/Devices.jsx'
import DiscoverySettings from './pages/User/Settings/DiscoverySettings/DiscoverySettings.jsx'
import Interests from './pages/User/Settings/Interests/Interests.jsx'
import SecuritySettings from './pages/User/Settings/SecuritySettings/SecuritySettings.jsx'
import ForgotPassword from './pages/User/ForgotPassword/ForgotPassword.jsx'
import Login from './pages/User/Login/Login.jsx'
import Register from './pages/User/Register/Register.jsx'
import ResetPassword from './pages/User/ResetPassword/ResetPassword.jsx'
import VerifyOtp from './pages/User/VerifyOtp/VerifyOtp.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/account-verification" element={<AccountVerification />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/match-success" element={<MatchSuccess />} />
        <Route path="/date-suggestions" element={<DateSuggestions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/history" element={<EventHistory />} />
        <Route path="/events/reward" element={<EventReward />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/search" element={<Search />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/emergency-alert" element={<EmergencyAlert />} />
        <Route path="/safety-checkin" element={<SafetyCheckin />} />
        <Route path="/safety-pin-setup" element={<SafetyPinSetup />} />
        <Route path="/safety-pin-forgot" element={<SafetyPinForgot />} />
        <Route path="/safety-pin-otp" element={<SafetyPinOtp />} />
        <Route path="/daily-connection" element={<DailyConnection />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/meet-up/:partnerId" element={<MeetUpPlan />} />
        <Route path="/love-tree" element={<LoveTree />} />
        <Route path="/love-tree/level-up" element={<LoveTreeLevelUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SecuritySettings />} />
        <Route path="/settings/devices" element={<Devices />} />
        <Route path="/settings/change-password" element={<ChangePassword />} />
        <Route path="/settings/discovery" element={<DiscoverySettings />} />
        <Route path="/settings/interests" element={<Interests />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
