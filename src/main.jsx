import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { initTracker } from './lib/tracker'
import './index.css'
import App from './App.jsx'

// Inicializar el sistema liviano de analíticas y seguridad en tiempo real
initTracker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
