import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { initTheme } from './utils/theme.js'
import './index.css'
import './styles/user-theme.css'
import './styles/layout.css'
import './styles/theme-dark.css'
import './styles/ui.css'
import './styles/surface.css'
import './styles/dating-shared.css'
import App from './App.jsx'

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
