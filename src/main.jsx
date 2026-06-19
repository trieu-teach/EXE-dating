import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'
import './styles/tokens.css'
import './styles/ui.css'
import './styles/layout.css'
import './styles/app.css'
import './styles/dating.css'
import './styles/overlay.css'
import './styles/onboarding.css'
import './styles/face-verification.css'
import './styles/tasks.css'
import './styles/love-tree.css'
import './styles/meetup.css'
import './styles/chat.css'
import './styles/bond-bar.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
